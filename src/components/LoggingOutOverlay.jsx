import { motion } from 'framer-motion'
import { useEffect } from 'react'

const DURATION = 6
const SPECK_COUNT = 14

export default function LoggingOutOverlay({ name, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION * 1000)
    return () => clearTimeout(t)
  }, [onDone])

  const specks = Array.from({ length: SPECK_COUNT })

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute h-[50vh] w-[50vh] rounded-full bg-[var(--color-accent)]/20 blur-[110px]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 1.3], opacity: [0, 0.7, 0.3] }}
        transition={{ duration: DURATION, times: [0, 0.5, 1], ease: 'easeInOut' }}
      />

      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)]"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1.1, 0.3], opacity: [1, 1, 0] }}
          transition={{ duration: 2.2, times: [0, 0.5, 1], ease: 'easeInOut' }}
        />
        <motion.span
          className="relative text-4xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.2, 1, 1, 0], rotate: [-20, 14, -10, 14, 0] }}
          transition={{ duration: 2.2, times: [0, 0.25, 0.4, 0.75, 1], ease: 'easeInOut' }}
        >
          👋
        </motion.span>

        {specks.map((_, i) => {
          const angle = (i / SPECK_COUNT) * Math.PI * 2
          const dist = 90 + (i % 3) * 40
          const x = Math.cos(angle) * dist
          const y = Math.sin(angle) * dist
          return (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{ x, y: y - 60, opacity: [0, 1, 0], scale: [0.5, 1, 0.3] }}
              transition={{ duration: 2, delay: 1.6 + (i % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          )
        })}
      </div>

      <motion.p
        className="relative mt-8 font-[var(--font-display)] text-2xl font-extrabold text-white md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration: DURATION - 1, delay: 0.6, times: [0, 0.2, 0.75, 1] }}
      >
        Bis bald{name ? `, ${name.trim().split(' ')[0]}` : ''}!
      </motion.p>

      <motion.p
        className="relative mt-2 text-sm text-[var(--color-ink-faint)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: DURATION - 1, delay: 1, times: [0, 0.2, 0.8, 1] }}
      >
        Du wirst abgemeldet…
      </motion.p>

      <motion.div
        className="absolute bottom-16 h-1 w-36 overflow-hidden rounded-full bg-white/10 md:w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: DURATION, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  )
}
