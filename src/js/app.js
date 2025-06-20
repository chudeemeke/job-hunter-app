// Core Application Architecture - Production Ready
// Security and UX at the foundation, not as features

import Dexie from 'https://unpkg.com/dexie@latest/dist/dexie.mjs';

// Master Database Schema
export const db = new Dexie('JobHunterPro');

db.version(1).stores({
    // User Management
    users: '++id, email, username, role, status, created, lastLogin, [email+status]',
    profiles: 'userId, displayName, avatar, bio, timezone, preferences',
    sessions: '++id, userId, token, device, ip, expires, created',
    permissions: '++id, userId, resource, action, granted',
    
    // Job Management
    jobs: '++id, externalId, source, title, company, location, type, salary, posted, [company+title+location], *keywords',
    applications: '++id, userId, jobId, status, stage, appliedDate, *tags',
    savedSearches: '++id, userId, query, filters, frequency, lastRun',
    
    // Resume & Cover Letters
    resumes: '++id, userId, name, content, isBase, created, modified',
    optimizations: '++id, userId, jobId, resumeId, optimizedContent, score',
    coverLetters: '++id, userId, jobId, content, template, created',
    
    // Communication
    emailAccounts: '++id, userId, email, provider, smtp, imap, oauth',
    emailTemplates: '++id, userId, name, subject, body, variables',
    sentEmails: '++id, userId, jobId, to, subject, sentDate, status',
    
    // Admin & Configuration
    jobBoards: '++id, name, apiUrl, apiKey, rateLimit, enabled, custom',
    systemSettings: 'key, value, updated',
    integrations: '++id, name, type, config, status',
    
    // Analytics & Logging
    events: '++id, userId, type, action, metadata, timestamp',
    errors: '++id, userId, error, stack, context, timestamp',
    metrics: '++id, userId, metric, value, date',
    
    // Messaging & Notifications
    notifications: '++id, userId, type, title, message, read, created',
    announcements: '++id, title, content, priority, active, created'
});

// Core Application Class
export class JobHunterApp {
    constructor() {
        this.db = db;
        this.services = {};
        this.initialized = false;
        this.setupCoreServices();
    }

    async setupCoreServices() {
        // Initialize core services with error boundaries
        try {
            // Security Service - Foundation of everything
            const { SecurityService } = await import('./services/securityService.js');
            this.services.security = new SecurityService(this);

            // User Management Service
            const { UserService } = await import('./services/userService.js');
            this.services.user = new UserService(this);

            // Message Service - Unified messaging
            const { MessageService } = await import('./services/messageService.js');
            this.services.message = new MessageService(this);

            // Logger Service - Comprehensive logging
            const { LoggerService } = await import('./services/loggerService.js');
            this.services.logger = new LoggerService(this);

            // Job Board Service
            const { JobBoardService } = await import('./services/jobBoardService.js');
            this.services.jobBoard = new JobBoardService(this);

            // AI Optimizer Service
            const { AIOptimizerService } = await import('./services/aiOptimizerService.js');
            this.services.aiOptimizer = new AIOptimizerService(this);

            // Email Service
            const { EmailService } = await import('./services/emailService.js');
            this.services.email = new EmailService(this);

            // Admin Service
            const { AdminService } = await import('./services/adminService.js');
            this.services.admin = new AdminService(this);

            // Analytics Service
            const { AnalyticsService } = await import('./services/analyticsService.js');
            this.services.analytics = new AnalyticsService(this);

            // Initialize application
            await this.initialize();
            
        } catch (error) {
            // Graceful fallback
            this.handleCriticalError(error);
        }
    }

    async initialize() {
        // Check if first run
        const isFirstRun = await this.checkFirstRun();
        
        if (isFirstRun) {
            await this.runFirstTimeSetup();
        }

        // Load user session
        await this.services.user.restoreSession();

        // Initialize UI
        await this.initializeUI();

        // Start background services
        this.startBackgroundServices();

        this.initialized = true;
        this.services.logger.info('Application initialized successfully');
    }

    async checkFirstRun() {
        const settings = await this.db.systemSettings.get('initialized');
        return !settings;
    }

    async runFirstTimeSetup() {
        // Create default admin user
        const adminUser = await this.services.user.createUser({
            email: 'admin@jobhunter.local',
            username: 'admin',
            role: 'admin',
            password: 'ChangeMe123!' // Force change on first login
        });

        // Initialize default job boards
        await this.initializeDefaultJobBoards();

        // Set default system settings
        await this.initializeSystemSettings();

        await this.db.systemSettings.put({
            key: 'initialized',
            value: true,
            updated: new Date().toISOString()
        });
    }

