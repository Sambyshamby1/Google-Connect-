// Service Worker for Refugee Connect
const CACHE_NAME = 'refugee-connect-v1';
const STATIC_CACHE_NAME = 'refugee-connect-static-v1';
const DYNAMIC_CACHE_NAME = 'refugee-connect-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/app.js',
  '/pi-client-multimodal.js',
  '/virtual-keyboard.js',
  '/emergency-phrases.js',
  '/document-vault.js',
  '/medical-guide.js',
  '/legal-rights.js',
  '/emergency-contacts.js',
  '/capabilities.js',
  '/gemmorandum-multimodal.js',
  '/gempath.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Failed to cache static files:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('refugee-connect-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests to AI station differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('[SW] Serving API response from cache:', url.pathname);
                return cachedResponse;
              }
              
              // Return offline fallback for API requests
              return new Response(JSON.stringify({
                error: 'offline',
                message: 'AI station not available. Please try again when connected.'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other resources, return a generic offline response
            return new Response('Offline - resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_DOCUMENTS') {
    // Cache important documents for offline access
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then(cache => {
          return cache.addAll(event.data.documents);
        })
    );
  }
});

// Background sync for when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-family-profiles') {
    event.waitUntil(syncFamilyProfiles());
  }
  
  if (event.tag === 'sync-translations') {
    event.waitUntil(syncTranslations());
  }
});

// Helper function to sync family profiles
async function syncFamilyProfiles() {
  try {
    // Get pending profiles from IndexedDB
    const profiles = await getPendingProfiles();
    
    // Send to AI station
    for (const profile of profiles) {
      await fetch('/api/family/sync', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[SW] Family profiles synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync family profiles:', error);
  }
}

// Helper function to sync translations
async function syncTranslations() {
  try {
    // Get pending translation requests from IndexedDB
    const requests = await getPendingTranslations();
    
    // Send to AI station
    for (const request of requests) {
      await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[SW] Translations synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync translations:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingProfiles() {
  // Implementation would retrieve from IndexedDB
  return [];
}

async function getPendingTranslations() {
  // Implementation would retrieve from IndexedDB
  return [];
}