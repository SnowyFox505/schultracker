import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Navigates immediately (the nav shell isn't unmounted by the route change,
// so the icon keeps spinning in place regardless) and just resets the spin
// state after it's had time to play out, so it's never left "stuck" and can
// always be triggered again.
export function useSpinNavigate(to, spinDuration = 1100) {
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const timerRef = useRef(null)

  function trigger(e) {
    e.preventDefault()
    navigate(to)
    setSpinning(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSpinning(false), spinDuration)
  }

  return { spinning, trigger }
}
