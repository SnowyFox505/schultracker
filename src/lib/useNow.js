import { useEffect, useState } from 'react'

// A `Date` that updates itself once a minute (aligned to the next minute boundary, then every 60s)
// so time-dependent UI re-renders on its own instead of only when something else changes.
export function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let interval
    const msToNextMinute = 60000 - (Date.now() % 60000)
    const align = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60000)
    }, msToNextMinute)
    return () => {
      clearTimeout(align)
      clearInterval(interval)
    }
  }, [])
  return now
}
