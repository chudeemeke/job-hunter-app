// Applications View - Comprehensive Application Tracker
// Track, manage, and analyze all job applications with AI insights

export default class ApplicationsView {
    constructor(app) {
        this.app = app;
        this.filters = {
            status: 'all',
            dateRange: 'all',
            search: ''
        };
        this.sortBy = 'date_desc';
        this.viewMode = 'kanban'; // kanban, list, timeline
    }

    async render() {
        const stats = await this.loadApplicationStats();
        
        return `
            <div class="applications-container">
                <!-- Header -->
                <header class="applications-header">
                    <div class="header-content">
                        <div class="header-left">
                            <h1 class="page-title">Application Tracker</h1>
                            <p class="page-subtitle">
                                ${stats.total} applications • ${stats.activeCount} active • ${stats.responseRate}% response rate
                            </p>
                        </div>
                        <div class="header-actions">
                            <button class="btn-secondary" onclick="applications.exportData()">
                                <i class="icon">📊</i> Export
                            </button>
                            <button class="btn-primary" onclick="applications.showAddApplication()">
                                <i class="icon">➕</i> Add Application
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Stats Overview -->
                <section class="stats-overview">
                    <div class="stat-cards-row">
                        <div class="stat-card primary">
                            <div class="stat-icon">📨</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.total}</div>
                                <div class="stat-label">Total Applications</div>
                                <div class="stat-change ${stats.weeklyChange.type}">
                                    ${stats.weeklyChange.type === 'increase' ? '↑' : '↓'} 
                                    ${stats.weeklyChange.value} this week
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-card success">
                            <div class="stat-icon">📞</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.interviews}</div>
                                <div class="stat-label">Interviews</div>
                                <div class="stat-metric">${stats.interviewRate}% conversion</div>
                            </div>
                        </div>
                        
                        <div class="stat-card warning">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.pending}</div>
                                <div class="stat-label">Awaiting Response</div>
                                <div class="stat-metric">${stats.avgResponseTime} days avg</div>
                            </div>
                        </div>
                        
                        <div class="stat-card info">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.offers}</div>
                                <div class="stat-label">Offers Received</div>
                                <div class="stat-metric">${stats.offerRate}% success rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Filters and View Controls -->
                <section class="controls-section">
                    <div class="filters-row">
                        <div class="filter-group">
                            <label>Status</label>
                            <select id="status-filter" onchange="applications.updateFilters()">
                                <option value="all">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>Date Range</label>
                            <select id="date-filter" onchange="applications.updateFilters()">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                            </select>
                        </div>
                        
                        <div class="filter-group search-group">
                            <label>Search</label>
                            <input 
                                type="search" 
                                id="search-filter" 
                                placeholder="Company, position, or keywords..."
                                oninput="applications.updateFilters()"
                            >
                        </div>
                        
                        <div class="view-toggles">
                            <button 
                                class="view-toggle ${this.viewMode === 'kanban' ? 'active' : ''}"
                                onclick="applications.setViewMode('kanban')"
                                title="Kanban View"
                            >
                                <i class="icon">📋</i>
                            </button>
                            <button 
                                class="view-toggle ${this.viewMode === 'list' ? 'active' : ''}"
                                onclick="applications.setViewMode('list')"
                                title="List View"
                            >
                                <i class="icon">📃</i>
                            </button>
                            <button 
                                class="view-toggle ${this.viewMode === 'timeline' ? 'active' : ''}"
                                onclick="applications.setViewMode('timeline')"
                                title="Timeline View"
                            >
                                <i class="icon">📅</i>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- AI Insights -->
                <section class="ai-insights-section" id="ai-insights">
                    ${await this.renderAIInsights(stats)}
                </section>

                <!-- Applications View -->
                <section class="applications-view" id="applications-view">
                    ${await this.renderApplicationsView()}
                </section>

                <!-- Follow-up Reminders -->
                <section class="reminders-section">
                    <h2 class="section-title">
                        <i class="icon">🔔</i> Follow-up Reminders
                    </h2>
                    <div class="reminders-list" id="reminders-list">
                        ${await this.renderReminders()}
                    </div>
                </section>
            </div>

            <style>
                .applications-container {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                    padding-bottom: 2rem;
                }

                /* Header */
                .applications-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    padding: 2rem 0;
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem;
                    color: var(--text-primary);
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                /* Stats Section */
                .stats-overview {
                    max-width: 1400px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                }

                .stat-cards-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    background: var(--bg-primary);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .stat-card.primary { border-color: var(--primary); }
                .stat-card.success { border-color: var(--success); }
                .stat-card.warning { border-color: var(--warning); }
                .stat-card.info { border-color: var(--info); }

                .stat-icon {
                    font-size: 2rem;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }

                .stat-change,
                .stat-metric {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .stat-change.increase { color: var(--success); }
                .stat-change.decrease { color: var(--danger); }
                .stat-metric { color: var(--text-secondary); }

                /* Controls Section */
                .controls-section {
                    max-width: 1400px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                }

                .filters-row {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .filter-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .filter-group select,
                .filter-group input {
                    padding: 0.625rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .filter-group select:focus,
                .filter-group input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                .search-group {
                    flex: 1;
                    min-width: 300px;
                }

                .view-toggles {
                    display: flex;
                    gap: 0.5rem;
                    margin-left: auto;
                }

                .view-toggle {
                    width: 40px;
                    height: 40px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-toggle:hover {
                    background: var(--bg-secondary);
                }

                .view-toggle.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                /* AI Insights */
                .ai-insights-section {
                    max-width: 1400px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                }

                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                .insight-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                    border-left: 4px solid var(--primary);
                }

                .insight-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .insight-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    background: var(--primary);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 999px;
                    text-transform: uppercase;
                }

                .insight-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .insight-content {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .insight-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .insight-action:hover {
                    gap: 0.75rem;
                }

                /* Kanban View */
                .kanban-board {
                    display: flex;
                    gap: 1.5rem;
                    overflow-x: auto;
                    padding: 1rem 0;
                }

                .kanban-column {
                    flex: 0 0 320px;
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: var(--shadow-sm);
                }

                .kanban-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--border-color);
                }

                .kanban-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .kanban-count {
                    background: var(--bg-secondary);
                    padding: 0.25rem 0.5rem;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .kanban-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    min-height: 200px;
                }

                .application-card {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .application-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }

                .application-card.dragging {
                    opacity: 0.5;
                    transform: rotate(3deg);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 0.75rem;
                }

                .company-info {
                    flex: 1;
                }

                .company-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .position-title {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .card-menu {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: var(--text-secondary);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-menu:hover {
                    background: var(--bg-tertiary);
                }

                .card-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }

                .card-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .card-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .card-tag {
                    padding: 0.25rem 0.5rem;
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    border-radius: 4px;
                }

                /* List View */
                .list-view {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }

                .list-header {
                    display: grid;
                    grid-template-columns: 3fr 2fr 1fr 1fr 1fr 100px;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    background: var(--bg-secondary);
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .list-body {
                    max-height: 600px;
                    overflow-y: auto;
                }

                .list-row {
                    display: grid;
                    grid-template-columns: 3fr 2fr 1fr 1fr 1fr 100px;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .list-row:hover {
                    background: var(--bg-secondary);
                }

                .list-company {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .list-status {
                    display: flex;
                    align-items: center;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-applied { background: var(--info); color: white; }
                .status-screening { background: var(--warning); color: white; }
                .status-interview { background: var(--success); color: white; }
                .status-offer { background: #10b981; color: white; }
                .status-rejected { background: var(--danger); color: white; }
                .status-withdrawn { background: var(--gray-500); color: white; }

                /* Timeline View */
                .timeline-view {
                    padding: 2rem;
                    background: var(--bg-primary);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                }

                .timeline-month {
                    margin-bottom: 2rem;
                }

                .month-header {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--border-color);
                }

                .timeline-items {
                    position: relative;
                    padding-left: 2rem;
                }

                .timeline-items::before {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--border-color);
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    margin-left: 1rem;
                }

                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: -1.5rem;
                    top: 1.5rem;
                    width: 12px;
                    height: 12px;
                    background: var(--primary);
                    border-radius: 50%;
                    border: 3px solid var(--bg-primary);
                }

                .timeline-date {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                /* Reminders Section */
                .reminders-section {
                    max-width: 1400px;
                    margin: 3rem auto 2rem;
                    padding: 0 2rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .reminders-list {
                    display: grid;
                    gap: 1rem;
                }

                .reminder-item {
                    background: var(--bg-primary);
                    border-radius: 10px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: var(--shadow-sm);
                    border-left: 4px solid var(--warning);
                }

                .reminder-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--warning);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .reminder-content {
                    flex: 1;
                }

                .reminder-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .reminder-details {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .reminder-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                /* Empty States */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-message {
                    margin-bottom: 1.5rem;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .kanban-board {
                        padding: 1rem;
                    }

                    .kanban-column {
                        flex: 0 0 280px;
                    }

                    .list-header,
                    .list-row {
                        grid-template-columns: 2fr 1fr 1fr 80px;
                    }

                    .list-header > *:nth-child(3),
                    .list-row > *:nth-child(3),
                    .list-header > *:nth-child(4),
                    .list-row > *:nth-child(4) {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .header-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .stat-cards-row {
                        grid-template-columns: 1fr;
                    }

                    .filters-row {
                        flex-direction: column;
                    }

                    .filter-group {
                        width: 100%;
                    }

                    .view-toggles {
                        margin-left: 0;
                        width: 100%;
                        justify-content: center;
                    }

                    .kanban-board {
                        flex-direction: column;
                    }

                    .kanban-column {
                        flex: 1;
                        width: 100%;
                    }
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

                .application-card {
                    animation: slideIn 0.3s ease backwards;
                }

                .application-card:nth-child(1) { animation-delay: 0.05s; }
                .application-card:nth-child(2) { animation-delay: 0.1s; }
                .application-card:nth-child(3) { animation-delay: 0.15s; }
                .application-card:nth-child(4) { animation-delay: 0.2s; }
                .application-card:nth-child(5) { animation-delay: 0.25s; }

                /* Drag and Drop */
                .drag-over {
                    background: var(--bg-tertiary);
                    border: 2px dashed var(--primary);
                }

                .drag-placeholder {
                    height: 100px;
                    background: var(--bg-tertiary);
                    border: 2px dashed var(--border-color);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-tertiary);
                }

                /* Dark Mode Adjustments */
                [data-theme="dark"] .stat-card {
                    background: var(--bg-secondary);
                }

                [data-theme="dark"] .application-card {
                    background: var(--bg-tertiary);
                }

                [data-theme="dark"] .kanban-column {
                    background: var(--bg-secondary);
                }
            </style>
        `;
    }

