// Dashboard View - Main user interface
// Intelligent, beautiful, and feature-rich

export default class DashboardView {
    constructor(app) {
        this.app = app;
        this.widgets = new Map();
        this.refreshInterval = null;
    }

    async render() {
        const user = this.app.services.user.currentUser;
        const stats = await this.loadDashboardData();

        return `
            <div class="dashboard-container">
                <!-- Header -->
                <header class="dashboard-header">
                    <div class="header-content">
                        <div class="header-left">
                            <h1 class="dashboard-title">
                                Good ${this.getTimeOfDay()}, ${user.profile.displayName} 👋
                            </h1>
                            <p class="dashboard-subtitle">
                                ${this.getMotivationalMessage(stats)}
                            </p>
                        </div>
                        <div class="header-right">
                            <button class="icon-button" data-tooltip="Search" data-action="search">
                                🔍
                            </button>
                            <button class="icon-button" data-tooltip="Notifications" data-action="notifications">
                                🔔
                                ${stats.unreadNotifications > 0 ? `<span class="badge">${stats.unreadNotifications}</span>` : ''}
                            </button>
                            <div class="user-menu">
                                <button class="user-avatar" data-action="profile">
                                    <img src="${user.profile.avatar}" alt="${user.profile.displayName}">
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Quick Actions -->
                <section class="quick-actions">
                    <div class="action-cards">
                        <button class="action-card primary" data-action="smart-search">
                            <div class="action-icon">🎯</div>
                            <div class="action-content">
                                <h3>Smart Job Search</h3>
                                <p>AI-powered job matching</p>
                            </div>
                            <div class="action-arrow">→</div>
                        </button>
                        
                        <button class="action-card success" data-action="optimize-resume">
                            <div class="action-icon">📄</div>
                            <div class="action-content">
                                <h3>Optimize Resume</h3>
                                <p>${stats.aiConfidence}% AI confidence</p>
                            </div>
                            <div class="action-arrow">→</div>
                        </button>
                        
                        <button class="action-card info" data-action="batch-apply">
                            <div class="action-icon">🚀</div>
                            <div class="action-content">
                                <h3>Batch Apply</h3>
                                <p>${stats.readyToApply} jobs ready</p>
                            </div>
                            <div class="action-arrow">→</div>
                        </button>
                    </div>
                </section>

                <!-- Main Dashboard Grid -->
                <div class="dashboard-grid">
                    <!-- Stats Overview -->
                    <div class="widget widget-stats">
                        <div class="widget-header">
                            <h2 class="widget-title">Your Progress</h2>
                            <button class="widget-action" data-action="view-analytics">
                                View Details
                            </button>
                        </div>
                        <div class="widget-content">
                            <div class="stat-cards">
                                <div class="stat-card">
                                    <div class="stat-value">${stats.totalApplications}</div>
                                    <div class="stat-label">Applications</div>
                                    <div class="stat-trend ${stats.applicationsTrend.direction}">
                                        ${stats.applicationsTrend.direction === 'up' ? '↑' : '↓'} 
                                        ${stats.applicationsTrend.percent}% this week
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${stats.interviews}</div>
                                    <div class="stat-label">Interviews</div>
                                    <div class="stat-progress">
                                        <div class="progress-bar" style="width: ${stats.interviewRate}%"></div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${stats.responseRate}%</div>
                                    <div class="stat-label">Response Rate</div>
                                    <div class="stat-indicator ${this.getResponseRateClass(stats.responseRate)}">
                                        ${this.getResponseRateLabel(stats.responseRate)}
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${stats.savedJobs}</div>
                                    <div class="stat-label">Saved Jobs</div>
                                    <div class="stat-action">
                                        <button class="link-button" data-action="view-saved">View all</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Insights Widget -->
                    <div class="widget widget-insights">
                        <div class="widget-header">
                            <h2 class="widget-title">
                                <span class="ai-badge">AI</span> Insights & Suggestions
                            </h2>
                            <div class="widget-meta">
                                Last updated: ${this.formatTime(stats.insightsUpdated)}
                            </div>
                        </div>
                        <div class="widget-content">
                            ${this.renderInsights(stats.insights)}
                        </div>
                    </div>

                    <!-- Recent Applications -->
                    <div class="widget widget-applications">
                        <div class="widget-header">
                            <h2 class="widget-title">Recent Applications</h2>
                            <button class="widget-action" data-action="view-all-applications">
                                View All
                            </button>
                        </div>
                        <div class="widget-content">
                            <div class="application-list">
                                ${stats.recentApplications.map(app => this.renderApplicationItem(app)).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Upcoming Tasks -->
                    <div class="widget widget-tasks">
                        <div class="widget-header">
                            <h2 class="widget-title">Today's Tasks</h2>
                            <span class="task-count">${stats.todaysTasks.length} tasks</span>
                        </div>
                        <div class="widget-content">
                            <div class="task-list">
                                ${stats.todaysTasks.map(task => this.renderTaskItem(task)).join('')}
                            </div>
                            ${stats.todaysTasks.length === 0 ? 
                                '<div class="empty-state">🎉 All caught up!</div>' : 
                                ''
                            }
                        </div>
                    </div>

                    <!-- Job Recommendations -->
                    <div class="widget widget-recommendations">
                        <div class="widget-header">
                            <h2 class="widget-title">
                                <span class="ai-badge">AI</span> Job Matches
                            </h2>
                            <button class="widget-action" data-action="refresh-matches">
                                Refresh
                            </button>
                        </div>
                        <div class="widget-content">
                            <div class="job-matches">
                                ${stats.jobMatches.map(job => this.renderJobMatch(job)).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Learning Progress -->
                    <div class="widget widget-learning">
                        <div class="widget-header">
                            <h2 class="widget-title">AI Learning Progress</h2>
                        </div>
                        <div class="widget-content">
                            <div class="learning-stats">
                                <div class="learning-item">
                                    <span class="learning-label">Corrections learned</span>
                                    <span class="learning-value">${stats.aiLearning.corrections}</span>
                                </div>
                                <div class="learning-item">
                                    <span class="learning-label">Success patterns</span>
                                    <span class="learning-value">${stats.aiLearning.patterns}</span>
                                </div>
                                <div class="learning-item">
                                    <span class="learning-label">Accuracy improvement</span>
                                    <span class="learning-value">+${stats.aiLearning.improvement}%</span>
                                </div>
                            </div>
                            <div class="learning-message">
                                ${this.getAILearningMessage(stats.aiLearning)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating Action Button -->
                <button class="fab" data-action="quick-apply">
                    <span class="fab-icon">⚡</span>
                </button>
            </div>

            <style>
                .dashboard-container {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                    padding-bottom: 2rem;
                }

                /* Header */
                .dashboard-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(var(--bg-primary-rgb), 0.95);
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.5rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    flex: 1;
                }

                .dashboard-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem;
                }

                .dashboard-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .icon-button {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    border: none;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-button:hover {
                    background: var(--gray-200);
                    transform: translateY(-1px);
                }

                .badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--danger);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.125rem 0.375rem;
                    border-radius: 999px;
                    min-width: 20px;
                }

                .user-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    padding: 0;
                    background: none;
                }

                .user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .user-avatar:hover {
                    border-color: var(--primary);
                    transform: scale(1.05);
                }

                /* Quick Actions */
                .quick-actions {
                    max-width: 1400px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                }

                .action-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .action-card {
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    text-align: left;
                    width: 100%;
                }

                .action-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: currentColor;
                }

                .action-card.primary {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .action-card.success {
                    border-color: var(--success);
                    color: var(--success);
                }

                .action-card.info {
                    border-color: var(--info);
                    color: var(--info);
                }

                .action-icon {
                    font-size: 2.5rem;
                    opacity: 0.9;
                }

                .action-content {
                    flex: 1;
                }

                .action-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem;
                    color: var(--text-primary);
                }

                .action-content p {
                    font-size: 0.875rem;
                    margin: 0;
                    opacity: 0.8;
                }

                .action-arrow {
                    font-size: 1.5rem;
                    opacity: 0.5;
                    transition: all 0.2s;
                }

                .action-card:hover .action-arrow {
                    opacity: 1;
                    transform: translateX(4px);
                }

                /* Dashboard Grid */
                .dashboard-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 1.5rem;
                }

                /* Widgets */
                .widget {
                    background: var(--bg-primary);
                    border-radius: 16px;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .widget-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .widget-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .widget-action {
                    font-size: 0.875rem;
                    color: var(--primary);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .widget-action:hover {
                    color: var(--primary-dark);
                    text-decoration: underline;
                }

                .widget-content {
                    padding: 1.5rem;
                    flex: 1;
                }

                /* Widget Sizes */
                .widget-stats {
                    grid-column: span 12;
                }

                .widget-insights {
                    grid-column: span 12;
                    lg:grid-column: span 6;
                }

                .widget-applications {
                    grid-column: span 12;
                    lg:grid-column: span 6;
                }

                .widget-tasks {
                    grid-column: span 12;
                    md:grid-column: span 6;
                    lg:grid-column: span 4;
                }

                .widget-recommendations {
                    grid-column: span 12;
                    md:grid-column: span 6;
                    lg:grid-column: span 5;
                }

                .widget-learning {
                    grid-column: span 12;
                    lg:grid-column: span 3;
                }

                /* Stats Cards */
                .stat-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    text-align: center;
                    padding: 1.5rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .stat-trend {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .stat-trend.up {
                    color: var(--success);
                }

                .stat-trend.down {
                    color: var(--danger);
                }

                .stat-progress {
                    height: 4px;
                    background: var(--gray-200);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 0.5rem;
                }

                .progress-bar {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 2px;
                    transition: width 0.3s;
                }

                /* AI Badge */
                .ai-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.125rem 0.5rem;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 999px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Insights */
                .insight-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .insight-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .insight-item:hover {
                    background: var(--bg-tertiary);
                    transform: translateX(4px);
                }

                .insight-icon {
                    font-size: 1.5rem;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 10px;
                    flex-shrink: 0;
                }

                .insight-content {
                    flex: 1;
                }

                .insight-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .insight-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .insight-action {
                    font-size: 0.875rem;
                    color: var(--primary);
                    font-weight: 500;
                    margin-top: 0.5rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                /* Application List */
                .application-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .application-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .application-item:hover {
                    background: var(--bg-tertiary);
                }

                .company-logo {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background: var(--gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .application-details {
                    flex: 1;
                }

                .application-position {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.125rem;
                }

                .application-company {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .application-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-applied {
                    background: var(--info);
                    color: white;
                }

                .status-interview {
                    background: var(--success);
                    color: white;
                }

                .status-rejected {
                    background: var(--danger);
                    color: white;
                }

                /* Task List */
                .task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .task-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .task-item:hover {
                    background: var(--bg-tertiary);
                }

                .task-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .task-checkbox.checked {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .task-checkbox.checked::after {
                    content: '✓';
                    color: white;
                    font-size: 0.875rem;
                }

                .task-text {
                    flex: 1;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }

                .task-text.completed {
                    text-decoration: line-through;
                    color: var(--text-secondary);
                }

                .task-time {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                /* Job Matches */
                .job-matches {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .job-match {
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .job-match:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }

                .match-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 0.75rem;
                }

                .match-score {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--success);
                    color: white;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .job-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .job-company {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .job-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .job-tag {
                    padding: 0.25rem 0.5rem;
                    background: var(--gray-100);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    border-radius: 4px;
                }

                /* Learning Widget */
                .learning-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .learning-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .learning-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .learning-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .learning-message {
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    text-align: center;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                    font-size: 1.125rem;
                }

                /* FAB */
                .fab {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    box-shadow: var(--shadow-lg);
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                }

                .fab:hover {
                    transform: scale(1.1);
                    box-shadow: var(--shadow-xl);
                }

                .fab:active {
                    transform: scale(0.95);
                }

                .fab-icon {
                    font-size: 1.5rem;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .dashboard-grid {
                        padding: 0 1rem;
                    }

                    .widget {
                        grid-column: span 12 !important;
                    }

                    .stat-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .header-content {
                        padding: 1rem;
                    }

                    .dashboard-title {
                        font-size: 1.5rem;
                    }

                    .action-cards {
                        grid-template-columns: 1fr;
                    }

                    .stat-cards {
                        grid-template-columns: 1fr;
                    }

                    .fab {
                        bottom: 1rem;
                        right: 1rem;
                        width: 56px;
                        height: 56px;
                    }
                }

                /* Dark mode adjustments */
                [data-theme="dark"] .action-card {
                    background: var(--bg-secondary);
                }

                [data-theme="dark"] .stat-card {
                    background: var(--bg-tertiary);
                }

                [data-theme="dark"] .insight-icon {
                    background: var(--bg-tertiary);
                }

                /* Animations */
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .widget {
                    animation: slideIn 0.5s ease backwards;
                }

                .widget:nth-child(1) { animation-delay: 0.1s; }
                .widget:nth-child(2) { animation-delay: 0.2s; }
                .widget:nth-child(3) { animation-delay: 0.3s; }
                .widget:nth-child(4) { animation-delay: 0.4s; }
                .widget:nth-child(5) { animation-delay: 0.5s; }
                .widget:nth-child(6) { animation-delay: 0.6s; }

                /* Loading skeleton */
                .skeleton {
                    background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                @keyframes loading {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
            </style>
        `;
    }

