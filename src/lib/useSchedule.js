import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

export function useSchedule() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'schedule')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const map = {}
        snap.docs.forEach((d) => {
          map[d.id] = d.data()
        })
        setLessons(map)
        setLoading(false)
      },
      // Without this, a genuine listener error (not just a slow reconnect) leaves `loading` stuck
      // at true forever — Home.jsx's "Lädt deinen Stundenplan …" placeholder would never clear.
      (err) => {
        console.error('useSchedule onSnapshot error', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  async function setLesson(day, period, data) {
    if (!user) return
    const id = `${day}-${period}`
    await setDoc(doc(db, 'users', user.uid, 'schedule', id), { day, period, ...data })
  }

  async function clearLesson(day, period) {
    if (!user) return
    const id = `${day}-${period}`
    await deleteDoc(doc(db, 'users', user.uid, 'schedule', id))
  }

  return { lessons, loading, setLesson, clearLesson }
}
