import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SUBJECT_COLORS, makeCustomColor } from '../lib/constants'

const LONG_PRESS_MS = 450
const PERMANENT_ID = SUBJECT_COLORS[0].id

export default function ColorPicker({
  value,
  onChange,
  customColors = [],
  hiddenColors = [],
  onAddCustom,
  onRemoveCustom,
  onHidePreset,
  size = 'md',
}) {
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const timerRef = useRef(null)
  const firedRef = useRef(false)

  const visiblePresets = SUBJECT_COLORS.filter((c) => !hiddenColors.includes(c.id))
  const swatches = [...visiblePresets, ...customColors]

  function handlePick(e) {
    const hex = e.target.value
    const color = makeCustomColor(hex)
    onAddCustom?.(color)
    onChange(color.id)
  }

  function startPress(id, canDelete) {
    if (pendingDeleteId && pendingDeleteId !== id) setPendingDeleteId(null)
    if (!canDelete) return
    firedRef.current = false
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      setPendingDeleteId(id)
    }, LONG_PRESS_MS)
  }

  function endPress(id) {
    clearTimeout(timerRef.current)
    if (pendingDeleteId === id && !firedRef.current) {
      setPendingDeleteId(null)
      return
    }
    if (!firedRef.current) {
      onChange(id)
    }
  }

  function cancelPress() {
    clearTimeout(timerRef.current)
  }

  function handleDelete(c, isCustom) {
    if (isCustom) {
      onRemoveCustom?.(c.id)
    } else {
      onHidePreset?.(c.id)
    }
    setPendingDeleteId(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {swatches.map((c) => {
        const isCustom = customColors.some((cc) => cc.id === c.id)
        const canDelete = c.id !== PERMANENT_ID
        const showDelete = pendingDeleteId === c.id
        return (
          <motion.button
            key={c.id}
            type="button"
            onPointerDown={() => startPress(c.id, canDelete)}
            onPointerUp={() => endPress(c.id)}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => canDelete && e.preventDefault()}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: value === c.id ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={`relative shrink-0 rounded-full ${dim}`}
            style={{ background: c.bg }}
            aria-label={c.id}
          >
            {value === c.id && !showDelete && (
              <span className="absolute -inset-1 rounded-full border-2" style={{ borderColor: c.bg }} />
            )}
            <AnimatePresence>
              {showDelete && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(c, isCustom)
                  }}
                  className="absolute -inset-2 flex items-center justify-center rounded-full bg-black/70"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b81" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}

      <label
        className={`relative flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--color-ink-faint)] text-[var(--color-ink-faint)] ${dim}`}
        aria-label="Eigene Farbe hinzufügen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <input
          type="color"
          onChange={handlePick}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}
