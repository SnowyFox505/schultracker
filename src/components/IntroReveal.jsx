import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { colorFor } from '../lib/constants'

const WORDMARK = 'Schultracker'
const DURATION = 6

export default function IntroReveal({ name, subjects = [], customColors = [], onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION * 1000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: DURATION, times: [0, 0.85, 1], ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute h-[55vh] w-[55vh] rounded-full bg-[var(--color-accent)]/25 blur-[110px]"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.3, 1.4, 1.55], opacity: [0, 0.9, 0.6, 0.45] }}
        transition={{ duration: DURATION, times: [0, 0.32, 0.65, 1], ease: 'easeOut' }}
      />

      <FloatingSparks />

      <motion.div
        className="relative flex overflow-hidden font-[var(--font-display)] text-4xl font-extrabold tracking-tight md:text-6xl"
        initial="hidden"
        animate={['show', 'breathe']}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
          breathe: {
            scale: [1, 1, 1.025, 1],
            transition: { duration: DURATION, times: [0, 0.55, 0.72, 0.85], ease: 'easeInOut' },
          },
        }}
        style={{ perspective: 400 }}
      >
        {WORDMARK.split('').map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { y: 40, opacity: 0, rotateX: -70 },
              show: { y: 0, opacity: 1, rotateX: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
            }}
            className="inline-block bg-gradient-to-br from-white to-[var(--color-accent-2)] bg-clip-text text-transparent"
          >
            {ch}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="relative mt-4 h-[2px] w-40 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent md:w-56"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {subjects.length > 0 && (
        <motion.div
          className="relative mt-8 flex gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1.5 } } }}
        >
          {subjects.slice(0, 8).map((s, i) => {
            const color = colorFor(s.color, customColors)
            const fromX = (i % 2 === 0 ? -1 : 1) * (60 + i * 12)
            return (
              <motion.span
                key={s.id || i}
                className="h-3 w-3 rounded-full md:h-4 md:w-4"
                style={{ background: color.bg }}
                variants={{
                  hidden: { opacity: 0, x: fromX, y: -30, scale: 0.3 },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: [0.3, 1.25, 1],
                    transition: { type: 'spring', stiffness: 260, damping: 18 },
                  },
                }}
              />
            )
          })}
        </motion.div>
      )}

      <motion.p
        className="relative mt-8 text-lg font-semibold text-white md:text-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1], y: 0 }}
        transition={{ delay: 2.5, duration: 0.6, times: [0, 0.4, 1] }}
      >
        Startklar, {name?.trim().split(' ')[0] || 'los'}.
      </motion.p>

      <motion.p
        className="relative mt-2 text-xs text-[var(--color-ink-faint)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: 2.9, duration: 2.6, times: [0, 0.2, 0.8, 1] }}
      >
        Made by Leopold
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

function FloatingSparks() {
  const specks = Array.from({ length: 10 })
  return (
    <div className="pointer-events-none absolute inset-0">
      {specks.map((_, i) => {
        const left = 10 + ((i * 37) % 80)
        const delay = 1.6 + (i % 5) * 0.35
        return (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-accent-2)]"
            style={{ left: `${left}%`, top: '58%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: -120 }}
            transition={{ delay, duration: 3, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
