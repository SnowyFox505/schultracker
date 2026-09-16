import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const SUBCOLLECTIONS = ['schedule', 'breaks', 'homework', 'tests', 'notes']

export async function deleteAccountAndData(user, password, { beforeAuthDelete } = {}) {
  const credential = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, credential)

  for (const name of SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db, 'users', user.uid, name))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }

  await deleteDoc(doc(db, 'users', user.uid))
  await beforeAuthDelete?.()
  await deleteUser(user)
}
