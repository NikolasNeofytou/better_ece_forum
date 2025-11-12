// Service Worker for Better ECE Forum
const CACHE_NAME = 'better-ece-forum-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(err => console.error('Service Worker: Cache error', err))
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map(name => caches.delete(name))
        )
      })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API requests (handle them separately if needed)
  if (request.url.includes('/api/')) {
    return
  }

  // Network-first strategy for HTML pages
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response
          const responseClone = response.clone()
          
          // Cache the response
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone))
          
          return response
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request)
            .then(cachedResponse => {
              // If not in cache, show offline page
              return cachedResponse || caches.match('/offline')
            })
        })
    )
    return
  }

  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache if not a success response
            if (!response || response.status !== 200) {
              return response
            }

            // Clone the response
            const responseClone = response.clone()

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))

            return response
          })
      })
  )
})

// Background sync for offline actions (if needed in future)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Syncing...', event.tag)
  // Handle background sync events here
})

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from ECE Forum',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'forum-notification',
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification('ECE Forum', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  event.notification.close()

  event.waitUntil(
    clients.openWindow('/')
  )
})
