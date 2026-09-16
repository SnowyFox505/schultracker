import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

export function useBreaks() {
  const { user } = useAuth()
  const [breaks, setBreaks] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'breaks')
    const unsub = onSnapshot(ref, (snap) => {
      const map = {}
      snap.docs.forEach((d) => {
        map[d.id] = d.data()
      })
      setBreaks(map)
      setLoading(false)
    })
    return unsub
  }, [user])

  async function setBreak(afterPeriod, duration) {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'breaks', String(afterPeriod)), { afterPeriod, duration })
  }

  async function clearBreak(afterPeriod) {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'breaks', String(afterPeriod)))
  }

  return { breaks, loading, setBreak, clearBreak }
}
