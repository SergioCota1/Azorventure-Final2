import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { guardarPushToken } from './userService';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let initialized = false;

export const resetPushNotifications = () => {
  initialized = false;
};

export const initPushNotifications = async (): Promise<void> => {
  if (initialized) return;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !VAPID_KEY) {
    console.warn('Push notifications: Firebase config or VAPID key not set in .env');
    return;
  }

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('Push notifications not supported in this browser.');
    return;
  }

  initialized = true;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied by user.');
      return;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);

    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    // Wait for the service worker to be fully active
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await guardarPushToken(token);
    }

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Nova notificação';
      const body = payload.notification?.body || '';
      // Use service worker to show notification (works in foreground too)
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, { body, icon: '/splash-logo.png', badge: '/splash-logo.png' });
      });
    });

  } catch (error) {
    console.error('Falha ao inicializar push notifications:', error);
  }
};
