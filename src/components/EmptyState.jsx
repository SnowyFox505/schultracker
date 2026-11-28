import { motion } from 'framer-motion'

export default function EmptyState({ text, actionLabel, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-4 ${className}`}>
      <motion.div
        className="h-2.5 w-2.5 rounded-full bg-[var(--color-ink-faint)]"
        animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.35, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="text-center text-[var(--color-ink-faint)]">{text}</p>
      {onAction && (
        <button type="button" onClick={onAction} className="min-h-11 rounded-full bg-[var(--color-accent-soft)] px-5 text-sm font-semibold text-[var(--color-accent)] active:scale-95">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
