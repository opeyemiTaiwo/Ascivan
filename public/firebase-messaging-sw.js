/* public/firebase-messaging-sw.js
   Handles background push notifications for Ascivan.
   Uses the compat builds because service workers can't use ES modules everywhere. */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBx_q4j-3uQlOxLmRkg1hQ4ZQHUfDU8CfM',
  authDomain: 'ascivan-5b4f4.firebaseapp.com',
  projectId: 'ascivan-5b4f4',
  storageBucket: 'ascivan-5b4f4.firebasestorage.app',
  messagingSenderId: '237454613250',
  appId: '1:237454613250:web:4304adece445ed20f7c01b',
});

const messaging = firebase.messaging();

// Background messages (site closed or tab not focused).
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Ascivan';
  const options = {
    body: payload.notification?.body || '',
    icon: '/Images/512X512.png',
    badge: '/Images/512X512.png',
    data: { link: payload.data?.link || payload.fcmOptions?.link || '/' },
  };
  self.registration.showNotification(title, options);
});

// Click → focus or open the app at the link.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
