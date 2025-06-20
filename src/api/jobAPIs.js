// Job Board API Integration Module
import { config, getApiEndpoint } from '../config/config.js';
import { getDatabase } from '../utils/database.js';
import { RateLimiter } from './rateLimiter.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Rate limiters for each API
const rateLimiters = {
  linkedin: new RateLimiter(config.rateLimits.linkedin),
  indeed: new RateLimiter(config.rateLimits.indeed),
  adzuna: new RateLimiter(config.rateLimits.adzuna),
  reed: new RateLimiter(config.rateLimits.reed),
  remoteok: new RateLimiter({ requests: 60, window: 60000 }) // 60 per minute
};

// Job API Base Class
class JobAPI {
  constructor(apiName) {
    this.apiName = apiName;
    this.config = config.apis[apiName];
    this.rateLimiter = rateLimiters[apiName];
    this.db = null;
  }

  async init() {
    this.db = await getDatabase();
  }

  // Check rate limit before making request
  async checkRateLimit() {
    const canProceed = await this.rateLimiter.checkLimit();
    if (!canProceed) {
      throw new Error(`Rate limit exceeded for ${this.apiName}`);
    }
  }

  // Cache wrapper
  async cachedRequest(cacheKey, requestFn, ttl = config.cache.maxAge) {
    const cached = await this.db.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await requestFn();
    await this.db.setCached(cacheKey, data, ttl);
    return data;
  }

  // Generic error handler
  handleError(error) {
    console.error(`${this.apiName} API Error:`, error);
    return {
      error: true,
      message: error.message,
      api: this.apiName,
      timestamp: new Date().toISOString()
    };
  }

  // Normalize job data to common format
  normalizeJob(rawJob) {
    // To be implemented by each API
    throw new Error('normalizeJob must be implemented by subclass');
  }
}

// LinkedIn Jobs API
class LinkedInAPI extends JobAPI {
  constructor() {
    super('linkedin');
    this.accessToken = null;
  }

  // OAuth 2.0 flow
  async authenticate() {
    // In production, implement full OAuth flow
    // For now, assume token is stored
    const tokenData = await this.db.get('settings', 'linkedin_token');
    if (tokenData && tokenData.value && tokenData.expiry > Date.now()) {
      this.accessToken = decrypt(tokenData.value);
      return true;
    }
    
    // Redirect to LinkedIn OAuth
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${this.config.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.config.redirectUri)}&` +
      `scope=${this.config.scope.join('%20')}`;
    
    window.location.href = authUrl;
    return false;
  }

  async searchJobs(query, location, options = {}) {
    try {
      await this.checkRateLimit();
      
      if (!this.accessToken) {
        await this.authenticate();
      }

      const params = new URLSearchParams({
        keywords: query,
        location: location,
        start: options.offset || 0,
        count: options.limit || 25,
        ...options
      });

      const response = await fetch(
        `${this.config.baseUrl}/v2/jobSearch?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const data = await response.json();
      return data.elements.map(job => this.normalizeJob(job));
    } catch (error) {
      return this.handleError(error);
    }
  }

  normalizeJob(rawJob) {
    return {
      id: `linkedin_${rawJob.id}`,
      source: 'linkedin',
      title: rawJob.title,
      company: rawJob.companyName,
      location: rawJob.location,
      description: rawJob.description,
      requirements: this.extractRequirements(rawJob.description),
      type: rawJob.employmentType,
      experienceLevel: rawJob.experienceLevel,
      salary: rawJob.salary || 'Not specified',
      datePosted: new Date(rawJob.listedAt).toISOString(),
      url: `https://www.linkedin.com/jobs/view/${rawJob.id}`,
      applyUrl: rawJob.applyUrl,
      benefits: rawJob.benefits || [],
      skills: rawJob.skills || [],
      rawData: rawJob
    };
  }

  extractRequirements(description) {
    // Extract requirements using NLP patterns
    const requirementsPattern = /requirements:|qualifications:|must have:|required skills:/gi;
    const sections = description.split(requirementsPattern);
    
    if (sections.length > 1) {
      const requirementsText = sections[1].split(/\n\n/)[0];
      return requirementsText
        .split(/[•\-\n]/)
        .map(req => req.trim())
        .filter(req => req.length > 0);
    }
    
    return [];
  }
}

// Indeed API
class IndeedAPI extends JobAPI {
  constructor() {
    super('indeed');
  }

