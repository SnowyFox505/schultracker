import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })
}

export const adminDb = getFirestore()
export const adminMessaging = getMessaging()
export const adminAuth = getAuth()

// Sends a data-only push to all of a user's devices and prunes tokens that are no longer valid.
export async function sendToUser(uid, { title, body, url = '/' }) {
  const devices = await adminDb.collection('users').doc(uid).collection('devices').get()
  const tokens = devices.docs.map((d) => d.data().token).filter(Boolean)
  if (!tokens.length) return 0
  const res = await adminMessaging.sendEachForMulticast({ tokens, data: { title, body, url } })
  await Promise.all(
    res.responses.map((r, i) => {
      const code = r.error?.code
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
        return devices.docs[i].ref.delete()
      }
      return null
    })
  )
  return res.successCount
}