    async loadDashboardData() {
        try {
            // Load all necessary data in parallel
            const [
                applications,
                jobs,
                notifications,
                analytics,
                aiStats,
                tasks
            ] = await Promise.all([
                this.getApplicationStats(),
                this.getJobRecommendations(),
                this.getNotifications(),
                this.getAnalytics(),
                this.getAIStats(),
                this.getTodaysTasks()
            ]);

            return {
                // Application stats
                totalApplications: applications.total,
                interviews: applications.interviews,
                responseRate: applications.responseRate,
                savedJobs: jobs.saved,
                applicationsTrend: applications.trend,
                interviewRate: applications.interviewRate,
                recentApplications: applications.recent,

                // AI stats
                aiConfidence: aiStats.averageConfidence,
                aiLearning: aiStats.learning,
                
                // Other data
                unreadNotifications: notifications.unread,
                insights: await this.generateInsights(analytics),
                jobMatches: jobs.matches,
                todaysTasks: tasks,
                readyToApply: jobs.readyToApply,
                
                // Timestamps
                insightsUpdated: new Date()
            };
        } catch (error) {
            this.app.services.logger.error('Failed to load dashboard data', error);
            return this.getDefaultDashboardData();
        }
    }

    async getApplicationStats() {
        const applications = await this.app.db.applications
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        const total = applications.length;
        const interviews = applications.filter(a => a.status === 'interview').length;
        const responses = applications.filter(a => a.status !== 'applied').length;
        
        // Calculate trend
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = applications.filter(a => new Date(a.appliedDate) > weekAgo).length;
        const lastWeek = applications.filter(a => {
            const date = new Date(a.appliedDate);
            return date > new Date(weekAgo - 7 * 24 * 60 * 60 * 1000) && date <= weekAgo;
        }).length;

        const trend = {
            direction: thisWeek >= lastWeek ? 'up' : 'down',
            percent: lastWeek > 0 ? Math.round((thisWeek - lastWeek) / lastWeek * 100) : 100
        };

        // Get recent applications with job details
        const recent = await Promise.all(
            applications
                .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
                .slice(0, 5)
                .map(async app => {
                    const job = await this.app.db.jobs.get(app.jobId);
                    return { ...app, job };
                })
        );

        return {
            total,
            interviews,
            responseRate: total > 0 ? Math.round(responses / total * 100) : 0,
            interviewRate: total > 0 ? Math.round(interviews / total * 100) : 0,
            trend,
            recent
        };
    }

