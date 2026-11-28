import { useCallback, useEffect, useRef, useState } from 'react'

const SHOW_MS = 6000

// Safety net for writes. Firestore applies a write locally at once but its promise only resolves when
// the server confirms (never, while offline), so forms must not await it: pass it to `guard` instead.
export function useFeedback() {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const show = useCallback((next) => {
    clearTimeout(timer.current)
    setToast(next && { ...next, id: Date.now() })
    if (next) timer.current = setTimeout(() => setToast(null), SHOW_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const guard = useCallback(
    (promise, message = 'Das hat nicht geklappt. Versuch es nochmal.') =>
      Promise.resolve(promise).catch((err) => {
        console.error(err)
        show({ text: message, error: true })
      }),
    [show]
  )

  // Deletes right away and offers to bring it back.
  const removeWithUndo = useCallback(
    (text, doRemove, doRestore) => {
      show({
        text,
        undo: () => {
          show(null)
          guard(doRestore(), 'Wiederherstellen hat nicht geklappt.')
        },
      })
      guard(doRemove(), 'Löschen hat nicht geklappt.')
    },
    [show, guard]
  )

  return { toast, guard, removeWithUndo, fail: (text) => show({ text, error: true }) }
}
