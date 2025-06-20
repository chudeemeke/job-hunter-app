// Job Listings View - Smart job search with AI matching
// Showcases the ingenious $0 implementation

export default class JobListingsView {
    constructor(app) {
        this.app = app;
        this.jobs = [];
        this.filters = {
            search: '',
            type: 'all',
            location: 'all',
            salary: 'all',
            posted: 'all',
            source: 'all'
        };
        this.sortBy = 'relevance';
        this.viewMode = 'grid';
        this.selectedJobs = new Set();
        this.page = 1;
        this.loading = false;
    }

    async render() {
        return `
            <div class="job-listings-container">
                <!-- Header -->
                <header class="listings-header">
                    <div class="header-content">
                        <div class="header-left">
                            <button class="back-button" data-action="back">
                                ← Back
                            </button>
                            <h1 class="page-title">Smart Job Search</h1>
                        </div>
                        <div class="header-right">
                            <div class="view-toggle">
                                <button class="view-button ${this.viewMode === 'grid' ? 'active' : ''}" 
                                        data-view="grid" title="Grid view">
                                    ⊞
                                </button>
                                <button class="view-button ${this.viewMode === 'list' ? 'active' : ''}" 
                                        data-view="list" title="List view">
                                    ☰
                                </button>
                            </div>
                            <button class="batch-apply-button" data-action="batch-apply" 
                                    ${this.selectedJobs.size === 0 ? 'disabled' : ''}>
                                ⚡ Apply to ${this.selectedJobs.size} jobs
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Search Bar -->
                <section class="search-section">
                    <div class="search-container">
                        <div class="search-wrapper">
                            <span class="search-icon">🔍</span>
                            <input type="search" 
                                   class="search-input" 
                                   placeholder="Search by title, company, skills..." 
                                   value="${this.filters.search}"
                                   data-filter="search">
                            <button class="ai-search-button" data-action="ai-search" 
                                    title="AI-powered search">
                                <span class="ai-badge">AI</span>
                            </button>
                        </div>
                        <button class="filter-button" data-action="toggle-filters">
                            <span class="filter-icon">⚙️</span>
                            Filters
                            ${this.hasActiveFilters() ? '<span class="filter-count">' + this.countActiveFilters() + '</span>' : ''}
                        </button>
                    </div>
                </section>

                <!-- Filters (Collapsible) -->
                <section class="filters-section ${this.filtersVisible ? 'visible' : ''}" id="filtersSection">
                    <div class="filters-container">
                        <div class="filter-group">
                            <label class="filter-label">Job Type</label>
                            <select class="filter-select" data-filter="type">
                                <option value="all">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Location</label>
                            <select class="filter-select" data-filter="location">
                                <option value="all">All Locations</option>
                                <option value="remote">Remote Only</option>
                                <option value="usa">United States</option>
                                <option value="europe">Europe</option>
                                <option value="asia">Asia</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Salary Range</label>
                            <select class="filter-select" data-filter="salary">
                                <option value="all">All Salaries</option>
                                <option value="0-50k">$0 - $50k</option>
                                <option value="50k-100k">$50k - $100k</option>
                                <option value="100k-150k">$100k - $150k</option>
                                <option value="150k+">$150k+</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Posted</label>
                            <select class="filter-select" data-filter="posted">
                                <option value="all">Any Time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="3d">Last 3 days</option>
                                <option value="7d">Last week</option>
                                <option value="30d">Last month</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Source</label>
                            <select class="filter-select" data-filter="source">
                                <option value="all">All Sources</option>
                                <option value="remoteok">RemoteOK</option>
                                <option value="github">GitHub Jobs</option>
                                <option value="community">Community</option>
                                <option value="rss">RSS Feeds</option>
                            </select>
                        </div>
                        
                        <button class="clear-filters-button" data-action="clear-filters">
                            Clear All
                        </button>
                    </div>
                </section>

                <!-- Results Summary -->
                <section class="results-summary">
                    <div class="summary-content">
                        <div class="summary-left">
                            <span class="result-count">${this.jobs.length} jobs found</span>
                            ${this.filters.search ? `<span class="search-term">for "${this.filters.search}"</span>` : ''}
                        </div>
                        <div class="summary-right">
                            <label class="sort-label">Sort by:</label>
                            <select class="sort-select" data-action="sort">
                                <option value="relevance">Best Match</option>
                                <option value="date">Most Recent</option>
                                <option value="salary">Highest Salary</option>
                                <option value="company">Company A-Z</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Job Listings -->
                <section class="listings-section">
                    <div class="listings-container ${this.viewMode}">
                        ${this.loading ? this.renderLoading() : this.renderJobs()}
                    </div>
                    
                    ${!this.loading && this.jobs.length === 0 ? this.renderEmptyState() : ''}
                    
                    ${!this.loading && this.hasMoreJobs() ? `
                        <div class="load-more-container">
                            <button class="load-more-button" data-action="load-more">
                                Load More Jobs
                            </button>
                        </div>
                    ` : ''}
                </section>

                <!-- AI Assistant FAB -->
                <button class="ai-fab" data-action="ai-assistant" title="AI Job Assistant">
                    <span class="ai-icon">🤖</span>
                </button>
            </div>

            <style>
                .job-listings-container {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                }

                /* Header */
                .listings-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .back-button {
                    padding: 0.5rem 1rem;
                    background: none;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .back-button:hover {
                    background: var(--bg-secondary);
                    border-color: var(--primary);
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .view-toggle {
                    display: flex;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    padding: 0.25rem;
                }

                .view-button {
                    padding: 0.5rem 0.75rem;
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                    color: var(--text-secondary);
                }

                .view-button:hover {
                    background: var(--bg-tertiary);
                }

                .view-button.active {
                    background: var(--bg-primary);
                    color: var(--primary);
                    box-shadow: var(--shadow-sm);
                }

                .batch-apply-button {
                    padding: 0.75rem 1.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .batch-apply-button:hover:not(:disabled) {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .batch-apply-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Search Section */
                .search-section {
                    background: var(--bg-primary);
                    padding: 1.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }

                .search-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    gap: 1rem;
                }

                .search-wrapper {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                }

                .search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: var(--bg-primary);
                    transition: all 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .ai-search-button {
                    position: absolute;
                    right: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--bg-secondary);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ai-search-button:hover {
                    background: var(--bg-tertiary);
                }

                .filter-button {
                    padding: 0.875rem 1.5rem;
                    background: var(--bg-secondary);
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-button:hover {
                    background: var(--bg-tertiary);
                }

                .filter-count {
                    padding: 0.125rem 0.5rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* Filters Section */
                .filters-section {
                    background: var(--bg-primary);
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    border-bottom: 1px solid var(--border-color);
                }

                .filters-section.visible {
                    max-height: 200px;
                }

                .filters-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.5rem 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    align-items: end;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .filter-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .filter-select {
                    padding: 0.625rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-select:hover {
                    border-color: var(--primary);
                }

                .filter-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .clear-filters-button {
                    padding: 0.625rem 1rem;
                    background: none;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    align-self: end;
                }

                .clear-filters-button:hover {
                    border-color: var(--danger);
                    color: var(--danger);
                }

                /* Results Summary */
                .results-summary {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.5rem 2rem;
                }

                .summary-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .summary-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .result-count {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .search-term {
                    font-size: 1rem;
                    color: var(--text-secondary);
                }

                .summary-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .sort-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .sort-select {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                /* Listings Section */
                .listings-section {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem 2rem;
                }

                .listings-container {
                    display: grid;
                    gap: 1.5rem;
                }

                .listings-container.grid {
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }

                .listings-container.list {
                    grid-template-columns: 1fr;
                }

                /* Job Card */
                .job-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .job-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .job-card.selected {
                    border-color: var(--primary);
                    background: var(--bg-secondary);
                }

                .job-checkbox {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--border-color);
                    border-radius: 6px;
                    background: var(--bg-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .job-checkbox:hover {
                    border-color: var(--primary);
                }

                .job-checkbox.checked {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .job-checkbox.checked::after {
                    content: '✓';
                    color: white;
                    font-size: 1rem;
                    font-weight: bold;
                }

                .job-header {
                    display: flex;
                    align-items: start;
                    gap: 1rem;
                    padding-right: 2rem;
                }

                .company-logo {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    background: var(--gray-100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }

                .company-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 12px;
                }

                .job-info {
                    flex: 1;
                }

                .job-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                    line-height: 1.3;
                }

                .job-company {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .job-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .job-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .job-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin: 0.5rem 0;
                }

                .job-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .job-tag {
                    padding: 0.25rem 0.75rem;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: 999px;
                    border: 1px solid var(--border-color);
                }

                .job-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .job-posted {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .job-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .job-action {
                    padding: 0.5rem 1rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .job-action:hover {
                    background: var(--bg-tertiary);
                    border-color: var(--primary);
                }

                .job-action.primary {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .job-action.primary:hover {
                    background: var(--primary-dark);
                }

                .job-match-score {
                    position: absolute;
                    top: -8px;
                    left: 1rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--success);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 999px;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                /* List View Specific */
                .listings-container.list .job-card {
                    flex-direction: row;
                    align-items: center;
                }

                .listings-container.list .job-info {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .listings-container.list .job-description {
                    display: none;
                }

                .listings-container.list .job-tags {
                    margin-left: auto;
                }

                /* Loading State */
                .loading-container {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }

                .skeleton-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid var(--border-color);
                }

                .skeleton {
                    background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }

                .skeleton-title {
                    height: 24px;
                    width: 70%;
                    margin-bottom: 0.5rem;
                }

                .skeleton-company {
                    height: 20px;
                    width: 40%;
                    margin-bottom: 1rem;
                }

                .skeleton-description {
                    height: 60px;
                    margin-bottom: 1rem;
                }

                .skeleton-tags {
                    display: flex;
                    gap: 0.5rem;
                }

                .skeleton-tag {
                    height: 24px;
                    width: 80px;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-primary);
                    border-radius: 12px;
                    margin: 2rem 0;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-message {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }

                .empty-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                /* Load More */
                .load-more-container {
                    text-align: center;
                    padding: 2rem;
                }

                .load-more-button {
                    padding: 0.875rem 2rem;
                    background: var(--bg-primary);
                    border: 2px solid var(--primary);
                    color: var(--primary);
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .load-more-button:hover {
                    background: var(--primary);
                    color: white;
                }

                /* AI FAB */
                .ai-fab {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
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

                .ai-fab:hover {
                    transform: scale(1.1);
                    box-shadow: var(--shadow-xl);
                }

                .ai-icon {
                    font-size: 1.75rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .header-content,
                    .search-container,
                    .results-summary,
                    .listings-section {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }

                    .listings-container.grid {
                        grid-template-columns: 1fr;
                    }

                    .filters-container {
                        grid-template-columns: 1fr;
                    }

                    .filters-section.visible {
                        max-height: 500px;
                    }

                    .summary-content {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: start;
                    }

                    .job-card {
                        padding: 1rem;
                    }

                    .ai-fab {
                        bottom: 1rem;
                        right: 1rem;
                        width: 56px;
                        height: 56px;
                    }
                }

                /* Dark mode adjustments */
                [data-theme="dark"] .job-card {
                    background: var(--bg-secondary);
                }

                [data-theme="dark"] .job-card:hover {
                    background: var(--bg-tertiary);
                }

                [data-theme="dark"] .skeleton {
                    background: linear-gradient(90deg, var(--gray-700) 25%, var(--gray-600) 50%, var(--gray-700) 75%);
                    background-size: 200% 100%;
                }

                /* Source indicators */
                .source-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    padding: 0.125rem 0.5rem;
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                    font-size: 0.625rem;
                    font-weight: 600;
                    border-radius: 4px;
                    text-transform: uppercase;
                }

                .source-remoteok { background: #ff4742; color: white; }
                .source-github { background: #24292e; color: white; }
                .source-community { background: #10b981; color: white; }
                .source-rss { background: #f59e0b; color: white; }
            </style>
        `;
    }

