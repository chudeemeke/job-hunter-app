// IndexedDB Database Manager for Job Hunter PWA
import { config } from '../config/config.js';

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbName = config.database.name;
    this.version = config.database.version;
    this.stores = config.database.stores;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('jobs')) {
          const jobStore = db.createObjectStore('jobs', { keyPath: 'id' });
          jobStore.createIndex('title', 'title', { unique: false });
          jobStore.createIndex('company', 'company', { unique: false });
          jobStore.createIndex('location', 'location', { unique: false });
          jobStore.createIndex('datePosted', 'datePosted', { unique: false });
          jobStore.createIndex('source', 'source', { unique: false });
          jobStore.createIndex('salary', 'salary', { unique: false });
          jobStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('applications')) {
          const appStore = db.createObjectStore('applications', { keyPath: 'id' });
          appStore.createIndex('jobId', 'jobId', { unique: false });
          appStore.createIndex('status', 'status', { unique: false });
          appStore.createIndex('dateApplied', 'dateApplied', { unique: false });
        }

        if (!db.objectStoreNames.contains('resumes')) {
          const resumeStore = db.createObjectStore('resumes', { keyPath: 'id' });
          resumeStore.createIndex('name', 'name', { unique: false });
          resumeStore.createIndex('dateModified', 'dateModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('coverLetters')) {
          const coverStore = db.createObjectStore('coverLetters', { keyPath: 'id' });
          coverStore.createIndex('jobId', 'jobId', { unique: false });
          coverStore.createIndex('dateCreated', 'dateCreated', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('apiCache')) {
          const cacheStore = db.createObjectStore('apiCache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  async add(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName, query = null) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = query ? store.getAll(query) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Index-based queries
  async getByIndex(storeName, indexName, value) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Advanced queries
  async query(storeName, filters = {}) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      const results = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          let match = true;
          
          // Apply filters
          for (const [key, value] of Object.entries(filters)) {
            if (cursor.value[key] !== value) {
              match = false;
              break;
            }
          }
          
          if (match) {
            results.push(cursor.value);
          }
          
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Bulk operations
  async bulkAdd(storeName, items) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const promises = items.map(item => {
      return new Promise((resolve, reject) => {
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.allSettled(promises);
  }

  // Cache management
  async getCached(key) {
    try {
      const cached = await this.get('apiCache', key);
      
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      
      // Clean up expired cache
      if (cached) {
        await this.delete('apiCache', key);
      }
      
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  async setCached(key, data, ttl = config.cache.maxAge) {
    try {
      await this.update('apiCache', {
        key,
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  // Clean expired cache entries
  async cleanCache() {
    const transaction = this.db.transaction(['apiCache'], 'readwrite');
    const store = transaction.objectStore(apiCache);
    const index = store.index('expiry');
    
    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          store.delete(cursor.primaryKey);
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleaned ${deletedCount} expired cache entries`);
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Export data
  async exportData() {
    const data = {
      jobs: await this.getAll('jobs'),
      applications: await this.getAll('applications'),
      resumes: await this.getAll('resumes'),
      coverLetters: await this.getAll('coverLetters'),
      settings: await this.getAll('settings'),
      exportDate: new Date().toISOString()
    };
    
    return data;
  }

  // Import data
  async importData(data) {
    const results = {
      jobs: 0,
      applications: 0,
      resumes: 0,
      coverLetters: 0,
      settings: 0,
      errors: []
    };
    
    try {
      // Clear existing data
      const stores = ['jobs', 'applications', 'resumes', 'coverLetters', 'settings'];
      for (const store of stores) {
        const transaction = this.db.transaction([store], 'readwrite');
        await new Promise((resolve, reject) => {
          const request = transaction.objectStore(store).clear();
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      }
      
      // Import new data
      if (data.jobs) {
        const jobResults = await this.bulkAdd('jobs', data.jobs);
        results.jobs = jobResults.filter(r => r.status === 'fulfilled').length;
      }
      
      if (data.applications) {
        const appResults = await this.bulkAdd('applications', data.applications);
        results.applications = appResults.filter(r => r.status === 'fulfilled').length;
      }
      
      if (data.resumes) {
        const resumeResults = await this.bulkAdd('resumes', data.resumes);
        results.resumes = resumeResults.filter(r => r.status === 'fulfilled').length;
      }
      
      if (data.coverLetters) {
        const coverResults = await this.bulkAdd('coverLetters', data.coverLetters);
        results.coverLetters = coverResults.filter(r => r.status === 'fulfilled').length;
      }
      
      if (data.settings) {
        for (const setting of data.settings) {
          await this.update('settings', setting);
          results.settings++;
        }
      }
    } catch (error) {
      results.errors.push(error.message);
    }
    
    return results;
  }

  // Statistics
  async getStats() {
    const stats = {
      totalJobs: 0,
      totalApplications: 0,
      applicationsByStatus: {},
      jobsBySite: {},
      recentActivity: []
    };
    
    // Count jobs
    const jobs = await this.getAll('jobs');
    stats.totalJobs = jobs.length;
    
    // Count jobs by source
    jobs.forEach(job => {
      stats.jobsBySite[job.source] = (stats.jobsBySite[job.source] || 0) + 1;
    });
    
    // Count applications
    const applications = await this.getAll('applications');
    stats.totalApplications = applications.length;
    
    // Count by status
    applications.forEach(app => {
      stats.applicationsByStatus[app.status] = (stats.applicationsByStatus[app.status] || 0) + 1;
    });
    
    // Get recent activity
    const recentApps = applications
      .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
      .slice(0, 10);
    
    for (const app of recentApps) {
      const job = await this.get('jobs', app.jobId);
      if (job) {
        stats.recentActivity.push({
          ...app,
          jobTitle: job.title,
          company: job.company
        });
      }
    }
    
    return stats;
  }
}

// Singleton instance
let dbInstance = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
    await dbInstance.init();
  }
  return dbInstance;
};

export default DatabaseManager;