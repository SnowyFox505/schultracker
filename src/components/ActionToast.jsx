import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

// "Gelöscht · Rückgängig" and write errors. Sits above the bottom nav, left of the add button.
export default function ActionToast({ toast }) {
  return createPortal(
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role={toast.error ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] left-4 right-24 z-[70] flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1.5 pl-4 pr-2 text-sm font-semibold shadow-xl shadow-black/40 md:bottom-5 md:left-auto md:w-80"
        >
          <span className={toast.error ? 'text-[#ff6b81]' : ''}>{toast.text}</span>
          {toast.undo && (
            <button type="button" onClick={toast.undo} className="min-h-11 shrink-0 rounded-xl px-3 text-[var(--color-accent)] active:opacity-70">
              Rückgängig
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
