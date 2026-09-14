import { motion } from 'framer-motion'

export default function Card({ children, className = '', ...props }) {
  return (
    <motion.div
      layout
      className={`rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
