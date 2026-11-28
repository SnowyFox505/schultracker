import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function Sheet({ open, onClose, title, children }) {
  const dragControls = useDragControls()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragSnapToOrigin
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            // Never taller than the screen: the header stays put, only the body scrolls.
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(var(--app-height,100dvh)-env(safe-area-inset-top)-0.75rem)] max-w-md flex-col rounded-t-[32px] border-t border-white/[0.09] bg-[var(--color-surface)] bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] to-40%"
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="relative shrink-0 touch-none cursor-grab px-6 pb-5 pt-3 active:cursor-grabbing"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[var(--color-border)]" />
              {title && <h2 className="pr-12 font-[var(--font-display)] text-2xl font-bold">{title}</h2>}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                aria-label="Schließen"
                className="absolute right-4 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-ink-dim)] active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
