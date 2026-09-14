import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="gradient-warm flex h-screen w-screen items-center justify-center">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-[var(--color-accent)] border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
