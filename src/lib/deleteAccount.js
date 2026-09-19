import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { leaveBubble } from './bubble'

const SUBCOLLECTIONS = ['schedule', 'breaks', 'bubbleState', 'homework', 'tests', 'notes']

export async function deleteAccountAndData(user, password, { beforeAuthDelete } = {}) {
  const credential = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, credential)

  try {
    await leaveBubble(user)
  } catch {
    // bubble cleanup must never block deleting the account itself
  }

  for (const name of SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db, 'users', user.uid, name))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }

  await deleteDoc(doc(db, 'users', user.uid))
  await beforeAuthDelete?.()
  await deleteUser(user)
}
