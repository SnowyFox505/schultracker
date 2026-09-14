import { useRef } from 'react'
import { motion } from 'framer-motion'
import { SUBJECT_COLORS, makeCustomColor } from '../lib/constants'

export default function ColorPicker({ value, onChange, customColors = [], onAddCustom, size = 'md' }) {
  const inputRef = useRef(null)
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'

  function handlePick(e) {
    const hex = e.target.value
    const color = makeCustomColor(hex)
    onAddCustom?.(color)
    onChange(color.id)
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {[...SUBJECT_COLORS, ...customColors].map((c) => (
        <motion.button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: value === c.id ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={`relative shrink-0 rounded-full ${dim}`}
          style={{ background: c.bg }}
          aria-label={c.id}
        >
          {value === c.id && (
            <span className="absolute -inset-1 rounded-full border-2" style={{ borderColor: c.bg }} />
          )}
        </motion.button>
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--color-ink-faint)] text-[var(--color-ink-faint)] ${dim}`}
        aria-label="Eigene Farbe hinzufügen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input ref={inputRef} type="color" onChange={handlePick} className="sr-only" />
    </div>
  )
}
