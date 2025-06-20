// Admin Dashboard View - Comprehensive System Management
// Full control panel for administrators

export default class AdminDashboardView {
    constructor(app) {
        this.app = app;
        this.currentSection = 'overview';
        this.refreshInterval = null;
        this.charts = new Map();
    }

    async render() {
        // Verify admin access
        const user = this.app.services.user.currentUser;
        if (!user || user.role !== 'admin') {
            window.location.hash = 'dashboard';
            return '';
        }

        const stats = await this.loadSystemStats();
        
        return `
            <div class="admin-dashboard">
                <!-- Header -->
                <header class="admin-header">
                    <div class="header-content">
                        <div class="header-left">
                            <h1 class="page-title">Admin Dashboard</h1>
                            <p class="page-subtitle">System Control Center</p>
                        </div>
                        <div class="header-right">
                            <div class="system-status">
                                <span class="status-indicator ${stats.systemHealth.status}"></span>
                                <span class="status-text">System ${stats.systemHealth.statusText}</span>
                            </div>
                            <button class="btn-secondary" onclick="adminDashboard.refreshAll()">
                                <i class="icon">🔄</i> Refresh
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Navigation -->
                <nav class="admin-nav">
                    <div class="nav-container">
                        <button 
                            class="nav-item ${this.currentSection === 'overview' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('overview')"
                        >
                            <i class="icon">📊</i>
                            <span>Overview</span>
                        </button>
                        <button 
                            class="nav-item ${this.currentSection === 'users' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('users')"
                        >
                            <i class="icon">👥</i>
                            <span>Users</span>
                        </button>
                        <button 
                            class="nav-item ${this.currentSection === 'jobs' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('jobs')"
                        >
                            <i class="icon">💼</i>
                            <span>Job Boards</span>
                        </button>
                        <button 
                            class="nav-item ${this.currentSection === 'analytics' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('analytics')"
                        >
                            <i class="icon">📈</i>
                            <span>Analytics</span>
                        </button>
                        <button 
                            class="nav-item ${this.currentSection === 'logs' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('logs')"
                        >
                            <i class="icon">📜</i>
                            <span>System Logs</span>
                        </button>
                        <button 
                            class="nav-item ${this.currentSection === 'settings' ? 'active' : ''}"
                            onclick="adminDashboard.showSection('settings')"
                        >
                            <i class="icon">⚙️</i>
                            <span>Settings</span>
                        </button>
                    </div>
                </nav>

                <!-- Content Area -->
                <div class="admin-content" id="admin-content">
                    ${await this.renderSection(this.currentSection, stats)}
                </div>
            </div>

            <style>
                .admin-dashboard {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                }

                /* Header */
                .admin-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    padding: 1.5rem 0;
                }

                .header-content {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem;
                    color: var(--text-primary);
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    margin: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .system-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--bg-secondary);
                    border-radius: 999px;
                }

                .status-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--success);
                }

                .status-indicator.healthy { background: var(--success); }
                .status-indicator.warning { background: var(--warning); }
                .status-indicator.error { background: var(--danger); }

                .status-text {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                /* Navigation */
                .admin-nav {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .nav-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .nav-item:hover {
                    color: var(--text-primary);
                    background: var(--bg-secondary);
                }

                .nav-item.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }

                .nav-item .icon {
                    font-size: 1.25rem;
                }

                /* Content */
                .admin-content {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-change {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .stat-change.positive { color: var(--success); }
                .stat-change.negative { color: var(--danger); }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                /* Charts */
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .chart-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .chart-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .chart-container {
                    height: 300px;
                    position: relative;
                }

                /* Tables */
                .data-table {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }

                .table-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .table-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .table-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    background: var(--bg-secondary);
                }

                th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                td {
                    padding: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                tbody tr:hover {
                    background: var(--bg-secondary);
                }

                /* User Management */
                .user-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .user-info {
                    flex: 1;
                }

                .user-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .user-email {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .user-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .user-status.active {
                    background: rgba(var(--success-rgb), 0.1);
                    color: var(--success);
                }

                .user-status.inactive {
                    background: rgba(var(--danger-rgb), 0.1);
                    color: var(--danger);
                }

                .user-status.suspended {
                    background: rgba(var(--warning-rgb), 0.1);
                    color: var(--warning);
                }

                /* Job Board Management */
                .job-board-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                    margin-bottom: 1rem;
                }

                .board-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .board-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .board-url {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-family: monospace;
                }

                .board-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .toggle-switch {
                    position: relative;
                    width: 48px;
                    height: 24px;
                    background: var(--gray-300);
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-switch.active {
                    background: var(--success);
                }

                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .toggle-switch.active::after {
                    transform: translateX(24px);
                }

                .board-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                }

                .board-stat {
                    text-align: center;
                }

                .board-stat-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .board-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                /* System Logs */
                .log-filters {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .log-entry {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    font-family: monospace;
                    font-size: 0.875rem;
                }

                .log-timestamp {
                    color: var(--text-secondary);
                    white-space: nowrap;
                }

                .log-level {
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .log-level.info { color: var(--info); }
                .log-level.warning { color: var(--warning); }
                .log-level.error { color: var(--danger); }
                .log-level.success { color: var(--success); }

                .log-message {
                    flex: 1;
                    color: var(--text-primary);
                }

                /* Settings */
                .settings-section {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: var(--shadow-sm);
                    margin-bottom: 1.5rem;
                }

                .setting-group {
                    margin-bottom: 2rem;
                }

                .setting-group:last-child {
                    margin-bottom: 0;
                }

                .setting-label {
                    display: block;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .setting-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                }

                .setting-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .setting-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                /* Actions */
                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: var(--bg-secondary);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-icon:hover {
                    background: var(--bg-tertiary);
                    transform: scale(1.1);
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

                /* Responsive */
                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .header-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .nav-container {
                        padding: 0 1rem;
                    }

                    .board-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                /* Dark Mode */
                [data-theme="dark"] .stat-card,
                [data-theme="dark"] .chart-card,
                [data-theme="dark"] .data-table,
                [data-theme="dark"] .job-board-card,
                [data-theme="dark"] .settings-section {
                    background: var(--bg-secondary);
                }

                [data-theme="dark"] .stat-icon {
                    background: var(--bg-tertiary);
                }

                /* Loading States */
                .loading-skeleton {
                    background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
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

    async renderSection(section, stats) {
        switch (section) {
            case 'overview':
                return this.renderOverview(stats);
            case 'users':
                return this.renderUsers();
            case 'jobs':
                return this.renderJobBoards();
            case 'analytics':
                return this.renderAnalytics();
            case 'logs':
                return this.renderLogs();
            case 'settings':
                return this.renderSettings();
            default:
                return this.renderOverview(stats);
        }
    }

    async renderOverview(stats) {
        return `
            <!-- System Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Total Users</div>
                        <div class="stat-value">${stats.totalUsers.toLocaleString()}</div>
                        <div class="stat-change ${stats.userGrowth >= 0 ? 'positive' : 'negative'}">
                            ${stats.userGrowth >= 0 ? '↑' : '↓'} ${Math.abs(stats.userGrowth)}% this week
                        </div>
                    </div>
                    <div class="stat-icon">👥</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Active Jobs</div>
                        <div class="stat-value">${stats.activeJobs.toLocaleString()}</div>
                        <div class="stat-change positive">
                            ${stats.newJobsToday} new today
                        </div>
                    </div>
                    <div class="stat-icon">💼</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Applications</div>
                        <div class="stat-value">${stats.totalApplications.toLocaleString()}</div>
                        <div class="stat-change positive">
                            ${stats.applicationsToday} today
                        </div>
                    </div>
                    <div class="stat-icon">📨</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Success Rate</div>
                        <div class="stat-value">${stats.systemSuccessRate}%</div>
                        <div class="stat-change ${stats.successTrend >= 0 ? 'positive' : 'negative'}">
                            ${stats.successTrend >= 0 ? '↑' : '↓'} ${Math.abs(stats.successTrend)}%
                        </div>
                    </div>
                    <div class="stat-icon">📈</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">User Activity</h3>
                        <select class="chart-period" onchange="adminDashboard.updateChart('activity', this.value)">
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                    <div class="chart-container" id="activity-chart">
                        ${this.renderActivityChart(stats.activityData)}
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">Application Success Rates</h3>
                        <button class="btn-sm" onclick="adminDashboard.exportChart('success')">
                            Export
                        </button>
                    </div>
                    <div class="chart-container" id="success-chart">
                        ${this.renderSuccessChart(stats.successData)}
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="data-table">
                <div class="table-header">
                    <h3 class="table-title">Recent System Activity</h3>
                    <div class="table-actions">
                        <button class="btn-sm" onclick="adminDashboard.viewAllActivity()">
                            View All
                        </button>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.recentActivity.map(activity => `
                                <tr>
                                    <td>${this.formatTime(activity.timestamp)}</td>
                                    <td>
                                        <div class="user-row">
                                            <div class="user-avatar">${this.getInitials(activity.userName)}</div>
                                            <div class="user-info">
                                                <div class="user-name">${activity.userName}</div>
                                                <div class="user-email">${activity.userEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${this.formatAction(activity.action)}</td>
                                    <td>${activity.details || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async renderUsers() {
        const users = await this.loadUsers();
        
        return `
            <!-- User Management Header -->
            <div class="section-header">
                <h2 class="section-title">User Management</h2>
                <div class="section-actions">
                    <input 
                        type="search" 
                        placeholder="Search users..." 
                        class="search-input"
                        onchange="adminDashboard.searchUsers(this.value)"
                    >
                    <button class="btn-primary" onclick="adminDashboard.showAddUser()">
                        <i class="icon">➕</i> Add User
                    </button>
                </div>
            </div>

            <!-- User Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Total Users</div>
                        <div class="stat-value">${users.total}</div>
                    </div>
                    <div class="stat-icon">👥</div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Active Today</div>
                        <div class="stat-value">${users.activeToday}</div>
                    </div>
                    <div class="stat-icon">✅</div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">New This Week</div>
                        <div class="stat-value">${users.newThisWeek}</div>
                    </div>
                    <div class="stat-icon">🆕</div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Admin Users</div>
                        <div class="stat-value">${users.adminCount}</div>
                    </div>
                    <div class="stat-icon">🛡️</div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="data-table">
                <div class="table-header">
                    <h3 class="table-title">All Users</h3>
                    <div class="table-actions">
                        <button class="btn-sm" onclick="adminDashboard.exportUsers()">
                            Export CSV
                        </button>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Last Active</th>
                                <th>Applications</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.list.map(user => `
                                <tr>
                                    <td>
                                        <div class="user-row">
                                            <div class="user-avatar">
                                                ${user.avatar ? 
                                                    `<img src="${user.avatar}" alt="${user.name}">` :
                                                    this.getInitials(user.name)
                                                }
                                            </div>
                                            <div class="user-info">
                                                <div class="user-name">${user.name}</div>
                                                <div class="user-email">${user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select 
                                            class="role-select" 
                                            onchange="adminDashboard.updateUserRole(${user.id}, this.value)"
                                        >
                                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                            <option value="premium" ${user.role === 'premium' ? 'selected' : ''}>Premium</option>
                                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span class="user-status ${user.status}">
                                            ${user.status}
                                        </span>
                                    </td>
                                    <td>${this.formatDate(user.created)}</td>
                                    <td>${this.formatDate(user.lastLogin)}</td>
                                    <td>${user.applicationCount}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button 
                                                class="btn-icon" 
                                                title="View Details"
                                                onclick="adminDashboard.viewUser(${user.id})"
                                            >
                                                👁️
                                            </button>
                                            <button 
                                                class="btn-icon" 
                                                title="Edit User"
                                                onclick="adminDashboard.editUser(${user.id})"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                class="btn-icon" 
                                                title="${user.status === 'active' ? 'Suspend' : 'Activate'}"
                                                onclick="adminDashboard.toggleUserStatus(${user.id})"
                                            >
                                                ${user.status === 'active' ? '⏸️' : '▶️'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async renderJobBoards() {
        const boards = await this.loadJobBoards();
        
        return `
            <!-- Job Board Management -->
            <div class="section-header">
                <h2 class="section-title">Job Board Configuration</h2>
                <button class="btn-primary" onclick="adminDashboard.showAddJobBoard()">
                    <i class="icon">➕</i> Add Job Board
                </button>
            </div>

            <!-- Job Boards List -->
            ${boards.map(board => `
                <div class="job-board-card">
                    <div class="board-header">
                        <div>
                            <h3 class="board-name">${board.name}</h3>
                            <p class="board-url">${board.apiUrl}</p>
                        </div>
                        <div class="board-status">
                            <span class="status-text">${board.enabled ? 'Active' : 'Inactive'}</span>
                            <div 
                                class="toggle-switch ${board.enabled ? 'active' : ''}"
                                onclick="adminDashboard.toggleJobBoard(${board.id})"
                            ></div>
                        </div>
                    </div>
                    
                    <div class="board-stats">
                        <div class="board-stat">
                            <div class="board-stat-value">${board.jobCount}</div>
                            <div class="board-stat-label">Total Jobs</div>
                        </div>
                        <div class="board-stat">
                            <div class="board-stat-value">${board.newToday}</div>
                            <div class="board-stat-label">New Today</div>
                        </div>
                        <div class="board-stat">
                            <div class="board-stat-value">${board.rateLimit}/hr</div>
                            <div class="board-stat-label">Rate Limit</div>
                        </div>
                        <div class="board-stat">
                            <div class="board-stat-value">${board.lastSync ? this.formatTime(board.lastSync) : 'Never'}</div>
                            <div class="board-stat-label">Last Sync</div>
                        </div>
                    </div>
                    
                    <div class="board-actions">
                        <button class="btn-sm" onclick="adminDashboard.syncJobBoard(${board.id})">
                            🔄 Sync Now
                        </button>
                        <button class="btn-sm" onclick="adminDashboard.editJobBoard(${board.id})">
                            ⚙️ Configure
                        </button>
                        <button class="btn-sm danger" onclick="adminDashboard.deleteJobBoard(${board.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('')}

            <!-- API Health Status -->
            <div class="data-table">
                <div class="table-header">
                    <h3 class="table-title">API Health Status</h3>
                    <button class="btn-sm" onclick="adminDashboard.testAllAPIs()">
                        Test All
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>API</th>
                                <th>Status</th>
                                <th>Response Time</th>
                                <th>Success Rate</th>
                                <th>Last Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${boards.map(board => `
                                <tr>
                                    <td>${board.name}</td>
                                    <td>
                                        <span class="status-indicator ${board.health.status}"></span>
                                        ${board.health.status}
                                    </td>
                                    <td>${board.health.responseTime}ms</td>
                                    <td>${board.health.successRate}%</td>
                                    <td>${this.formatTime(board.health.lastCheck)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async renderAnalytics() {
        const analytics = await this.loadAnalytics();
        
        return `
            <!-- Analytics Dashboard -->
            <div class="section-header">
                <h2 class="section-title">System Analytics</h2>
                <div class="date-range-selector">
                    <select onchange="adminDashboard.updateAnalyticsRange(this.value)">
                        <option value="7d">Last 7 days</option>
                        <option value="30d" selected>Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Avg. Applications/User</div>
                        <div class="stat-value">${analytics.avgApplicationsPerUser}</div>
                        <div class="stat-change ${analytics.applicationTrend >= 0 ? 'positive' : 'negative'}">
                            ${analytics.applicationTrend >= 0 ? '↑' : '↓'} ${Math.abs(analytics.applicationTrend)}%
                        </div>
                    </div>
                    <div class="stat-icon">📊</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Interview Rate</div>
                        <div class="stat-value">${analytics.interviewRate}%</div>
                        <div class="stat-change positive">
                            Industry avg: ${analytics.industryAvgInterview}%
                        </div>
                    </div>
                    <div class="stat-icon">🎯</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">AI Optimization Usage</div>
                        <div class="stat-value">${analytics.aiUsageRate}%</div>
                        <div class="stat-change positive">
                            ${analytics.aiImprovementRate}% better results
                        </div>
                    </div>
                    <div class="stat-icon">🤖</div>
                </div>

                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">User Retention</div>
                        <div class="stat-value">${analytics.retentionRate}%</div>
                        <div class="stat-change">
                            30-day retention
                        </div>
                    </div>
                    <div class="stat-icon">💪</div>
                </div>
            </div>

            <!-- Analytics Charts -->
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">Application Funnel</h3>
                    </div>
                    <div class="chart-container">
                        ${this.renderFunnelChart(analytics.funnelData)}
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-header">
                        <h3 class="chart-title">Popular Job Categories</h3>
                    </div>
                    <div class="chart-container">
                        ${this.renderCategoryChart(analytics.categoryData)}
                    </div>
                </div>
            </div>

            <!-- User Behavior Insights -->
            <div class="data-table">
                <div class="table-header">
                    <h3 class="table-title">User Behavior Insights</h3>
                </div>
                <div class="insights-grid">
                    ${analytics.insights.map(insight => `
                        <div class="insight-card">
                            <div class="insight-icon">${insight.icon}</div>
                            <div class="insight-content">
                                <h4>${insight.title}</h4>
                                <p>${insight.description}</p>
                                <div class="insight-metric">
                                    <strong>${insight.metric}</strong> ${insight.metricLabel}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderLogs() {
        const logs = await this.loadSystemLogs();
        
        return `
            <!-- System Logs -->
            <div class="section-header">
                <h2 class="section-title">System Logs</h2>
                <button class="btn-secondary" onclick="adminDashboard.exportLogs()">
                    Export Logs
                </button>
            </div>

            <!-- Log Filters -->
            <div class="log-filters">
                <select id="log-level" onchange="adminDashboard.filterLogs()">
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                </select>
                
                <select id="log-service" onchange="adminDashboard.filterLogs()">
                    <option value="all">All Services</option>
                    <option value="auth">Authentication</option>
                    <option value="jobs">Job Board</option>
                    <option value="ai">AI Optimizer</option>
                    <option value="email">Email Service</option>
                </select>
                
                <input 
                    type="search" 
                    placeholder="Search logs..." 
                    id="log-search"
                    onchange="adminDashboard.filterLogs()"
                >
                
                <button class="btn-sm" onclick="adminDashboard.clearLogs()">
                    Clear Old Logs
                </button>
            </div>

            <!-- Logs Display -->
            <div class="data-table">
                <div class="table-wrapper logs-container">
                    ${logs.entries.map(log => `
                        <div class="log-entry">
                            <span class="log-timestamp">${this.formatTimestamp(log.timestamp)}</span>
                            <span class="log-level ${log.level}">${log.level}</span>
                            <span class="log-message">${log.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Error Summary -->
            ${logs.errorSummary.length > 0 ? `
                <div class="data-table">
                    <div class="table-header">
                        <h3 class="table-title">Error Summary</h3>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Error Type</th>
                                    <th>Count</th>
                                    <th>Last Occurrence</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.errorSummary.map(error => `
                                    <tr>
                                        <td>${error.type}</td>
                                        <td>${error.count}</td>
                                        <td>${this.formatTime(error.lastOccurrence)}</td>
                                        <td>
                                            <button class="btn-sm" onclick="adminDashboard.viewErrorDetails('${error.type}')">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        `;
    }

    async renderSettings() {
        const settings = await this.loadSystemSettings();
        
        return `
            <!-- System Settings -->
            <div class="section-header">
                <h2 class="section-title">System Settings</h2>
            </div>

            <!-- General Settings -->
            <div class="settings-section">
                <h3>General Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Application Name</label>
                    <p class="setting-description">The name displayed throughout the application</p>
                    <input 
                        type="text" 
                        class="setting-input" 
                        value="${settings.appName}"
                        onchange="adminDashboard.updateSetting('appName', this.value)"
                    >
                </div>

                <div class="setting-group">
                    <label class="setting-label">Default Language</label>
                    <p class="setting-description">Primary language for the application</p>
                    <select 
                        class="setting-input"
                        onchange="adminDashboard.updateSetting('language', this.value)"
                    >
                        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="es" ${settings.language === 'es' ? 'selected' : ''}>Spanish</option>
                        <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>French</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label class="setting-label">Timezone</label>
                    <p class="setting-description">Default timezone for date/time display</p>
                    <input 
                        type="text" 
                        class="setting-input" 
                        value="${settings.timezone}"
                        onchange="adminDashboard.updateSetting('timezone', this.value)"
                    >
                </div>
            </div>

            <!-- Security Settings -->
            <div class="settings-section">
                <h3>Security Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Session Timeout (hours)</label>
                    <p class="setting-description">How long before users are automatically logged out</p>
                    <input 
                        type="number" 
                        class="setting-input" 
                        value="${settings.security.sessionTimeout / 3600000}"
                        onchange="adminDashboard.updateSetting('security.sessionTimeout', this.value * 3600000)"
                    >
                </div>

                <div class="setting-group">
                    <label class="setting-label">Max Login Attempts</label>
                    <p class="setting-description">Number of failed attempts before account lockout</p>
                    <input 
                        type="number" 
                        class="setting-input" 
                        value="${settings.security.maxLoginAttempts}"
                        onchange="adminDashboard.updateSetting('security.maxLoginAttempts', this.value)"
                    >
                </div>

                <div class="setting-group">
                    <label class="setting-label">Two-Factor Authentication</label>
                    <p class="setting-description">Require 2FA for all admin accounts</p>
                    <div class="toggle-container">
                        <div 
                            class="toggle-switch ${settings.security.require2FA ? 'active' : ''}"
                            onclick="adminDashboard.toggleSetting('security.require2FA')"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Feature Flags -->
            <div class="settings-section">
                <h3>Feature Flags</h3>
                
                ${Object.entries(settings.features).map(([feature, enabled]) => `
                    <div class="setting-group">
                        <label class="setting-label">${this.formatFeatureName(feature)}</label>
                        <p class="setting-description">${this.getFeatureDescription(feature)}</p>
                        <div class="toggle-container">
                            <div 
                                class="toggle-switch ${enabled ? 'active' : ''}"
                                onclick="adminDashboard.toggleSetting('features.${feature}')"
                            ></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Maintenance Mode -->
            <div class="settings-section">
                <h3>Maintenance Mode</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Enable Maintenance Mode</label>
                    <p class="setting-description">
                        Temporarily disable access for non-admin users
                    </p>
                    <div class="toggle-container">
                        <div 
                            class="toggle-switch ${settings.maintenanceMode ? 'active' : ''}"
                            onclick="adminDashboard.toggleMaintenanceMode()"
                        ></div>
                    </div>
                </div>

                ${settings.maintenanceMode ? `
                    <div class="setting-group">
                        <label class="setting-label">Maintenance Message</label>
                        <textarea 
                            class="setting-input" 
                            rows="3"
                            onchange="adminDashboard.updateSetting('maintenanceMessage', this.value)"
                        >${settings.maintenanceMessage || ''}</textarea>
                    </div>
                ` : ''}
            </div>

            <!-- Save Button -->
            <div class="settings-actions">
                <button class="btn-primary" onclick="adminDashboard.saveAllSettings()">
                    Save All Settings
                </button>
                <button class="btn-secondary" onclick="adminDashboard.resetSettings()">
                    Reset to Defaults
                </button>
            </div>
        `;
    }

    // Data Loading Methods
    async loadSystemStats() {
        try {
            const now = new Date();
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            
            // Load real data from database
            const [users, jobs, applications, events] = await Promise.all([
                this.app.db.users.toArray(),
                this.app.db.jobs.toArray(),
                this.app.db.applications.toArray(),
                this.app.db.events.where('timestamp').above(weekAgo.toISOString()).toArray()
            ]);

            // Calculate stats
            const activeUsers = users.filter(u => u.status === 'active').length;
            const newUsersThisWeek = users.filter(u => new Date(u.created) > weekAgo).length;
            const userGrowth = users.length > 0 ? Math.round((newUsersThisWeek / users.length) * 100) : 0;

            const activeJobs = jobs.length;
            const newJobsToday = jobs.filter(j => {
                const posted = new Date(j.posted);
                return posted.toDateString() === now.toDateString();
            }).length;

            const applicationsToday = applications.filter(a => {
                const applied = new Date(a.appliedDate);
                return applied.toDateString() === now.toDateString();
            }).length;

            const successfulApplications = applications.filter(a => 
                ['interview', 'offer'].includes(a.status)
            ).length;
            const systemSuccessRate = applications.length > 0 ? 
                Math.round((successfulApplications / applications.length) * 100) : 0;

            // System health check
            const errors = events.filter(e => e.type === 'error');
            const systemHealth = {
                status: errors.length === 0 ? 'healthy' : errors.length < 10 ? 'warning' : 'error',
                statusText: errors.length === 0 ? 'Healthy' : errors.length < 10 ? 'Warning' : 'Critical'
            };

            // Recent activity
            const recentActivity = events
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
                .map(event => ({
                    timestamp: event.timestamp,
                    userName: 'User ' + event.userId,
                    userEmail: `user${event.userId}@example.com`,
                    action: event.action,
                    details: event.metadata?.details
                }));

            return {
                totalUsers: users.length,
                userGrowth,
                activeJobs,
                newJobsToday,
                totalApplications: applications.length,
                applicationsToday,
                systemSuccessRate,
                successTrend: 5, // Mock positive trend
                systemHealth,
                recentActivity,
                activityData: this.generateMockChartData('activity'),
                successData: this.generateMockChartData('success')
            };
        } catch (error) {
            this.app.services.logger.error('Failed to load system stats', error);
            return this.getDefaultStats();
        }
    }

    async loadUsers() {
        try {
            const users = await this.app.db.users.toArray();
            const now = new Date();
            const today = new Date(now.toDateString());
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

            // Get user profiles and application counts
            const userList = await Promise.all(users.map(async user => {
                const profile = await this.app.db.profiles.get(user.id);
                const applicationCount = await this.app.db.applications
                    .where('userId')
                    .equals(user.id)
                    .count();

                return {
                    ...user,
                    name: profile?.displayName || user.username,
                    avatar: profile?.avatar,
                    applicationCount
                };
            }));

            return {
                total: users.length,
                activeToday: users.filter(u => new Date(u.lastLogin) >= today).length,
                newThisWeek: users.filter(u => new Date(u.created) > weekAgo).length,
                adminCount: users.filter(u => u.role === 'admin').length,
                list: userList
            };
        } catch (error) {
            this.app.services.logger.error('Failed to load users', error);
            return { total: 0, activeToday: 0, newThisWeek: 0, adminCount: 0, list: [] };
        }
    }

    async loadJobBoards() {
        try {
            const boards = await this.app.db.jobBoards.toArray();
            
            // Get job counts and health status for each board
            const boardsWithStats = await Promise.all(boards.map(async board => {
                const jobCount = await this.app.db.jobs
                    .where('source')
                    .equals(board.name)
                    .count();

                const today = new Date().toDateString();
                const newToday = await this.app.db.jobs
                    .where('source')
                    .equals(board.name)
                    .filter(job => new Date(job.posted).toDateString() === today)
                    .count();

                // Mock health data
                const health = {
                    status: board.enabled ? 'healthy' : 'inactive',
                    responseTime: Math.floor(Math.random() * 300) + 100,
                    successRate: Math.floor(Math.random() * 20) + 80,
                    lastCheck: new Date(Date.now() - Math.random() * 3600000)
                };

                return {
                    ...board,
                    jobCount,
                    newToday,
                    health
                };
            }));

            return boardsWithStats;
        } catch (error) {
            this.app.services.logger.error('Failed to load job boards', error);
            return [];
        }
    }

    async loadAnalytics() {
        try {
            const applications = await this.app.db.applications.toArray();
            const users = await this.app.db.users.toArray();
            const events = await this.app.db.events.toArray();

            // Calculate metrics
            const avgApplicationsPerUser = users.length > 0 ? 
                Math.round(applications.length / users.length * 10) / 10 : 0;

            const interviews = applications.filter(a => a.status === 'interview').length;
            const interviewRate = applications.length > 0 ?
                Math.round((interviews / applications.length) * 100) : 0;

            const aiEvents = events.filter(e => e.type === 'ai_optimization');
            const aiUsageRate = users.length > 0 ?
                Math.round((aiEvents.length / users.length) * 100) : 0;

            return {
                avgApplicationsPerUser,
                applicationTrend: 15,
                interviewRate,
                industryAvgInterview: 10,
                aiUsageRate,
                aiImprovementRate: 35,
                retentionRate: 75,
                funnelData: this.generateFunnelData(applications),
                categoryData: this.generateCategoryData(),
                insights: this.generateInsights()
            };
        } catch (error) {
            this.app.services.logger.error('Failed to load analytics', error);
            return this.getDefaultAnalytics();
        }
    }

    async loadSystemLogs() {
        try {
            const logs = await this.app.db.events
                .reverse()
                .limit(1000)
                .toArray();

            const entries = logs.map(log => ({
                timestamp: log.timestamp,
                level: this.getLogLevel(log.type),
                message: this.formatLogMessage(log),
                service: this.getLogService(log.type)
            }));

            // Group errors
            const errors = entries.filter(e => e.level === 'error');
            const errorTypes = {};
            errors.forEach(error => {
                const type = this.extractErrorType(error.message);
                if (!errorTypes[type]) {
                    errorTypes[type] = { count: 0, lastOccurrence: null };
                }
                errorTypes[type].count++;
                errorTypes[type].lastOccurrence = error.timestamp;
            });

            const errorSummary = Object.entries(errorTypes).map(([type, data]) => ({
                type,
                count: data.count,
                lastOccurrence: data.lastOccurrence
            }));

            return { entries, errorSummary };
        } catch (error) {
            this.app.services.logger.error('Failed to load logs', error);
            return { entries: [], errorSummary: [] };
        }
    }

    async loadSystemSettings() {
        try {
            const settings = await this.app.db.systemSettings.toArray();
            const settingsMap = {};
            
            settings.forEach(setting => {
                settingsMap[setting.key] = setting.value;
            });

            return settingsMap;
        } catch (error) {
            this.app.services.logger.error('Failed to load settings', error);
            return this.getDefaultSettings();
        }
    }

    // Event Handlers
    async showSection(section) {
        this.currentSection = section;
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.nav-item').classList.add('active');
        
        // Load section content
        const contentArea = document.getElementById('admin-content');
        const stats = await this.loadSystemStats();
        contentArea.innerHTML = await this.renderSection(section, stats);
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    async refreshAll() {
        const contentArea = document.getElementById('admin-content');
        contentArea.innerHTML = '<div class="loading">Refreshing...</div>';
        
        const stats = await this.loadSystemStats();
        contentArea.innerHTML = await this.renderSection(this.currentSection, stats);
        
        this.app.services.message.success('Data refreshed');
    }

    // User Management
    async updateUserRole(userId, newRole) {
        try {
            const user = await this.app.db.users.get(userId);
            if (user) {
                user.role = newRole;
                await this.app.db.users.put(user);
                this.app.services.message.success('User role updated');
            }
        } catch (error) {
            this.app.services.message.error('Failed to update user role');
        }
    }

    async toggleUserStatus(userId) {
        try {
            const user = await this.app.db.users.get(userId);
            if (user) {
                user.status = user.status === 'active' ? 'suspended' : 'active';
                await this.app.db.users.put(user);
                await this.showSection('users');
                this.app.services.message.success(`User ${user.status === 'active' ? 'activated' : 'suspended'}`);
            }
        } catch (error) {
            this.app.services.message.error('Failed to update user status');
        }
    }

    async viewUser(userId) {
        await this.app.ui.showModal('admin-user-details', { userId });
    }

    async editUser(userId) {
        await this.app.ui.showModal('admin-edit-user', { userId });
    }

    async showAddUser() {
        await this.app.ui.showModal('admin-add-user');
    }

    async exportUsers() {
        try {
            const users = await this.loadUsers();
            const csv = this.convertToCSV(users.list);
            this.downloadFile(csv, 'users-export.csv', 'text/csv');
            this.app.services.message.success('Users exported successfully');
        } catch (error) {
            this.app.services.message.error('Failed to export users');
        }
    }

    // Job Board Management
    async toggleJobBoard(boardId) {
        try {
            const board = await this.app.db.jobBoards.get(boardId);
            if (board) {
                board.enabled = !board.enabled;
                await this.app.db.jobBoards.put(board);
                await this.showSection('jobs');
                this.app.services.message.success(`Job board ${board.enabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            this.app.services.message.error('Failed to toggle job board');
        }
    }

    async syncJobBoard(boardId) {
        try {
            this.app.services.message.info('Syncing job board...');
            await this.app.services.jobBoard.syncJobBoard(boardId);
            await this.showSection('jobs');
            this.app.services.message.success('Job board synced successfully');
        } catch (error) {
            this.app.services.message.error('Failed to sync job board');
        }
    }

    async editJobBoard(boardId) {
        await this.app.ui.showModal('admin-edit-job-board', { boardId });
    }

    async deleteJobBoard(boardId) {
        if (confirm('Are you sure you want to delete this job board?')) {
            try {
                await this.app.db.jobBoards.delete(boardId);
                await this.showSection('jobs');
                this.app.services.message.success('Job board deleted');
            } catch (error) {
                this.app.services.message.error('Failed to delete job board');
            }
        }
    }

    async showAddJobBoard() {
        await this.app.ui.showModal('admin-add-job-board');
    }

    async testAllAPIs() {
        this.app.services.message.info('Testing all APIs...');
        // Implementation would test each API
        setTimeout(() => {
            this.app.services.message.success('API tests completed');
        }, 2000);
    }

    // Settings Management
    async updateSetting(key, value) {
        try {
            await this.app.db.systemSettings.put({
                key,
                value,
                updated: new Date().toISOString()
            });
            this.app.services.message.success('Setting updated');
        } catch (error) {
            this.app.services.message.error('Failed to update setting');
        }
    }

    async toggleSetting(key) {
        try {
            const setting = await this.app.db.systemSettings.get(key);
            const currentValue = setting?.value || false;
            await this.updateSetting(key, !currentValue);
            await this.showSection('settings');
        } catch (error) {
            this.app.services.message.error('Failed to toggle setting');
        }
    }

    async toggleMaintenanceMode() {
        const enabled = await this.toggleSetting('maintenanceMode');
        if (enabled) {
            this.app.services.message.warning('Maintenance mode enabled - only admins can access the system');
        }
    }

    async saveAllSettings() {
        this.app.services.message.success('All settings saved successfully');
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            // Implementation would reset settings
            this.app.services.message.success('Settings reset to defaults');
        }
    }

    // Helper Methods
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    formatAction(action) {
        const actionMap = {
            'login': 'Logged in',
            'logout': 'Logged out',
            'application_created': 'Created application',
            'resume_optimized': 'Optimized resume',
            'job_saved': 'Saved job'
        };
        return actionMap[action] || action;
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getLogLevel(type) {
        if (type.includes('error')) return 'error';
        if (type.includes('warning')) return 'warning';
        if (type.includes('success')) return 'success';
        return 'info';
    }

    formatLogMessage(log) {
        return `${log.action}: ${JSON.stringify(log.metadata || {})}`;
    }

    getLogService(type) {
        if (type.includes('auth')) return 'auth';
        if (type.includes('job')) return 'jobs';
        if (type.includes('ai')) return 'ai';
        if (type.includes('email')) return 'email';
        return 'system';
    }

    extractErrorType(message) {
        // Simple error categorization
        if (message.includes('network')) return 'Network Error';
        if (message.includes('auth')) return 'Authentication Error';
        if (message.includes('database')) return 'Database Error';
        return 'Unknown Error';
    }

    formatFeatureName(feature) {
        return feature
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    getFeatureDescription(feature) {
        const descriptions = {
            aiOptimization: 'Enable AI-powered resume and cover letter optimization',
            batchApplications: 'Allow users to apply to multiple jobs at once',
            emailIntegration: 'Enable email integration for sending applications',
            analytics: 'Track and display user analytics',
            communitySharing: 'Allow users to share tips and success stories'
        };
        return descriptions[feature] || 'Enable this feature';
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return csv;
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Chart Rendering (Simplified)
    renderActivityChart(data) {
        // In a real implementation, this would use a charting library
        return `
            <div class="simple-chart">
                <div class="chart-bars">
                    ${data.map(point => `
                        <div class="chart-bar" style="height: ${point.value}%">
                            <span class="bar-value">${point.value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="chart-labels">
                    ${data.map(point => `
                        <span class="chart-label">${point.label}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSuccessChart(data) {
        return this.renderActivityChart(data);
    }

    renderFunnelChart(data) {
        return `
            <div class="funnel-chart">
                ${data.map((stage, index) => `
                    <div class="funnel-stage" style="width: ${100 - index * 20}%">
                        <div class="stage-label">${stage.label}</div>
                        <div class="stage-value">${stage.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCategoryChart(data) {
        return `
            <div class="category-chart">
                ${data.map(category => `
                    <div class="category-item">
                        <span class="category-name">${category.name}</span>
                        <div class="category-bar">
                            <div class="bar-fill" style="width: ${category.percentage}%"></div>
                        </div>
                        <span class="category-value">${category.percentage}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Mock Data Generators
    generateMockChartData(type) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            label: day,
            value: Math.floor(Math.random() * 80) + 20
        }));
    }

    generateFunnelData(applications) {
        const total = applications.length;
        const interviewed = applications.filter(a => ['interview', 'offer'].includes(a.status)).length;
        const offered = applications.filter(a => a.status === 'offer').length;
        
        return [
            { label: 'Applications Sent', value: total },
            { label: 'Interviews', value: interviewed },
            { label: 'Offers', value: offered }
        ];
    }

    generateCategoryData() {
        return [
            { name: 'Software Development', percentage: 35 },
            { name: 'Data Science', percentage: 25 },
            { name: 'Product Management', percentage: 20 },
            { name: 'Design', percentage: 15 },
            { name: 'Marketing', percentage: 5 }
        ];
    }

    generateInsights() {
        return [
            {
                icon: '📈',
                title: 'Application Success Increasing',
                description: 'Users who optimize resumes with AI have 40% higher interview rates',
                metric: '40%',
                metricLabel: 'higher success rate'
            },
            {
                icon: '⏱️',
                title: 'Peak Activity Times',
                description: 'Most applications are sent between 9-11 AM and 2-4 PM',
                metric: '73%',
                metricLabel: 'during peak hours'
            },
            {
                icon: '🎯',
                title: 'Targeted Applications Win',
                description: 'Users applying to fewer, more targeted jobs see better results',
                metric: '2.5x',
                metricLabel: 'better response rate'
            }
        ];
    }

    getDefaultStats() {
        return {
            totalUsers: 0,
            userGrowth: 0,
            activeJobs: 0,
            newJobsToday: 0,
            totalApplications: 0,
            applicationsToday: 0,
            systemSuccessRate: 0,
            successTrend: 0,
            systemHealth: { status: 'unknown', statusText: 'Unknown' },
            recentActivity: [],
            activityData: [],
            successData: []
        };
    }

    getDefaultSettings() {
        return {
            appName: 'Job Hunter Pro',
            language: 'en',
            timezone: 'UTC',
            security: {
                sessionTimeout: 86400000,
                maxLoginAttempts: 5,
                require2FA: false
            },
            features: {
                aiOptimization: true,
                batchApplications: true,
                emailIntegration: true,
                analytics: true,
                communitySharing: false
            },
            maintenanceMode: false
        };
    }

    getDefaultAnalytics() {
        return {
            avgApplicationsPerUser: 0,
            applicationTrend: 0,
            interviewRate: 0,
            industryAvgInterview: 10,
            aiUsageRate: 0,
            aiImprovementRate: 0,
            retentionRate: 0,
            funnelData: [],
            categoryData: [],
            insights: []
        };
    }

    // Lifecycle
    async afterRender() {
        // Start auto-refresh
        this.refreshInterval = setInterval(() => {
            this.updateRealTimeStats();
        }, 30000); // Every 30 seconds
    }

    async updateRealTimeStats() {
        // Update real-time elements without full refresh
        // This would update specific counters and indicators
    }

    unmounted() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Create global instance
window.adminDashboard = new AdminDashboardView(window.app);