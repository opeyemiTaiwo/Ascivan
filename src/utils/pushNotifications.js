// src/utils/pushNotifications.js
// Client-side push: request permission, register the device's FCM token on the
// user's doc, and a helper to ask the server to send a push to other users.

import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth, messaging } from '../firebase/config';
import { toast } from 'react-toastify';

// Your Web Push certificate "Key pair" (VAPID public key) from Firebase Console →
// Project Settings → Cloud Messaging → Web Push certificates.
// Stored as an env var so it isn't hard-coded; falls back to empty (no push).
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

// Register the service worker (once).
async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  } catch (e) {
    console.warn('SW registration failed:', e?.message);
    return null;
  }
}

// Ask permission + get token + save it to the signed-in user's doc.
// Call this after login, or from a "Enable notifications" button.
export async function enablePushForCurrentUser({ interactive = false } = {}) {
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported || !messaging) {
      if (interactive) toast.info('Push notifications are not supported in this browser.');
      return false;
    }
    if (!VAPID_KEY) {
      if (interactive) toast.error('Push is not configured yet (missing VAPID key).');
      return false;
    }
    const user = auth.currentUser;
    if (!user) return false;

    // Permission
    if (Notification.permission === 'denied') {
      if (interactive) toast.info('Notifications are blocked. Enable them in your browser settings.');
      return false;
    }
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;
    }

    const registration = await registerSW();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration || undefined,
    });
    if (!token) return false;

    await updateDoc(doc(db, 'users', user.uid), {
      fcmTokens: arrayUnion(token),
    });
    if (interactive) toast.success('Notifications enabled on this device.');
    return true;
  } catch (e) {
    console.error('enablePush failed:', e);
    if (interactive) toast.error('Could not enable notifications.');
    return false;
  }
}

// Foreground messages (site open + focused) — show a toast since the OS
// notification is suppressed while the tab is focused.
export function listenForForegroundPush() {
  if (!messaging) return;
  try {
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Loomiqe';
      const body = payload.notification?.body || '';
      toast.info(`${title}${body ? ': ' + body : ''}`);
    });
  } catch (e) { /* ignore */ }
}

// Ask the server to push to one or more users. Uses the signed-in user's
// Firebase ID token to authorize the call.
export async function sendPush({ recipientUid, recipientUids, title, body, link }) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ recipientUid, recipientUids, title, body, link }),
    });
  } catch (e) {
    // Non-blocking: push failures should never break the core action.
    console.warn('sendPush failed:', e?.message);
  }
}
