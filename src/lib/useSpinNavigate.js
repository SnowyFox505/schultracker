import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useSpinNavigate(to, delay = 1100) {
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const firedRef = useRef(false)

  function trigger(e) {
    e.preventDefault()
    if (firedRef.current) return
    firedRef.current = true
    setSpinning(true)
    setTimeout(() => navigate(to), delay)
  }

  return { spinning, trigger }
}