    async loadApplicationStats() {
        try {
            const userId = this.app.services.user.currentUser.id;
            const applications = await this.app.db.applications
                .where('userId')
                .equals(userId)
                .toArray();

            const now = new Date();
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

            // Calculate stats
            const total = applications.length;
            const activeCount = applications.filter(a => 
                ['applied', 'screening', 'interview'].includes(a.status)
            ).length;
            
            const interviews = applications.filter(a => a.status === 'interview').length;
            const offers = applications.filter(a => a.status === 'offer').length;
            const rejected = applications.filter(a => a.status === 'rejected').length;
            const pending = applications.filter(a => a.status === 'applied').length;

            // Response rate
            const responded = applications.filter(a => a.status !== 'applied').length;
            const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
            
            // Interview rate
            const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
            
            // Offer rate
            const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

            // Weekly change
            const thisWeek = applications.filter(a => new Date(a.appliedDate) > weekAgo).length;
            const lastWeek = applications.filter(a => {
                const date = new Date(a.appliedDate);
                return date <= weekAgo && date > new Date(weekAgo - 7 * 24 * 60 * 60 * 1000);
            }).length;
            
            const weeklyChange = {
                type: thisWeek >= lastWeek ? 'increase' : 'decrease',
                value: Math.abs(thisWeek - lastWeek)
            };

            // Average response time
            const respondedApps = applications.filter(a => a.responseDate);
            const avgResponseTime = respondedApps.length > 0
                ? Math.round(
                    respondedApps.reduce((sum, app) => {
                        const days = (new Date(app.responseDate) - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
                        return sum + days;
                    }, 0) / respondedApps.length
                  )
                : 0;

            return {
                total,
                activeCount,
                interviews,
                offers,
                rejected,
                pending,
                responseRate,
                interviewRate,
                offerRate,
                weeklyChange,
                avgResponseTime,
                applications
            };
        } catch (error) {
            this.app.services.logger.error('Failed to load application stats', error);
            return this.getDefaultStats();
        }
    }

    async renderAIInsights(stats) {
        const insights = await this.generateAIInsights(stats);
        
        if (insights.length === 0) {
            return '';
        }

        return `
            <div class="insights-grid">
                ${insights.map(insight => `
                    <div class="insight-card">
                        <div class="insight-header">
                            <span class="insight-badge">AI Insight</span>
                        </div>
                        <h3 class="insight-title">${insight.title}</h3>
                        <p class="insight-content">${insight.message}</p>
                        ${insight.action ? `
                            <div class="insight-action" onclick="applications.handleInsightAction('${insight.id}')">
                                ${insight.action.label} →
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async generateAIInsights(stats) {
        const insights = [];

        // Low response rate
        if (stats.responseRate < 20 && stats.total > 5) {
            insights.push({
                id: 'low-response',
                title: 'Improve Your Response Rate',
                message: `Your ${stats.responseRate}% response rate is below average. Consider tailoring your applications more specifically to each role and following up after 1 week.`,
                action: { label: 'View Application Tips', handler: 'tips' }
            });
        }

        // High interview conversion
        if (stats.interviewRate > 25 && stats.interviews > 0) {
            insights.push({
                id: 'high-interview',
                title: 'Strong Interview Conversion!',
                message: `Your ${stats.interviewRate}% interview rate is excellent! Whatever you're doing is working. Keep focusing on quality over quantity.`,
                action: null
            });
        }

