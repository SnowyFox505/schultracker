import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Persistent (IndexedDB) local cache: without this, every cold start of the installed PWA has to
// wait for a fresh network round-trip before any onSnapshot listener fires its first result — on
// iOS, reopening after the OS suspended the background tab's connection for a while (overnight,
// a network change) could leave that initial round-trip hanging long enough for the "Lädt..."
// placeholders (useSchedule() etc.) to sit there seemingly forever. With a local cache, the first
// snapshot resolves instantly from disk while the live connection reconnects in the background.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
