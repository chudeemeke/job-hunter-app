// AI Assistant Component - Intelligent Help System
// Provides contextual help, guidance, and automated actions

export class AIAssistant {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.context = null;
        this.conversationHistory = [];
        this.suggestions = [];
        this.floatingButton = null;
    }

    async initialize() {
        // Create floating help button
        this.createFloatingButton();
        
        // Load conversation history
        await this.loadHistory();
        
        // Set up context awareness
        this.setupContextAwareness();
        
        // Initialize help database
        await this.initializeHelpDatabase();
    }

    createFloatingButton() {
        this.floatingButton = document.createElement('div');
        this.floatingButton.className = 'ai-assistant-button';
        this.floatingButton.innerHTML = `
            <div class="assistant-icon">
                <span class="icon">🤖</span>
                <span class="pulse"></span>
            </div>
            <span class="assistant-label">Help Me</span>
        `;
        
        this.floatingButton.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.floatingButton);
        
        // Add styles
        this.injectStyles();
    }

    async toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            await this.open();
        }
    }

    async open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.floatingButton.classList.add('active');
        
        // Create assistant panel
        const panel = document.createElement('div');
        panel.className = 'ai-assistant-panel';
        panel.innerHTML = await this.renderPanel();
        document.body.appendChild(panel);
        
        // Animate in
        requestAnimationFrame(() => {
            panel.classList.add('active');
        });
        
        // Focus input
        setTimeout(() => {
            const input = panel.querySelector('.assistant-input');
            input?.focus();
        }, 300);
        
        // Attach event listeners
        this.attachPanelListeners(panel);
        
        // Generate initial suggestions
        await this.generateContextualSuggestions();
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.floatingButton.classList.remove('active');
        
        const panel = document.querySelector('.ai-assistant-panel');
        if (panel) {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        }
    }

    async renderPanel() {
        const currentView = this.getCurrentView();
        const suggestions = await this.getQuickActions(currentView);
        
        return `
            <div class="assistant-container">
                <div class="assistant-header">
                    <div class="header-left">
                        <h3 class="assistant-title">AI Assistant</h3>
                        <p class="assistant-subtitle">How can I help you today?</p>
                    </div>
                    <button class="close-button" onclick="aiAssistant.close()">×</button>
                </div>
                
                <div class="assistant-body">
                    <!-- Quick Actions -->
                    <div class="quick-actions-section">
                        <h4 class="section-title">Quick Actions for ${this.getViewName(currentView)}</h4>
                        <div class="quick-actions-grid">
                            ${suggestions.map(action => `
                                <button class="quick-action-card" onclick="aiAssistant.executeAction('${action.id}')">
                                    <div class="action-icon">${action.icon}</div>
                                    <div class="action-text">
                                        <div class="action-title">${action.title}</div>
                                        <div class="action-description">${action.description}</div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Common Tasks -->
                    <div class="common-tasks-section">
                        <h4 class="section-title">Common Tasks</h4>
                        <div class="task-list">
                            ${this.getCommonTasks().map(task => `
                                <button class="task-item" onclick="aiAssistant.handleTask('${task.id}')">
                                    <span class="task-icon">${task.icon}</span>
                                    <span class="task-label">${task.label}</span>
                                    <span class="task-arrow">→</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Insights -->
                    <div class="insights-section">
                        <h4 class="section-title">AI Insights</h4>
                        <div class="insights-content">
                            ${await this.generateInsights()}
                        </div>
                    </div>
                    
                    <!-- Help Search -->
                    <div class="help-search-section">
                        <h4 class="section-title">Search for Help</h4>
                        <div class="search-container">
                            <input 
                                type="text" 
                                class="assistant-input" 
                                placeholder="Type your question or describe what you need help with..."
                                onkeypress="aiAssistant.handleInput(event)"
                            >
                            <button class="search-button" onclick="aiAssistant.search()">
                                <span class="icon">🔍</span>
                            </button>
                        </div>
                        <div class="search-results" id="search-results"></div>
                    </div>
                    
                    <!-- Recent Actions -->
                    ${this.conversationHistory.length > 0 ? `
                        <div class="history-section">
                            <h4 class="section-title">Recent Actions</h4>
                            <div class="history-list">
                                ${this.conversationHistory.slice(-5).reverse().map(item => `
                                    <div class="history-item">
                                        <span class="history-icon">${this.getActionIcon(item.type)}</span>
                                        <span class="history-text">${item.text}</span>
                                        <span class="history-time">${this.formatTime(item.timestamp)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async getQuickActions(currentView) {
        const actions = {
            'dashboard': [
                {
                    id: 'optimize-profile',
                    icon: '✨',
                    title: 'Optimize My Profile',
                    description: 'AI will analyze and improve your profile'
                },
                {
                    id: 'find-best-matches',
                    icon: '🎯',
                    title: 'Find Best Job Matches',
                    description: 'Discover jobs that match your skills'
                },
                {
                    id: 'weekly-summary',
                    icon: '📊',
                    title: 'Generate Weekly Report',
                    description: 'See your application progress'
                }
            ],
            'job-listings': [
                {
                    id: 'smart-filter',
                    icon: '🔍',
                    title: 'Smart Filter Jobs',
                    description: 'AI filters based on your profile'
                },
                {
                    id: 'batch-save',
                    icon: '💾',
                    title: 'Save Best Matches',
                    description: 'Auto-save top matching jobs'
                },
                {
                    id: 'compare-jobs',
                    icon: '⚖️',
                    title: 'Compare Selected Jobs',
                    description: 'Side-by-side comparison'
                }
            ],
            'resume-manager': [
                {
                    id: 'improve-resume',
                    icon: '📝',
                    title: 'Improve Current Resume',
                    description: 'Get AI suggestions'
                },
                {
                    id: 'keyword-analysis',
                    icon: '🔤',
                    title: 'Keyword Analysis',
                    description: 'Find missing keywords'
                },
                {
                    id: 'generate-variants',
                    icon: '📑',
                    title: 'Generate Variations',
                    description: 'Create multiple versions'
                }
            ],
            'applications': [
                {
                    id: 'follow-up-reminders',
                    icon: '⏰',
                    title: 'Set Follow-up Reminders',
                    description: 'Never miss a follow-up'
                },
                {
                    id: 'status-analysis',
                    icon: '📈',
                    title: 'Analyze Success Rate',
                    description: 'Understand what works'
                },
                {
                    id: 'export-report',
                    icon: '📄',
                    title: 'Generate Report',
                    description: 'Export application data'
                }
            ]
        };

        return actions[currentView] || actions['dashboard'];
    }

    getCommonTasks() {
        return [
            { id: 'create-resume', icon: '📄', label: 'Create a new resume' },
            { id: 'find-remote', icon: '🌍', label: 'Find remote jobs' },
            { id: 'interview-prep', icon: '🎤', label: 'Prepare for interview' },
            { id: 'salary-research', icon: '💰', label: 'Research salaries' },
            { id: 'write-cover', icon: '✍️', label: 'Write cover letter' },
            { id: 'network-tips', icon: '🤝', label: 'Networking tips' }
        ];
    }

    async generateInsights() {
        const stats = await this.gatherUserStats();
        const insights = [];

        // Application pace insight
        if (stats.applicationsThisWeek < stats.averageWeekly * 0.5) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Your application pace has slowed down. Consistency is key to success!'
            });
        }

        // Success rate insight
        if (stats.interviewRate > 20) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: `Your ${stats.interviewRate}% interview rate is excellent! Keep it up!`
            });
        }

        // Profile completeness
        if (stats.profileCompleteness < 80) {
            insights.push({
                type: 'info',
                icon: 'ℹ️',
                message: 'Complete your profile to get better job matches'
            });
        }

        // Follow-up reminder
        if (stats.pendingFollowUps > 0) {
            insights.push({
                type: 'action',
                icon: '📧',
                message: `You have ${stats.pendingFollowUps} applications ready for follow-up`
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Everything looks great! Keep up the good work!'
            });
        }

        return insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-message">${insight.message}</span>
            </div>
        `).join('');
    }

    async executeAction(actionId) {
        const actions = {
            // Profile actions
            'optimize-profile': async () => {
                await this.optimizeUserProfile();
            },
            
            // Job search actions
            'find-best-matches': async () => {
                await this.findBestJobMatches();
            },
            
            'smart-filter': async () => {
                await this.applySmartFilters();
            },
            
            'batch-save': async () => {
                await this.batchSaveJobs();
            },
            
            // Resume actions
            'improve-resume': async () => {
                await this.improveResume();
            },
            
            'keyword-analysis': async () => {
                await this.analyzeKeywords();
            },
            
            // Application actions
            'follow-up-reminders': async () => {
                await this.setFollowUpReminders();
            },
            
            'status-analysis': async () => {
                await this.analyzeApplicationStatus();
            },
            
            // Reports
            'weekly-summary': async () => {
                await this.generateWeeklySummary();
            },
            
            'export-report': async () => {
                await this.exportApplicationReport();
            }
        };

        const action = actions[actionId];
        if (action) {
            try {
                // Show loading
                this.showLoading('Processing...');
                
                // Execute action
                await action();
                
                // Log action
                await this.logAction(actionId, 'quick_action');
                
                // Hide loading
                this.hideLoading();
                
            } catch (error) {
                this.app.services.logger.error('AI Assistant action failed', error);
                this.app.services.message.error('Something went wrong. Please try again.');
                this.hideLoading();
            }
        }
    }

    async handleTask(taskId) {
        const taskHandlers = {
            'create-resume': () => {
                this.close();
                window.location.hash = 'resume-manager';
            },
            
            'find-remote': async () => {
                this.close();
                window.location.hash = 'job-listings';
                // Wait for view to load
                setTimeout(() => {
                    const searchInput = document.querySelector('#job-search');
                    if (searchInput) {
                        searchInput.value = 'remote';
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }, 500);
            },
            
            'interview-prep': async () => {
                await this.showInterviewPrep();
            },
            
            'salary-research': async () => {
                await this.showSalaryResearch();
            },
            
            'write-cover': () => {
                this.close();
                window.location.hash = 'resume-manager';
                this.app.services.message.info('Select a job in Resume Manager to generate a cover letter');
            },
            
            'network-tips': async () => {
                await this.showNetworkingTips();
            }
        };

        const handler = taskHandlers[taskId];
        if (handler) {
            await handler();
            await this.logAction(taskId, 'common_task');
        }
    }

    async handleInput(event) {
        if (event.key === 'Enter') {
            await this.search();
        }
    }

    async search() {
        const input = document.querySelector('.assistant-input');
        const query = input?.value.trim();
        
        if (!query) return;
        
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
        
        try {
            // Search help database
            const results = await this.searchHelpDatabase(query);
            
            // Analyze query intent
            const intent = this.analyzeQueryIntent(query);
            
            // Generate response
            const response = await this.generateResponse(query, intent, results);
            
            // Display results
            resultsContainer.innerHTML = response;
            
            // Log search
            await this.logAction(query, 'search');
            
        } catch (error) {
            resultsContainer.innerHTML = '<div class="error">Failed to search. Please try again.</div>';
        }
    }

    async searchHelpDatabase(query) {
        // This would search through a comprehensive help database
        // For now, we'll use pattern matching
        
        const helpDatabase = [
            {
                keywords: ['optimize', 'resume', 'improve'],
                title: 'Resume Optimization',
                content: 'Our AI can analyze your resume and suggest improvements based on the job you\'re applying for.',
                action: 'Go to Resume Manager',
                actionId: 'navigate-resume'
            },
            {
                keywords: ['follow', 'up', 'reminder'],
                title: 'Follow-up Reminders',
                content: 'Set automatic reminders to follow up on your applications after 7-14 days.',
                action: 'View Applications',
                actionId: 'navigate-applications'
            },
            {
                keywords: ['interview', 'prepare', 'tips'],
                title: 'Interview Preparation',
                content: 'Get AI-generated interview questions and tips based on the job description.',
                action: 'Show Interview Tips',
                actionId: 'show-interview-tips'
            },
            {
                keywords: ['batch', 'apply', 'multiple'],
                title: 'Batch Applications',
                content: 'Apply to multiple jobs at once with customized resumes for each position.',
                action: 'Start Batch Apply',
                actionId: 'batch-apply'
            }
        ];

        const queryLower = query.toLowerCase();
        const results = helpDatabase.filter(item => 
            item.keywords.some(keyword => queryLower.includes(keyword))
        );

        return results;
    }

    analyzeQueryIntent(query) {
        const intents = {
            'how_to': /how (do|can|to)/i,
            'what_is': /what (is|are|does)/i,
            'where': /where (is|can|do)/i,
            'why': /why (is|does|should)/i,
            'help': /help|assist|support/i,
            'problem': /problem|issue|error|wrong/i,
            'feature': /feature|function|capability/i
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(query)) {
                return intent;
            }
        }

        return 'general';
    }

    async generateResponse(query, intent, results) {
        if (results.length === 0) {
            return `
                <div class="no-results">
                    <p>I couldn't find specific help for "${query}".</p>
                    <p>Try browsing our common tasks above or contact support.</p>
                </div>
            `;
        }

        return `
            <div class="search-results-list">
                ${results.map(result => `
                    <div class="result-item">
                        <h5 class="result-title">${result.title}</h5>
                        <p class="result-content">${result.content}</p>
                        ${result.action ? `
                            <button class="result-action" onclick="aiAssistant.executeHelp('${result.actionId}')">
                                ${result.action} →
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Specific AI Actions
    async optimizeUserProfile() {
        const profile = this.app.services.user.currentUser.profile;
        const completeness = this.calculateProfileCompleteness(profile);
        
        if (completeness === 100) {
            this.app.services.message.success('Your profile is already optimized!');
            return;
        }

        const suggestions = [];
        
        if (!profile.bio || profile.bio.length < 100) {
            suggestions.push('Add a compelling professional summary');
        }
        
        if (!profile.skills || profile.skills.length < 5) {
            suggestions.push('Add at least 5 key skills');
        }
        
        if (!profile.preferences?.jobPreferences) {
            suggestions.push('Set your job preferences for better matches');
        }

        const message = `
            <h4>Profile Optimization Suggestions</h4>
            <ul>
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <p>Completing these will improve your job matches by up to 40%!</p>
        `;

        this.app.services.message.info(message, {
            duration: 0,
            actions: [{
                label: 'Edit Profile',
                handler: () => {
                    this.close();
                    window.location.hash = 'profile';
                }
            }]
        });
    }

    async findBestJobMatches() {
        this.showLoading('Finding best matches...');
        
        try {
            // Get user preferences
            const preferences = this.app.services.user.currentUser.profile.preferences?.jobPreferences;
            
            // Get all jobs
            const jobs = await this.app.services.jobBoard.getAllJobs();
            
            // Score and sort
            const scoredJobs = jobs.map(job => ({
                ...job,
                matchScore: this.calculateJobMatch(job, preferences)
            }));
            
            const topMatches = scoredJobs
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 10);
            
            // Save top matches
            for (const job of topMatches) {
                await this.app.services.jobBoard.saveJob(job.id);
            }
            
            this.hideLoading();
            this.close();
            
            this.app.services.message.success(`Found and saved ${topMatches.length} best matching jobs!`);
            
            // Navigate to saved jobs
            window.location.hash = 'job-listings?filter=saved';
            
        } catch (error) {
            this.hideLoading();
            this.app.services.message.error('Failed to find matches. Please try again.');
        }
    }

    async applySmartFilters() {
        const preferences = this.app.services.user.currentUser.profile.preferences?.jobPreferences;
        
        if (!preferences) {
            this.app.services.message.warning('Please set your job preferences first');
            return;
        }
        
        // Apply filters to job search
        const filters = {
            keywords: preferences.keywords.join(' '),
            location: preferences.preferRemote ? 'remote' : preferences.locations[0],
            type: preferences.types[0],
            minSalary: preferences.minSalary
        };
        
        // Update UI filters
        Object.entries(filters).forEach(([key, value]) => {
            const element = document.querySelector(`[data-filter="${key}"]`);
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('change'));
            }
        });
        
        this.close();
        this.app.services.message.success('Smart filters applied based on your preferences!');
    }

    async improveResume() {
        const baseResume = localStorage.getItem('base_resume');
        
        if (!baseResume) {
            this.app.services.message.warning('Please add your resume first');
            this.close();
            window.location.hash = 'resume-manager';
            return;
        }
        
        // Analyze resume
        const analysis = this.analyzeResumeQuality(baseResume);
        
        const suggestions = [];
        
        if (analysis.quantificationScore < 50) {
            suggestions.push({
                type: 'improvement',
                title: 'Add Quantifiable Achievements',
                message: 'Include numbers, percentages, and metrics to make your impact concrete'
            });
        }
        
        if (analysis.keywordDensity < 30) {
            suggestions.push({
                type: 'improvement',
                title: 'Optimize Keywords',
                message: 'Add industry-specific keywords and technical skills'
            });
        }
        
        if (analysis.readabilityScore < 60) {
            suggestions.push({
                type: 'improvement',
                title: 'Improve Readability',
                message: 'Use shorter sentences and bullet points for better scanning'
            });
        }

        const message = `
            <h4>Resume Analysis</h4>
            <div class="analysis-scores">
                <div>Overall Score: ${analysis.overallScore}/100</div>
                <div>Quantification: ${analysis.quantificationScore}/100</div>
                <div>Keywords: ${analysis.keywordDensity}/100</div>
                <div>Readability: ${analysis.readabilityScore}/100</div>
            </div>
            <h5>Improvement Suggestions:</h5>
            ${suggestions.map(s => `
                <div class="suggestion-item">
                    <strong>${s.title}</strong>
                    <p>${s.message}</p>
                </div>
            `).join('')}
        `;

        this.app.services.message.info(message, {
            duration: 0,
            actions: [{
                label: 'Optimize Now',
                handler: () => {
                    this.close();
                    window.location.hash = 'resume-manager';
                }
            }]
        });
    }

    async generateWeeklySummary() {
        this.showLoading('Generating weekly summary...');
        
        try {
            const stats = await this.gatherUserStats();
            const insights = await this.generateWeeklyInsights(stats);
            
            const summary = `
                <h3>Your Weekly Summary</h3>
                
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-value">${stats.applicationsThisWeek}</span>
                        <span class="stat-label">Applications Sent</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${stats.interviewsThisWeek}</span>
                        <span class="stat-label">Interviews Scheduled</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${stats.responseRate}%</span>
                        <span class="stat-label">Response Rate</span>
                    </div>
                </div>
                
                <h4>Key Insights</h4>
                <div class="insights-list">
                    ${insights.map(insight => `
                        <div class="insight">
                            <span class="insight-icon">${insight.icon}</span>
                            <span>${insight.message}</span>
                        </div>
                    `).join('')}
                </div>
                
                <h4>Recommendations</h4>
                <ul>
                    ${this.generateWeeklyRecommendations(stats).map(rec => 
                        `<li>${rec}</li>`
                    ).join('')}
                </ul>
            `;
            
            this.hideLoading();
            
            this.app.services.message.info(summary, {
                duration: 0,
                title: `Week of ${this.getWeekDateRange()}`,
                actions: [{
                    label: 'Download Report',
                    handler: () => this.downloadWeeklyReport(stats, insights)
                }]
            });
            
        } catch (error) {
            this.hideLoading();
            this.app.services.message.error('Failed to generate summary');
        }
    }

    // Helper Methods
    setupContextAwareness() {
        // Monitor view changes
        window.addEventListener('hashchange', () => {
            this.context = this.getCurrentContext();
            if (this.isOpen) {
                this.refreshPanel();
            }
        });
        
        // Monitor user actions
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.trackUserAction(action);
            }
        });
    }

    getCurrentView() {
        const hash = window.location.hash.slice(1).split('?')[0];
        return hash || 'dashboard';
    }

    getViewName(view) {
        const names = {
            'dashboard': 'Dashboard',
            'job-listings': 'Job Search',
            'resume-manager': 'Resume Manager',
            'applications': 'Applications',
            'profile': 'Profile',
            'settings': 'Settings'
        };
        return names[view] || 'This Page';
    }

    getCurrentContext() {
        return {
            view: this.getCurrentView(),
            timestamp: Date.now(),
            user: this.app.services.user.currentUser
        };
    }

    async loadHistory() {
        const saved = localStorage.getItem('ai_assistant_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }

    async saveHistory() {
        localStorage.setItem('ai_assistant_history', JSON.stringify(this.conversationHistory));
    }

    async logAction(action, type) {
        const entry = {
            action,
            type,
            timestamp: Date.now(),
            context: this.getCurrentContext(),
            text: this.getActionDescription(action)
        };
        
        this.conversationHistory.push(entry);
        
        // Keep last 50 actions
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        await this.saveHistory();
        
        // Track in analytics
        this.app.services.analytics?.track('ai_assistant_action', {
            action,
            type,
            view: entry.context.view
        });
    }

    getActionDescription(action) {
        const descriptions = {
            'optimize-profile': 'Optimized user profile',
            'find-best-matches': 'Found best job matches',
            'smart-filter': 'Applied smart filters',
            'improve-resume': 'Analyzed resume quality',
            'weekly-summary': 'Generated weekly summary'
        };
        
        return descriptions[action] || action;
    }

    getActionIcon(type) {
        const icons = {
            'quick_action': '⚡',
            'common_task': '📋',
            'search': '🔍',
            'help': '❓',
            'navigation': '🧭'
        };
        return icons[type] || '📌';
    }

    async gatherUserStats() {
        const userId = this.app.services.user.currentUser.id;
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        
        const applications = await this.app.db.applications
            .where('userId')
            .equals(userId)
            .toArray();
        
        const thisWeek = applications.filter(app => 
            new Date(app.appliedDate) > weekAgo
        );
        
        const interviews = applications.filter(app => 
            app.status === 'interview'
        );
        
        const interviewsThisWeek = interviews.filter(app =>
            new Date(app.lastUpdated || app.appliedDate) > weekAgo
        );
        
        const responded = applications.filter(app => 
            app.status !== 'applied'
        );
        
        const profile = this.app.services.user.currentUser.profile;
        
        return {
            totalApplications: applications.length,
            applicationsThisWeek: thisWeek.length,
            averageWeekly: Math.round(applications.length / 4), // Assuming 4 weeks
            interviews: interviews.length,
            interviewsThisWeek: interviewsThisWeek.length,
            interviewRate: applications.length > 0 ? 
                Math.round((interviews.length / applications.length) * 100) : 0,
            responseRate: applications.length > 0 ?
                Math.round((responded.length / applications.length) * 100) : 0,
            profileCompleteness: this.calculateProfileCompleteness(profile),
            pendingFollowUps: applications.filter(app => {
                if (app.status !== 'applied') return false;
                const days = (now - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
                return days >= 7 && days <= 14;
            }).length
        };
    }

    calculateProfileCompleteness(profile) {
        let score = 0;
        const checks = [
            profile.displayName,
            profile.bio && profile.bio.length > 50,
            profile.skills && profile.skills.length > 3,
            profile.experience && profile.experience.length > 0,
            profile.education,
            profile.preferences?.jobPreferences,
            profile.avatar !== '/assets/default-avatar.png',
            profile.contactInfo?.email,
            profile.contactInfo?.phone,
            profile.contactInfo?.linkedin
        ];
        
        checks.forEach(check => {
            if (check) score += 10;
        });
        
        return score;
    }

    calculateJobMatch(job, preferences) {
        if (!preferences) return 50;
        
        let score = 50;
        
        // Keywords match
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        preferences.keywords?.forEach(keyword => {
            if (jobText.includes(keyword.toLowerCase())) {
                score += 5;
            }
        });
        
        // Location match
        if (preferences.preferRemote && job.location === 'Remote') {
            score += 15;
        } else if (preferences.locations?.includes(job.location)) {
            score += 10;
        }
        
        // Type match
        if (preferences.types?.includes(job.type)) {
            score += 10;
        }
        
        // Salary match
        if (job.salary && preferences.minSalary) {
            const jobSalary = this.parseSalary(job.salary);
            if (jobSalary >= preferences.minSalary) {
                score += 10;
            }
        }
        
        return Math.min(score, 100);
    }

    parseSalary(salaryString) {
        const match = salaryString.match(/\d+/);
        return match ? parseInt(match[0]) * 1000 : 0;
    }

    analyzeResumeQuality(resume) {
        const lines = resume.split('\n');
        const words = resume.split(/\s+/);
        
        // Quantification score
        const numbers = resume.match(/\d+/g) || [];
        const quantificationScore = Math.min((numbers.length / lines.length) * 100, 100);
        
        // Keyword density
        const techKeywords = ['developed', 'implemented', 'managed', 'led', 'created', 
                            'designed', 'built', 'improved', 'increased', 'reduced'];
        const keywordCount = techKeywords.filter(keyword => 
            resume.toLowerCase().includes(keyword)
        ).length;
        const keywordDensity = (keywordCount / techKeywords.length) * 100;
        
        // Readability
        const avgWordsPerLine = words.length / lines.length;
        const readabilityScore = avgWordsPerLine < 20 ? 80 : 
                                avgWordsPerLine < 30 ? 60 : 40;
        
        // Overall score
        const overallScore = Math.round(
            (quantificationScore + keywordDensity + readabilityScore) / 3
        );
        
        return {
            overallScore,
            quantificationScore: Math.round(quantificationScore),
            keywordDensity: Math.round(keywordDensity),
            readabilityScore
        };
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h ago`;
        } else {
            return new Date(timestamp).toLocaleDateString();
        }
    }

    showLoading(message = 'Loading...') {
        const panel = document.querySelector('.ai-assistant-panel');
        if (panel) {
            const loader = document.createElement('div');
            loader.className = 'assistant-loader';
            loader.innerHTML = `
                <div class="loader-spinner"></div>
                <div class="loader-message">${message}</div>
            `;
            panel.appendChild(loader);
        }
    }

    hideLoading() {
        const loader = document.querySelector('.assistant-loader');
        loader?.remove();
    }

    async refreshPanel() {
        const panel = document.querySelector('.assistant-container');
        if (panel) {
            panel.innerHTML = await this.renderPanel();
            this.attachPanelListeners(panel.parentElement);
        }
    }

    attachPanelListeners(panel) {
        // Re-attach any dynamic listeners
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* AI Assistant Styles */
            .ai-assistant-button {
                position: fixed;
                bottom: 2rem;
                left: 2rem;
                background: var(--primary);
                color: white;
                border-radius: 50px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s ease;
                z-index: 1000;
            }

            .ai-assistant-button:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow-xl);
            }

            .ai-assistant-button.active {
                background: var(--primary-dark);
            }

            .assistant-icon {
                position: relative;
                font-size: 1.5rem;
            }

            .pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.5);
                    opacity: 0;
                }
            }

            .assistant-label {
                font-weight: 600;
                font-size: 1rem;
            }

            /* Assistant Panel */
            .ai-assistant-panel {
                position: fixed;
                right: 2rem;
                bottom: 6rem;
                width: 450px;
                max-height: 600px;
                background: var(--bg-primary);
                border-radius: 16px;
                box-shadow: var(--shadow-xl);
                z-index: 1001;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
            }

            .ai-assistant-panel.active {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .assistant-container {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .assistant-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .assistant-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0;
                color: var(--text-primary);
            }

            .assistant-subtitle {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin: 0.25rem 0 0;
            }

            .close-button {
                width: 36px;
                height: 36px;
                border: none;
                background: var(--bg-secondary);
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .close-button:hover {
                background: var(--bg-tertiary);
                transform: scale(1.1);
            }

            .assistant-body {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }

            /* Quick Actions */
            .quick-actions-section,
            .common-tasks-section,
            .insights-section,
            .help-search-section,
            .history-section {
                margin-bottom: 2rem;
            }

            .section-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0 0 1rem;
            }

            .quick-actions-grid {
                display: grid;
                gap: 0.75rem;
            }

            .quick-action-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--bg-secondary);
                border: 2px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: left;
                width: 100%;
            }

            .quick-action-card:hover {
                border-color: var(--primary);
                transform: translateX(4px);
            }

            .action-icon {
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-primary);
                border-radius: 10px;
            }

            .action-text {
                flex: 1;
            }

            .action-title {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .action-description {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            /* Common Tasks */
            .task-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .task-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                background: var(--bg-secondary);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                width: 100%;
                text-align: left;
            }

            .task-item:hover {
                background: var(--bg-tertiary);
                transform: translateX(4px);
            }

            .task-icon {
                font-size: 1.25rem;
            }

            .task-label {
                flex: 1;
                color: var(--text-primary);
            }

            .task-arrow {
                color: var(--text-secondary);
                transition: all 0.2s;
            }

            .task-item:hover .task-arrow {
                transform: translateX(4px);
            }

            /* Insights */
            .insights-content {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .insight-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                font-size: 0.875rem;
            }

            .insight-item.warning {
                background: rgba(var(--warning-rgb), 0.1);
                color: var(--warning);
            }

            .insight-item.success {
                background: rgba(var(--success-rgb), 0.1);
                color: var(--success);
            }

            .insight-item.info {
                background: rgba(var(--info-rgb), 0.1);
                color: var(--info);
            }

            .insight-item.action {
                background: rgba(var(--primary-rgb), 0.1);
                color: var(--primary);
            }

            .insight-icon {
                font-size: 1.25rem;
            }

            .insight-message {
                flex: 1;
            }

            /* Search */
            .search-container {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .assistant-input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .assistant-input:focus {
                outline: none;
                border-color: var(--primary);
                background: var(--bg-primary);
            }

            .search-button {
                width: 44px;
                height: 44px;
                border: none;
                background: var(--primary);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .search-button:hover {
                background: var(--primary-dark);
                transform: scale(1.05);
            }

            /* Search Results */
            .search-results {
                max-height: 200px;
                overflow-y: auto;
            }

            .result-item {
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }

            .result-title {
                font-weight: 600;
                color: var(--text-primary);
                margin: 0 0 0.5rem;
            }

            .result-content {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin: 0 0 0.75rem;
                line-height: 1.5;
            }

            .result-action {
                font-size: 0.875rem;
                color: var(--primary);
                background: none;
                border: none;
                cursor: pointer;
                font-weight: 500;
                padding: 0;
                transition: all 0.2s;
            }

            .result-action:hover {
                transform: translateX(4px);
            }

            /* History */
            .history-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .history-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .history-icon {
                font-size: 1rem;
            }

            .history-text {
                flex: 1;
            }

            .history-time {
                font-size: 0.75rem;
                color: var(--text-tertiary);
            }

            /* Loading */
            .assistant-loader {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(var(--bg-primary-rgb), 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(5px);
                border-radius: 16px;
                z-index: 10;
            }

            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border-color);
                border-top-color: var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loader-message {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            /* Empty States */
            .no-results {
                text-align: center;
                padding: 2rem 1rem;
                color: var(--text-secondary);
            }

            .no-results p {
                margin: 0.5rem 0;
            }

            /* Responsive */
            @media (max-width: 640px) {
                .ai-assistant-button {
                    bottom: 1rem;
                    left: 1rem;
                    padding: 0.875rem 1.25rem;
                }

                .assistant-label {
                    display: none;
                }

                .ai-assistant-panel {
                    right: 1rem;
                    left: 1rem;
                    width: auto;
                    bottom: 5rem;
                    max-height: 70vh;
                }
            }

            /* Dark Mode */
            [data-theme="dark"] .ai-assistant-panel {
                background: var(--bg-secondary);
            }

            [data-theme="dark"] .quick-action-card,
            [data-theme="dark"] .task-item {
                background: var(--bg-tertiary);
            }

            [data-theme="dark"] .action-icon {
                background: var(--bg-secondary);
            }
        `;
        
        document.head.appendChild(style);
    }

    // Additional methods for specific features would go here...
}

// Create singleton instance
export const aiAssistant = new AIAssistant(window.app);

// Initialize when app is ready
window.addEventListener('load', () => {
    setTimeout(() => {
        aiAssistant.initialize();
    }, 1000);
});