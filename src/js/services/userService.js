// User Service - Comprehensive User Management
// Handles authentication, profiles, permissions, and sessions

import { SecurityService } from './securityService.js';

export class UserService {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.currentUser = null;
        this.session = null;
    }

    // User Registration
    async createUser(userData) {
        try {
            // Validate user data
            this.validateUserData(userData);

            // Check if user exists
            const existing = await this.db.users
                .where('email')
                .equals(userData.email.toLowerCase())
                .first();

            if (existing) {
                throw new Error('User already exists');
            }

            // Hash password
            const hashedPassword = await SecurityService.hashPassword(userData.password);

            // Create user record
            const user = {
                email: userData.email.toLowerCase(),
                username: userData.username || userData.email.split('@')[0],
                passwordHash: hashedPassword,
                role: userData.role || 'user',
                status: 'active',
                created: new Date().toISOString(),
                lastLogin: null,
                emailVerified: false,
                twoFactorEnabled: false
            };

            const userId = await this.db.users.add(user);

            // Create user profile
            await this.db.profiles.add({
                userId,
                displayName: userData.displayName || user.username,
                avatar: userData.avatar || this.generateAvatar(user.username),
                bio: '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                preferences: {
                    theme: 'auto',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        jobAlerts: true,
                        applicationUpdates: true
                    },
                    privacy: {
                        profileVisibility: 'private',
                        shareStatistics: false
                    },
                    jobPreferences: {
                        types: ['full-time', 'remote'],
                        minSalary: null,
                        locations: [],
                        keywords: []
                    }
                }
            });

            // Grant default permissions
            await this.grantDefaultPermissions(userId, user.role);

            // Log event
            this.app.services.logger.info('User created', { userId, email: user.email });

            return { userId, user: { ...user, passwordHash: undefined } };

        } catch (error) {
            this.app.services.logger.error('User creation failed', error);
            throw error;
        }
    }

    // User Authentication
    async login(email, password, remember = false) {
        try {
            // Rate limiting check
            await this.checkLoginAttempts(email);

            // Find user
            const user = await this.db.users
                .where('email')
                .equals(email.toLowerCase())
                .first();

            if (!user || user.status !== 'active') {
                await this.recordLoginAttempt(email, false);
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isValid = await SecurityService.verifyPassword(password, user.passwordHash);
            if (!isValid) {
                await this.recordLoginAttempt(email, false);
                throw new Error('Invalid credentials');
            }

            // Check 2FA if enabled
            if (user.twoFactorEnabled) {
                return { requiresTwoFactor: true, userId: user.id };
            }

            // Create session
            const session = await this.createSession(user.id, remember);

            // Update last login
            await this.db.users.update(user.id, {
                lastLogin: new Date().toISOString()
            });

            // Record successful login
            await this.recordLoginAttempt(email, true);

            // Load full user data
            await this.loadCurrentUser(user.id);

            // Analytics
            this.app.services.analytics.track('user_login', {
                userId: user.id,
                method: 'password'
            });

            return { success: true, session, user: this.currentUser };

        } catch (error) {
            this.app.services.logger.error('Login failed', { email, error });
            throw error;
        }
    }

    // Two-Factor Authentication
    async verifyTwoFactor(userId, code) {
        try {
            const user = await this.db.users.get(userId);
            if (!user) throw new Error('User not found');

            // Verify TOTP code
            const isValid = await SecurityService.verifyTOTP(code, user.totpSecret);
            if (!isValid) {
                throw new Error('Invalid code');
            }

            // Create session
            const session = await this.createSession(userId, false);

            // Update last login
            await this.db.users.update(userId, {
                lastLogin: new Date().toISOString()
            });

            // Load user data
            await this.loadCurrentUser(userId);

            return { success: true, session, user: this.currentUser };

        } catch (error) {
            this.app.services.logger.error('2FA verification failed', { userId, error });
            throw error;
        }
    }

    // Session Management
    async createSession(userId, remember = false) {
        const token = SecurityService.generateToken();
        const expires = remember 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const session = {
            userId,
            token,
            device: this.getDeviceInfo(),
            ip: await this.getIPAddress(),
            expires: expires.toISOString(),
            created: new Date().toISOString()
        };

        await this.db.sessions.add(session);

        // Store in localStorage/sessionStorage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('sessionToken', token);

        this.session = session;
        return session;
    }

    async restoreSession() {
        try {
            // Check both storages
            const token = localStorage.getItem('sessionToken') || 
                         sessionStorage.getItem('sessionToken');

            if (!token) return null;

            // Find session
            const session = await this.db.sessions
                .where('token')
                .equals(token)
                .first();

            if (!session) return null;

            // Check expiry
            if (new Date(session.expires) < new Date()) {
                await this.logout();
                return null;
            }

            // Load user
            await this.loadCurrentUser(session.userId);
            this.session = session;

            return session;

        } catch (error) {
            this.app.services.logger.error('Session restore failed', error);
            return null;
        }
    }

    async loadCurrentUser(userId) {
        const user = await this.db.users.get(userId);
        if (!user) throw new Error('User not found');

        const profile = await this.db.profiles.get(userId);
        const permissions = await this.db.permissions
            .where('userId')
            .equals(userId)
            .toArray();

        this.currentUser = {
            ...user,
            passwordHash: undefined,
            profile,
            permissions: permissions.reduce((acc, p) => {
                acc[`${p.resource}:${p.action}`] = p.granted;
                return acc;
            }, {})
        };

        return this.currentUser;
    }

    // Logout
    async logout() {
        if (this.session) {
            await this.db.sessions.delete(this.session.id);
        }

        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('sessionToken');

        this.currentUser = null;
        this.session = null;

        this.app.services.analytics.track('user_logout');
    }

    // Permission Management
    async hasPermission(resource, action) {
        if (!this.currentUser) return false;

        // Admin has all permissions
        if (this.currentUser.role === 'admin') return true;

        const key = `${resource}:${action}`;
        return this.currentUser.permissions[key] === true;
    }

    async grantPermission(userId, resource, action) {
        await this.db.permissions.add({
            userId,
            resource,
            action,
            granted: true,
            grantedAt: new Date().toISOString(),
            grantedBy: this.currentUser?.id
        });
    }

    async revokePermission(userId, resource, action) {
        const permission = await this.db.permissions
            .where(['userId', 'resource', 'action'])
            .equals([userId, resource, action])
            .first();

        if (permission) {
            await this.db.permissions.delete(permission.id);
        }
    }

    async grantDefaultPermissions(userId, role) {
        const defaultPermissions = {
            user: [
                ['jobs', 'read'],
                ['jobs', 'search'],
                ['applications', 'create'],
                ['applications', 'read'],
                ['applications', 'update'],
                ['resumes', 'create'],
                ['resumes', 'read'],
                ['resumes', 'update'],
                ['resumes', 'delete'],
                ['profile', 'read'],
                ['profile', 'update']
            ],
            premium: [
                ['ai_optimization', 'use'],
                ['batch_applications', 'use'],
                ['analytics', 'advanced'],
                ['job_boards', 'priority']
            ],
            admin: [
                ['users', '*'],
                ['job_boards', '*'],
                ['system', '*'],
                ['analytics', '*']
            ]
        };

        const permissions = defaultPermissions[role] || defaultPermissions.user;

        for (const [resource, action] of permissions) {
            await this.grantPermission(userId, resource, action);
        }

        // Premium users get all user permissions too
        if (role === 'premium') {
            for (const [resource, action] of defaultPermissions.user) {
                await this.grantPermission(userId, resource, action);
            }
        }
    }

    // Profile Management
    async updateProfile(updates) {
        if (!this.currentUser) throw new Error('Not authenticated');

        await this.db.profiles.update(this.currentUser.id, updates);

        // Reload user
        await this.loadCurrentUser(this.currentUser.id);

        this.app.services.analytics.track('profile_updated', {
            userId: this.currentUser.id,
            fields: Object.keys(updates)
        });

        return this.currentUser.profile;
    }

    async updateEmailSettings(emailSettings) {
        if (!this.currentUser) throw new Error('Not authenticated');

        // Encrypt sensitive data
        const encrypted = await SecurityService.encryptData(emailSettings);

        await this.db.emailAccounts.put({
            userId: this.currentUser.id,
            ...encrypted,
            updated: new Date().toISOString()
        });

        this.app.services.message.success('Email settings updated');
    }

    // Security Helpers
    async checkLoginAttempts(email) {
        const recentAttempts = await this.db.loginAttempts
            .where('email')
            .equals(email.toLowerCase())
            .and(attempt => {
                const hourAgo = Date.now() - 3600000;
                return new Date(attempt.timestamp) > new Date(hourAgo);
            })
            .toArray();

        const failedAttempts = recentAttempts.filter(a => !a.success);

        if (failedAttempts.length >= 5) {
            throw new Error('Too many login attempts. Please try again later.');
        }
    }

    async recordLoginAttempt(email, success) {
        await this.db.loginAttempts.add({
            email: email.toLowerCase(),
            timestamp: new Date().toISOString(),
            success,
            ip: await this.getIPAddress(),
            device: this.getDeviceInfo()
        });
    }

    // Utilities
    validateUserData(userData) {
        const { email, password, username } = userData;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email address');
        }

        // Password validation
        const passwordPolicy = {
            minLength: 8,
            requireUppercase: /[A-Z]/,
            requireLowercase: /[a-z]/,
            requireNumbers: /\d/,
            requireSpecial: /[!@#$%^&*]/
        };

        if (password.length < passwordPolicy.minLength) {
            throw new Error(`Password must be at least ${passwordPolicy.minLength} characters`);
        }

        if (!passwordPolicy.requireUppercase.test(password)) {
            throw new Error('Password must contain uppercase letters');
        }

        if (!passwordPolicy.requireNumbers.test(password)) {
            throw new Error('Password must contain numbers');
        }

        // Username validation
        if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            throw new Error('Username must be 3-20 characters, alphanumeric and underscore only');
        }
    }

    generateAvatar(username) {
        // Generate identicon-style avatar
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
        const color = colors[username.charCodeAt(0) % colors.length];
        const initial = username.charAt(0).toUpperCase();

        return `data:image/svg+xml;base64,${btoa(`
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${color}"/>
                <text x="50" y="50" font-family="Arial" font-size="40" fill="white" 
                      text-anchor="middle" dominant-baseline="central">${initial}</text>
            </svg>
        `)}`;
    }

    getDeviceInfo() {
        const ua = navigator.userAgent;
        const browser = ua.match(/(Chrome|Safari|Firefox|Edge)\/[\d.]+/)?.[0] || 'Unknown';
        const os = ua.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || 'Unknown';
        
        return {
            browser,
            os,
            mobile: /Mobile|Android|iPhone/.test(ua),
            userAgent: ua
        };
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    // Session Monitor
    startSessionMonitor() {
        // Check session every minute
        setInterval(async () => {
            if (this.session) {
                const expires = new Date(this.session.expires);
                const now = new Date();

                // Warn 5 minutes before expiry
                const warningTime = new Date(expires - 5 * 60 * 1000);
                if (now > warningTime && now < expires) {
                    this.app.services.message.warning(
                        'Your session will expire soon. Save your work.',
                        { duration: 10000 }
                    );
                }

                // Auto logout if expired
                if (now > expires) {
                    await this.logout();
                    this.app.services.message.info('Session expired. Please login again.');
                }
            }
        }, 60000);
    }
}