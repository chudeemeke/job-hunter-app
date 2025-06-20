// Service Worker for Job Hunter PWA with Auto-Update
const CACHE_VERSION = 'v3';
const CACHE_NAME = `job-hunter-${CACHE_VERSION}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[SW] Installing new version:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting(); // Force immediate activation
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating new version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith('job-hunter-') && cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Claiming clients');
            return self.clients.claim(); // Take control of all clients immediately
        })
    );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Network-first strategy for HTML to ensure updates
    if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Update cache with new version
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache when offline
                    return caches.match(request) || caches.match('/index.html');
                })
        );
        return;
    }
    
    // Cache-first strategy for other assets
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback
                return caches.match('/index.html');
            })
    );
});

// Background sync for job updates
self.addEventListener('sync', event => {
    if (event.tag === 'sync-jobs') {
        event.waitUntil(syncJobs());
    }
});

async function syncJobs() {
    try {
        // In a real app, this would fetch from job APIs
        console.log('Syncing job data...');
        
        // Example: fetch from multiple job boards
        const sources = [
            'https://api.linkedin.com/jobs',
            'https://api.indeed.com/jobs',
            'https://api.angellist.com/jobs'
        ];
        
        // For demo purposes, we're not making actual API calls
        // In production, you would fetch and aggregate job data here
        
        console.log('Job sync complete');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Push notifications for job alerts
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New job matches found!',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View Jobs'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Job Hunter Alert', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for client communication
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting on message');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// Check for updates by comparing version
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // In production, this would check against a server endpoint
        // For now, version is hardcoded in CACHE_VERSION
        event.ports[0].postMessage({ 
            hasUpdate: false,
            currentVersion: CACHE_VERSION 
        });
    }
});