    async getJobRecommendations() {
        // Get user's profile and preferences
        const userProfile = this.app.services.user.currentUser.profile;
        const preferences = userProfile.preferences.jobPreferences;

        // Get all jobs
        const allJobs = await this.app.db.jobs.toArray();
        
        // Score and sort jobs
        const scoredJobs = allJobs.map(job => {
            const score = this.calculateJobMatchScore(job, preferences);
            return { ...job, matchScore: score };
        });

        const matches = scoredJobs
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        const saved = await this.app.db.savedJobs?.count() || 0;
        const readyToApply = matches.filter(j => j.matchScore > 80).length;

        return { matches, saved, readyToApply };
    }

    calculateJobMatchScore(job, preferences) {
        let score = 50; // Base score

        // Type match
        if (preferences.types.includes(job.type)) score += 10;

        // Location match
        if (job.location === 'Remote' || preferences.locations.includes(job.location)) score += 15;

        // Keywords match
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        preferences.keywords.forEach(keyword => {
            if (jobText.includes(keyword.toLowerCase())) score += 5;
        });

        // Salary match
        if (job.salary && preferences.minSalary) {
            const jobSalary = this.parseSalary(job.salary);
            if (jobSalary >= preferences.minSalary) score += 10;
        }

        // Recent posting bonus
        if (job.posted && job.posted.includes('hour') || job.posted.includes('day')) {
            score += 5;
        }

        return Math.min(score, 100);
    }

