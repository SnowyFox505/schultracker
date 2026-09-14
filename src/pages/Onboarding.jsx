import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ColorPicker from '../components/ColorPicker'
import { SUBJECT_COLORS, colorFor } from '../lib/constants'

const TOTAL_STEPS = 3

export default function Onboarding() {
  const { profile, completeOnboarding, addCustomColor, removeCustomColor } = useAuth()
  const navigate = useNavigate()
  const customColors = profile?.customColors || []
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState([])
  const [subjectName, setSubjectName] = useState('')
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0].id)
  const [busy, setBusy] = useState(false)

  const canGoNext = step === 0 ? name.trim().length > 0 : true

  function next() {
    if (!canGoNext) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }
  function back() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function addSubject() {
    const trimmed = subjectName.trim()
    if (!trimmed) return
    setSubjects((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed, color: selectedColor }])
    setSubjectName('')
    const palette = [...SUBJECT_COLORS, ...customColors]
    const usedColors = new Set([...subjects.map((s) => s.color), selectedColor])
    const nextColor = palette.find((c) => !usedColors.has(c.id)) || palette[(subjects.length + 1) % palette.length]
    setSelectedColor(nextColor.id)
  }

  function removeSubject(id) {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  async function finish() {
    setBusy(true)
    try {
      await completeOnboarding({ name: name.trim(), subjects })
      navigate('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gradient-warm relative flex min-h-screen w-full flex-col overflow-hidden px-6 pb-10 pt-10 md:items-center md:px-6">
      <FloatingOrbs />

      <div className="relative z-10 flex w-full flex-1 flex-col md:max-w-lg">
        <ProgressBar step={step} total={TOTAL_STEPS} />

        <div className="relative mt-10 flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <Step key="name" direction={direction}>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="mb-2 font-[var(--font-display)] text-4xl font-extrabold leading-tight"
                >
                  Wie heißt
                  <br />
                  du? 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="mb-6 text-[var(--color-ink-dim)]"
                >
                  Lass uns deine App in ein paar Schritten einrichten.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                  />
                </motion.div>
              </Step>
            )}

            {step === 1 && (
              <Step key="subjects" direction={direction}>
                <h1 className="mb-2 font-[var(--font-display)] text-3xl font-extrabold leading-tight">Deine Fächer</h1>
                <p className="mb-6 text-[var(--color-ink-dim)]">
                  Füge deine Fächer hinzu und gib ihnen eine Farbe. Du kannst das später jederzeit ändern.
                </p>

                <div className="mb-4 flex gap-2">
                  <Input
                    autoFocus
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="z.B. Mathe"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={addSubject} className="px-4">
                    +
                  </Button>
                </div>

                <div className="mb-6">
                  <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                    customColors={customColors}
                    onAddCustom={addCustomColor}
                    onRemoveCustom={removeCustomColor}
                  />
                  {customColors.length > 0 && (
                    <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Eigene Farbe lang drücken zum Löschen.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence initial={false}>
                    {subjects.map((s, i) => {
                      const color = colorFor(s.color, customColors)
                      return (
                        <motion.button
                          key={s.id}
                          layout
                          initial={{ opacity: 0, scale: 0.6, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 26, delay: i * 0.03 }}
                          onClick={() => removeSubject(s.id)}
                          className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: color.bg }} />
                          {s.name}
                          <span className="text-[var(--color-ink-faint)]">×</span>
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step key="ready" direction={direction}>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="mb-2 font-[var(--font-display)] text-4xl font-extrabold leading-tight"
                >
                  Bereit, {name.trim().split(' ')[0]}.
                </motion.h1>
                <p className="mb-6 text-[var(--color-ink-dim)]">
                  {subjects.length > 0
                    ? `${subjects.length} Fach${subjects.length > 1 ? 'er' : ''} eingerichtet. Du kannst jetzt loslegen.`
                    : 'Keine Fächer angelegt – kein Problem, du kannst sie jederzeit hinzufügen.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s, i) => {
                    const color = colorFor(s.color, customColors)
                    return (
                      <motion.span
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
                        className="rounded-full px-3.5 py-2 text-sm font-medium"
                        style={{ background: color.soft, color: color.bg }}
                      >
                        {s.name}
                      </motion.span>
                    )
                  })}
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={back} className="flex-1">
              Zurück
            </Button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={next} disabled={!canGoNext} className="flex-1">
              Weiter
            </Button>
          ) : (
            <Button onClick={finish} disabled={busy} className="flex-1">
              {busy ? 'Einen Moment…' : 'Fertig'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ children, direction }) {
  return (
    <motion.div
      custom={direction}
      initial={{ opacity: 0, x: 32 * direction, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -32 * direction, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  )
}

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]"
            initial={{ width: 0 }}
            animate={{ width: i <= step ? '100%' : '0%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          />
        </div>
      ))}
    </div>
  )
}

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--color-accent)]/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[var(--color-accent-2)]/15 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
