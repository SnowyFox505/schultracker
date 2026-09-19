import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging'
import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { app, auth, db } from './firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function pushSupported() {
  return !!VAPID_KEY && 'Notification' in window && 'serviceWorker' in navigator && (await isSupported())
}

async function deviceId(token) {
  const bytes = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash).slice(0, 10), (b) => b.toString(16).padStart(2, '0')).join('')
}

// Asks the browser for notification permission (must be called from a tap) and registers this device.
export async function enablePush(user) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('denied')
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  await navigator.serviceWorker.ready
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
  if (!token) throw new Error('no-token')
  await setDoc(doc(db, 'users', user.uid, 'devices', await deviceId(token)), {
    token,
    ua: navigator.userAgent.slice(0, 120),
    updatedAt: serverTimestamp(),
  })
  return token
}

export async function disablePush(user) {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    const token = registration
      ? await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
      : null
    if (token) {
      await deleteDoc(doc(db, 'users', user.uid, 'devices', await deviceId(token)))
      await deleteToken(getMessaging(app))
    }
  } catch {
    // best effort — the flag in the profile is what stops the server from sending
  }
}

export async function sendTestPush() {
  const idToken = await auth.currentUser.getIdToken()
  const res = await fetch('/api/send-test', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
  if (!res.ok) throw new Error('failed')
  return (await res.json()).sent
}