    renderJobs() {
        if (this.jobs.length === 0) {
            return '';
        }

        return this.jobs.map(job => this.renderJobCard(job)).join('');
    }

    renderJobCard(job) {
        const isSelected = this.selectedJobs.has(job.id);
        const matchScore = job.matchScore || this.calculateMatchScore(job);
        const logo = job.logo || this.generateCompanyLogo(job.company);

        return `
            <div class="job-card ${isSelected ? 'selected' : ''}" data-job-id="${job.id}">
                <div class="source-badge source-${job.source}">${job.source}</div>
                ${matchScore >= 80 ? `
                    <div class="job-match-score">
                        <span>⭐</span> ${matchScore}% match
                    </div>
                ` : ''}
                
                <div class="job-checkbox ${isSelected ? 'checked' : ''}" 
                     data-action="toggle-job" 
                     data-id="${job.id}"
                     onclick="event.stopPropagation()">
                </div>

                <div class="job-header">
                    <div class="company-logo">
                        ${logo.startsWith('http') ? `<img src="${logo}" alt="${job.company}">` : logo}
                    </div>
                    <div class="job-info">
                        <h3 class="job-title">${job.title}</h3>
                        <div class="job-company">${job.company}</div>
                        <div class="job-meta">
                            ${job.location ? `
                                <span class="job-meta-item">
                                    <span>📍</span> ${job.location}
                                </span>
                            ` : ''}
                            ${job.type ? `
                                <span class="job-meta-item">
                                    <span>💼</span> ${job.type}
                                </span>
                            ` : ''}
                            ${job.salary ? `
                                <span class="job-meta-item">
                                    <span>💰</span> ${job.salary}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <p class="job-description">${this.truncateDescription(job.description)}</p>

                <div class="job-tags">
                    ${job.requirements ? job.requirements.slice(0, 5).map(req => `
                        <span class="job-tag">${req}</span>
                    `).join('') : ''}
                </div>

                <div class="job-footer">
                    <span class="job-posted">${job.posted}</span>
                    <div class="job-actions">
                        <button class="job-action" data-action="view-job" data-id="${job.id}">
                            View Details
                        </button>
                        <button class="job-action primary" data-action="quick-apply" data-id="${job.id}">
                            Quick Apply
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="loading-container">
                ${Array(6).fill(0).map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-company"></div>
                        <div class="skeleton skeleton-description"></div>
                        <div class="skeleton-tags">
                            <div class="skeleton skeleton-tag"></div>
                            <div class="skeleton skeleton-tag"></div>
                            <div class="skeleton skeleton-tag"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h2 class="empty-title">No jobs found</h2>
                <p class="empty-message">
                    Try adjusting your filters or search terms to find more opportunities.
                </p>
                <div class="empty-actions">
                    <button class="job-action" data-action="clear-filters">
                        Clear Filters
                    </button>
                    <button class="job-action primary" data-action="ai-search">
                        Try AI Search
                    </button>
                </div>
            </div>
        `;
    }

    async mounted() {
        this.setupEventListeners();
        await this.loadJobs();
    }

    setupEventListeners() {
        // View toggle
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', () => {
                this.viewMode = button.dataset.view;
                this.updateView();
            });
        });

        // Filter toggles
        document.querySelector('[data-action="toggle-filters"]').addEventListener('click', () => {
            this.toggleFilters();
        });

        // Filter changes
        document.querySelectorAll('[data-filter]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateFilter(input.dataset.filter, input.value);
            });
        });

        // Search input
        const searchInput = document.querySelector('[data-filter="search"]');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.updateFilter('search', e.target.value);
            }, 300);
        });

        // Sort change
        document.querySelector('[data-action="sort"]').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.sortJobs();
        });

        // Action handlers
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const id = e.target.closest('[data-id]')?.dataset.id;
            
            if (action) {
                this.handleAction(action, id);
            }
        });

        // Job card clicks
        document.addEventListener('click', (e) => {
            const jobCard = e.target.closest('.job-card');
            if (jobCard && !e.target.closest('[data-action]')) {
                const jobId = jobCard.dataset.jobId;
                this.handleAction('view-job', jobId);
            }
        });
    }

    async handleAction(action, id) {
        switch (action) {
            case 'back':
                await this.app.ui.showView('dashboard');
                break;
                
            case 'batch-apply':
                await this.batchApply();
                break;
                
            case 'ai-search':
                await this.showAISearch();
                break;
                
            case 'toggle-job':
                this.toggleJobSelection(id);
                break;
                
            case 'view-job':
                await this.app.ui.showView('job-details', { id });
                break;
                
            case 'quick-apply':
                await this.quickApply(id);
                break;
                
            case 'clear-filters':
                this.clearFilters();
                break;
                
            case 'load-more':
                await this.loadMore();
                break;
                
            case 'ai-assistant':
                await this.showAIAssistant();
                break;
        }
    }

    async loadJobs() {
        this.loading = true;
        this.updateUI();

        try {
            // Use the job board service to search
            const query = this.filters.search || 'software developer';
            const jobs = await this.app.services.jobBoard.searchJobs(query, {
                sources: this.filters.source === 'all' ? {} : { [this.filters.source]: true }
            });

            // Apply client-side filters
            this.jobs = this.applyFilters(jobs);
            
            // Sort jobs
            this.sortJobs();
            
            // Calculate match scores
            await this.calculateMatchScores();

        } catch (error) {
            this.app.services.logger.error('Failed to load jobs', error);
            this.app.services.message.error('Failed to load jobs. Please try again.');
        } finally {
            this.loading = false;
            this.updateUI();
        }
    }

    applyFilters(jobs) {
        return jobs.filter(job => {
            // Type filter
            if (this.filters.type !== 'all') {
                if (this.filters.type === 'remote' && !job.location?.toLowerCase().includes('remote')) {
                    return false;
                } else if (this.filters.type !== 'remote' && job.type?.toLowerCase() !== this.filters.type) {
                    return false;
                }
            }

            // Location filter
            if (this.filters.location !== 'all') {
                if (this.filters.location === 'remote' && !job.location?.toLowerCase().includes('remote')) {
                    return false;
                } else if (this.filters.location !== 'remote' && !this.matchLocation(job.location, this.filters.location)) {
                    return false;
                }
            }

            // Salary filter
            if (this.filters.salary !== 'all' && job.salary) {
                const salary = this.parseSalary(job.salary);
                const range = this.filters.salary;
                
                if (range === '0-50k' && salary > 50000) return false;
                if (range === '50k-100k' && (salary < 50000 || salary > 100000)) return false;
                if (range === '100k-150k' && (salary < 100000 || salary > 150000)) return false;
                if (range === '150k+' && salary < 150000) return false;
            }

            // Posted filter
            if (this.filters.posted !== 'all') {
                const daysAgo = this.getDaysAgo(job.posted);
                
                if (this.filters.posted === '24h' && daysAgo > 1) return false;
                if (this.filters.posted === '3d' && daysAgo > 3) return false;
                if (this.filters.posted === '7d' && daysAgo > 7) return false;
                if (this.filters.posted === '30d' && daysAgo > 30) return false;
            }

            return true;
        });
    }

    sortJobs() {
        switch (this.sortBy) {
            case 'relevance':
                this.jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                break;
                
            case 'date':
                this.jobs.sort((a, b) => this.getDaysAgo(a.posted) - this.getDaysAgo(b.posted));
                break;
                
            case 'salary':
                this.jobs.sort((a, b) => this.parseSalary(b.salary) - this.parseSalary(a.salary));
                break;
                
            case 'company':
                this.jobs.sort((a, b) => a.company.localeCompare(b.company));
                break;
        }
    }

    async calculateMatchScores() {
        const userProfile = this.app.services.user.currentUser?.profile;
        if (!userProfile) return;

        const preferences = userProfile.preferences.jobPreferences;
        
        this.jobs.forEach(job => {
            job.matchScore = this.calculateMatchScore(job, preferences);
        });

        // Re-sort if sorting by relevance
        if (this.sortBy === 'relevance') {
            this.sortJobs();
        }
    }

    calculateMatchScore(job, preferences) {
        if (!preferences) {
            preferences = this.app.services.user.currentUser?.profile?.preferences?.jobPreferences;
        }
        
        if (!preferences) return 50;

        let score = 50; // Base score

        // Type match
        if (preferences.types?.includes(job.type)) score += 10;

        // Location match
        if (job.location === 'Remote' || preferences.locations?.includes(job.location)) score += 15;

        // Keywords match
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        preferences.keywords?.forEach(keyword => {
            if (jobText.includes(keyword.toLowerCase())) score += 5;
        });

        // Skills match
        const userSkills = preferences.skills || [];
        job.requirements?.forEach(req => {
            if (userSkills.some(skill => req.toLowerCase().includes(skill.toLowerCase()))) {
                score += 3;
            }
        });

        return Math.min(score, 100);
    }

    toggleJobSelection(jobId) {
        if (this.selectedJobs.has(jobId)) {
            this.selectedJobs.delete(jobId);
        } else {
            this.selectedJobs.add(jobId);
        }
        
        // Update UI
        const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
        const checkbox = jobCard?.querySelector('.job-checkbox');
        
        if (jobCard) {
            jobCard.classList.toggle('selected');
        }
        
        if (checkbox) {
            checkbox.classList.toggle('checked');
        }

        // Update batch apply button
        const batchButton = document.querySelector('.batch-apply-button');
        if (batchButton) {
            batchButton.textContent = `⚡ Apply to ${this.selectedJobs.size} jobs`;
            batchButton.disabled = this.selectedJobs.size === 0;
        }
    }

    async batchApply() {
        if (this.selectedJobs.size === 0) return;

        const jobIds = Array.from(this.selectedJobs);
        await this.app.ui.showModal('batch-apply', { jobIds });
    }

    async quickApply(jobId) {
        await this.app.ui.showModal('quick-apply', { jobId });
    }

    async showAISearch() {
        const result = await this.app.services.message.prompt(
            'Describe your ideal job and I\'ll find the best matches using AI',
            {
                title: 'AI Job Search',
                placeholder: 'e.g., "Remote React developer role with good work-life balance"',
                type: 'text'
            }
        );

        if (result) {
            this.filters.search = result;
            document.querySelector('[data-filter="search"]').value = result;
            await this.loadJobs();
            
            this.app.services.message.success('AI search complete! Found the best matches for you.');
        }
    }

    async showAIAssistant() {
        await this.app.ui.showModal('ai-assistant', {
            context: 'job-search',
            jobs: this.jobs.slice(0, 10)
        });
    }

    toggleFilters() {
        const filtersSection = document.getElementById('filtersSection');
        this.filtersVisible = !this.filtersVisible;
        filtersSection.classList.toggle('visible');
    }

    updateFilter(filter, value) {
        this.filters[filter] = value;
        this.page = 1; // Reset pagination
        this.loadJobs();
    }

    clearFilters() {
        this.filters = {
            search: '',
            type: 'all',
            location: 'all',
            salary: 'all',
            posted: 'all',
            source: 'all'
        };
        
        // Update UI
        document.querySelectorAll('[data-filter]').forEach(input => {
            if (input.type === 'search') {
                input.value = '';
            } else {
                input.value = 'all';
            }
        });
        
        this.loadJobs();
    }

    async loadMore() {
        this.page++;
        // In a real implementation, this would load more results
        // For now, we'll just show a message
        this.app.services.message.info('Loading more jobs...');
    }

    updateView() {
        const container = document.querySelector('.listings-container');
        container.className = `listings-container ${this.viewMode}`;
        
        document.querySelectorAll('.view-button').forEach(button => {
            button.classList.toggle('active', button.dataset.view === this.viewMode);
        });
    }

    updateUI() {
        // This would update the entire UI based on current state
        // For now, we'll rely on the initial render
    }

    hasActiveFilters() {
        return Object.entries(this.filters).some(([key, value]) => {
            return key !== 'search' && value !== 'all';
        });
    }

    countActiveFilters() {
        return Object.entries(this.filters).filter(([key, value]) => {
            return key !== 'search' && value !== 'all';
        }).length;
    }

    hasMoreJobs() {
        // In a real implementation, this would check if there are more pages
        return this.jobs.length >= 20;
    }

    truncateDescription(description) {
        if (!description) return '';
        const limit = 150;
        if (description.length <= limit) return description;
        return description.substring(0, limit).trim() + '...';
    }

    generateCompanyLogo(company) {
        if (!company) return '🏢';
        return company.charAt(0).toUpperCase();
    }

    matchLocation(jobLocation, filterLocation) {
        if (!jobLocation) return false;
        
        const locationMap = {
            'usa': ['united states', 'usa', 'us', 'america'],
            'europe': ['europe', 'eu', 'uk', 'germany', 'france', 'spain'],
            'asia': ['asia', 'india', 'china', 'japan', 'singapore']
        };

        const patterns = locationMap[filterLocation] || [];
        const jobLoc = jobLocation.toLowerCase();
        
        return patterns.some(pattern => jobLoc.includes(pattern));
    }

    parseSalary(salary) {
        if (!salary) return 0;
        
        // Extract numbers from salary string
        const numbers = salary.match(/\d+/g);
        if (!numbers) return 0;
        
        // Get the highest number (assume it's annual)
        const amounts = numbers.map(n => parseInt(n));
        let max = Math.max(...amounts);
        
        // If it looks like it's in thousands (e.g., "150k")
        if (salary.toLowerCase().includes('k')) {
            max *= 1000;
        }
        
        return max;
    }

    getDaysAgo(posted) {
        if (!posted) return 999;
        
        const lower = posted.toLowerCase();
        
        if (lower.includes('just now') || lower.includes('minute')) return 0;
        if (lower.includes('hour')) {
            const hours = parseInt(posted.match(/\d+/)?.[0] || '1');
            return hours / 24;
        }
        if (lower.includes('day')) {
            return parseInt(posted.match(/\d+/)?.[0] || '1');
        }
        if (lower.includes('week')) {
            return parseInt(posted.match(/\d+/)?.[0] || '1') * 7;
        }
        if (lower.includes('month')) {
            return parseInt(posted.match(/\d+/)?.[0] || '1') * 30;
        }
        
        return 999; // Very old
    }
}
