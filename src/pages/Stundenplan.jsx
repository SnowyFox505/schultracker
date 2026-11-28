import { TILE } from '../lib/tile'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useNow } from '../lib/useNow'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { useBreaks } from '../lib/useBreaks'
import { usePeriods } from '../lib/usePeriods'
import { DEFAULT_SCHOOL_START } from '../lib/periods'
import { useSavedToast } from '../lib/useSavedToast'
import { WEEKDAYS, PERIOD_NUMBERS, JS_DAY_TO_WEEKDAY, colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import PageTitle from '../components/PageTitle'
import EmptyState from '../components/EmptyState'
import Sheet from '../components/Sheet'
import SavedToast from '../components/SavedToast'
import ActionToast from '../components/ActionToast'
import { useFeedback } from '../lib/useFeedback'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Stundenplan() {
  const { profile, updateUserProfile } = useAuth()
  const { lessons, loading, setLesson, clearLesson } = useSchedule()
  const { breaks, setBreak, clearBreak } = useBreaks()
  const { periods } = usePeriods()
  const [editMode, setEditMode] = useState(false)
  const [activeCell, setActiveCell] = useState(null)
  const [subject, setSubject] = useState('')
  const [room, setRoom] = useState('')
  const [activeBreak, setActiveBreak] = useState(null)
  const [breakDuration, setBreakDuration] = useState('')
  const [activeEndDay, setActiveEndDay] = useState(null)
  const [endTime, setEndTime] = useState('')
  const [startEditing, setStartEditing] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [showSaved, triggerSaved] = useSavedToast()
  const { toast, guard } = useFeedback()

  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []
  const schoolEnd = profile?.schoolEnd || {}
  const schoolStart = profile?.schoolStart || DEFAULT_SCHOOL_START
  const periodByNum = Object.fromEntries(periods.map((p) => [p.period, p]))

  // Today's column is marked, the running lesson too; on weekends nothing is.
  const now = useNow()
  const today = JS_DAY_TO_WEEKDAY[now.getDay()]
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const isRunning = (p) => p && nowMin >= p.startMin && nowMin < p.endMin
  // On a phone the week is wider than the screen: start with today in view.
  const scroller = useRef(null)
  const todayHead = useRef(null)
  useEffect(() => {
    if (loading || !scroller.current || !todayHead.current) return
    // 50px = the period column that stays pinned on the left
    scroller.current.scrollLeft = todayHead.current.offsetLeft - 50
  }, [loading])

  function openCell(day, period) {
    if (!editMode) return
    const id = `${day}-${period}`
    const existing = lessons[id]
    setSubject(existing?.subject || '')
    setRoom(existing?.room || '')
    setActiveCell({ day, period })
  }

  function handleSave(e) {
    e.preventDefault()
    if (!activeCell) return
    if (!subject.trim()) {
      guard(clearLesson(activeCell.day, activeCell.period))
    } else {
      const subjMeta = subjects.find((s) => s.name === subject)
      guard(setLesson(activeCell.day, activeCell.period, {
        subject: subject.trim(),
        room: room.trim(),
        color: subjMeta?.color || 'orange',
      }))
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

  function handleSaveBreak(e) {
    e.preventDefault()
    if (!activeBreak) return
    const minutes = parseInt(breakDuration, 10)
    if (!minutes || minutes <= 0) {
      guard(clearBreak(activeBreak))
    } else {
      guard(setBreak(activeBreak, minutes))
      triggerSaved()
    }
    setActiveBreak(null)
  }

  function handleRemoveBreak() {
    if (!activeBreak) return
    guard(clearBreak(activeBreak))
    setActiveBreak(null)
  }

  function openEndEdit(day) {
    if (!editMode) return
    setEndTime(schoolEnd[day] || '')
    setActiveEndDay(day)
  }

  function handleSaveEnd(e) {
    e.preventDefault()
    if (!activeEndDay) return
    const next = { ...schoolEnd }
    if (endTime) next[activeEndDay] = endTime
    else delete next[activeEndDay]
    guard(updateUserProfile({ schoolEnd: next }))
    triggerSaved()
    setActiveEndDay(null)
  }

  function handleRemoveEnd() {
    if (!activeEndDay) return
    const next = { ...schoolEnd }
    delete next[activeEndDay]
    guard(updateUserProfile({ schoolEnd: next }))
    setActiveEndDay(null)
  }

  function openStartEdit() {
    if (!editMode) return
    setStartTime(schoolStart)
    setStartEditing(true)
  }

  function handleSaveStart(e) {
    e.preventDefault()
    if (!startTime) return
    guard(updateUserProfile({ schoolStart: startTime }))
    triggerSaved()
    setStartEditing(false)
  }

  return (
    <PageTransition>
      <AnimatePresence>{showSaved && <SavedToast text="Gespeichert" />}</AnimatePresence>
      <ActionToast toast={toast} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-y-2">
        <PageTitle className="w-full md:w-auto">Stundenplan</PageTitle>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`rounded-full px-4 py-3 text-sm font-semibold transition-colors md:py-2 ${
            editMode ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-ink-dim)]'
          }`}
        >
          {editMode ? 'Fertig' : 'Bearbeiten'}
        </button>
      </div>

      {!loading && !editMode && Object.keys(lessons).length === 0 && (
        <EmptyState className="mb-3 !py-2" text="Dein Stundenplan ist noch leer." actionLabel="Stunden eintragen" onAction={() => setEditMode(true)} />
      )}

      <button
        type="button"
        onClick={openStartEdit}
        disabled={!editMode}
        className={`mb-4 flex w-full items-center justify-between px-4 py-3 text-left ${TILE}`}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Schulstart</p>
          <p className="text-sm font-semibold">{schoolStart} Uhr</p>
        </div>
        {editMode && (
          <span className="rounded-full bg-[var(--color-surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-ink-dim)]">Ändern</span>
        )}
      </button>

      <div className="rounded-3xl border border-white/[0.07] bg-[var(--color-surface)] p-2">
      <div ref={scroller} className="touch-pan-x touch-pan-y overflow-x-auto overscroll-x-contain">
        <div className="relative grid min-w-[560px] grid-cols-[44px_repeat(5,1fr)] gap-1.5 md:min-w-0 md:grid-cols-[64px_repeat(5,1fr)] md:gap-2.5">
          <div className="sticky left-0 z-10 bg-[var(--color-surface)] shadow-[0_0_0_4px_var(--color-surface)]" />
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              ref={d === today ? todayHead : null}
              aria-current={d === today ? 'date' : undefined}
              className={`rounded-full py-1 text-center text-xs font-bold md:text-sm ${
                d === today ? 'bg-[var(--color-accent)] text-black' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              {d}
            </div>
          ))}

          {PERIOD_NUMBERS.map((period, idx) => {
            const brk = breaks[String(period)]
            const isLast = idx === PERIOD_NUMBERS.length - 1
            const p = periodByNum[period]
            return (
              <Fragment key={`p-${period}`}>
                <div
                  className={`sticky left-0 z-10 flex flex-col items-center justify-center bg-[var(--color-surface)] shadow-[0_0_0_4px_var(--color-surface)] text-center text-xs font-semibold ${
                    today && isRunning(p) ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'
                  }`}
                >
                  <span>{period}</span>
                  {p && (
                    <span className="text-[10px] font-normal leading-tight text-[var(--color-ink-faint)] md:text-[11px]">
                      {p.start}
                      <br />–{p.end}
                    </span>
                  )}
                </div>
                {WEEKDAYS.map((day) => {
                  const lesson = lessons[`${day}-${period}`]
                  const color = lesson ? colorFor(lesson.color, customColors) : null
                  const isToday = day === today
                  const running = isToday && lesson && isRunning(p)
                  return (
                    <motion.button
                      key={`${day}-${period}`}
                      onClick={() => openCell(day, period)}
                      whileTap={editMode ? { scale: 0.95 } : {}}
                      animate={{ background: color ? color.soft : 'var(--color-surface-2)' }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`touch-manipulation flex min-h-[56px] flex-col items-center justify-center rounded-2xl border p-1 text-center md:min-h-[72px] ${
                        editMode
                          ? 'border-dashed border-[var(--color-border)]'
                          : isToday
                            ? 'border-[var(--color-accent)]/35'
                            : lesson
                              ? 'border-white/[0.09]'
                              : 'border-white/[0.04]'
                      } ${running ? '!border-2 !border-[var(--color-accent)]' : ''}`}
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
                            {running && <span className="mt-0.5 rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-black">Jetzt</span>}
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
                        : 'border border-dashed border-[var(--color-border)] text-[var(--color-ink-faint)]'
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
      </div>

      {editMode && (
        <p className="mt-4 text-center text-xs text-[var(--color-ink-faint)]">
          Tippe auf ein Feld, um es zu bearbeiten. Pausen gelten für die ganze Woche.
        </p>
      )}

      {(editMode || Object.keys(schoolEnd).length > 0) && (
        <div className="mt-6">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Schulschluss</p>
          <div className="grid grid-cols-5 gap-1.5 md:gap-2.5">
            {WEEKDAYS.map((day) => {
              const time = schoolEnd[day]
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => openEndEdit(day)}
                  disabled={!editMode}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl border p-2 text-center ${
                    time ? 'border-transparent bg-[var(--color-accent-soft)]' : 'border-dashed border-[var(--color-border)]'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[var(--color-ink-faint)]">{day}</span>
                  <span className={`text-xs font-semibold ${time ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'}`}>
                    {time || (editMode ? '+' : '–')}
                  </span>
                </button>
              )
            })}
          </div>
          {editMode && (
            <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
              Legt fest, wann dein Schultag spätestens vorbei ist — wird für die "Nächste Stunde"-Karte auf Heute und für Erinnerungen verwendet, statt nur die letzte eingetragene Stunde zu nehmen.
            </p>
          )}
        </div>
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

      <Sheet open={!!activeEndDay} onClose={() => setActiveEndDay(null)} title={activeEndDay ? `Schulschluss: ${activeEndDay}` : ''}>
        <form onSubmit={handleSaveEnd} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-ink-dim)]">
            Ab wann bist du an diesem Tag spätestens frei? Leer lassen, um wieder die letzte eingetragene Stunde zu verwenden.
          </p>
          <Input label="Uhrzeit" type="time" autoFocus value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <div className="mt-2 flex gap-3">
            {activeEndDay && schoolEnd[activeEndDay] && (
              <Button type="button" variant="secondary" onClick={handleRemoveEnd} className="flex-1">
                Entfernen
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Speichern
            </Button>
          </div>
        </form>
      </Sheet>

      <Sheet open={startEditing} onClose={() => setStartEditing(false)} title="Schulstart">
        <form onSubmit={handleSaveStart} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-ink-dim)]">
            Wann beginnt bei dir die 1. Stunde? Daraus berechnet die App alle weiteren Stundenzeiten (45 Minuten pro Stunde, plus
            deine eingetragenen Pausen) — für die "Nächste Stunde"-Karte auf Heute und für Erinnerungen.
          </p>
          <Input label="Uhrzeit" type="time" autoFocus required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Button type="submit" className="mt-2 w-full">
            Speichern
          </Button>
        </form>
      </Sheet>
    </PageTransition>
  )
}
