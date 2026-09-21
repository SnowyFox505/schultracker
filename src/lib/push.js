import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging'
import { collection, deleteDoc, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
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

// Short human label for a device, taken from the user agent ("iPhone · Safari").
export function deviceLabel(ua = navigator.userAgent) {
  const device = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows-PC' : /Macintosh/.test(ua) ? 'Mac' : 'Gerät'
  const browser = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome/.test(ua) ? 'Chrome' : /FxiOS|Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : ''
  return browser ? `${device} · ${browser}` : device
}

// Settings are per device: users/{uid}/devices/{id}.prefs overrides the account-level defaults
// (users/{uid}.push), which older devices still rely on.
export function effectivePrefs(accountPush = {}, devicePrefs = {}) {
  return {
    homework: { on: true, time: '18:00', ...accountPush.homework, ...devicePrefs.homework },
    tests: { on: true, time: '18:00', days: [5, 1], ...accountPush.tests, ...devicePrefs.tests },
    skipSchool: (devicePrefs.skipSchool ?? accountPush.skipSchool) !== false,
  }
}

export function useDevices(user) {
  const [devices, setDevices] = useState(null)
  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'devices'), (snap) =>
      setDevices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
  }, [user])
  return devices
}

// Id of this device's registration (null if notifications aren't granted here).
export async function currentDeviceId() {
  try {
    if (Notification.permission !== 'granted') return null
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    if (!registration) return null
    const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
    return token ? await deviceId(token) : null
  } catch {
    return null
  }
}

// Asks the browser for notification permission (must be called from a tap) and registers this device.
export async function enablePush(user) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('denied')
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  await navigator.serviceWorker.ready
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
  if (!token) throw new Error('no-token')
  const id = await deviceId(token)
  await setDoc(
    doc(db, 'users', user.uid, 'devices', id),
    { token, ua: navigator.userAgent.slice(0, 120), label: deviceLabel(), enabled: true, updatedAt: serverTimestamp() },
    { merge: true }
  )
  return id
}

export const setDevicePrefs = (user, id, prefs) => setDoc(doc(db, 'users', user.uid, 'devices', id), { prefs }, { merge: true })
export const setDeviceEnabled = (user, id, enabled) => setDoc(doc(db, 'users', user.uid, 'devices', id), { enabled }, { merge: true })

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

export async function sendTestPush(deviceId) {
  const idToken = await auth.currentUser.getIdToken()
  const res = await fetch(`/api/send-test${deviceId ? `?device=${deviceId}` : ''}`, { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
  if (!res.ok) throw new Error('failed')
  return (await res.json()).sent
}
