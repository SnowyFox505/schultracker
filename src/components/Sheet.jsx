import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function Sheet({ open, onClose, title, children }) {
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
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[28px] border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 pb-8 pt-4"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--color-border)]" />
            {title && <h2 className="mb-5 font-[var(--font-display)] text-2xl font-bold">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
