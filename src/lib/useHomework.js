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
  setDoc,
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
  // Per-user overlay for shared items: each member has their own done/hidden state.
  const [states, setStates] = useState({})

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'homework'), orderBy('dueDate', 'asc'))
    return onSnapshot(q, (snap) => setPersonal(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: false }))))
  }, [user])

  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'bubbleState'), (snap) => {
      const map = {}
      snap.docs.forEach((d) => {
        map[d.id] = d.data()
      })
      setStates(map)
    })
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
    () => {
      const visibleShared = bubbleId
        ? shared.filter((h) => !states[h.id]?.hidden).map((h) => ({ ...h, done: !!states[h.id]?.done }))
        : []
      return [...personal, ...visibleShared].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    },
    [personal, shared, states, bubbleId]
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

  function stateRef(item) {
    return doc(db, 'users', user.uid, 'bubbleState', item.id)
  }

  // Checking off / deleting a shared item only affects this user; edits go to everyone.
  async function update(item, data) {
    if (!user) return
    if (item.shared && Object.keys(data).length === 1 && 'done' in data) {
      return setDoc(stateRef(item), { done: data.done }, { merge: true })
    }
    return updateDoc(doc(colFor(item.shared), item.id), data)
  }

  async function remove(item) {
    if (!user) return
    if (item.shared) return setDoc(stateRef(item), { hidden: true }, { merge: true })
    return deleteDoc(doc(colFor(item.shared), item.id))
  }

  return { items, add, update, remove }
}
