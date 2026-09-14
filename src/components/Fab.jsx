import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Fab({ onClick, label = 'Hinzufügen' }) {
  const [ripples, setRipples] = useState([])
  const [bump, setBump] = useState(0)

  function handleClick() {
    setRipples((r) => [...r, Date.now() + Math.random()])
    setBump((b) => b + 1)
    onClick?.()
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.86 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={label}
      className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-black shadow-xl shadow-orange-900/40"
    >
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.span
            key={id}
            className="absolute h-full w-full rounded-full bg-white/50"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onAnimationComplete={() => setRipples((r) => r.filter((x) => x !== id))}
          />
        ))}
      </AnimatePresence>
      <motion.svg
        key={bump}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="relative"
        initial={{ rotate: 0 }}
        animate={{ rotate: 180 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </motion.svg>
    </motion.button>
  )
}
