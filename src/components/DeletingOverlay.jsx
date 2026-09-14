import { motion } from 'framer-motion'

const IMPLODE_COUNT = 16
const EXPLODE_COUNT = 28

export default function DeletingOverlay() {
  const implodeParticles = Array.from({ length: IMPLODE_COUNT })
  const explodeParticles = Array.from({ length: EXPLODE_COUNT })

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex h-0 w-0 items-center justify-center">
        {implodeParticles.map((_, i) => {
          const angle = (i / IMPLODE_COUNT) * Math.PI * 2
          const dist = 120 + (i % 3) * 50
          const x = Math.cos(angle) * dist
          const y = Math.sin(angle) * dist
          return (
            <motion.span
              key={`in-${i}`}
              className="absolute h-2 w-2 rounded-full bg-[#ff6b81]"
              initial={{ x, y, opacity: 0, scale: 1 }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 1], scale: [1, 0.8, 0.3] }}
              transition={{ duration: 2, delay: 0.2 + (i % 5) * 0.12, ease: [0.6, 0, 0.85, 0.15] }}
            />
          )
        })}

        <motion.div
          className="absolute h-16 w-16 rounded-full bg-[#ff6b81]"
          initial={{ scale: 0.2, opacity: 0, filter: 'blur(14px)' }}
          animate={{ scale: [0.2, 0.9, 0.1, 0], opacity: [0, 0.9, 1, 0] }}
          transition={{ duration: 2.4, delay: 0.2, times: [0, 0.72, 0.92, 1], ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute h-10 w-10 rounded-full border-2 border-[#ff6b81]"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 7], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.85, delay: 2.5, ease: 'easeOut' }}
        />

        {explodeParticles.map((_, i) => {
          const angle = (i / EXPLODE_COUNT) * Math.PI * 2 + (i % 2) * 0.12
          const dist = 200 + (i % 4) * 85
          const x = Math.cos(angle) * dist
          const y = Math.sin(angle) * dist
          const size = 3 + (i % 3) * 2
          return (
            <motion.span
              key={`out-${i}`}
              className="absolute rounded-full bg-[#ff6b81]"
              style={{ width: size, height: size }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{ x, y, opacity: [0, 1, 0], scale: [0.5, 1, 0.2] }}
              transition={{ duration: 0.8, delay: 2.5 + (i % 7) * 0.02, ease: [0.16, 1, 0.3, 1] }}
            />
          )
        })}

        <motion.div
          className="absolute h-3 w-3 rounded-full bg-[#ff6b81]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.3, delay: 3.35 }}
        />
        <motion.div
          className="absolute h-3 w-3 rounded-full bg-[#ff6b81]"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 2.6, 1], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, delay: 3.35, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="relative mt-12 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Account wird gelöscht
        <motion.span
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, times: [0, 0.3, 0.75, 1] }}
        >
          …
        </motion.span>
      </motion.p>
    </motion.div>
  )
}
