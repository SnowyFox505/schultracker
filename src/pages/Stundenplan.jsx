import { Fragment, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { WEEKDAYS, DEFAULT_PERIODS, colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Sheet from '../components/Sheet'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Stundenplan() {
  const { profile } = useAuth()
  const { lessons, setLesson, clearLesson } = useSchedule()
  const [editMode, setEditMode] = useState(false)
  const [activeCell, setActiveCell] = useState(null)
  const [subject, setSubject] = useState('')
  const [room, setRoom] = useState('')

  const subjects = profile?.subjects || []

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
    }
    setActiveCell(null)
  }

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
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

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[560px] grid-cols-[44px_repeat(5,1fr)] gap-1.5 md:min-w-0 md:grid-cols-[64px_repeat(5,1fr)] md:gap-2.5">
          <div />
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-center text-xs font-semibold text-[var(--color-ink-faint)] md:text-sm">
              {d}
            </div>
          ))}

          {DEFAULT_PERIODS.map(({ period }) => (
            <Fragment key={`p-${period}`}>
              <div className="flex items-center justify-center text-xs font-semibold text-[var(--color-ink-faint)]">
                {period}
              </div>
              {WEEKDAYS.map((day) => {
                const lesson = lessons[`${day}-${period}`]
                const color = lesson ? colorFor(lesson.color) : null
                return (
                  <motion.button
                    key={`${day}-${period}`}
                    onClick={() => openCell(day, period)}
                    whileTap={editMode ? { scale: 0.95 } : {}}
                    className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border p-1 text-center md:min-h-[72px] md:rounded-2xl ${
                      editMode ? 'border-dashed border-[var(--color-border)]' : 'border-transparent'
                    }`}
                    style={{ background: color ? color.soft : 'var(--color-surface)' }}
                  >
                    {lesson ? (
                      <>
                        <span className="text-[12px] font-semibold leading-tight md:text-sm" style={{ color: color.bg }}>
                          {lesson.subject}
                        </span>
                        {lesson.room && <span className="text-[10px] text-[var(--color-ink-faint)] md:text-xs">{lesson.room}</span>}
                      </>
                    ) : editMode ? (
                      <span className="text-lg text-[var(--color-ink-faint)]">+</span>
                    ) : null}
                  </motion.button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {editMode && (
        <p className="mt-4 text-center text-xs text-[var(--color-ink-faint)]">Tippe auf ein Feld, um es zu bearbeiten.</p>
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
                    background: subject === s.name ? colorFor(s.color).bg : colorFor(s.color).soft,
                    color: subject === s.name ? '#0a0a0f' : colorFor(s.color).bg,
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
    </PageTransition>
  )
}
