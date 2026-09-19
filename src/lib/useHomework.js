import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

// Personal homework plus (if the user is in a Bubble) the Bubble's shared homework, merged.
// New entries go to the Bubble when the user is in one, otherwise to their private list.
export function useHomework() {
  const { user, profile } = useAuth()
  const bubbleId = profile?.bubbleId || null
  const [personal, setPersonal] = useState([])
  const [shared, setShared] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'homework'), orderBy('dueDate', 'asc'))
    return onSnapshot(q, (snap) => setPersonal(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: false }))))
  }, [user])

  useEffect(() => {
    if (!user || !bubbleId) return
    const q = query(collection(db, 'bubbles', bubbleId, 'homework'), orderBy('dueDate', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => setShared(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: true }))),
      () => setShared([])
    )
    return () => {
      unsub()
      setShared([])
    }
  }, [user, bubbleId])

  const items = useMemo(
    () => [...personal, ...(bubbleId ? shared : [])].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')),
    [personal, shared, bubbleId]
  )

  function colFor(isShared) {
    return isShared ? collection(db, 'bubbles', bubbleId, 'homework') : collection(db, 'users', user.uid, 'homework')
  }

  async function add(data) {
    if (!user) return
    if (bubbleId) {
      return addDoc(colFor(true), {
        ...data,
        addedBy: user.uid,
        addedByName: profile?.name || '',
        createdAt: serverTimestamp(),
      })
    }
    return addDoc(colFor(false), { ...data, createdAt: serverTimestamp() })
  }

  async function update(item, data) {
    if (!user) return
    return updateDoc(doc(colFor(item.shared), item.id), data)
  }

  async function remove(item) {
    if (!user) return
    return deleteDoc(doc(colFor(item.shared), item.id))
  }

  return { items, add, update, remove }
}