        // Follow-up reminder
        const oldApplications = stats.applications.filter(app => {
            if (app.status !== 'applied') return false;
            const daysSince = (Date.now() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
            return daysSince > 7 && daysSince < 14;
        });

        if (oldApplications.length > 0) {
            insights.push({
                id: 'follow-up',
                title: 'Time to Follow Up',
                message: `You have ${oldApplications.length} applications that are 1-2 weeks old without a response. Following up can increase your response rate by 30%.`,
                action: { label: 'Set Reminders', handler: 'reminders' }
            });
        }

        // Application pace
        if (stats.weeklyChange.type === 'decrease' && stats.weeklyChange.value > 3) {
            insights.push({
                id: 'pace-slow',
                title: 'Application Pace Slowing',
                message: 'Your application rate has decreased this week. Consistency is key to landing interviews. Try to maintain a steady pace.',
                action: { label: 'Browse New Jobs', handler: 'browse' }
            });
        }

        return insights.slice(0, 3); // Top 3 insights
    }

    async renderApplicationsView() {
        const stats = await this.loadApplicationStats();
        const filteredApps = this.filterApplications(stats.applications);
        
        switch (this.viewMode) {
            case 'kanban':
                return this.renderKanbanView(filteredApps);
            case 'list':
                return this.renderListView(filteredApps);
            case 'timeline':
                return this.renderTimelineView(filteredApps);
            default:
                return this.renderKanbanView(filteredApps);
        }
    }

