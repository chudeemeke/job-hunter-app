// Service Worker for Job Hunter PWA
const CACHE_NAME = 'job-hunter-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Offline fallback
                    return caches.match('/index.html');
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
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