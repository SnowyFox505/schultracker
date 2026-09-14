import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
  const [ripples, setRipples] = useState([])

  function handleClick(e) {
    if (variant === 'primary' && !disabled) {
      const rect = e.currentTarget.getBoundingClientRect()
      setRipples((r) => [
        ...r,
        { id: Date.now() + Math.random(), x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
    }
    onClick?.(e)
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 font-semibold text-[15px] transition-opacity disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {variant === 'primary' && (
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              className="pointer-events-none absolute h-4 w-4 rounded-full bg-white/60"
              style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 14, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => setRipples((r2) => r2.filter((x) => x.id !== r.id))}
            />
          ))}
        </AnimatePresence>
      )}
      <span className="relative">{children}</span>
    </motion.button>
  )
}