    filterApplications(applications) {
        let filtered = [...applications];

        // Status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(app => app.status === this.filters.status);
        }

        // Date range filter
        if (this.filters.dateRange !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (this.filters.dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarter':
                    startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (startDate) {
                filtered = filtered.filter(app => new Date(app.appliedDate) >= startDate);
            }
        }

        // Search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(app => {
                const searchableText = `${app.company} ${app.position} ${app.location || ''} ${app.notes || ''}`.toLowerCase();
                return searchableText.includes(search);
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'date_desc':
                    return new Date(b.appliedDate) - new Date(a.appliedDate);
                case 'date_asc':
                    return new Date(a.appliedDate) - new Date(b.appliedDate);
                case 'company':
                    return a.company.localeCompare(b.company);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return new Date(b.appliedDate) - new Date(a.appliedDate);
            }
        });

        return filtered;
    }

    renderKanbanView(applications) {
        const columns = [
            { id: 'applied', title: 'Applied', icon: '📨', color: 'info' },
            { id: 'screening', title: 'Screening', icon: '🔍', color: 'warning' },
            { id: 'interview', title: 'Interview', icon: '📞', color: 'success' },
            { id: 'offer', title: 'Offer', icon: '🎉', color: 'success' },
            { id: 'rejected', title: 'Rejected', icon: '❌', color: 'danger' },
            { id: 'withdrawn', title: 'Withdrawn', icon: '🚫', color: 'secondary' }
        ];

        return `
            <div class="kanban-board">
                ${columns.map(column => {
                    const columnApps = applications.filter(app => app.status === column.id);
                    return `
                        <div class="kanban-column" data-status="${column.id}">
                            <div class="kanban-header">
                                <div class="kanban-title">
                                    <span>${column.icon}</span>
                                    <span>${column.title}</span>
                                </div>
                                <span class="kanban-count">${columnApps.length}</span>
                            </div>
                            <div class="kanban-cards" 
                                 ondrop="applications.handleDrop(event, '${column.id}')"
                                 ondragover="applications.handleDragOver(event)">
                                ${columnApps.length > 0 ? 
                                    columnApps.map(app => this.renderApplicationCard(app)).join('') :
                                    '<div class="empty-state"><p>No applications</p></div>'
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderApplicationCard(app) {
        return `
            <div class="application-card" 
                 data-id="${app.id}"
                 draggable="true"
                 ondragstart="applications.handleDragStart(event, ${app.id})"
                 onclick="applications.viewApplication(${app.id})">
                <div class="card-header">
                    <div class="company-info">
                        <div class="company-name">${app.company}</div>
                        <div class="position-title">${app.position}</div>
                    </div>
                    <button class="card-menu" onclick="applications.showCardMenu(event, ${app.id})">
                        ⋮
                    </button>
                </div>
                <div class="card-meta">
                    ${app.location ? `
                        <span class="card-meta-item">
                            <i class="icon">📍</i> ${app.location}
                        </span>
                    ` : ''}
                    <span class="card-meta-item">
                        <i class="icon">📅</i> ${this.formatDate(app.appliedDate)}
                    </span>
                </div>
                ${app.tags && app.tags.length > 0 ? `
                    <div class="card-tags">
                        ${app.tags.map(tag => 
                            `<span class="card-tag">${tag}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderListView(applications) {
        if (applications.length === 0) {
            return `
                <div class="list-view">
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <div class="empty-title">No Applications Found</div>
                        <div class="empty-message">
                            ${this.filters.search || this.filters.status !== 'all' ? 
                                'Try adjusting your filters' : 
                                'Start applying to track your progress'
                            }
                        </div>
                        ${this.filters.status === 'all' && !this.filters.search ? `
                            <button class="btn-primary" onclick="window.location.hash='job-listings'">
                                Browse Jobs
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div class="list-view">
                <div class="list-header">
                    <div>Company / Position</div>
                    <div>Status</div>
                    <div>Applied</div>
                    <div>Updated</div>
                    <div>Match</div>
                    <div>Actions</div>
                </div>
                <div class="list-body">
                    ${applications.map(app => `
                        <div class="list-row" onclick="applications.viewApplication(${app.id})">
                            <div class="list-company">
                                <strong>${app.company}</strong>
                                <span>${app.position}</span>
                            </div>
                            <div class="list-status">
                                <span class="status-badge status-${app.status}">
                                    ${this.getStatusLabel(app.status)}
                                </span>
                            </div>
                            <div>${this.formatDate(app.appliedDate)}</div>
                            <div>${this.formatDate(app.lastUpdated || app.appliedDate)}</div>
                            <div>${app.matchScore || '-'}%</div>
                            <div>
                                <button class="btn-sm" onclick="applications.showActions(event, ${app.id})">
                                    Actions
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTimelineView(applications) {
        // Group by month
        const grouped = {};
        applications.forEach(app => {
            const date = new Date(app.appliedDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(app);
        });

        // Sort months
        const sortedMonths = Object.keys(grouped).sort().reverse();

        if (sortedMonths.length === 0) {
            return `
                <div class="timeline-view">
                    <div class="empty-state">
                        <div class="empty-icon">📅</div>
                        <div class="empty-title">No Timeline Data</div>
                        <div class="empty-message">Your application timeline will appear here</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="timeline-view">
                ${sortedMonths.map(monthKey => {
                    const [year, month] = monthKey.split('-');
                    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    
                    return `
                        <div class="timeline-month">
                            <h3 class="month-header">${monthName}</h3>
                            <div class="timeline-items">
                                ${grouped[monthKey].map(app => `
                                    <div class="timeline-item" onclick="applications.viewApplication(${app.id})">
                                        <div class="timeline-date">
                                            ${new Date(app.appliedDate).toLocaleDateString()}
                                        </div>
                                        <strong>${app.company}</strong> - ${app.position}
                                        <div class="status-badge status-${app.status}">
                                            ${this.getStatusLabel(app.status)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    async renderReminders() {
        const reminders = await this.getFollowUpReminders();
        
        if (reminders.length === 0) {
            return `
                <div class="empty-state">
                    <p>No follow-ups needed right now. Great job staying on top of things!</p>
                </div>
            `;
        }

        return reminders.map(reminder => `
            <div class="reminder-item">
                <div class="reminder-icon">⏰</div>
                <div class="reminder-content">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-details">${reminder.details}</div>
                </div>
                <div class="reminder-actions">
                    <button class="btn-sm btn-primary" onclick="applications.handleReminder(${reminder.applicationId}, 'followup')">
                        Send Follow-up
                    </button>
                    <button class="btn-sm" onclick="applications.handleReminder(${reminder.applicationId}, 'dismiss')">
                        Dismiss
                    </button>
                </div>
            </div>
        `).join('');
    }

    async getFollowUpReminders() {
        const applications = await this.loadApplicationStats();
        const reminders = [];
        const now = Date.now();

        applications.applications.forEach(app => {
            if (app.status === 'applied') {
                const daysSince = (now - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
                
                if (daysSince >= 7 && daysSince <= 14 && !app.followedUp) {
                    reminders.push({
                        applicationId: app.id,
                        title: `Follow up with ${app.company}`,
                        details: `Applied ${Math.round(daysSince)} days ago for ${app.position}`,
                        priority: daysSince > 10 ? 'high' : 'medium'
                    });
                }
            }
            
            if (app.status === 'interview' && app.interviewDate) {
                const daysUntil = (new Date(app.interviewDate) - now) / (1000 * 60 * 60 * 24);
                
                if (daysUntil <= 1 && daysUntil > 0) {
                    reminders.push({
                        applicationId: app.id,
                        title: `Interview tomorrow with ${app.company}`,
                        details: `Prepare for your ${app.position} interview`,
                        priority: 'high'
                    });
                }
            }
        });

        return reminders.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // Event Handlers
    async afterRender() {
        this.attachEventListeners();
        this.initializeDragAndDrop();
    }

    attachEventListeners() {
        // Filter event listeners are attached inline
        // Additional listeners can be added here
    }

    initializeDragAndDrop() {
        // Drag and drop is initialized via inline event handlers
        // Additional setup can be done here if needed
    }

    updateFilters() {
        this.filters.status = document.getElementById('status-filter').value;
        this.filters.dateRange = document.getElementById('date-filter').value;
        this.filters.search = document.getElementById('search-filter').value;
        
        this.refreshView();
    }

    async refreshView() {
        const viewContainer = document.getElementById('applications-view');
        viewContainer.innerHTML = await this.renderApplicationsView();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update button states
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.view-toggle').classList.add('active');
        
        this.refreshView();
    }

    // Drag and Drop Handlers
    handleDragStart(event, applicationId) {
        event.dataTransfer.setData('applicationId', applicationId);
        event.target.classList.add('dragging');
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDrop(event, newStatus) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const applicationId = parseInt(event.dataTransfer.getData('applicationId'));
        this.updateApplicationStatus(applicationId, newStatus);
        
        // Remove dragging class
        document.querySelector('.dragging')?.classList.remove('dragging');
    }

    async updateApplicationStatus(applicationId, newStatus) {
        try {
            const application = await this.app.db.applications.get(applicationId);
            if (!application) return;

            const oldStatus = application.status;
            application.status = newStatus;
            application.lastUpdated = new Date().toISOString();

            // Add response date if moving from applied
            if (oldStatus === 'applied' && newStatus !== 'applied') {
                application.responseDate = new Date().toISOString();
            }

            await this.app.db.applications.put(application);

            // Track the change
            await this.app.services.analytics.track('application_status_changed', {
                applicationId,
                from: oldStatus,
                to: newStatus
            });

            // If interview or offer, track with AI
            if (newStatus === 'interview' || newStatus === 'offer') {
                await this.app.services.aiOptimizer.trackApplicationOutcome(
                    applicationId, 
                    newStatus
                );
            }

            // Refresh view
            this.refreshView();
            
            // Show success message
            this.app.services.message.success(`Application status updated to ${this.getStatusLabel(newStatus)}`);

        } catch (error) {
            this.app.services.logger.error('Failed to update application status', error);
            this.app.services.message.error('Failed to update status');
        }
    }

    async viewApplication(applicationId) {
        await this.app.ui.showView('application-details', { id: applicationId });
    }

    showCardMenu(event, applicationId) {
        event.stopPropagation();
        // Show context menu
        // This would show a dropdown with options like Edit, Delete, etc.
    }

    async showAddApplication() {
        await this.app.ui.showModal('add-application');
    }

    async exportData() {
        try {
            const applications = await this.loadApplicationStats();
            const data = applications.applications.map(app => ({
                Company: app.company,
                Position: app.position,
                Location: app.location || '',
                Status: this.getStatusLabel(app.status),
                'Applied Date': new Date(app.appliedDate).toLocaleDateString(),
                'Last Updated': new Date(app.lastUpdated || app.appliedDate).toLocaleDateString(),
                'Match Score': app.matchScore || '',
                Notes: app.notes || ''
            }));

            // Convert to CSV
            const csv = this.convertToCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.app.services.message.success('Applications exported successfully!');
        } catch (error) {
            this.app.services.logger.error('Export failed', error);
            this.app.services.message.error('Failed to export applications');
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    async handleInsightAction(insightId) {
        const actions = {
            'low-response': () => this.app.ui.showModal('application-tips'),
            'follow-up': () => this.scrollToReminders(),
            'pace-slow': () => window.location.hash = 'job-listings'
        };

        const action = actions[insightId];
        if (action) action();
    }

    scrollToReminders() {
        document.querySelector('.reminders-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    async handleReminder(applicationId, action) {
        if (action === 'followup') {
            // Open follow-up email composer
            const application = await this.app.db.applications.get(applicationId);
            if (application) {
                await this.app.ui.showModal('compose-followup', { application });
            }
        } else if (action === 'dismiss') {
            // Mark as followed up
            const application = await this.app.db.applications.get(applicationId);
            if (application) {
                application.followedUp = true;
                await this.app.db.applications.put(application);
                this.refreshView();
            }
        }
    }

    // Helper Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            if (hours === 0) return 'Just now';
            return `${hours}h ago`;
        } else if (diff < 604800000) { // Less than 1 week
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    getStatusLabel(status) {
        const labels = {
            applied: 'Applied',
            screening: 'Screening',
            interview: 'Interview',
            offer: 'Offer',
            rejected: 'Rejected',
            withdrawn: 'Withdrawn'
        };
        return labels[status] || status;
    }

    getDefaultStats() {
        return {
            total: 0,
            activeCount: 0,
            interviews: 0,
            offers: 0,
            rejected: 0,
            pending: 0,
            responseRate: 0,
            interviewRate: 0,
            offerRate: 0,
            weeklyChange: { type: 'increase', value: 0 },
            avgResponseTime: 0,
            applications: []
        };
    }
}

// Create global instance
window.applications = new ApplicationsView(window.app);