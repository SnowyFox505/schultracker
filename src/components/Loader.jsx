import { motion } from 'framer-motion'

const ORBITERS = [0, 1, 2]

export default function Loader() {
  return (
    <div className="gradient-warm flex h-screen w-screen flex-col items-center justify-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <motion.div
          className="absolute h-32 w-32 rounded-full bg-[var(--color-accent)]/30 blur-2xl"
          animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        >
          {ORBITERS.map((i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--color-accent-2)]"
              style={{ transformOrigin: '50% 80px', transform: `translateX(-50%) rotate(${i * 120}deg)`, opacity: 1 - i * 0.28 }}
            />
          ))}
        </motion.div>
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          className="relative h-20 w-20 rounded-[22px] shadow-[0_0_40px_rgba(255,122,48,0.45)]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <motion.p
        className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-faint)]"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        Schultracker
      </motion.p>
    </div>
  )
}
