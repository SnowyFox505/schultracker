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

// A personal list (users/{uid}/{name}) plus the Bubble's shared list (bubbles/{id}/{name}), merged.
// `shareEnabled`: new entries go to the Bubble. `viewEnabled`: see the others' shared entries (own shared ones always show).
// Editing is shared; deleting (and checking off, if `withDone`) is per-user via users/{uid}/bubbleState.
export function useSharedList(name, { order, shareEnabled = true, viewEnabled = shareEnabled, withDone = false }) {
  const { user, profile } = useAuth()
  const bubbleId = profile?.bubbleId || null
  const sharing = !!bubbleId && shareEnabled
  const viewing = !!bubbleId && viewEnabled
  const listening = sharing || viewing
  const [personal, setPersonal] = useState([])
  const [shared, setShared] = useState([])
  const [states, setStates] = useState({})

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, name), orderBy(order, 'asc'))
    return onSnapshot(q, (snap) => setPersonal(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: false }))))
  }, [user, name, order])

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
    if (!user || !listening) return
    const q = query(collection(db, 'bubbles', bubbleId, name), orderBy(order, 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => setShared(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: true }))),
      () => setShared([])
    )
    return () => {
      unsub()
      setShared([])
    }
  }, [user, listening, bubbleId, name, order])

  const items = useMemo(() => {
    const visibleShared = listening
      ? shared
          .filter((h) => viewing || h.addedBy === user?.uid)
          .filter((h) => !states[h.id]?.hidden)
          .map((h) => (withDone ? { ...h, done: !!states[h.id]?.done } : h))
      : []
    return [...personal, ...visibleShared].sort((a, b) => (a[order] || '').localeCompare(b[order] || ''))
  }, [personal, shared, states, listening, viewing, user, order, withDone])

  function colFor(isShared) {
    return isShared ? collection(db, 'bubbles', bubbleId, name) : collection(db, 'users', user.uid, name)
  }

  function stateRef(item) {
    return doc(db, 'users', user.uid, 'bubbleState', item.id)
  }

  async function add(data) {
    if (!user) return
    if (sharing) {
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
    if (withDone && item.shared && Object.keys(data).length === 1 && 'done' in data) {
      return setDoc(stateRef(item), { done: data.done }, { merge: true })
    }
    return updateDoc(doc(colFor(item.shared), item.id), data)
  }

  async function remove(item) {
    if (!user) return
    if (item.shared) return setDoc(stateRef(item), { hidden: true }, { merge: true })
    return deleteDoc(doc(colFor(false), item.id))
  }

  return { items, add, update, remove }
}