    async getNotifications() {
        const notifications = await this.app.db.notifications
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        const unread = notifications.filter(n => !n.read).length;

        return { unread, notifications };
    }

    async getAnalytics() {
        return await this.app.services.analytics.getAnalytics({
            userId: this.app.services.user.currentUser.id,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
    }

    async getAIStats() {
        const optimizations = await this.app.db.optimizations
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        const corrections = await this.app.db.events
            .where(['userId', 'type'])
            .equals([this.app.services.user.currentUser.id, 'ai_correction'])
            .count();

        const patterns = await this.app.db.events
            .where(['userId', 'action'])
            .equals([this.app.services.user.currentUser.id, 'pattern_learned'])
            .count();

        const avgConfidence = optimizations.length > 0
            ? Math.round(optimizations.reduce((sum, opt) => sum + (opt.score || 0), 0) / optimizations.length)
            : 75;

        // Calculate improvement
        const firstOptimizations = optimizations.slice(0, 5);
        const recentOptimizations = optimizations.slice(-5);
        
        const firstAvg = firstOptimizations.reduce((sum, opt) => sum + (opt.score || 0), 0) / firstOptimizations.length || 0;
        const recentAvg = recentOptimizations.reduce((sum, opt) => sum + (opt.score || 0), 0) / recentOptimizations.length || 0;
        
        const improvement = Math.round(recentAvg - firstAvg);

        return {
            averageConfidence: avgConfidence,
            learning: {
                corrections,
                patterns,
                improvement: Math.max(improvement, 0)
            }
        };
    }

    async getTodaysTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get follow-ups
        const followUps = await this.app.db.notifications
            .where('scheduledFor')
            .between(today.toISOString(), tomorrow.toISOString())
            .toArray();

        // Get applications needing action
        const pendingApplications = await this.app.db.applications
            .where('status')
            .equals('applied')
            .toArray();

        const tasks = [];

        // Add follow-up tasks
        followUps.forEach(fu => {
            tasks.push({
                id: fu.id,
                type: 'followup',
                text: fu.message,
                time: new Date(fu.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                completed: false
            });
        });

        // Add application tasks
        const oldApplications = pendingApplications.filter(app => {
            const daysSince = (Date.now() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
            return daysSince > 7 && daysSince < 14;
        });

        oldApplications.slice(0, 3).forEach(app => {
            tasks.push({
                id: app.id,
                type: 'application',
                text: `Follow up on ${app.jobTitle || 'application'}`,
                time: 'This week',
                completed: false
            });
        });

        return tasks.sort((a, b) => {
            if (a.time === 'This week') return 1;
            if (b.time === 'This week') return -1;
            return a.time.localeCompare(b.time);
        });
    }

    async generateInsights(analytics) {
        const insights = [];

        // Get AI-generated insights
        if (analytics.insights) {
            analytics.insights.forEach(insight => {
                insights.push({
                    id: `ai-${insight.category}`,
                    type: insight.type,
                    icon: this.getInsightIcon(insight.type),
                    title: this.getInsightTitle(insight),
                    description: insight.message,
                    action: this.getInsightAction(insight),
                    priority: insight.priority
                });
            });
        }

        // Add custom insights based on data
        const customInsights = await this.generateCustomInsights(analytics);
        insights.push(...customInsights);

        // Sort by priority
        insights.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return insights.slice(0, 5); // Top 5 insights
    }

    async generateCustomInsights(analytics) {
        const insights = [];
        const applications = await this.getApplicationStats();

        // Low response rate insight
        if (applications.responseRate < 20) {
            insights.push({
                id: 'low-response',
                type: 'improvement',
                icon: '📈',
                title: 'Improve Your Response Rate',
                description: 'Your response rate is below average. Consider optimizing your resume with our AI to better match job requirements.',
                action: { label: 'Optimize Resume', handler: 'optimize-resume' },
                priority: 'high'
            });
        }

        // No recent applications
        const lastApplication = applications.recent[0];
        if (lastApplication) {
            const daysSince = (Date.now() - new Date(lastApplication.appliedDate)) / (1000 * 60 * 60 * 24);
            if (daysSince > 3) {
                insights.push({
                    id: 'no-recent-apps',
                    type: 'reminder',
                    icon: '⏰',
                    title: 'Keep Your Momentum Going',
                    description: `It's been ${Math.round(daysSince)} days since your last application. Consistency is key to landing interviews!`,
                    action: { label: 'Browse Jobs', handler: 'smart-search' },
                    priority: 'medium'
                });
            }
        }

        // Success celebration
        if (applications.interviews > 0 && applications.interviewRate > 10) {
            insights.push({
                id: 'success',
                type: 'success',
                icon: '🎉',
                title: 'Great Interview Rate!',
                description: `Your ${applications.interviewRate}% interview rate is above average. Keep up the great work!`,
                action: { label: 'View Tips', handler: 'interview-tips' },
                priority: 'low'
            });
        }

        return insights;
    }

    renderInsights(insights) {
        if (insights.length === 0) {
            return '<div class="empty-state">No new insights at the moment. Keep applying!</div>';
        }

        return `
            <div class="insight-list">
                ${insights.map(insight => `
                    <div class="insight-item" data-action="${insight.action?.handler || 'view-insight'}" data-id="${insight.id}">
                        <div class="insight-icon">${insight.icon}</div>
                        <div class="insight-content">
                            <div class="insight-title">${insight.title}</div>
                            <div class="insight-description">${insight.description}</div>
                            ${insight.action ? `
                                <div class="insight-action">
                                    ${insight.action.label} →
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderApplicationItem(app) {
        const status = app.status || 'applied';
        const logo = app.job?.logo || this.generateCompanyLogo(app.job?.company);

        return `
            <div class="application-item" data-action="view-application" data-id="${app.id}">
                <div class="company-logo">
                    ${logo}
                </div>
                <div class="application-details">
                    <div class="application-position">${app.job?.title || 'Position'}</div>
                    <div class="application-company">${app.job?.company || 'Company'}</div>
                </div>
                <div class="application-status status-${status}">
                    ${this.getStatusLabel(status)}
                </div>
            </div>
        `;
    }

    renderTaskItem(task) {
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle-task"></div>
                <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                <div class="task-time">${task.time}</div>
            </div>
        `;
    }

    renderJobMatch(job) {
        return `
            <div class="job-match" data-action="view-job" data-id="${job.id}">
                <div class="match-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="match-score">
                        ${job.matchScore}% match
                    </div>
                </div>
                <div class="job-tags">
                    ${job.location ? `<span class="job-tag">📍 ${job.location}</span>` : ''}
                    ${job.type ? `<span class="job-tag">💼 ${job.type}</span>` : ''}
                    ${job.salary ? `<span class="job-tag">💰 ${job.salary}</span>` : ''}
                </div>
            </div>
        `;
    }

    async mounted() {
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Action handlers
        document.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const action = element.dataset.action;
                const id = element.dataset.id;
                this.handleAction(action, id);
            });
        });

        // Task toggling
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTask(checkbox.closest('.task-item').dataset.taskId);
            });
        });
    }

    async handleAction(action, id) {
        switch (action) {
            case 'smart-search':
                await this.app.ui.showView('job-search');
                break;
                
            case 'optimize-resume':
                await this.app.ui.showView('resume-manager');
                break;
                
            case 'batch-apply':
                await this.app.ui.showView('batch-apply');
                break;
                
            case 'view-analytics':
                await this.app.ui.showView('analytics');
                break;
                
            case 'view-application':
                await this.app.ui.showView('application-details', { id });
                break;
                
            case 'view-job':
                await this.app.ui.showView('job-details', { id });
                break;
                
            case 'notifications':
                await this.showNotifications();
                break;
                
            case 'profile':
                await this.showProfileMenu();
                break;
                
            case 'quick-apply':
                await this.showQuickApply();
                break;
                
            default:
                console.log('Unhandled action:', action);
        }
    }

    async toggleTask(taskId) {
        const checkbox = document.querySelector(`[data-task-id="${taskId}"] .task-checkbox`);
        const text = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
        
        checkbox.classList.toggle('checked');
        text.classList.toggle('completed');
        
        // Update in database
        // This would update the actual task status
    }

    async showNotifications() {
        await this.app.ui.showModal('notifications');
    }

    async showQuickApply() {
        await this.app.ui.showModal('quick-apply');
    }

    startAutoRefresh() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(async () => {
            const data = await this.loadDashboardData();
            this.updateWidgets(data);
        }, 5 * 60 * 1000);
    }

    updateWidgets(data) {
        // Update stats
        document.querySelectorAll('.stat-value').forEach((element, index) => {
            const values = [
                data.totalApplications,
                data.interviews,
                `${data.responseRate}%`,
                data.savedJobs
            ];
            if (values[index] !== undefined) {
                element.textContent = values[index];
            }
        });

        // Update other dynamic content
        // This would update all widgets with new data
    }

    unmounted() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    // Helper methods
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    getMotivationalMessage(stats) {
        const messages = {
            high_activity: "You're on fire! Keep up the momentum.",
            low_activity: "Ready to find your dream job? Let's get started!",
            good_response: "Great response rate! Your applications are standing out.",
            interviews_scheduled: `${stats.interviews} interview${stats.interviews !== 1 ? 's' : ''} scheduled. You've got this!`,
            default: "Your next opportunity is just one application away."
        };

        if (stats.applicationsTrend.direction === 'up' && stats.applicationsTrend.percent > 50) {
            return messages.high_activity;
        } else if (stats.totalApplications === 0) {
            return messages.low_activity;
        } else if (stats.responseRate > 25) {
            return messages.good_response;
        } else if (stats.interviews > 0) {
            return messages.interviews_scheduled;
        }

        return messages.default;
    }

    async showProfileMenu() {
        const menuContent = `
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="menu-item" data-menu-action="view-profile">
                    <span>👤</span> View Profile
                </button>
                <button class="menu-item" data-menu-action="settings">
                    <span>⚙️</span> Settings
                </button>
                <button class="menu-item" data-menu-action="show-tour">
                    <span>🎯</span> Show App Tour
                </button>
                <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid var(--border-color);">
                <button class="menu-item" data-menu-action="logout">
                    <span>🚪</span> Logout
                </button>
            </div>
        `;

        const messageId = this.app.services.message.show(menuContent, {
            type: 'info',
            title: this.app.services.user.currentUser.profile.displayName,
            duration: 0,
            closable: true
        });

        // Add event listeners to menu items
        setTimeout(() => {
            document.querySelectorAll('[data-menu-action]').forEach(item => {
                item.addEventListener('click', async (e) => {
                    const action = e.target.closest('[data-menu-action]').dataset.menuAction;
                    this.app.services.message.hide(messageId);
                    
                    switch(action) {
                        case 'view-profile':
                            await this.app.ui.showView('profile');
                            break;
                        case 'settings':
                            await this.app.ui.showView('settings');
                            break;
                        case 'show-tour':
                            await this.app.ui.showView('onboarding');
                            break;
                        case 'logout':
                            await this.app.services.user.logout();
                            await this.app.ui.showView('login');
                            break;
                    }
                });
            });
        }, 100);
    }

    getResponseRateClass(rate) {
        if (rate >= 30) return 'excellent';
        if (rate >= 20) return 'good';
        if (rate >= 10) return 'average';
        return 'needs-improvement';
    }

    getResponseRateLabel(rate) {
        if (rate >= 30) return 'Excellent';
        if (rate >= 20) return 'Good';
        if (rate >= 10) return 'Average';
        return 'Room to improve';
    }

    getInsightIcon(type) {
        const icons = {
            warning: '⚠️',
            improvement: '📈',
            success: '🎉',
            info: 'ℹ️',
            opportunity: '💡',
            reminder: '⏰'
        };
        return icons[type] || '💡';
    }

    getInsightTitle(insight) {
        // Generate title from insight data
        return insight.message.split('.')[0];
    }

    getInsightAction(insight) {
        const actions = {
            engagement: { label: 'Improve Content', handler: 'improve-content' },
            performance: { label: 'Optimize Performance', handler: 'settings' },
            usage: { label: 'View Analytics', handler: 'analytics' },
            adoption: { label: 'Explore Features', handler: 'features' }
        };
        return actions[insight.category] || { label: 'Learn More', handler: 'help' };
    }

    generateCompanyLogo(company) {
        if (!company) return '🏢';
        return company.charAt(0).toUpperCase();
    }

    getStatusLabel(status) {
        const labels = {
            applied: 'Applied',
            interview: 'Interview',
            rejected: 'Rejected',
            offer: 'Offer',
            accepted: 'Accepted'
        };
        return labels[status] || status;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(date).toLocaleDateString();
    }

    parseSalary(salary) {
        // Simple salary parser
        const match = salary.match(/\d+/);
        return match ? parseInt(match[0]) * 1000 : 0;
    }

    getAILearningMessage(learning) {
        if (learning.corrections > 50) {
            return "I've learned a lot from your preferences! Each application gets better.";
        } else if (learning.corrections > 20) {
            return "I'm getting better at understanding your style. Keep those corrections coming!";
        } else if (learning.corrections > 0) {
            return "I'm learning from your feedback. The more you correct, the smarter I get!";
        }
        return "I'm ready to learn from your preferences. Try optimizing a resume!";
    }

    getDefaultDashboardData() {
        return {
            totalApplications: 0,
            interviews: 0,
            responseRate: 0,
            savedJobs: 0,
            applicationsTrend: { direction: 'up', percent: 0 },
            interviewRate: 0,
            recentApplications: [],
            aiConfidence: 75,
            aiLearning: { corrections: 0, patterns: 0, improvement: 0 },
            unreadNotifications: 0,
            insights: [],
            jobMatches: [],
            todaysTasks: [],
            readyToApply: 0,
            insightsUpdated: new Date()
        };
    }
}
