import { useCallback, useRef, useState } from 'react'

export function useSavedToast() {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const trigger = useCallback(() => {
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 1400)
  }, [])

  return [visible, trigger]
}
