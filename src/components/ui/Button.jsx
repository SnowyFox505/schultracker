import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-black shadow-lg shadow-orange-900/30',
  secondary: 'bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-ink-dim)]',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold text-[15px] transition-opacity disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
