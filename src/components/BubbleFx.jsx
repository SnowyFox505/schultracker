import { useEffect } from 'react'
import { motion } from 'framer-motion'

const ORB_BG =
  'radial-gradient(circle at 32% 28%, #ffd9a8 0%, var(--color-accent-2) 28%, var(--color-accent) 62%, #b04a12 100%)'
const SPARKS = 16

// Full-screen big moment: "create" (~4s) grows a bubble and spells out the join code inside it,
// "join" (~2.6s) lets the user's name fly into an existing bubble.
export default function BubbleFx({ mode, code = '', name = '', onDone }) {
  const create = mode === 'create'
  const duration = create ? 4 : 2.6

  useEffect(() => {
    const t = setTimeout(onDone, duration * 1000)
    return () => clearTimeout(t)
  }, [onDone, duration])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration, times: [0, 0.08, 0.86, 1] }}
    >
      <motion.div
        className="absolute h-[60vh] w-[60vh] rounded-full bg-[var(--color-accent)]/25 blur-[110px]"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.2, 1.35], opacity: [0, 0.8, 0.5] }}
        transition={{ duration, ease: 'easeOut' }}
      />

      <div className="relative flex h-72 w-72 items-center justify-center">
        {create && (
          <motion.div
            className="absolute h-3 w-3 rounded-full bg-[var(--color-accent)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        )}

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: ORB_BG, boxShadow: '0 0 70px 8px rgba(255,122,48,0.4), inset -16px -20px 44px rgba(120,40,0,0.35)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={create ? { scale: [0, 0.3, 1.12, 0.96, 1], opacity: 1 } : { scale: [0, 1.1, 1], opacity: 1 }}
          transition={{ duration: create ? 1.6 : 0.9, delay: create ? 0.6 : 0.1, ease: 'easeOut' }}
        />
        <div className="absolute left-[18%] top-[13%] h-11 w-16 -rotate-[28deg] rounded-full bg-white/40 blur-md" />

        {create ? (
          <div className="relative flex gap-2 font-[var(--font-display)] text-4xl font-extrabold tracking-widest text-white drop-shadow">
            {code.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.4 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 2 + i * 0.12 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
        ) : (
          <motion.span
            className="relative rounded-full bg-white/90 px-5 py-2 text-lg font-bold text-[#7a2f08] shadow-xl"
            initial={{ y: 260, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 13, delay: 0.9 }}
          >
            {name || 'Du'}
          </motion.span>
        )}

        {Array.from({ length: SPARKS }).map((_, i) => {
          const angle = (i / SPARKS) * Math.PI * 2
          const dist = 170 + (i % 3) * 40
          return (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: [0, 1, 0], scale: [0.5, 1, 0.3] }}
              transition={{ duration: 0.9, delay: create ? 2.5 : 1.5, ease: 'easeOut' }}
            />
          )
        })}
      </div>

      <motion.p
        className="relative mt-10 font-[var(--font-display)] text-2xl font-extrabold text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: create ? 2.9 : 1.6, duration: 0.5 }}
      >
        {create ? 'Deine Bubble ist bereit!' : 'Willkommen in der Bubble!'}
      </motion.p>
    </motion.div>
  )
}
