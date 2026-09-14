import { motion } from 'framer-motion'

const PARTICLE_COUNT = 16

export default function DeletingOverlay() {
  const particles = Array.from({ length: PARTICLE_COUNT })

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {particles.map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2
        const dist = 130 + (i % 3) * 55
        const x = Math.cos(angle) * dist
        const y = Math.sin(angle) * dist
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-[#ff6b81]"
            initial={{ x, y, opacity: 0, scale: 1 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [1, 0.6, 0] }}
            transition={{ duration: 1.3, delay: 0.3 + (i % 5) * 0.08, ease: [0.6, 0, 0.9, 0.2] }}
          />
        )
      })}

      <motion.div
        className="absolute h-24 w-24 rounded-full bg-[#ff6b81]"
        initial={{ scale: 0.3, opacity: 0.6, filter: 'blur(20px)' }}
        animate={{ scale: [0.3, 1, 0.2, 3.2], opacity: [0.6, 0.9, 1, 0] }}
        transition={{ duration: 2.2, times: [0, 0.55, 0.75, 1], ease: 'easeInOut' }}
      />

      <motion.p
        className="relative text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0], x: [0, -2, 2, -1, 0] }}
        transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1], ease: 'easeInOut' }}
      >
        Account wird gelöscht…
      </motion.p>
    </motion.div>
  )
}
