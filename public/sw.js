// Dee-Maker Studio Service Worker for Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push event listener: displays Chrome / browser push notification
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Dee-Maker Notification',
        body: event.data.text()
      };
    }
  }

  const title = data.title || 'Dee-Maker Studio';
  const options = {
    body: data.body || 'New alert from Dee-Maker Studio',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: data.url || '/?openProducer=true&tab=requests'
    },
    tag: 'dee-maker-alert',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click listener: closes notification and opens / focuses tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/?openProducer=true&tab=requests';

  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open with the same origin, navigate and focus
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});
