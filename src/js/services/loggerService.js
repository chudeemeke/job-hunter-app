// Logger Service - Comprehensive Logging Framework
// Handles all logging, error tracking, and analytics

export class LoggerService {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.logLevel = 'info';
        this.maxLogs = 10000;
        this.batchSize = 50;
        this.logBuffer = [];
        this.setupErrorHandlers();
    }

    // Log levels
    static levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        critical: 4
    };

    // Setup global error handlers
    setupErrorHandlers() {
        // Store original console methods
        this.originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        };

        // Override console methods
        if (this.shouldIntercept()) {
            console.log = (...args) => this.log('info', ...args);
            console.info = (...args) => this.log('info', ...args);
            console.warn = (...args) => this.log('warn', ...args);
            console.error = (...args) => this.log('error', ...args);
        }

        // Window error event
        window.addEventListener('error', (event) => {
            this.error('Uncaught error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: this.serializeError(event.error)
            });
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled promise rejection', {
                reason: this.serializeError(event.reason),
                promise: event.promise
            });
        });

        // Performance issues
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) {
                            this.warn('Long task detected', {
                                name: entry.name,
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Some browsers don't support longtask
            }
        }

        // Network errors
        window.addEventListener('offline', () => {
            this.warn('Network offline');
        });

        window.addEventListener('online', () => {
            this.info('Network online');
            this.flushBuffer();
        });
    }

    // Main logging method
    async log(level, message, data = {}) {
        // Check log level
        if (LoggerService.levels[level] < LoggerService.levels[this.logLevel]) {
            return;
        }

        // Create log entry
        const logEntry = {
            level,
            message: this.formatMessage(message),
            data: this.sanitizeData(data),
            timestamp: new Date().toISOString(),
            userId: this.app.services.user?.currentUser?.id || null,
            sessionId: this.app.services.user?.session?.id || null,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Add to buffer
        this.logBuffer.push(logEntry);

        // Console output in development
        if (this.isDevelopment()) {
            this.consoleOutput(level, message, data);
        }

        // Flush buffer if needed
        if (this.logBuffer.length >= this.batchSize) {
            await this.flushBuffer();
        }

        // Immediate flush for errors
        if (level === 'error' || level === 'critical') {
            await this.flushBuffer();
        }
    }

    // Convenience methods
    debug(message, data) {
        return this.log('debug', message, data);
    }

    info(message, data) {
        return this.log('info', message, data);
    }

    warn(message, data) {
        return this.log('warn', message, data);
    }

    error(message, data) {
        return this.log('error', message, data);
    }

    critical(message, data) {
        return this.log('critical', message, data);
    }

    // Flush log buffer to database
    async flushBuffer() {
        if (this.logBuffer.length === 0) return;

        const logsToFlush = [...this.logBuffer];
        this.logBuffer = [];

        try {
            // Save to events table
            await this.db.events.bulkAdd(logsToFlush.map(log => ({
                userId: log.userId,
                type: 'log',
                action: log.level,
                metadata: log,
                timestamp: log.timestamp
            })));

            // Save errors to dedicated table
            const errors = logsToFlush.filter(log => 
                log.level === 'error' || log.level === 'critical'
            );

            if (errors.length > 0) {
                await this.db.errors.bulkAdd(errors.map(log => ({
                    userId: log.userId,
                    error: log.message,
                    stack: log.data.stack || '',
                    context: log.data,
                    timestamp: log.timestamp
                })));
            }

            // Cleanup old logs
            await this.cleanupOldLogs();

        } catch (error) {
            // Fallback to localStorage if database fails
            this.fallbackStorage(logsToFlush);
            this.originalConsole.error('Failed to flush logs:', error);
        }
    }

    // Cleanup old logs
    async cleanupOldLogs() {
        const count = await this.db.events.where('type').equals('log').count();
        
        if (count > this.maxLogs) {
            const toDelete = count - this.maxLogs;
            const oldLogs = await this.db.events
                .where('type')
                .equals('log')
                .limit(toDelete)
                .toArray();
            
            const idsToDelete = oldLogs.map(log => log.id);
            await this.db.events.bulkDelete(idsToDelete);
        }
    }

    // Format message
    formatMessage(message) {
        if (typeof message === 'string') return message;
        
        try {
            return JSON.stringify(message, null, 2);
        } catch {
            return String(message);
        }
    }

    // Sanitize data for storage
    sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;

        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            // Skip sensitive fields
            if (this.isSensitiveField(key)) {
                sanitized[key] = '[REDACTED]';
                continue;
            }

            // Handle different types
            if (value instanceof Error) {
                sanitized[key] = this.serializeError(value);
            } else if (value instanceof Date) {
                sanitized[key] = value.toISOString();
            } else if (typeof value === 'function') {
                sanitized[key] = '[Function]';
            } else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeData(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    // Check if field is sensitive
    isSensitiveField(field) {
        const sensitiveFields = [
            'password', 'passwordHash', 'token', 'secret', 
            'apiKey', 'creditCard', 'ssn', 'pin'
        ];
        
        return sensitiveFields.some(sensitive => 
            field.toLowerCase().includes(sensitive.toLowerCase())
        );
    }

    // Serialize error objects
    serializeError(error) {
        if (!error) return null;
        
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            };
        }
        
        return error;
    }

    // Console output for development
    consoleOutput(level, message, data) {
        const styles = {
            debug: 'color: #6B7280',
            info: 'color: #3B82F6',
            warn: 'color: #F59E0B',
            error: 'color: #EF4444',
            critical: 'color: #EF4444; font-weight: bold'
        };

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (Object.keys(data).length > 0) {
            this.originalConsole.log(
                `%c${prefix} ${message}`,
                styles[level],
                data
            );
        } else {
            this.originalConsole.log(
                `%c${prefix} ${message}`,
                styles[level]
            );
        }
    }

    // Performance tracking
    startTimer(label) {
        const startTime = performance.now();
        
        return {
            end: (metadata = {}) => {
                const duration = performance.now() - startTime;
                
                this.info(`Performance: ${label}`, {
                    duration: Math.round(duration),
                    ...metadata
                });

                // Track in metrics
                this.trackMetric('performance', duration, {
                    label,
                    ...metadata
                });
            }
        };
    }

    // Track metrics
    async trackMetric(metric, value, metadata = {}) {
        try {
            await this.db.metrics.add({
                userId: this.app.services.user?.currentUser?.id || null,
                metric,
                value,
                metadata,
                date: new Date().toISOString()
            });
        } catch (error) {
            this.originalConsole.error('Failed to track metric:', error);
        }
    }

    // Get logs for display
    async getLogs(filters = {}) {
        let query = this.db.events.where('type').equals('log');

        if (filters.level) {
            query = query.and(event => event.metadata.level === filters.level);
        }

        if (filters.userId) {
            query = query.and(event => event.userId === filters.userId);
        }

        if (filters.startDate) {
            query = query.and(event => event.timestamp >= filters.startDate);
        }

        if (filters.endDate) {
            query = query.and(event => event.timestamp <= filters.endDate);
        }

        return await query
            .reverse()
            .limit(filters.limit || 100)
            .toArray();
    }

    // Export logs
    async exportLogs(format = 'json') {
        const logs = await this.getLogs({ limit: 10000 });

        switch (format) {
            case 'json':
                return JSON.stringify(logs, null, 2);
            
            case 'csv':
                return this.logsToCSV(logs);
            
            case 'txt':
                return this.logsToText(logs);
            
            default:
                throw new Error('Unsupported export format');
        }
    }

    // Convert logs to CSV
    logsToCSV(logs) {
        const headers = ['Timestamp', 'Level', 'Message', 'User ID', 'URL'];
        const rows = logs.map(log => [
            log.timestamp,
            log.metadata.level,
            log.metadata.message.replace(/"/g, '""'),
            log.userId || '',
            log.metadata.url || ''
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    }

    // Convert logs to text
    logsToText(logs) {
        return logs.map(log => {
            const { timestamp, level, message } = log.metadata;
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        }).join('\n');
    }

    // Fallback storage
    fallbackStorage(logs) {
        try {
            const stored = JSON.parse(localStorage.getItem('fallbackLogs') || '[]');
            stored.push(...logs);
            
            // Keep only last 1000 logs
            const trimmed = stored.slice(-1000);
            localStorage.setItem('fallbackLogs', JSON.stringify(trimmed));
        } catch {
            // Storage full or other error
        }
    }

    // Recover fallback logs
    async recoverFallbackLogs() {
        try {
            const stored = JSON.parse(localStorage.getItem('fallbackLogs') || '[]');
            if (stored.length > 0) {
                await this.db.events.bulkAdd(stored.map(log => ({
                    userId: log.userId,
                    type: 'log',
                    action: log.level,
                    metadata: log,
                    timestamp: log.timestamp
                })));
                
                localStorage.removeItem('fallbackLogs');
                this.info('Recovered fallback logs', { count: stored.length });
            }
        } catch (error) {
            this.originalConsole.error('Failed to recover fallback logs:', error);
        }
    }

    // Configuration
    setLogLevel(level) {
        if (LoggerService.levels[level] !== undefined) {
            this.logLevel = level;
            this.info('Log level changed', { level });
        }
    }

    // Environment checks
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    shouldIntercept() {
        return !this.isDevelopment();
    }

    // Remote logging (for critical errors)
    async remoteLog(level, message, data) {
        if (level !== 'critical' && level !== 'error') return;

        try {
            // In production, send to logging service
            // For now, we'll store in GitHub Gist
            const gistData = {
                description: `JobHunter Error Log - ${new Date().toISOString()}`,
                public: false,
                files: {
                    'error.json': {
                        content: JSON.stringify({
                            level,
                            message,
                            data,
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent,
                            url: window.location.href
                        }, null, 2)
                    }
                }
            };

            // Would need authentication for private gists
            // For now, just log that we would send it
            this.info('Would send remote log', { level, message });
        } catch {
            // Fail silently
        }
    }
}