  async searchJobs(query, location, options = {}) {
    try {
      await this.checkRateLimit();

      const params = new URLSearchParams({
        publisher: this.config.publisherId,
        v: this.config.version,
        format: this.config.format,
        q: query,
        l: location,
        radius: options.radius || 25,
        sort: options.sort || 'date',
        start: options.offset || 0,
        limit: options.limit || 25,
        fromage: options.daysAgo || 30,
        ...options
      });

      const cacheKey = `indeed_${query}_${location}_${JSON.stringify(options)}`;
      
      return await this.cachedRequest(cacheKey, async () => {
        const response = await fetch(`${this.config.baseUrl}?${params}`);
        
        if (!response.ok) {
          throw new Error(`Indeed API error: ${response.status}`);
        }

        const data = await response.json();
        return data.results.map(job => this.normalizeJob(job));
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  normalizeJob(rawJob) {
    return {
      id: `indeed_${rawJob.jobkey}`,
      source: 'indeed',
      title: rawJob.jobtitle,
      company: rawJob.company,
      location: `${rawJob.city}, ${rawJob.state}`,
      description: rawJob.snippet,
      fullDescription: null, // Requires separate API call
      type: rawJob.fullTime ? 'Full-time' : 'Part-time',
      salary: rawJob.salary || 'Not specified',
      datePosted: new Date(rawJob.date).toISOString(),
      url: rawJob.url,
      sponsored: rawJob.sponsored,
      requirements: [],
      rawData: rawJob
    };
  }

  // Fetch full job details
  async getJobDetails(jobKey) {
    try {
      await this.checkRateLimit();

      const response = await fetch(
        `${this.config.baseUrl}/viewjob?jk=${jobKey}&publisher=${this.config.publisherId}`
      );

      if (!response.ok) {
        throw new Error(`Indeed API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Adzuna API
class AdzunaAPI extends JobAPI {
  constructor() {
    super('adzuna');
  }

  async searchJobs(query, location, options = {}) {
    try {
      await this.checkRateLimit();

      const country = options.country || 'us';
      const page = options.page || 1;
      const resultsPerPage = options.limit || 20;

      const params = new URLSearchParams({
        app_id: this.config.appId,
        app_key: this.config.appKey,
        results_per_page: resultsPerPage,
        what: query,
        where: location,
        sort_by: options.sortBy || 'date',
        ...options
      });

      const url = `${this.config.baseUrl}/${country}/search/${page}?${params}`;
      const cacheKey = `adzuna_${country}_${query}_${location}_${page}`;

      return await this.cachedRequest(cacheKey, async () => {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Adzuna API error: ${response.status}`);
        }

        const data = await response.json();
        return data.results.map(job => this.normalizeJob(job));
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  normalizeJob(rawJob) {
    return {
      id: `adzuna_${rawJob.id}`,
      source: 'adzuna',
      title: rawJob.title,
      company: rawJob.company.display_name,
      location: rawJob.location.display_name,
      description: rawJob.description,
      type: rawJob.contract_type || 'Not specified',
      salary: this.formatSalary(rawJob.salary_min, rawJob.salary_max),
      datePosted: new Date(rawJob.created).toISOString(),
      url: rawJob.redirect_url,
      category: rawJob.category.label,
      requirements: this.extractRequirements(rawJob.description),
      rawData: rawJob
    };
  }

  formatSalary(min, max) {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max.toLocaleString()}`;
  }

  extractRequirements(description) {
    // Simple extraction - can be enhanced with NLP
    const lines = description.split('\n');
    const requirements = [];
    let inRequirements = false;

    for (const line of lines) {
      if (line.match(/requirements|qualifications|skills/i)) {
        inRequirements = true;
        continue;
      }
      
      if (inRequirements && line.trim()) {
        if (line.match(/responsibilities|duties|benefits/i)) {
          break;
        }
        requirements.push(line.trim().replace(/^[•\-\*]\s*/, ''));
      }
    }

    return requirements;
  }
}

// Reed API
class ReedAPI extends JobAPI {
  constructor() {
    super('reed');
  }

  async searchJobs(query, location, options = {}) {
    try {
      await this.checkRateLimit();

      const params = new URLSearchParams({
        keywords: query,
        location: location,
        distancefromlocation: options.radius || 10,
        permanent: options.permanent || true,
        contract: options.contract || false,
        temp: options.temp || false,
        parttime: options.partTime || false,
        fulltime: options.fullTime || true,
        minimumSalary: options.minSalary || 0,
        maximumSalary: options.maxSalary || 0,
        posted: options.postedWithin || 30,
        graduatejobs: options.graduate || false,
        ...options
      });

      const auth = btoa(this.config.apiKey + ':');
      const cacheKey = `reed_${query}_${location}_${JSON.stringify(options)}`;

      return await this.cachedRequest(cacheKey, async () => {
        const response = await fetch(
          `${this.config.baseUrl}/search?${params}`,
          {
            headers: {
              'Authorization': `Basic ${auth}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Reed API error: ${response.status}`);
        }

        const data = await response.json();
        return data.results.map(job => this.normalizeJob(job));
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  normalizeJob(rawJob) {
    return {
      id: `reed_${rawJob.jobId}`,
      source: 'reed',
      title: rawJob.jobTitle,
      company: rawJob.employerName,
      location: rawJob.locationName,
      description: rawJob.jobDescription,
      type: this.getJobType(rawJob),
      salary: `${rawJob.minimumSalary} - ${rawJob.maximumSalary} ${rawJob.currency}`,
      datePosted: new Date(rawJob.datePosted).toISOString(),
      url: rawJob.jobUrl,
      expirationDate: rawJob.expirationDate,
      applications: rawJob.applications,
      requirements: [],
      rawData: rawJob
    };
  }

  getJobType(job) {
    if (job.fullTime) return 'Full-time';
    if (job.partTime) return 'Part-time';
    if (job.contract) return 'Contract';
    if (job.temp) return 'Temporary';
    return 'Not specified';
  }

  // Get full job details
  async getJobDetails(jobId) {
    try {
      await this.checkRateLimit();

      const auth = btoa(this.config.apiKey + ':');
      const response = await fetch(
        `${this.config.baseUrl}/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Reed API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// RemoteOK API
class RemoteOKAPI extends JobAPI {
  constructor() {
    super('remoteok');
  }

  async searchJobs(query, location = 'remote', options = {}) {
    try {
      await this.checkRateLimit();

      const cacheKey = `remoteok_${query}_${JSON.stringify(options)}`;

      return await this.cachedRequest(cacheKey, async () => {
        const response = await fetch(
          this.config.baseUrl,
          {
            headers: {
              'User-Agent': this.config.userAgent
            }
          }
        );

        if (!response.ok) {
          throw new Error(`RemoteOK API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter by query
        const filtered = data
          .slice(1) // First element is metadata
          .filter(job => {
            const searchText = `${job.position} ${job.company} ${job.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
          })
          .slice(0, options.limit || 50);

        return filtered.map(job => this.normalizeJob(job));
      }, 3600000); // Cache for 1 hour
    } catch (error) {
      return this.handleError(error);
    }
  }

  normalizeJob(rawJob) {
    return {
      id: `remoteok_${rawJob.id}`,
      source: 'remoteok',
      title: rawJob.position,
      company: rawJob.company,
      location: 'Remote',
      description: rawJob.description,
      type: 'Full-time',
      salary: this.extractSalary(rawJob),
      datePosted: new Date(rawJob.date).toISOString(),
      url: rawJob.url,
      applyUrl: rawJob.apply_url,
      tags: rawJob.tags,
      logo: rawJob.company_logo,
      requirements: this.extractRequirements(rawJob.description),
      rawData: rawJob
    };
  }

  extractSalary(job) {
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    }
    
    // Try to extract from description
    const salaryMatch = job.description.match(/\$[\d,]+/);
    return salaryMatch ? salaryMatch[0] : 'Not specified';
  }

  extractRequirements(description) {
    const sections = description.split(/requirements|qualifications|we're looking for/i);
    if (sections.length > 1) {
      return sections[1]
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 10)
        .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
    }
    return [];
  }
}

// Job Search Aggregator
class JobSearchAggregator {
  constructor() {
    this.apis = {
      linkedin: new LinkedInAPI(),
      indeed: new IndeedAPI(),
      adzuna: new AdzunaAPI(),
      reed: new ReedAPI(),
      remoteok: new RemoteOKAPI()
    };
    this.db = null;
  }

  async init() {
    this.db = await getDatabase();
    
    // Initialize all APIs
    await Promise.all(
      Object.values(this.apis).map(api => api.init())
    );
  }

  // Search across multiple job boards
  async searchJobs(query, location, options = {}) {
    const enabledAPIs = options.sources || config.jobSources.priority;
    const concurrent = options.concurrent || config.jobSources.concurrent;
    
    // Create batches for concurrent execution
    const batches = [];
    for (let i = 0; i < enabledAPIs.length; i += concurrent) {
      batches.push(enabledAPIs.slice(i, i + concurrent));
    }

    const allResults = [];
    const errors = [];

    // Execute batches sequentially
    for (const batch of batches) {
      const batchPromises = batch.map(apiName => {
        if (!this.apis[apiName]) {
          console.warn(`Unknown API: ${apiName}`);
          return Promise.resolve([]);
        }

        return this.apis[apiName]
          .searchJobs(query, location, options)
          .catch(error => {
            errors.push({ api: apiName, error: error.message });
            return [];
          });
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults.flat());
    }

    // Deduplicate results
    const uniqueJobs = this.deduplicateJobs(allResults);
    
    // Save to database
    await this.saveJobs(uniqueJobs);

    return {
      jobs: uniqueJobs,
      total: uniqueJobs.length,
      sources: enabledAPIs,
      errors: errors,
      timestamp: new Date().toISOString()
    };
  }

  // Deduplicate jobs based on title, company, and location
  deduplicateJobs(jobs) {
    const seen = new Map();
    
    return jobs.filter(job => {
      const key = `${job.title}_${job.company}_${job.location}`.toLowerCase();
      
      if (seen.has(key)) {
        // Merge data from duplicate
        const existing = seen.get(key);
        if (job.salary && job.salary !== 'Not specified' && existing.salary === 'Not specified') {
          existing.salary = job.salary;
        }
        if (job.requirements.length > existing.requirements.length) {
          existing.requirements = job.requirements;
        }
        return false;
      }
      
      seen.set(key, job);
      return true;
    });
  }

  // Save jobs to database
  async saveJobs(jobs) {
    const results = await this.db.bulkAdd('jobs', jobs);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Saved ${successful} jobs to database`);
    return successful;
  }

  // Get job details from specific API
  async getJobDetails(jobId) {
    const [source, id] = jobId.split('_', 2);
    
    if (!this.apis[source]) {
      throw new Error(`Unknown job source: ${source}`);
    }

    if (typeof this.apis[source].getJobDetails === 'function') {
      return await this.apis[source].getJobDetails(id);
    }

    // Fallback to cached data
    return await this.db.get('jobs', jobId);
  }

  // Search with intelligent filtering
  async smartSearch(query, preferences = {}) {
    const {
      location = 'remote',
      experienceLevel = 'all',
      salary = { min: 0, max: 999999 },
      jobType = 'all',
      datePosted = 30,
      skills = [],
      excludeCompanies = [],
      preferredCompanies = []
    } = preferences;

    // Build search options
    const searchOptions = {
      experienceLevel,
      jobType,
      daysAgo: datePosted,
      minSalary: salary.min,
      maxSalary: salary.max
    };

    // Search all sources
    const results = await this.searchJobs(query, location, searchOptions);

    // Apply smart filtering
    let filteredJobs = results.jobs;

    // Filter by skills
    if (skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => {
        const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
        return skills.some(skill => jobText.includes(skill.toLowerCase()));
      });
    }

    // Exclude companies
    if (excludeCompanies.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        !excludeCompanies.some(company => 
          job.company.toLowerCase().includes(company.toLowerCase())
        )
      );
    }

    // Score and sort jobs
    const scoredJobs = filteredJobs.map(job => ({
      ...job,
      score: this.calculateJobScore(job, { skills, preferredCompanies, query })
    }));

    scoredJobs.sort((a, b) => b.score - a.score);

    return {
      ...results,
      jobs: scoredJobs,
      filtered: results.total - scoredJobs.length
    };
  }

  // Calculate job relevance score
  calculateJobScore(job, preferences) {
    let score = 0;
    
    // Preferred companies get bonus
    if (preferences.preferredCompanies.some(company => 
      job.company.toLowerCase().includes(company.toLowerCase())
    )) {
      score += 50;
    }

    // Skills match
    const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
    preferences.skills.forEach(skill => {
      if (jobText.includes(skill.toLowerCase())) {
        score += 10;
      }
    });

    // Query relevance
    const queryWords = preferences.query.toLowerCase().split(' ');
    queryWords.forEach(word => {
      if (jobText.includes(word)) {
        score += 5;
      }
    });

    // Recent posts get slight bonus
    const daysAgo = (Date.now() - new Date(job.datePosted)) / (1000 * 60 * 60 * 24);
    if (daysAgo < 7) score += 10;
    else if (daysAgo < 14) score += 5;

    // Salary transparency bonus
    if (job.salary && job.salary !== 'Not specified') {
      score += 5;
    }

    return score;
  }
}

// Export singleton instance
let aggregatorInstance = null;

export const getJobAggregator = async () => {
  if (!aggregatorInstance) {
    aggregatorInstance = new JobSearchAggregator();
    await aggregatorInstance.init();
  }
  return aggregatorInstance;
};

export {
  LinkedInAPI,
  IndeedAPI,
  AdzunaAPI,
  ReedAPI,
  RemoteOKAPI,
  JobSearchAggregator
};