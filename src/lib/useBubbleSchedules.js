import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export function useBubbleSchedules(bubbleId) {
  const [list, setList] = useState([])
  useEffect(() => {
    if (!bubbleId) return
    const unsub = onSnapshot(
      collection(db, 'bubbles', bubbleId, 'schedules'),
      (snap) => setList(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
      () => setList([])
    )
    return () => {
      unsub()
      setList([])
    }
  }, [bubbleId])
  return bubbleId ? list : []
}
