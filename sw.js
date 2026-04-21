// PETVERSE Service Worker
const CACHE_NAME = 'petverse-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/utils.js',
  '/js/storage.js',
  '/js/pet.js',
  '/js/shop.js',
  '/js/bounties.js',
  '/js/social.js',
  '/js/world.js',
  '/js/chat.js',
  '/js/achievements.js',
  '/js/notifications.js',
  '/manifest.json'
];

// Installera service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Aktivera service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Hantera fetch-förfrågningar
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Hantera push-notiser
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/icon.png',
    badge: '/assets/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Hantera klick på notiser
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});