// KARMA Service Worker v2
const CACHE_NAME = ‘karma-v2’;
const STATIC = [
‘/’,
‘/index.html’,
‘/styles/main.css’,
‘/manifest.json’
];

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE_NAME).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
);
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

self.addEventListener(‘fetch’, e => {
e.respondWith(
caches.match(e.request).then(cached => {
const fresh = fetch(e.request).then(res => {
if (res && res.status === 200 && res.type === ‘basic’) {
const clone = res.clone();
caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
}
return res;
});
return cached || fresh;
})
);
});

self.addEventListener(‘push’, e => {
const d = e.data?.json() || {};
e.waitUntil(self.registration.showNotification(d.title || ‘KARMA’, {
body: d.body || ‘’,
icon: ‘/assets/icon.png’,
badge: ‘/assets/badge.png’,
vibrate: [200, 100, 200],
data: { url: d.url || ‘/’ }
}));
});

self.addEventListener(‘notificationclick’, e => {
e.notification.close();
e.waitUntil(clients.openWindow(e.notification.data?.url || ‘/’));
});