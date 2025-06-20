// Admin Service - Comprehensive Admin Panel
// Handles all administrative functions with professional UI/UX

export class AdminService {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.initialized = false;
    }

    async initialize() {
        // Check admin permission
        if (!await this.app.services.user.hasPermission('system', 'admin')) {
            throw new Error('Unauthorized');
        }

        this.initialized = true;
    }

    // Admin Dashboard Data
    async getDashboardData() {
        const [users, jobs, applications, errors, metrics] = await Promise.all([
            this.getUserStats(),
            this.getJobStats(),
            this.getApplicationStats(),
            this.getRecentErrors(),
            this.getSystemMetrics()
        ]);

        return {
            users,
            jobs,
            applications,
            errors,
            metrics,
            timestamp: new Date().toISOString()
        };
    }

    async getUserStats() {
        const total = await this.db.users.count();
        const active = await this.db.users.where('status').equals('active').count();
        const premium = await this.db.users.where('role').equals('premium').count();
        
        // Activity in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const recentActive = await this.db.sessions
            .where('created')
            .above(weekAgo)
            .count();

        // User growth
        const growth = await this.calculateGrowth('users', 30);

        return {
            total,
            active,
            premium,
            recentActive,
            growth,
            roles: await this.getUsersByRole()
        };
    }

    async getJobStats() {
        const total = await this.db.jobs.count();
        
        // Jobs by source
        const bySource = {};
        const jobs = await this.db.jobs.toArray();
        jobs.forEach(job => {
            bySource[job.source] = (bySource[job.source] || 0) + 1;
        });

        // Recent additions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.db.jobs
            .where('posted')
            .above(today.toISOString())
            .count();

        return {
            total,
            bySource,
            todayCount,
            avgPerDay: await this.getAveragePerDay('jobs', 7)
        };
    }

    async getApplicationStats() {
        const total = await this.db.applications.count();
        
        // By status
        const byStatus = {};
        const applications = await this.db.applications.toArray();
        applications.forEach(app => {
            byStatus[app.status] = (byStatus[app.status] || 0) + 1;
        });

        // Success rate
        const successful = byStatus.offer || 0;
        const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0;

        return {
            total,
            byStatus,
            successRate,
            avgResponseTime: await this.getAverageResponseTime()
        };
    }

    async getRecentErrors() {
        return await this.db.errors
            .orderBy('timestamp')
            .reverse()
            .limit(10)
            .toArray();
    }

    async getSystemMetrics() {
        const dbSize = await this.estimateDBSize();
        const cacheSize = await this.getCacheSize();
        
        return {
            dbSize,
            cacheSize,
            uptime: this.getUptime(),
            performance: await this.getPerformanceMetrics()
        };
    }

    // Job Board Management
    async getJobBoards() {
        return await this.db.jobBoards.toArray();
    }

    async addJobBoard(boardData) {
        // Validate board configuration
        this.validateJobBoard(boardData);

        // Test connection
        await this.testJobBoardConnection(boardData);

        // Add to database
        const id = await this.db.jobBoards.add({
            ...boardData,
            custom: true,
            created: new Date().toISOString(),
            createdBy: this.app.services.user.currentUser.id
        });

        this.app.services.logger.info('Job board added', { id, name: boardData.name });
        
        return id;
    }

    async updateJobBoard(id, updates) {
        const board = await this.db.jobBoards.get(id);
        if (!board) throw new Error('Job board not found');

        // Validate updates
        if (updates.apiUrl || updates.config) {
            await this.testJobBoardConnection({ ...board, ...updates });
        }

        await this.db.jobBoards.update(id, {
            ...updates,
            updated: new Date().toISOString()
        });

        this.app.services.logger.info('Job board updated', { id, updates });
    }

    async deleteJobBoard(id) {
        const board = await this.db.jobBoards.get(id);
        if (!board) throw new Error('Job board not found');
        
        if (!board.custom) {
            throw new Error('Cannot delete built-in job boards');
        }

        await this.db.jobBoards.delete(id);
        
        this.app.services.logger.info('Job board deleted', { id, name: board.name });
    }

    validateJobBoard(boardData) {
        const required = ['name', 'apiUrl'];
        
        for (const field of required) {
            if (!boardData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Validate URL
        try {
            new URL(boardData.apiUrl);
        } catch {
            throw new Error('Invalid API URL');
        }

        // Validate rate limit
        if (boardData.rateLimit && (boardData.rateLimit < 1 || boardData.rateLimit > 1000)) {
            throw new Error('Rate limit must be between 1 and 1000');
        }
    }

    async testJobBoardConnection(boardData) {
        try {
            // Simple connectivity test
            const testUrl = boardData.apiUrl.replace('{query}', 'test');
            const response = await fetch(testUrl, {
                method: 'HEAD',
                headers: boardData.apiKey ? {
                    'Authorization': `Bearer ${boardData.apiKey}`
                } : {}
            });

            if (!response.ok && response.status !== 405) { // 405 is ok, means endpoint exists
                throw new Error(`Connection failed: ${response.status}`);
            }

            return true;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    // User Management
    async getUsers(filters = {}) {
        let query = this.db.users;

        if (filters.role) {
            query = query.where('role').equals(filters.role);
        }

        if (filters.status) {
            query = query.where('status').equals(filters.status);
        }

        const users = await query.toArray();

        // Add profile data
        for (const user of users) {
            user.profile = await this.db.profiles.get(user.id);
        }

        return users;
    }

    async updateUser(userId, updates) {
        const user = await this.db.users.get(userId);
        if (!user) throw new Error('User not found');

        // Cannot demote last admin
        if (user.role === 'admin' && updates.role !== 'admin') {
            const adminCount = await this.db.users.where('role').equals('admin').count();
            if (adminCount <= 1) {
                throw new Error('Cannot remove last admin');
            }
        }

        await this.db.users.update(userId, {
            ...updates,
            updated: new Date().toISOString()
        });

        // Update permissions if role changed
        if (updates.role && updates.role !== user.role) {
            await this.updateUserPermissions(userId, updates.role);
        }

        this.app.services.logger.info('User updated', { userId, updates });
    }

    async updateUserPermissions(userId, newRole) {
        // Remove all existing permissions
        await this.db.permissions.where('userId').equals(userId).delete();

        // Grant new role permissions
        await this.app.services.user.grantDefaultPermissions(userId, newRole);
    }

    async suspendUser(userId, reason) {
        await this.updateUser(userId, { status: 'suspended' });
        
        // Log out user
        await this.db.sessions.where('userId').equals(userId).delete();

        // Create suspension record
        await this.db.events.add({
            userId,
            type: 'user_suspended',
            action: 'suspend',
            metadata: { reason, suspendedBy: this.app.services.user.currentUser.id },
            timestamp: new Date().toISOString()
        });
    }

    // System Settings
    async getSettings() {
        const settings = await this.db.systemSettings.toArray();
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    }

    async updateSettings(updates) {
        for (const [key, value] of Object.entries(updates)) {
            await this.db.systemSettings.put({
                key,
                value,
                updated: new Date().toISOString()
            });
        }

        this.app.services.logger.info('System settings updated', { updates });
        
        // Apply settings immediately
        await this.applySettings(updates);
    }

    async applySettings(settings) {
        // Apply theme
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
        }

        // Apply other settings as needed
        if (settings.features) {
            // Enable/disable features
            Object.entries(settings.features).forEach(([feature, enabled]) => {
                if (this.app.services[feature]) {
                    this.app.services[feature].enabled = enabled;
                }
            });
        }
    }

    // Analytics
    async getAnalytics(dateRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange);

        const events = await this.db.events
            .where('timestamp')
            .above(startDate.toISOString())
            .toArray();

        return this.aggregateAnalytics(events);
    }

    aggregateAnalytics(events) {
        const analytics = {
            totalEvents: events.length,
            byType: {},
            byAction: {},
            timeline: {},
            topUsers: {}
        };

        events.forEach(event => {
            // By type
            analytics.byType[event.type] = (analytics.byType[event.type] || 0) + 1;

            // By action
            analytics.byAction[event.action] = (analytics.byAction[event.action] || 0) + 1;

            // Timeline (by day)
            const day = new Date(event.timestamp).toISOString().split('T')[0];
            analytics.timeline[day] = (analytics.timeline[day] || 0) + 1;

            // Top users
            if (event.userId) {
                analytics.topUsers[event.userId] = (analytics.topUsers[event.userId] || 0) + 1;
            }
        });

        // Convert to arrays and sort
        analytics.timeline = Object.entries(analytics.timeline)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        analytics.topUsers = Object.entries(analytics.topUsers)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return analytics;
    }

    // Announcements
    async createAnnouncement(announcement) {
        const id = await this.db.announcements.add({
            ...announcement,
            created: new Date().toISOString(),
            createdBy: this.app.services.user.currentUser.id
        });

        // Show to current users
        if (announcement.active) {
            this.app.services.message.showAnnouncement({ id, ...announcement });
        }

        return id;
    }

    async updateAnnouncement(id, updates) {
        await this.db.announcements.update(id, updates);
    }

    async deleteAnnouncement(id) {
        await this.db.announcements.delete(id);
    }

    // Maintenance
    async performMaintenance() {
        const tasks = [
            this.cleanupOldSessions(),
            this.cleanupOldErrors(),
            this.optimizeDatabase(),
            this.clearExpiredCache()
        ];

        const results = await Promise.allSettled(tasks);
        
        return results.map((result, index) => ({
            task: ['sessions', 'errors', 'database', 'cache'][index],
            status: result.status,
            result: result.value || result.reason?.message
        }));
    }

    async cleanupOldSessions() {
        const expired = await this.db.sessions
            .where('expires')
            .below(new Date().toISOString())
            .delete();

        return `Cleaned ${expired} expired sessions`;
    }

    async cleanupOldErrors() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const deleted = await this.db.errors
            .where('timestamp')
            .below(thirtyDaysAgo)
            .delete();

        return `Cleaned ${deleted} old errors`;
    }

    async optimizeDatabase() {
        // Compact database
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percent = (usage / quota * 100).toFixed(1);
            
            return `Database using ${this.formatBytes(usage)} of ${this.formatBytes(quota)} (${percent}%)`;
        }
        
        return 'Database optimization not supported';
    }

    async clearExpiredCache() {
        const expired = await this.db.cache
            .where('expires')
            .below(new Date().toISOString())
            .delete();

        return `Cleared ${expired} expired cache entries`;
    }

    // Helpers
    async calculateGrowth(table, days) {
        const now = new Date();
        const past = new Date(now - days * 24 * 60 * 60 * 1000);
        
        const currentCount = await this.db[table].count();
        const pastCount = await this.db[table]
            .where('created')
            .below(past.toISOString())
            .count();

        const growth = currentCount - pastCount;
        const growthPercent = pastCount > 0 ? (growth / pastCount * 100).toFixed(1) : 0;

        return {
            absolute: growth,
            percent: growthPercent
        };
    }

    async getAveragePerDay(table, days) {
        const count = await this.db[table].count();
        return (count / days).toFixed(1);
    }

    async getAverageResponseTime() {
        // Calculate average time between application and first status change
        const applications = await this.db.applications.toArray();
        let totalTime = 0;
        let count = 0;

        for (const app of applications) {
            if (app.status !== 'applied') {
                const events = await this.db.events
                    .where(['userId', 'type'])
                    .equals([app.userId, 'application_status_changed'])
                    .first();

                if (events) {
                    const timeDiff = new Date(events.timestamp) - new Date(app.appliedDate);
                    totalTime += timeDiff;
                    count++;
                }
            }
        }

        if (count === 0) return 'N/A';

        const avgHours = (totalTime / count / 1000 / 60 / 60).toFixed(1);
        return `${avgHours} hours`;
    }

    async getUsersByRole() {
        const roles = {};
        const users = await this.db.users.toArray();
        
        users.forEach(user => {
            roles[user.role] = (roles[user.role] || 0) + 1;
        });

        return roles;
    }

    async estimateDBSize() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return estimate.usage || 0;
        }
        return 0;
    }

    async getCacheSize() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            let totalSize = 0;

            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const requests = await cache.keys();
                
                for (const request of requests) {
                    const response = await cache.match(request);
                    if (response && response.headers.get('content-length')) {
                        totalSize += parseInt(response.headers.get('content-length'));
                    }
                }
            }

            return totalSize;
        }
        return 0;
    }

    getUptime() {
        const startTime = parseInt(sessionStorage.getItem('appStartTime') || Date.now());
        const uptime = Date.now() - startTime;
        
        const hours = Math.floor(uptime / 1000 / 60 / 60);
        const minutes = Math.floor((uptime / 1000 / 60) % 60);
        
        return `${hours}h ${minutes}m`;
    }

    async getPerformanceMetrics() {
        if ('performance' in window) {
            const entries = performance.getEntriesByType('navigation')[0];
            
            return {
                loadTime: entries.loadEventEnd - entries.loadEventStart,
                domReady: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
                renderTime: entries.domComplete - entries.domLoading
            };
        }
        
        return null;
    }

    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}