import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { SUBJECT_COLORS } from '../lib/constants'

const TOTAL_STEPS = 3

export default function Onboarding() {
  const { profile, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [subjects, setSubjects] = useState([])
  const [subjectName, setSubjectName] = useState('')
  const [colorIndex, setColorIndex] = useState(0)
  const [busy, setBusy] = useState(false)

  function next() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }
  function back() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function addSubject() {
    const name = subjectName.trim()
    if (!name) return
    setSubjects((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, color: SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length].id },
    ])
    setSubjectName('')
    setColorIndex((i) => i + 1)
  }

  function removeSubject(id) {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  async function finish() {
    setBusy(true)
    try {
      await completeOnboarding({ subjects })
      navigate('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gradient-warm flex min-h-screen w-full flex-col px-6 pb-10 pt-10">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="relative mt-10 flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <Step key="welcome" direction={direction}>
              <h1 className="mb-2 font-[var(--font-display)] text-4xl font-extrabold leading-tight">
                Hey{profile?.name ? `, ${profile.name}` : ''} 👋
              </h1>
              <p className="text-[var(--color-ink-dim)]">
                Lass uns deine App in ein paar Schritten für dich einrichten. Dauert nur eine Minute.
              </p>
            </Step>
          )}

          {step === 1 && (
            <Step key="subjects" direction={direction}>
              <h1 className="mb-2 font-[var(--font-display)] text-3xl font-extrabold leading-tight">
                Deine Fächer
              </h1>
              <p className="mb-6 text-[var(--color-ink-dim)]">
                Füge die Fächer hinzu, die du hast. Du kannst das später jederzeit ändern.
              </p>

              <div className="mb-4 flex gap-2">
                <Input
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

              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const color = SUBJECT_COLORS.find((c) => c.id === s.color)
                  return (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => removeSubject(s.id)}
                      className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: color.bg }} />
                      {s.name}
                      <span className="text-[var(--color-ink-faint)]">×</span>
                    </motion.button>
                  )
                })}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step key="ready" direction={direction}>
              <h1 className="mb-2 font-[var(--font-display)] text-4xl font-extrabold leading-tight">
                Bereit.
              </h1>
              <p className="mb-6 text-[var(--color-ink-dim)]">
                {subjects.length > 0
                  ? `${subjects.length} Fach${subjects.length > 1 ? 'er' : ''} eingerichtet. Du kannst jetzt loslegen.`
                  : 'Keine Fächer angelegt – kein Problem, du kannst sie jederzeit hinzufügen.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const color = SUBJECT_COLORS.find((c) => c.id === s.color)
                  return (
                    <span
                      key={s.id}
                      className="rounded-full px-3.5 py-2 text-sm font-medium"
                      style={{ background: color.soft, color: color.bg }}
                    >
                      {s.name}
                    </span>
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
          <Button onClick={next} className="flex-1">
            Weiter
          </Button>
        ) : (
          <Button onClick={finish} disabled={busy} className="flex-1">
            {busy ? 'Einen Moment…' : 'Fertig'}
          </Button>
        )}
      </div>
    </div>
  )
}

function Step({ children, direction }) {
  return (
    <motion.div
      custom={direction}
      initial={{ opacity: 0, x: 24 * direction }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 * direction }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  )
}
