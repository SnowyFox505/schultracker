import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Only this account can announce a release (see firestore.rules match /meta/{docId}).
export const ADMIN_EMAIL = 'zockermango@ik.me'

// The version Leopold has actually announced to users — separate from __APP_VERSION__, which is
// whatever build happens to be running right now (the service worker auto-updates in the
// background regardless, so some open sessions may already silently be ahead of this).
export function useRollout() {
  const [rollout, setRollout] = useState(undefined) // undefined = loading, null = no doc yet
  useEffect(() => onSnapshot(doc(db, 'meta', 'rollout'), (snap) => setRollout(snap.exists() ? snap.data() : null)), [])
  return rollout
}

export function announceRelease() {
  return setDoc(doc(db, 'meta', 'rollout'), { version: __APP_VERSION__, releasedAt: serverTimestamp() })
}
