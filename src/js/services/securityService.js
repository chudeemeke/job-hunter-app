// Security Service - Core Security Implementation
// Handles encryption, authentication, and security policies

export class SecurityService {
    constructor(app) {
        this.app = app;
        this.initializeSecurityHeaders();
    }

    // Initialize security headers and policies
    initializeSecurityHeaders() {
        // Content Security Policy
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://api.github.com https://corsproxy.io https://api.allorigins.win https://api.ipify.org",
            "worker-src 'self' blob:",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'"
        ].join('; ');

        // Set meta tag for CSP (can't set headers from client)
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = csp;
        document.head.appendChild(meta);

        // Prevent clickjacking
        if (window.self !== window.top) {
            document.body.style.display = 'none';
            throw new Error('Clickjacking attempt detected');
        }
    }

    // Password hashing using Web Crypto API
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        const exported = await crypto.subtle.exportKey('raw', key);
        const hashArray = new Uint8Array(exported);
        
        // Combine salt and hash
        const combined = new Uint8Array(salt.length + hashArray.length);
        combined.set(salt);
        combined.set(hashArray, salt.length);

        return btoa(String.fromCharCode(...combined));
    }

    // Verify password
    static async verifyPassword(password, hash) {
        try {
            const encoder = new TextEncoder();
            const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
            
            const salt = combined.slice(0, 16);
            const storedHash = combined.slice(16);

            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            const exported = await crypto.subtle.exportKey('raw', key);
            const testHash = new Uint8Array(exported);

            // Constant-time comparison
            return this.constantTimeCompare(testHash, storedHash);
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    // Constant-time comparison to prevent timing attacks
    static constantTimeCompare(a, b) {
        if (a.length !== b.length) return false;
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        
        return result === 0;
    }

    // Generate secure random token
    static generateToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Encrypt sensitive data
    static async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Generate key
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        // Generate IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataBuffer
        );

        // Export key
        const exportedKey = await crypto.subtle.exportKey('raw', key);

        // Combine IV, key, and encrypted data
        const combined = new Uint8Array(
            iv.length + exportedKey.byteLength + encrypted.byteLength
        );
        combined.set(iv, 0);
        combined.set(new Uint8Array(exportedKey), iv.length);
        combined.set(new Uint8Array(encrypted), iv.length + exportedKey.byteLength);

        return btoa(String.fromCharCode(...combined));
    }

    // Decrypt data
    static async decryptData(encryptedData) {
        try {
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            const iv = combined.slice(0, 12);
            const keyData = combined.slice(12, 44);
            const encrypted = combined.slice(44);

            // Import key
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    // XSS Prevention
    static sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Validate and sanitize input
    static sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') return '';
        
        // Remove null bytes
        input = input.replace(/\0/g, '');
        
        switch (type) {
            case 'email':
                return input.toLowerCase().trim().substring(0, 254);
            
            case 'username':
                return input.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
            
            case 'url':
                try {
                    const url = new URL(input);
                    return url.href;
                } catch {
                    return '';
                }
            
            case 'number':
                return parseInt(input) || 0;
            
            case 'text':
            default:
                return input.trim().substring(0, 1000);
        }
    }

    // TOTP (Time-based One-Time Password) for 2FA
    static async generateTOTPSecret() {
        const secret = this.generateToken(20);
        return {
            secret,
            qrcode: await this.generateQRCode(secret)
        };
    }

    static async verifyTOTP(token, secret) {
        // Simplified TOTP verification
        // In production, use a proper TOTP library
        const time = Math.floor(Date.now() / 30000);
        const expectedToken = await this.generateTOTPToken(secret, time);
        
        // Check current and previous time window
        return token === expectedToken || 
               token === await this.generateTOTPToken(secret, time - 1);
    }

    static async generateTOTPToken(secret, time) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const timeBuffer = new ArrayBuffer(8);
        const timeView = new DataView(timeBuffer);
        timeView.setUint32(4, time, false);

        const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
        const signatureArray = new Uint8Array(signature);
        
        const offset = signatureArray[signatureArray.length - 1] & 0xf;
        const code = (
            ((signatureArray[offset] & 0x7f) << 24) |
            ((signatureArray[offset + 1] & 0xff) << 16) |
            ((signatureArray[offset + 2] & 0xff) << 8) |
            (signatureArray[offset + 3] & 0xff)
        ) % 1000000;

        return code.toString().padStart(6, '0');
    }

    static async generateQRCode(secret) {
        // Placeholder - in production, use QR code library
        const otpauth = `otpauth://totp/JobHunter:user@example.com?secret=${secret}&issuer=JobHunter`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
    }

    // Rate limiting
    static createRateLimiter(maxAttempts = 5, windowMs = 60000) {
        const attempts = new Map();
        
        return {
            check: (key) => {
                const now = Date.now();
                const userAttempts = attempts.get(key) || [];
                
                // Clean old attempts
                const recentAttempts = userAttempts.filter(time => now - time < windowMs);
                
                if (recentAttempts.length >= maxAttempts) {
                    const oldestAttempt = recentAttempts[0];
                    const resetTime = oldestAttempt + windowMs;
                    const waitTime = Math.ceil((resetTime - now) / 1000);
                    
                    throw new Error(`Too many attempts. Please try again in ${waitTime} seconds.`);
                }
                
                recentAttempts.push(now);
                attempts.set(key, recentAttempts);
                
                return true;
            },
            
            reset: (key) => {
                attempts.delete(key);
            }
        };
    }

    // Session validation
    validateSession(session) {
        if (!session || !session.token || !session.expires) {
            return false;
        }

        // Check expiry
        if (new Date(session.expires) < new Date()) {
            return false;
        }

        // Validate token format
        if (!/^[A-Za-z0-9_-]{32,}$/.test(session.token)) {
            return false;
        }

        return true;
    }

    // CSRF Protection
    generateCSRFToken() {
        const token = SecurityService.generateToken();
        sessionStorage.setItem('csrfToken', token);
        return token;
    }

    validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        return token && storedToken && token === storedToken;
    }

    // Input validation rules
    static validationRules = {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            minLength: 3,
            maxLength: 254,
            message: 'Please enter a valid email address'
        },
        password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecial: true,
            message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
        },
        username: {
            pattern: /^[a-zA-Z0-9_-]+$/,
            minLength: 3,
            maxLength: 30,
            message: 'Username must be 3-30 characters, letters, numbers, underscore, and hyphen only'
        },
        url: {
            pattern: /^https?:\/\/.+/,
            maxLength: 2048,
            message: 'Please enter a valid URL'
        }
    };

    // Validate input against rules
    static validateInput(value, type) {
        const rules = this.validationRules[type];
        if (!rules) return { valid: true };

        const errors = [];

        // Length checks
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Minimum ${rules.minLength} characters required`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Maximum ${rules.maxLength} characters allowed`);
        }

        // Pattern check
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.message || 'Invalid format');
        }

        // Password specific checks
        if (type === 'password') {
            if (rules.requireUppercase && !/[A-Z]/.test(value)) {
                errors.push('Must contain uppercase letter');
            }
            if (rules.requireLowercase && !/[a-z]/.test(value)) {
                errors.push('Must contain lowercase letter');
            }
            if (rules.requireNumbers && !/\d/.test(value)) {
                errors.push('Must contain number');
            }
            if (rules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                errors.push('Must contain special character');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Secure random number generation
    static secureRandom(min, max) {
        const range = max - min + 1;
        const bytesNeeded = Math.ceil(Math.log2(range) / 8);
        const maxValue = Math.pow(256, bytesNeeded);
        const threshold = maxValue - (maxValue % range);

        let randomValue;
        do {
            const bytes = new Uint8Array(bytesNeeded);
            crypto.getRandomValues(bytes);
            randomValue = bytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0);
        } while (randomValue >= threshold);

        return min + (randomValue % range);
    }

    // Secure storage wrapper
    static secureStorage = {
        setItem: async (key, value) => {
            const encrypted = await SecurityService.encryptData(value);
            localStorage.setItem(`secure_${key}`, encrypted);
        },
        
        getItem: async (key) => {
            const encrypted = localStorage.getItem(`secure_${key}`);
            if (!encrypted) return null;
            
            try {
                return await SecurityService.decryptData(encrypted);
            } catch {
                localStorage.removeItem(`secure_${key}`);
                return null;
            }
        },
        
        removeItem: (key) => {
            localStorage.removeItem(`secure_${key}`);
        }
    };
}