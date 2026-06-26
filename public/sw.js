const CACHE_NAME = 'carebridge-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/sw.js',
  'https://www.gstatic.com/meet/sounds/ringout_7a03.mp3',
  'https://www.gstatic.com/meet/sounds/join_call_6a9b.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Ignore firestore, googleapis, and other external APIs to avoid intercepting/blocking Firebase
  if (
    url.hostname.includes('firestore.googleapis.com') || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // For sounds and static assets, use cache-first
  if (ASSETS_TO_CACHE.includes(url.pathname) || url.hostname === 'www.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  } else {
    // For local assets/pages, try network first, then cache fallback
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        if (action) {
          client.postMessage({ type: 'ALARM_ACTION', action, tag: event.notification.tag });
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Listen to Push Notifications (Firebase Cloud Messaging background integration)
self.addEventListener('push', (event) => {
  let data = { title: 'CareBridge Medicine Alarm', body: 'Time to take your scheduled dosage.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'CareBridge Medicine Alarm', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'medicine-reminder',
    requireInteraction: true, // Persists on Lock Screen until explicit client interaction
    actions: [
      { action: 'take', title: 'Take Medicine' },
      { action: 'snooze', title: 'Snooze 5 min' }
    ],
    vibrate: [500, 110, 500, 110, 450]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
