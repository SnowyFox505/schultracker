import { motion } from 'framer-motion'

// A soft light streak that sweeps once across its (relative, overflow-hidden) parent.
export default function Shine({ delay = 0.6 }) {
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
      initial={{ x: '0%' }}
      animate={{ x: '420%' }}
      transition={{ duration: 1.1, delay, ease: 'easeInOut' }}
    />
  )
}

export const flyIn = (i, base = 0) => ({
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring', stiffness: 220, damping: 20, delay: base + Math.min(i, 8) * 0.08 },
})
