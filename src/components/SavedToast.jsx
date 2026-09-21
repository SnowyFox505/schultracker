import { motion } from 'framer-motion'

export default function SavedToast({ text = 'Gespeichert' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold shadow-lg shadow-black/40"
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.4
          return (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-[var(--color-accent-2)]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(a) * 16, y: Math.sin(a) * 16, opacity: [0, 1, 0], scale: [0.6, 1.1, 0.3] }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            />
          )
        })}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.polyline
            points="4,12 9,17 20,6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          />
        </svg>
      </span>
      {text}
    </motion.div>
  )
}
