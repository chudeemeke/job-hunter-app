// Job Board Service - Ingenious $0 Implementation
// Uses free APIs, CORS proxies, and GitHub Gist as backend

import Dexie from 'https://unpkg.com/dexie@latest/dist/dexie.mjs';

// Initialize Dexie database
const db = new Dexie('JobHunterDB');
db.version(1).stores({
    jobs: '++id, source, title, company, location, type, posted, [company+title+location]',
    applications: '++id, jobId, status, appliedDate',
    resumes: '++id, jobId, optimized, created',
    settings: 'key, value',
    cache: 'key, data, timestamp'
});

// Free CORS proxy services (fallback chain)
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
];

// GitHub Gist for shared job data (community-sourced)
const GIST_ID = 'YOUR_GIST_ID'; // Create a public gist for shared jobs
const GITHUB_TOKEN = null; // Optional: for higher rate limits

export class JobBoardService {
    constructor() {
        this.db = db;
        this.corsProxy = CORS_PROXIES[0];
        this.initializeService();
    }

    async initializeService() {
        // Load cached settings
        const settings = await this.db.settings.toArray();
        this.settings = Object.fromEntries(settings.map(s => [s.key, s.value]));
        
        // Start background sync
        this.startBackgroundSync();
    }

    // Ingenious job search using multiple free sources
    async searchJobs(query, filters = {}) {
        const sources = [];
        
        // 1. RemoteOK API (free, no auth)
        if (filters.sources?.remote !== false) {
            sources.push(this.searchRemoteOK(query, filters));
        }
        
        // 2. Adzuna API (free tier - 250 req/month)
        if (filters.sources?.adzuna !== false) {
            sources.push(this.searchAdzuna(query, filters));
        }
        
        // 3. GitHub Jobs (via API)
        if (filters.sources?.github !== false) {
            sources.push(this.searchGitHubJobs(query, filters));
        }
        
        // 4. Community Gist (crowd-sourced jobs)
        sources.push(this.searchGistJobs(query, filters));
        
        // 5. Web scraping with consent (RSS feeds)
        if (filters.sources?.rss !== false) {
            sources.push(this.searchRSSFeeds(query, filters));
        }
        
        // Execute all searches in parallel
        const results = await Promise.allSettled(sources);
        const jobs = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value || []);
        
        // Store in IndexedDB
        await this.storeJobs(jobs);
        
