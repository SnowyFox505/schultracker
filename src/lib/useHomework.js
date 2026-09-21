import { useEffect, useMemo, useState } from 'react'
import { useSharedList } from './useSharedList'

function todayIso() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Checked-off homework disappears at 0:00 on the day after its due date (shared ones are only hidden
// for this user, own private ones are deleted).
export function useHomework() {
  const list = useSharedList('homework', { order: 'dueDate', withDone: true })
  const [today, setToday] = useState(todayIso)

  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
    const t = setTimeout(() => setToday(todayIso()), midnight - now)
    return () => clearTimeout(t)
  }, [today])

  const expired = (i) => i.done && i.dueDate && i.dueDate < today
  const items = useMemo(() => list.items.filter((i) => !expired(i)), [list.items, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const { remove } = list
  useEffect(() => {
    list.items.filter((i) => !i.shared && expired(i)).forEach((i) => remove(i))
  }, [list.items, today]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...list, items }
}