    async initializeDefaultJobBoards() {
        const defaultBoards = [
            {
                name: 'RemoteOK',
                apiUrl: 'https://remoteok.com/api',
                apiKey: null,
                rateLimit: 10,
                enabled: true,
                custom: false,
                config: {
                    cors: true,
                    auth: 'none',
                    responseFormat: 'json'
                }
            },
            {
                name: 'GitHub Jobs',
                apiUrl: 'https://api.github.com/search/issues',
                apiKey: null,
                rateLimit: 30,
                enabled: true,
                custom: false,
                config: {
                    searchParams: {
                        labels: 'hiring,job',
                        state: 'open'
                    }
                }
            },
            {
                name: 'Community Gist',
                apiUrl: 'https://api.github.com/gists/{gistId}',
                apiKey: null,
                rateLimit: 60,
                enabled: true,
                custom: false,
                config: {
                    gistId: process.env.COMMUNITY_GIST_ID || ''
                }
            }
        ];

        await this.db.jobBoards.bulkAdd(defaultBoards);
    }

    async initializeSystemSettings() {
        const defaultSettings = {
            appName: 'Job Hunter Pro',
            appVersion: '1.0.0',
            theme: 'auto',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            features: {
                aiOptimization: true,
                batchApplications: true,
                emailIntegration: true,
                analytics: true,
                communitySharing: true
            },
            security: {
                sessionTimeout: 86400000, // 24 hours
                maxLoginAttempts: 5,
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireNumbers: true,
                    requireSpecial: true
                }
            },
            ui: {
                animations: true,
                sounds: false,
                compactMode: false,
                accessibility: {
                    highContrast: false,
                    largeText: false,
                    reducedMotion: false
                }
            }
        };

        for (const [key, value] of Object.entries(defaultSettings)) {
            await this.db.systemSettings.put({
                key,
                value,
                updated: new Date().toISOString()
            });
        }
    }

    async initializeUI() {
        // Dynamic UI initialization based on user preferences
        const { UIManager } = await import('./ui/uiManager.js');
        this.ui = new UIManager(this);
        await this.ui.initialize();
    }

    startBackgroundServices() {
        // Job sync service
        this.services.jobBoard.startBackgroundSync();

        // Session management
        this.services.user.startSessionMonitor();

        // Analytics collection
        this.services.analytics.startCollection();

        // Error monitoring
        this.setupGlobalErrorHandlers();
    }

    setupGlobalErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'unhandledRejection',
                promise: event.promise
            });
        });

        // Network errors
        window.addEventListener('offline', () => {
            this.services.message.info('You are offline. Some features may be limited.');
        });

        window.addEventListener('online', () => {
            this.services.message.success('Back online!');
            this.services.jobBoard.syncJobs();
        });
    }

    async handleError(error, context = {}) {
        // Log error
        await this.services.logger.error(error, context);

        // User-friendly message
        const userMessage = this.getUserFriendlyError(error);
        this.services.message.error(userMessage);

        // Send to analytics
        this.services.analytics.trackError(error, context);
    }

    getUserFriendlyError(error) {
        const errorMap = {
            'NetworkError': 'Connection issue. Please check your internet.',
            'QuotaExceededError': 'Storage full. Please clear some data.',
            'NotAllowedError': 'Permission denied. Please check your settings.',
            'AbortError': 'Operation cancelled.',
            'TimeoutError': 'Request took too long. Please try again.',
            'ValidationError': 'Please check your input and try again.'
        };

        return errorMap[error.name] || 'Something went wrong. We\'re looking into it.';
    }

    handleCriticalError(error) {
        // Show beautiful error page
        document.body.innerHTML = `
            <div class="critical-error">
                <div class="error-content">
                    <h1>Oops! Something unexpected happened</h1>
                    <p>Don't worry, your data is safe. Let's get you back on track.</p>
                    <div class="error-actions">
                        <button onclick="location.reload()">Refresh Page</button>
                        <button onclick="localStorage.clear(); location.reload()">Start Fresh</button>
                    </div>
                    <details>
                        <summary>Technical Details</summary>
                        <pre>${error.stack || error.message}</pre>
                    </details>
                </div>
            </div>
            <style>
                .critical-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .error-content {
                    text-align: center;
                    padding: 2rem;
                    max-width: 600px;
                }
                .error-content h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                .error-content p {
                    font-size: 1.25rem;
                    margin-bottom: 2rem;
                    opacity: 0.9;
                }
                .error-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                }
                .error-actions button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    background: white;
                    color: #667eea;
                    transition: transform 0.2s;
                }
                .error-actions button:hover {
                    transform: translateY(-2px);
                }
                details {
                    margin-top: 2rem;
                    background: rgba(0,0,0,0.2);
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: left;
                }
                summary {
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                }
                pre {
                    overflow-x: auto;
                    font-size: 0.875rem;
                }
            </style>
        `;
    }
}

// Initialize app with error boundary
export let app;

try {
    app = new JobHunterApp();
} catch (error) {
    console.error('Failed to initialize app:', error);
    // Show initialization error
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; text-align: center;">
            <div>
                <h1>Unable to start Job Hunter</h1>
                <p>Please ensure you're using a modern browser with JavaScript enabled.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem;">Try Again</button>
            </div>
        </div>
    `;
}