import { motion } from 'framer-motion'

const RADIUS = 54
const CIRC = 2 * Math.PI * RADIUS

// Shown while the app clears its caches (before the reload).
export function UpdatingOverlay({ seconds = 3 }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: seconds, ease: 'easeInOut' }}
          />
        </svg>
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          className="h-20 w-20 rounded-[22px] shadow-[0_0_40px_rgba(255,122,48,0.45)]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-dim)]">
        Hole die neueste Version
        <motion.span animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.3, repeat: Infinity, times: [0, 0.3, 0.75, 1] }}>
          …
        </motion.span>
      </p>
    </motion.div>
  )
}

// Small celebration shown right after the reload.
export function UpdatedBurst() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[90] flex justify-center"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-14, 0, 0, -8] }}
      transition={{ duration: 2.8, times: [0, 0.12, 0.85, 1] }}
    >
      <div className="relative rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold shadow-xl">
        ✓ Auf dem neuesten Stand
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 34, opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
