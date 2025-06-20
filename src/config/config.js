// Configuration for Job Hunter PWA
// Store API keys and sensitive data in environment variables in production

export const config = {
  // API Configuration
  apis: {
    // LinkedIn Jobs API (requires OAuth 2.0)
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || window.location.origin + '/auth/linkedin',
      scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
      apiVersion: 'v2',
      baseUrl: 'https://api.linkedin.com'
    },
    
    // Indeed Publisher API
    indeed: {
      publisherId: process.env.INDEED_PUBLISHER_ID || '',
      apiKey: process.env.INDEED_API_KEY || '',
      baseUrl: 'https://api.indeed.com/ads/apisearch',
      version: 2,
      format: 'json'
    },
    
    // Adzuna API (Free tier available)
    adzuna: {
      appId: process.env.ADZUNA_APP_ID || '',
      appKey: process.env.ADZUNA_APP_KEY || '',
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
      countries: ['us', 'gb', 'au', 'ca', 'de', 'fr', 'in']
    },
    
    // Reed API
    reed: {
      apiKey: process.env.REED_API_KEY || '',
      baseUrl: 'https://www.reed.co.uk/api/1.0',
      auth: 'Basic' // Base64 encoded apiKey
    },
    
    // RemoteOK API (No key required)
    remoteok: {
      baseUrl: 'https://remoteok.io/api',
      userAgent: 'JobHunterPWA/1.0'
    },
    
    // OpenAI API for AI features
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4-turbo-preview',
      maxTokens: 2000,
      temperature: 0.7
    }
  },
  
  // Database Configuration (IndexedDB)
  database: {
    name: 'JobHunterDB',
    version: 1,
    stores: {
      jobs: 'id, title, company, location, datePosted, source',
      applications: 'id, jobId, status, dateApplied',
      resumes: 'id, name, content, dateModified',
      coverLetters: 'id, jobId, content, dateCreated',
      settings: 'key, value'
    }
  },
  
  // Cache Configuration
  cache: {
    version: 'v1.0.0',
    maxAge: 3600000, // 1 hour
    strategies: {
      jobs: 'network-first',
      static: 'cache-first',
      api: 'stale-while-revalidate'
    }
  },
  
  // Security Configuration
  security: {
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://api.linkedin.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': ["'self'", 'https://api.linkedin.com', 'https://api.indeed.com', 'https://api.adzuna.com', 'https://www.reed.co.uk', 'https://remoteok.io', 'https://api.openai.com'],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    },
    encryption: {
      algorithm: 'AES-GCM',
      keyLength: 256
    }
  },
  
  // Feature Flags
  features: {
    realTimeJobScraping: true,
    aiCoverLetters: true,
    resumeOptimization: true,
    batchApplications: true,
    advancedFiltering: true,
    salaryPrediction: true,
    interviewScheduling: false, // Coming soon
    referralNetwork: false // Coming soon
  },
  
  // Rate Limiting
  rateLimits: {
    linkedin: { requests: 100, window: 86400000 }, // 100 per day
    indeed: { requests: 1000, window: 86400000 }, // 1000 per day
    adzuna: { requests: 250, window: 3600000 }, // 250 per hour
    reed: { requests: 3000, window: 3600000 }, // 3000 per hour
    openai: { requests: 100, window: 60000 } // 100 per minute
  },
  
  // Job Sources Priority
  jobSources: {
    priority: ['linkedin', 'indeed', 'adzuna', 'reed', 'remoteok'],
    concurrent: 3, // Number of APIs to query simultaneously
    timeout: 10000, // 10 second timeout per API
    retries: 3
  },
  
  // UI Configuration
  ui: {
    itemsPerPage: 20,
    maxSelectedJobs: 50,
    debounceDelay: 300,
    animationDuration: 300,
    themes: ['light', 'dark', 'auto']
  }
};

// Environment detection
export const isProduction = () => window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.');
export const isDevelopment = () => !isProduction();

// API endpoint builder
export const getApiEndpoint = (api, endpoint) => {
  const baseUrl = config.apis[api]?.baseUrl;
  if (!baseUrl) throw new Error(`Unknown API: ${api}`);
  return `${baseUrl}${endpoint}`;
};

// Validate configuration on load
export const validateConfig = () => {
  const errors = [];
  
  // Check for required API keys in production
  if (isProduction()) {
    if (!config.apis.openai.apiKey) {
      errors.push('OpenAI API key is required for AI features');
    }
    
    // At least one job API should be configured
    const jobApis = ['linkedin', 'indeed', 'adzuna', 'reed'];
    const hasJobApi = jobApis.some(api => {
      const apiConfig = config.apis[api];
      return apiConfig && (apiConfig.apiKey || apiConfig.publisherId || apiConfig.clientId);
    });
    
    if (!hasJobApi) {
      errors.push('At least one job search API must be configured');
    }
  }
  
  return errors;
};

export default config;