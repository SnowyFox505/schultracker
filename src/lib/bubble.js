import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const MAX_MEMBERS = 3

function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('')
}

export function normalizeCode(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function createBubble(user, name) {
  for (let i = 0; i < 5; i++) {
    const code = generateCode()
    const ref = doc(db, 'bubbles', code)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, {
      code,
      members: [user.uid],
      memberNames: { [user.uid]: name },
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', user.uid), { bubbleId: code }, { merge: true })
    return code
  }
  throw new Error('code-collision')
}

export async function joinBubble(user, name, rawCode) {
  const code = normalizeCode(rawCode)
  const ref = doc(db, 'bubbles', code)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('not-found')
  const data = snap.data()
  if (!data.members.includes(user.uid)) {
    if (data.members.length >= MAX_MEMBERS) throw new Error('full')
    await updateDoc(ref, {
      members: arrayUnion(user.uid),
      [`memberNames.${user.uid}`]: name,
    })
  }
  await setDoc(doc(db, 'users', user.uid), { bubbleId: code }, { merge: true })
  return code
}

// v1: only detaches this user's profile; their uid stays in the bubble's members array.
export async function leaveBubble(user) {
  await setDoc(doc(db, 'users', user.uid), { bubbleId: null }, { merge: true })
}