        return this.deduplicateAndRank(jobs, query);
    }

    // RemoteOK - Free API for remote jobs
    async searchRemoteOK(query, filters) {
        try {
            const url = `https://remoteok.com/api?tag=${encodeURIComponent(query)}`;
            const response = await this.fetchWithCORS(url);
            const data = await response.json();
            
            return data.slice(1).map(job => ({ // Skip first metadata item
                id: `remoteok-${job.id}`,
                title: job.position,
                company: job.company,
                location: 'Remote',
                type: 'Full-time',
                salary: job.salary || 'Competitive',
                posted: this.timeAgo(new Date(job.date)),
                url: job.url,
                description: this.stripHTML(job.description),
                requirements: this.extractSkills(job.tags),
                logo: job.company_logo,
                source: 'remoteok'
            }));
        } catch (error) {
            console.error('RemoteOK search failed:', error);
            return [];
        }
    }

    // Adzuna - Free tier API
    async searchAdzuna(query, filters) {
        const APP_ID = localStorage.getItem('adzuna_app_id') || '';
        const APP_KEY = localStorage.getItem('adzuna_app_key') || '';
        
        if (!APP_ID || !APP_KEY) {
            console.log('Adzuna credentials not configured');
            return [];
        }
        
        try {
            const country = filters.country || 'us';
            const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?` +
                `app_id=${APP_ID}&app_key=${APP_KEY}&` +
                `what=${encodeURIComponent(query)}&` +
                `where=${encodeURIComponent(filters.location || '')}&` +
                `results_per_page=50`;
            
            const response = await this.fetchWithCORS(url);
            const data = await response.json();
            
            return data.results.map(job => ({
                id: `adzuna-${job.id}`,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                type: job.contract_type || 'Full-time',
                salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Competitive',
                posted: this.timeAgo(new Date(job.created)),
                url: job.redirect_url,
                description: job.description,
                requirements: this.extractSkills(job.description),
                source: 'adzuna'
            }));
        } catch (error) {
            console.error('Adzuna search failed:', error);
            return [];
        }
    }

    // GitHub Jobs via GitHub API
    async searchGitHubJobs(query, filters) {
        try {
            // Search GitHub issues labeled as 'job' or 'hiring'
            const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+label:hiring,job+state:open&sort=created&order=desc`;
            
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            if (GITHUB_TOKEN) {
                headers['Authorization'] = `token ${GITHUB_TOKEN}`;
            }
            
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            return data.items.map(issue => ({
                id: `github-${issue.id}`,
                title: issue.title,
                company: issue.repository_url.split('/').slice(-2, -1)[0],
                location: this.extractLocation(issue.body) || 'Remote',
                type: 'Full-time',
                salary: this.extractSalary(issue.body) || 'Competitive',
                posted: this.timeAgo(new Date(issue.created_at)),
                url: issue.html_url,
                description: issue.body,
                requirements: this.extractSkills(issue.body),
                source: 'github'
            }));
        } catch (error) {
            console.error('GitHub jobs search failed:', error);
            return [];
        }
    }

    // Community-sourced jobs from GitHub Gist
    async searchGistJobs(query, filters) {
        try {
            const url = `https://api.github.com/gists/${GIST_ID}`;
            const response = await fetch(url);
            const gist = await response.json();
            
            const content = gist.files['jobs.json']?.content;
            if (!content) return [];
            
            const jobs = JSON.parse(content);
            
            // Filter based on query
            return jobs.filter(job => 
                job.title.toLowerCase().includes(query.toLowerCase()) ||
                job.company.toLowerCase().includes(query.toLowerCase()) ||
                job.description.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Gist jobs search failed:', error);
            return [];
        }
    }

    // RSS Feed parsing for job boards
    async searchRSSFeeds(query, filters) {
        const feeds = [
            'https://stackoverflow.com/jobs/feed',
            'https://weworkremotely.com/remote-jobs.rss',
            'https://remotive.io/api/remote-jobs'
        ];
        
        const jobs = [];
        
        for (const feedUrl of feeds) {
            try {
                const response = await this.fetchWithCORS(feedUrl);
                const text = await response.text();
                const parsedJobs = this.parseRSSFeed(text, query);
                jobs.push(...parsedJobs);
            } catch (error) {
                console.error(`RSS feed ${feedUrl} failed:`, error);
            }
        }
        
        return jobs;
    }

    // Helper: Fetch with CORS proxy fallback
    async fetchWithCORS(url, options = {}) {
        for (const proxy of CORS_PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(url);
                const response = await fetch(proxyUrl, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    this.corsProxy = proxy; // Remember working proxy
                    return response;
                }
            } catch (error) {
                console.warn(`CORS proxy ${proxy} failed, trying next...`);
            }
        }
        
        throw new Error('All CORS proxies failed');
    }

    // Store jobs in IndexedDB
    async storeJobs(jobs) {
        const uniqueJobs = jobs.map(job => ({
            ...job,
            indexed: new Date().toISOString(),
            keywords: this.extractKeywords(job)
        }));
        
        await this.db.jobs.bulkPut(uniqueJobs);
    }

    // Intelligent deduplication and ranking
    deduplicateAndRank(jobs, query) {
        const seen = new Map();
        const queryWords = query.toLowerCase().split(' ');
        
        return jobs
            .filter(job => {
                const key = `${job.company}-${job.title}`.toLowerCase();
                if (seen.has(key)) return false;
                seen.set(key, true);
                return true;
            })
            .map(job => ({
                ...job,
                relevanceScore: this.calculateRelevance(job, queryWords)
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Calculate job relevance score
    calculateRelevance(job, queryWords) {
        let score = 0;
        const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
        
        queryWords.forEach(word => {
            if (job.title.toLowerCase().includes(word)) score += 10;
            if (job.company.toLowerCase().includes(word)) score += 5;
            if (job.description.toLowerCase().includes(word)) score += 2;
            if (job.requirements.some(req => req.toLowerCase().includes(word))) score += 3;
        });
        
        // Boost recent jobs
        const daysAgo = this.getDaysAgo(job.posted);
        if (daysAgo < 7) score += 5;
        if (daysAgo < 3) score += 10;
        
        // Boost jobs with salary info
        if (job.salary && job.salary !== 'Competitive') score += 3;
        
        return score;
    }

    // Extract keywords for better search
    extractKeywords(job) {
        const text = `${job.title} ${job.description} ${job.requirements.join(' ')}`;
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        
        // Common tech keywords
        const techKeywords = ['react', 'python', 'javascript', 'node', 'aws', 'docker', 
                            'kubernetes', 'typescript', 'golang', 'rust', 'java', 'senior',
                            'junior', 'remote', 'fullstack', 'frontend', 'backend', 'devops'];
        
        return words.filter(word => 
            word.length > 3 && 
            (techKeywords.includes(word) || word.match(/^[A-Z]+$/))
        );
    }

    // Background sync every hour
    startBackgroundSync() {
        // Initial sync
        this.syncJobs();
        
        // Periodic sync
        setInterval(() => this.syncJobs(), 3600000); // 1 hour
        
        // Sync on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.syncJobs();
        });
    }

    async syncJobs() {
        const lastSync = await this.db.settings.get('lastSync');
        const now = Date.now();
        
        if (lastSync && now - lastSync.value < 1800000) { // 30 min cooldown
            return;
        }
        
        // Get popular search terms from community
        const popularSearches = await this.getPopularSearches();
        
        // Sync jobs for popular terms
        for (const term of popularSearches.slice(0, 5)) {
            await this.searchJobs(term, { sources: { remote: true, github: true } });
        }
        
        await this.db.settings.put({ key: 'lastSync', value: now });
    }

    // Get popular searches from community Gist
    async getPopularSearches() {
        try {
            const url = `https://api.github.com/gists/${GIST_ID}`;
            const response = await fetch(url);
            const gist = await response.json();
            
            const content = gist.files['popular-searches.json']?.content;
            return content ? JSON.parse(content) : ['react', 'python', 'remote'];
        } catch {
            return ['react', 'python', 'remote', 'javascript', 'senior'];
        }
    }

    // Utility functions
    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }
        
        return 'just now';
    }

    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    extractSkills(text) {
        const skillPatterns = [
            /\b(React|Vue|Angular|JavaScript|TypeScript|Python|Java|C\+\+|Ruby|Go|Rust|Swift|Kotlin)\b/gi,
            /\b(Node\.js|Django|Flask|Spring|Rails|Laravel|Express|FastAPI)\b/gi,
            /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|CI\/CD|DevOps)\b/gi,
            /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|GraphQL)\b/gi,
            /\b(Machine Learning|AI|Data Science|Deep Learning|TensorFlow|PyTorch)\b/gi
        ];
        
        const skills = new Set();
        
        skillPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(skill => skills.add(skill));
        });
        
        return Array.from(skills);
    }

    extractLocation(text) {
        const locationPattern = /\b(Remote|New York|San Francisco|London|Berlin|Toronto|Austin|Seattle|Boston|Chicago|Los Angeles)\b/i;
        const match = text.match(locationPattern);
        return match ? match[0] : null;
    }

    extractSalary(text) {
        const salaryPattern = /\$?\d{2,3},?\d{0,3}k?/i;
        const match = text.match(salaryPattern);
        return match ? match[0] : null;
    }

    getDaysAgo(postedString) {
        const num = parseInt(postedString.match(/\d+/)?.[0] || '0');
        if (postedString.includes('hour')) return 0;
        if (postedString.includes('day')) return num;
        if (postedString.includes('week')) return num * 7;
        if (postedString.includes('month')) return num * 30;
        return 30; // Default to old
    }

    parseRSSFeed(xml, query) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const items = doc.querySelectorAll('item');
        const jobs = [];
        
        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            if (title.toLowerCase().includes(query.toLowerCase()) ||
                description.toLowerCase().includes(query.toLowerCase())) {
                
                jobs.push({
                    id: `rss-${Date.now()}-${Math.random()}`,
                    title: title,
                    company: this.extractCompany(title, description),
                    location: this.extractLocation(description) || 'Remote',
                    type: 'Full-time',
                    salary: this.extractSalary(description) || 'Competitive',
                    posted: this.timeAgo(new Date(pubDate)),
                    url: link,
                    description: this.stripHTML(description),
                    requirements: this.extractSkills(description),
                    source: 'rss'
                });
            }
        });
        
        return jobs;
    }

    extractCompany(title, description) {
        // Try to extract company from title (usually "Position at Company")
        const atMatch = title.match(/at\s+(.+?)$/i);
        if (atMatch) return atMatch[1];
        
        // Try to extract from description
        const companyMatch = description.match(/(?:company|employer):\s*(.+?)(?:\.|,|\s{2})/i);
        if (companyMatch) return companyMatch[1];
        
        return 'Company';
    }
}

// Export singleton instance
export const jobBoardService = new JobBoardService();