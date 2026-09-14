import { useEffect, useState } from 'react'
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

export function useCollection(name, { order = 'createdAt', direction = 'asc' } = {}) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, name)
    const q = order ? query(ref, orderBy(order, direction)) : ref
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user, name, order, direction])

  async function add(data) {
    if (!user) return
    return addDoc(collection(db, 'users', user.uid, name), {
      ...data,
      createdAt: serverTimestamp(),
    })
  }

  async function update(id, data) {
    if (!user) return
    return updateDoc(doc(db, 'users', user.uid, name, id), data)
  }

  async function remove(id) {
    if (!user) return
    return deleteDoc(doc(db, 'users', user.uid, name, id))
  }

  return { items, loading, add, update, remove }
}
