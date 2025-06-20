// Analytics Service - Comprehensive tracking and insights
// Privacy-first, all data stored locally

export class AnalyticsService {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.enabled = true;
        this.queue = [];
        this.initializeService();
    }

    async initializeService() {
        // Check user preference
        const settings = await this.db.systemSettings.get('analytics');
        this.enabled = settings?.value !== false;

        // Start collection if enabled
        if (this.enabled) {
            this.startCollection();
        }

        // Setup page visibility tracking
        this.setupVisibilityTracking();
    }

    // Generate unique session ID
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Main tracking method
    async track(eventName, properties = {}) {
        if (!this.enabled) return;

        const event = {
            userId: this.app.services.user.currentUser?.id || 'anonymous',
            type: 'analytics',
            action: eventName,
            metadata: {
                ...properties,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                referrer: document.referrer,
                device: this.getDeviceInfo(),
                performance: this.getPerformanceMetrics()
            },
            timestamp: new Date().toISOString()
        };

        // Add to queue
        this.queue.push(event);

        // Batch processing
        if (this.queue.length >= 10) {
            await this.flushQueue();
        }
    }

    // Flush event queue
    async flushQueue() {
        if (this.queue.length === 0) return;

        const events = [...this.queue];
        this.queue = [];

        try {
            await this.db.events.bulkAdd(events);
        } catch (error) {
            // Re-queue on failure
            this.queue.unshift(...events);
            this.app.services.logger.error('Analytics flush failed', error);
        }
    }

    // Track errors
    async trackError(error, context = {}) {
        await this.track('error', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            ...context
        });
    }

    // Track page views
    trackPageView(pageName, properties = {}) {
        this.track('page_view', {
            page: pageName,
            duration: Date.now() - this.startTime,
            ...properties
        });
    }

    // Track user interactions
    trackInteraction(element, action, value) {
        this.track('interaction', {
            element,
            action,
            value,
            timestamp: Date.now()
        });
    }

    // Track performance metrics
    async trackPerformance() {
        if (!('performance' in window)) return;

        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return;

        await this.track('performance', {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            renderTime: perfData.domComplete - perfData.domLoading,
            totalTime: perfData.loadEventEnd - perfData.fetchStart,
            resources: performance.getEntriesByType('resource').length
        });
    }

    // Start automatic collection
    startCollection() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');
            if (target) {
                const trackData = target.dataset.track;
                this.trackInteraction('click', trackData, target.textContent);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.track) {
                this.track('form_submit', {
                    formId: form.id,
                    formName: form.dataset.track
                });
            }
        });

        // Track search
        this.trackSearch();

        // Periodic performance tracking
        setInterval(() => this.trackPerformance(), 300000); // Every 5 minutes

        // Flush queue periodically
        setInterval(() => this.flushQueue(), 30000); // Every 30 seconds
    }

    // Track search queries
    trackSearch() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[data-search]');
        
        searchInputs.forEach(input => {
            let searchTimeout;
            
            input.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length > 2) {
                        this.track('search', {
                            query: e.target.value,
                            field: e.target.name || e.target.id
                        });
                    }
                }, 1000);
            });
        });
    }

    // Setup visibility tracking
    setupVisibilityTracking() {
        let hiddenTime = 0;
        let lastHidden = null;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                lastHidden = Date.now();
            } else if (lastHidden) {
                hiddenTime += Date.now() - lastHidden;
                this.track('visibility_change', {
                    hiddenDuration: Date.now() - lastHidden,
                    totalHidden: hiddenTime
                });
            }
        });

        // Track before unload
        window.addEventListener('beforeunload', () => {
            this.track('session_end', {
                duration: Date.now() - this.startTime,
                hiddenTime,
                activeTime: Date.now() - this.startTime - hiddenTime
            });
            
            // Force flush
            navigator.sendBeacon && this.sendBeacon();
        });
    }

    // Send beacon for critical data
    async sendBeacon() {
        if (!navigator.sendBeacon || this.queue.length === 0) return;

        const data = JSON.stringify(this.queue);
        const blob = new Blob([data], { type: 'application/json' });
        
        // In production, this would send to an analytics endpoint
        // For now, we just ensure data is saved locally
        await this.flushQueue();
    }

    // Get analytics data
    async getAnalytics(options = {}) {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            endDate = new Date(),
            userId = this.app.services.user.currentUser?.id,
            eventTypes = []
        } = options;

        let query = this.db.events
            .where('timestamp')
            .between(startDate.toISOString(), endDate.toISOString());

        if (userId) {
            query = query.and(event => event.userId === userId);
        }

        if (eventTypes.length > 0) {
            query = query.and(event => eventTypes.includes(event.action));
        }

        const events = await query.toArray();
        
        return this.processAnalytics(events, options);
    }

    // Process raw events into insights
    processAnalytics(events, options) {
        const analytics = {
            summary: this.generateSummary(events),
            timeline: this.generateTimeline(events, options),
            topEvents: this.getTopEvents(events),
            userBehavior: this.analyzeUserBehavior(events),
            performance: this.analyzePerformance(events),
            conversions: this.analyzeConversions(events),
            insights: this.generateInsights(events)
        };

        return analytics;
    }

    // Generate summary statistics
    generateSummary(events) {
        const summary = {
            totalEvents: events.length,
            uniqueUsers: new Set(events.map(e => e.userId)).size,
            uniqueSessions: new Set(events.map(e => e.metadata?.sessionId)).size,
            avgEventsPerSession: 0,
            avgSessionDuration: 0,
            bounceRate: 0
        };

        // Calculate averages
        const sessions = this.groupBySessions(events);
        const sessionDurations = [];
        let bounces = 0;

        Object.values(sessions).forEach(sessionEvents => {
            summary.avgEventsPerSession += sessionEvents.length;
            
            // Calculate session duration
            const start = new Date(sessionEvents[0].timestamp);
            const end = new Date(sessionEvents[sessionEvents.length - 1].timestamp);
            const duration = end - start;
            
            if (duration > 0) {
                sessionDurations.push(duration);
            }
            
            // Count bounces (sessions with only 1 page view)
            const pageViews = sessionEvents.filter(e => e.action === 'page_view').length;
            if (pageViews <= 1) bounces++;
        });

        summary.avgEventsPerSession /= Object.keys(sessions).length || 1;
        summary.avgSessionDuration = sessionDurations.length > 0 
            ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
            : 0;
        summary.bounceRate = (bounces / Object.keys(sessions).length * 100).toFixed(1);

        return summary;
    }

    // Generate timeline data
    generateTimeline(events, options) {
        const interval = options.interval || 'day';
        const timeline = {};

        events.forEach(event => {
            const date = new Date(event.timestamp);
            let key;

            switch (interval) {
                case 'hour':
                    key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
                    break;
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const week = this.getWeekNumber(date);
                    key = `${date.getFullYear()}-W${week}`;
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
            }

            timeline[key] = (timeline[key] || 0) + 1;
        });

        return Object.entries(timeline)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Get top events
    getTopEvents(events) {
        const eventCounts = {};
        
        events.forEach(event => {
            const key = event.action;
            eventCounts[key] = (eventCounts[key] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .map(([event, count]) => ({ event, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    // Analyze user behavior
    analyzeUserBehavior(events) {
        const behavior = {
            mostActiveHours: {},
            mostActiveDays: {},
            commonPaths: [],
            avgTimeOnPage: {},
            exitPages: {}
        };

        // Group by user sessions
        const userSessions = this.groupByUserSessions(events);

        Object.values(userSessions).forEach(sessions => {
            sessions.forEach(session => {
                // Active hours
                session.forEach(event => {
                    const hour = new Date(event.timestamp).getHours();
                    behavior.mostActiveHours[hour] = (behavior.mostActiveHours[hour] || 0) + 1;
                });

                // Page paths
                const pageViews = session.filter(e => e.action === 'page_view');
                for (let i = 0; i < pageViews.length - 1; i++) {
                    const path = `${pageViews[i].metadata.page} → ${pageViews[i + 1].metadata.page}`;
                    behavior.commonPaths.push(path);
                }

                // Exit pages
                if (pageViews.length > 0) {
                    const exitPage = pageViews[pageViews.length - 1].metadata.page;
                    behavior.exitPages[exitPage] = (behavior.exitPages[exitPage] || 0) + 1;
                }
            });
        });

        // Process common paths
        const pathCounts = {};
        behavior.commonPaths.forEach(path => {
            pathCounts[path] = (pathCounts[path] || 0) + 1;
        });
        
        behavior.commonPaths = Object.entries(pathCounts)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return behavior;
    }

    // Analyze performance metrics
    analyzePerformance(events) {
        const perfEvents = events.filter(e => e.action === 'performance');
        
        if (perfEvents.length === 0) {
            return { noData: true };
        }

        const metrics = {
            avgLoadTime: 0,
            avgRenderTime: 0,
            avgTotalTime: 0,
            loadTimeDistribution: {
                fast: 0,    // < 1s
                moderate: 0, // 1-3s
                slow: 0     // > 3s
            }
        };

        perfEvents.forEach(event => {
            const data = event.metadata;
            metrics.avgLoadTime += data.loadTime || 0;
            metrics.avgRenderTime += data.renderTime || 0;
            metrics.avgTotalTime += data.totalTime || 0;

            // Distribution
            const loadTime = data.totalTime || 0;
            if (loadTime < 1000) {
                metrics.loadTimeDistribution.fast++;
            } else if (loadTime < 3000) {
                metrics.loadTimeDistribution.moderate++;
            } else {
                metrics.loadTimeDistribution.slow++;
            }
        });

        // Calculate averages
        const count = perfEvents.length;
        metrics.avgLoadTime = Math.round(metrics.avgLoadTime / count);
        metrics.avgRenderTime = Math.round(metrics.avgRenderTime / count);
        metrics.avgTotalTime = Math.round(metrics.avgTotalTime / count);

        return metrics;
    }

    // Analyze conversions
    analyzeConversions(events) {
        const funnels = {
            registration: this.analyzeFunnel(events, [
                'page_view:landing',
                'page_view:signup',
                'form_submit:registration',
                'user_registered'
            ]),
            jobApplication: this.analyzeFunnel(events, [
                'page_view:job_details',
                'click:apply_button',
                'form_submit:application',
                'application_submitted'
            ]),
            resumeOptimization: this.analyzeFunnel(events, [
                'page_view:resume',
                'click:optimize_resume',
                'resume_analyzed',
                'resume_optimized'
            ])
        };

        return funnels;
    }

    // Analyze conversion funnel
    analyzeFunnel(events, steps) {
        const funnel = {
            steps: steps.map(step => ({
                name: step,
                count: 0,
                dropoff: 0
            })),
            totalConversion: 0
        };

        // Group by session
        const sessions = this.groupBySessions(events);

        Object.values(sessions).forEach(sessionEvents => {
            let currentStep = 0;
            
            sessionEvents.forEach(event => {
                const eventKey = `${event.action}:${event.metadata.page || event.metadata.formName || ''}`;
                
                if (currentStep < steps.length && eventKey.includes(steps[currentStep])) {
                    funnel.steps[currentStep].count++;
                    currentStep++;
                }
            });
        });

        // Calculate dropoffs
        for (let i = 0; i < funnel.steps.length - 1; i++) {
            const current = funnel.steps[i].count;
            const next = funnel.steps[i + 1].count;
            
            funnel.steps[i].dropoff = current > 0 
                ? ((current - next) / current * 100).toFixed(1)
                : 0;
        }

        // Total conversion
        if (funnel.steps.length > 0 && funnel.steps[0].count > 0) {
            const lastStep = funnel.steps[funnel.steps.length - 1];
            funnel.totalConversion = (lastStep.count / funnel.steps[0].count * 100).toFixed(1);
        }

        return funnel;
    }

    // Generate insights
    generateInsights(events) {
        const insights = [];
        const summary = this.generateSummary(events);
        const behavior = this.analyzeUserBehavior(events);
        const performance = this.analyzePerformance(events);

        // Bounce rate insight
        if (summary.bounceRate > 50) {
            insights.push({
                type: 'warning',
                category: 'engagement',
                message: `High bounce rate (${summary.bounceRate}%). Consider improving landing page content.`,
                priority: 'high'
            });
        }

        // Performance insight
        if (performance.avgTotalTime > 3000) {
            insights.push({
                type: 'warning',
                category: 'performance',
                message: `Slow average page load time (${(performance.avgTotalTime / 1000).toFixed(1)}s). Optimize for better user experience.`,
                priority: 'high'
            });
        }

        // Usage pattern insight
        const peakHour = Object.entries(behavior.mostActiveHours)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (peakHour) {
            insights.push({
                type: 'info',
                category: 'usage',
                message: `Peak usage at ${peakHour[0]}:00. Consider scheduling updates outside this time.`,
                priority: 'medium'
            });
        }

        // Feature adoption
        const featureEvents = events.filter(e => 
            ['resume_optimized', 'cover_letter_generated', 'batch_application'].includes(e.action)
        );
        
        if (featureEvents.length < events.length * 0.1) {
            insights.push({
                type: 'opportunity',
                category: 'adoption',
                message: 'Low adoption of advanced features. Consider improving feature discovery.',
                priority: 'medium'
            });
        }

        return insights;
    }

    // Helper methods
    groupBySessions(events) {
        const sessions = {};
        
        events.forEach(event => {
            const sessionId = event.metadata?.sessionId || 'unknown';
            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
            }
            sessions[sessionId].push(event);
        });

        return sessions;
    }

    groupByUserSessions(events) {
        const userSessions = {};
        
        events.forEach(event => {
            const userId = event.userId;
            const sessionId = event.metadata?.sessionId;
            
            if (!userSessions[userId]) {
                userSessions[userId] = {};
            }
            
            if (!userSessions[userId][sessionId]) {
                userSessions[userId][sessionId] = [];
            }
            
            userSessions[userId][sessionId].push(event);
        });

        // Convert to array format
        Object.keys(userSessions).forEach(userId => {
            userSessions[userId] = Object.values(userSessions[userId]);
        });

        return userSessions;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            deviceMemory: navigator.deviceMemory,
            hardwareConcurrency: navigator.hardwareConcurrency,
            connection: navigator.connection?.effectiveType
        };
    }

    getPerformanceMetrics() {
        if (!('performance' in window)) return {};

        return {
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            navigation: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime
            } : null
        };
    }

    // Export analytics data
    async exportAnalytics(format = 'json', options = {}) {
        const analytics = await this.getAnalytics(options);
        
        switch (format) {
            case 'json':
                return JSON.stringify(analytics, null, 2);
                
            case 'csv':
                return this.convertToCSV(analytics);
                
            case 'report':
                return this.generateReport(analytics);
                
            default:
                throw new Error('Unsupported export format');
        }
    }

    convertToCSV(analytics) {
        // Convert timeline to CSV
        const headers = ['Date', 'Events'];
        const rows = analytics.timeline.map(item => [item.date, item.count]);
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    generateReport(analytics) {
        return `
# Analytics Report
Generated: ${new Date().toLocaleString()}

## Summary
- Total Events: ${analytics.summary.totalEvents}
- Unique Users: ${analytics.summary.uniqueUsers}
- Unique Sessions: ${analytics.summary.uniqueSessions}
- Avg Events per Session: ${analytics.summary.avgEventsPerSession.toFixed(1)}
- Bounce Rate: ${analytics.summary.bounceRate}%

## Top Events
${analytics.topEvents.map(e => `- ${e.event}: ${e.count}`).join('\n')}

## Performance
- Avg Load Time: ${analytics.performance.avgLoadTime}ms
- Avg Render Time: ${analytics.performance.avgRenderTime}ms

## Insights
${analytics.insights.map(i => `- [${i.type}] ${i.message}`).join('\n')}
        `.trim();
    }

    // Privacy controls
    async disable() {
        this.enabled = false;
        await this.db.systemSettings.put({
            key: 'analytics',
            value: false,
            updated: new Date().toISOString()
        });
        
        this.app.services.message.info('Analytics disabled');
    }

    async enable() {
        this.enabled = true;
        await this.db.systemSettings.put({
            key: 'analytics',
            value: true,
            updated: new Date().toISOString()
        });
        
        this.app.services.message.success('Analytics enabled');
    }

    async clearData() {
        await this.db.events
            .where('type')
            .equals('analytics')
            .delete();
            
        this.app.services.message.success('Analytics data cleared');
    }
}

// Export singleton
export default AnalyticsService;