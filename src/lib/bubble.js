import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
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

// Removes the user from the bubble's members; the last member out deletes the bubble and its homework.
export async function leaveBubble(user) {
  const userRef = doc(db, 'users', user.uid)
  const bubbleId = (await getDoc(userRef)).data()?.bubbleId
  if (bubbleId) {
    const ref = doc(db, 'bubbles', bubbleId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      if (snap.data().members.length <= 1) {
        const items = await getDocs(collection(ref, 'homework'))
        await Promise.all(items.docs.map((d) => deleteDoc(d.ref)))
        await deleteDoc(ref)
      } else {
        await updateDoc(ref, {
          members: arrayRemove(user.uid),
          [`memberNames.${user.uid}`]: deleteField(),
        })
      }
    }
  }
  await setDoc(userRef, { bubbleId: null }, { merge: true })
}

// Moves the user's own open (not done) private homework into their bubble.
export async function migrateHomework(user, name, bubbleId, items) {
  const target = collection(db, 'bubbles', bubbleId, 'homework')
  for (const { id, subject, title, sketch, dueDate } of items) {
    await addDoc(target, {
      subject: subject ?? null,
      title: title ?? '',
      sketch: sketch ?? null,
      dueDate,
      done: false,
      addedBy: user.uid,
      addedByName: name,
      createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'users', user.uid, 'homework', id))
  }
}
