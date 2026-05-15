importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCm9OOTiXrxNqi-Zs8Dirg79QlwopdPrwI",
  authDomain: "azorventure.firebaseapp.com",
  projectId: "azorventure",
  storageBucket: "azorventure.firebasestorage.app",
  messagingSenderId: "611493726599",
  appId: "1:611493726599:web:d3826e8c82cfd62482ab22"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Nova notificação';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: '/splash-logo.png',
    badge: '/splash-logo.png',
  });
});
