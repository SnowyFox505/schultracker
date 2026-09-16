import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { useBreaks } from '../lib/useBreaks'
import { useSavedToast } from '../lib/useSavedToast'
import { WEEKDAYS, DEFAULT_PERIODS, colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Sheet from '../components/Sheet'
import SavedToast from '../components/SavedToast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Stundenplan() {
  const { profile } = useAuth()
  const { lessons, setLesson, clearLesson } = useSchedule()
  const { breaks, setBreak, clearBreak } = useBreaks()
  const [editMode, setEditMode] = useState(false)
  const [activeCell, setActiveCell] = useState(null)
  const [subject, setSubject] = useState('')
  const [room, setRoom] = useState('')
  const [activeBreak, setActiveBreak] = useState(null)
  const [breakDuration, setBreakDuration] = useState('')
  const [showSaved, triggerSaved] = useSavedToast()

  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []

  function openCell(day, period) {
    if (!editMode) return
    const id = `${day}-${period}`
    const existing = lessons[id]
    setSubject(existing?.subject || '')
    setRoom(existing?.room || '')
    setActiveCell({ day, period })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!activeCell) return
    if (!subject.trim()) {
      await clearLesson(activeCell.day, activeCell.period)
    } else {
      const subjMeta = subjects.find((s) => s.name === subject)
      await setLesson(activeCell.day, activeCell.period, {
        subject: subject.trim(),
        room: room.trim(),
        color: subjMeta?.color || 'orange',
      })
      triggerSaved()
    }
    setActiveCell(null)
  }

  function openBreakEdit(afterPeriod) {
    if (!editMode) return
    const existing = breaks[String(afterPeriod)]
    setBreakDuration(existing ? String(existing.duration) : '')
    setActiveBreak(afterPeriod)
  }

  async function handleSaveBreak(e) {
    e.preventDefault()
    if (!activeBreak) return
    const minutes = parseInt(breakDuration, 10)
    if (!minutes || minutes <= 0) {
      await clearBreak(activeBreak)
    } else {
      await setBreak(activeBreak, minutes)
      triggerSaved()
    }
    setActiveBreak(null)
  }

  async function handleRemoveBreak() {
    if (!activeBreak) return
    await clearBreak(activeBreak)
    setActiveBreak(null)
  }

  return (
    <PageTransition>
      <AnimatePresence>{showSaved && <SavedToast text="Gespeichert" />}</AnimatePresence>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-y-2 pr-16 md:pr-0">
        <h1 className="font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Stundenplan</h1>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            editMode ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-ink-dim)]'
          }`}
        >
          {editMode ? 'Fertig' : 'Bearbeiten'}
        </button>
      </div>

      <div className="touch-pan-x overflow-x-auto overscroll-x-contain pb-2">
        <div className="grid min-w-[560px] grid-cols-[44px_repeat(5,1fr)] gap-1.5 md:min-w-0 md:grid-cols-[64px_repeat(5,1fr)] md:gap-2.5">
          <div />
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-center text-xs font-semibold text-[var(--color-ink-faint)] md:text-sm">
              {d}
            </div>
          ))}

          {DEFAULT_PERIODS.map(({ period }, idx) => {
            const brk = breaks[String(period)]
            const isLast = idx === DEFAULT_PERIODS.length - 1
            return (
              <Fragment key={`p-${period}`}>
                <div className="flex items-center justify-center text-xs font-semibold text-[var(--color-ink-faint)]">
                  {period}
                </div>
                {WEEKDAYS.map((day) => {
                  const lesson = lessons[`${day}-${period}`]
                  const color = lesson ? colorFor(lesson.color, customColors) : null
                  return (
                    <motion.button
                      key={`${day}-${period}`}
                      onClick={() => openCell(day, period)}
                      whileTap={editMode ? { scale: 0.95 } : {}}
                      animate={{ background: color ? color.soft : 'var(--color-surface)' }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`touch-manipulation flex min-h-[56px] flex-col items-center justify-center rounded-xl border p-1 text-center md:min-h-[72px] md:rounded-2xl ${
                        editMode ? 'border-dashed border-[var(--color-border)]' : 'border-transparent'
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {lesson ? (
                          <motion.div
                            key="filled"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                            className="flex flex-col items-center"
                          >
                            <span
                              className="text-[12px] font-semibold leading-tight text-white md:text-sm"
                              style={{ textShadow: `0 0 7px ${color.bg}cc, 0 0 2px #ffffffee` }}
                            >
                              {lesson.subject}
                            </span>
                            {lesson.room && <span className="text-[10px] text-[var(--color-ink-faint)] md:text-xs">{lesson.room}</span>}
                          </motion.div>
                        ) : editMode ? (
                          <motion.span
                            key="plus"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-lg text-[var(--color-ink-faint)]"
                          >
                            +
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}

                {!isLast && (brk || editMode) && (
                  <button
                    type="button"
                    onClick={() => openBreakEdit(period)}
                    className={`col-span-6 flex items-center justify-center gap-1.5 rounded-lg py-1 text-[11px] font-medium transition-colors ${
                      brk
                        ? 'text-[var(--color-ink-faint)]'
                        : 'border border-dashed border-[var(--color-border)] text-[var(--color-ink-faint)]/50'
                    }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    {brk ? `Pause · ${brk.duration} Min` : editMode ? 'Pause hinzufügen' : ''}
                  </button>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      {editMode && (
        <p className="mt-4 text-center text-xs text-[var(--color-ink-faint)]">
          Tippe auf ein Feld, um es zu bearbeiten. Pausen gelten für die ganze Woche.
        </p>
      )}

      <Sheet open={!!activeCell} onClose={() => setActiveCell(null)} title={activeCell ? `${activeCell.day} · Stunde ${activeCell.period}` : ''}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubject(s.name)}
                  className="rounded-full px-3.5 py-2 text-sm font-medium transition-transform active:scale-95"
                  style={{
                    background: subject === s.name ? colorFor(s.color, customColors).bg : colorFor(s.color, customColors).soft,
                    color: subject === s.name ? '#0a0a0f' : colorFor(s.color, customColors).bg,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
          <Input label="Fach" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Mathe" />
          <Input label="Raum (optional)" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="z.B. R204" />
          <div className="mt-2 flex gap-3">
            <Button type="submit" className="flex-1">
              Speichern
            </Button>
          </div>
        </form>
      </Sheet>

      <Sheet
        open={!!activeBreak}
        onClose={() => setActiveBreak(null)}
        title={activeBreak ? `Pause nach Stunde ${activeBreak}` : ''}
      >
        <form onSubmit={handleSaveBreak} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-ink-dim)]">Gilt für alle Wochentage, an denen Stunde {activeBreak} stattfindet.</p>
          <Input
            label="Dauer (Minuten)"
            type="number"
            min="1"
            autoFocus
            value={breakDuration}
            onChange={(e) => setBreakDuration(e.target.value)}
            placeholder="z.B. 20"
          />
          <div className="mt-2 flex gap-3">
            {activeBreak && breaks[String(activeBreak)] && (
              <Button type="button" variant="secondary" onClick={handleRemoveBreak} className="flex-1">
                Entfernen
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Speichern
            </Button>
          </div>
        </form>
      </Sheet>
    </PageTransition>
  )
}
