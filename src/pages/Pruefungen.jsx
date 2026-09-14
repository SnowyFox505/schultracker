import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../lib/useCollection'
import { colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Fab from '../components/Fab'
import Sheet from '../components/Sheet'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Pruefungen() {
  const { profile } = useAuth()
  const { items, add, remove } = useCollection('tests', { order: 'date', direction: 'asc' })
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [date, setDate] = useState('')

  const subjects = profile?.subjects || []

  async function handleAdd(e) {
    e.preventDefault()
    if (!subject || !date) return
    await add({ subject, topic: topic.trim(), date })
    setSubject('')
    setTopic('')
    setDate('')
    setOpen(false)
  }

  return (
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold">Tests</h1>

      {items.length === 0 && (
        <p className="mt-10 text-center text-[var(--color-ink-faint)]">Keine anstehenden Tests. Trag welche ein, sobald sie angesagt werden.</p>
      )}

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <TestRow key={t.id} test={t} subjects={subjects} onDelete={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      <Fab onClick={() => setOpen(true)} label="Test hinzufügen" />

      <Sheet open={open} onClose={() => setOpen(false)} title="Neuer Test">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          {subjects.length > 0 ? (
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
          ) : (
            <Input label="Fach" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Mathe" />
          )}
          <Input label="Thema (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Quadratische Gleichungen" />
          <Input label="Datum" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type="submit" className="mt-2 w-full">
            Hinzufügen
          </Button>
        </form>
      </Sheet>
    </PageTransition>
  )
}

function TestRow({ test, subjects, onDelete }) {
  const subjMeta = subjects.find((s) => s.name === test.subject)
  const color = subjMeta ? colorFor(subjMeta.color) : colorFor('orange')
  const daysLeft = daysUntil(test.date)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: color.soft }}>
        <span className="text-[10px] font-semibold uppercase" style={{ color: color.bg }}>
          {monthShort(test.date)}
        </span>
        <span className="text-base font-bold" style={{ color: color.bg }}>
          {dayOfMonth(test.date)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{test.subject}</p>
        {test.topic && <p className="truncate text-sm text-[var(--color-ink-dim)]">{test.topic}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: color.soft, color: color.bg }}
        >
          {daysLeft === 0 ? 'Heute' : daysLeft === 1 ? 'Morgen' : daysLeft > 0 ? `in ${daysLeft} Tagen` : 'vorbei'}
        </span>
        <button onClick={onDelete} aria-label="Löschen" className="text-[var(--color-ink-faint)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}
function monthShort(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { month: 'short' })
}
function dayOfMonth(iso) {
  return new Date(iso).getDate()
}
