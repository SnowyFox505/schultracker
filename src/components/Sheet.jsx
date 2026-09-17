import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function Sheet({ open, onClose, title, children }) {
  const dragControls = useDragControls()

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
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md overflow-x-hidden rounded-t-[28px] border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 pb-8 pt-4"
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="-mx-6 -mt-4 mb-1 flex touch-none cursor-grab justify-center px-6 pb-4 pt-4 active:cursor-grabbing"
            >
              <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>
            {title && <h2 className="mb-5 font-[var(--font-display)] text-2xl font-bold">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
