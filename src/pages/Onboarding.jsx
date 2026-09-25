import PushSettings from '../components/PushSettings'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ColorPicker from '../components/ColorPicker'
import { GridIcon, TaskIcon, ClockIcon, NoteIcon } from '../components/navIcons'
import { SUBJECT_COLORS, colorFor } from '../lib/constants'

const TOTAL_STEPS = 4

export default function Onboarding() {
  const { profile, completeOnboarding, addCustomColor, removeCustomColor, hidePresetColor } = useAuth()
  const navigate = useNavigate()
  const customColors = profile?.customColors || []
  const hiddenColors = profile?.hiddenColors || []
  const [showIntro, setShowIntro] = useState(true)
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
    const palette = [...SUBJECT_COLORS.filter((c) => !hiddenColors.includes(c.id)), ...customColors]
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
    <div className="gradient-warm relative flex min-h-dvh w-full flex-col overflow-hidden px-6 pb-10 pt-10 md:items-center md:px-6">
      <AnimatePresence>{showIntro && <OnboardingIntro onDone={() => setShowIntro(false)} />}</AnimatePresence>

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
                    hiddenColors={hiddenColors}
                    onAddCustom={addCustomColor}
                    onRemoveCustom={removeCustomColor}
                    onHidePreset={hidePresetColor}
                  />
                  <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Farbe lang drücken zum Löschen (Orange bleibt immer).</p>
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
              <Step key="push" direction={direction}>
                <h1 className="mb-2 font-[var(--font-display)] text-4xl font-extrabold leading-tight">Erinnerungen</h1>
                <p className="mb-6 text-[var(--color-ink-dim)]">
                  Optional: Lass dich an offene Hausaufgaben und Tests erinnern. Das kannst du jederzeit in den Einstellungen ändern.
                </p>
                <PushSettings />
              </Step>
            )}

            {step === 3 && (
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
                    ? `${subjects.length} ${subjects.length > 1 ? 'Fächer' : 'Fach'} eingerichtet. Du kannst jetzt loslegen.`
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

const INTRO_WORDMARK = 'Fangen wir an.'
const INTRO_STEPS = [
  { Icon: GridIcon, label: 'Stundenplan' },
  { Icon: TaskIcon, label: 'Hausaufgaben' },
  { Icon: ClockIcon, label: 'Tests' },
  { Icon: NoteIcon, label: 'Notizen' },
]
const INTRO_DURATION = 9.5

function OnboardingIntro({ onDone }) {
  // Mount-once timer: `onDone` is a fresh inline function on every Onboarding render (e.g. each
  // keystroke while typing the name), and depending on it would restart the 9.5s countdown on
  // every one of those renders — if they ever came faster than that, the intro would never finish.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), INTRO_DURATION * 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="gradient-warm fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
    >
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-[var(--color-accent)]/25 blur-[100px]"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.15, 1.3], opacity: [0, 0.85, 0.55] }}
        transition={{ duration: INTRO_DURATION, times: [0, 0.3, 1], ease: 'easeOut' }}
      />

      <IntroSparks />

      <motion.div
        className="relative flex flex-wrap justify-center font-[var(--font-display)] text-3xl font-extrabold md:text-5xl"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
        }}
        style={{ perspective: 400 }}
      >
        {INTRO_WORDMARK.split('').map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { y: 30, opacity: 0, rotateX: -60 },
              show: { y: 0, opacity: 1, rotateX: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
            }}
            className="inline-block bg-gradient-to-br from-white to-[var(--color-accent-2)] bg-clip-text text-transparent"
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="relative mt-4 h-[2px] w-40 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="relative mt-5 max-w-xs text-center text-[var(--color-ink-dim)]"
      >
        Wir richten in ein paar Schritten alles ein, was du brauchst.
      </motion.p>

      <motion.div
        className="relative mt-10 flex gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.5, delayChildren: 2.2 } } }}
      >
        {INTRO_STEPS.map(({ Icon, label }, i) => (
          <motion.div
            key={label}
            className="flex flex-col items-center gap-2"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.7 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 280, damping: 20 },
              },
            }}
          >
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 2.4 + i * 0.5 }}
            >
              <Icon />
            </motion.div>
            <span className="text-[11px] font-medium text-[var(--color-ink-faint)]">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function IntroSparks() {
  const specks = Array.from({ length: 12 })
  return (
    <div className="pointer-events-none absolute inset-0">
      {specks.map((_, i) => {
        const left = 8 + ((i * 31) % 84)
        const delay = 0.8 + (i % 6) * 0.5
        return (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-accent-2)]"
            style={{ left: `${left}%`, top: '55%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: -140 }}
            transition={{ delay, duration: 3.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeOut' }}
          />
        )
      })}
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
