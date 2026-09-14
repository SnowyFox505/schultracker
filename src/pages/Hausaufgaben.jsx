import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../lib/useCollection'
import { useSavedToast } from '../lib/useSavedToast'
import { colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Fab from '../components/Fab'
import Sheet from '../components/Sheet'
import SavedToast from '../components/SavedToast'
import EmptyState from '../components/EmptyState'
import SwipeToDelete from '../components/SwipeToDelete'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Hausaufgaben() {
  const { profile } = useAuth()
  const { items, add, update, remove } = useCollection('homework', { order: 'dueDate', direction: 'asc' })
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showSaved, triggerSaved] = useSavedToast()

  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []
  const open_ = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    await add({ subject: subject || null, title: title.trim(), dueDate, done: false })
    setTitle('')
    setDueDate('')
    setSubject('')
    setOpen(false)
    triggerSaved()
  }

  return (
    <>
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Hausaufgaben</h1>

      {items.length === 0 && <EmptyState className="mt-6" text="Noch keine Hausaufgaben eingetragen." />}

      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
        <AnimatePresence initial={false}>
          {open_.map((hw) => (
            <HomeworkRow key={hw.id} hw={hw} onToggle={() => update(hw.id, { done: true })} onDelete={() => remove(hw.id)} />
          ))}
        </AnimatePresence>
      </div>

      {done.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold text-[var(--color-ink-faint)]">Erledigt</p>
          <div className="flex flex-col gap-2.5 opacity-50 md:grid md:grid-cols-2 md:gap-3">
            <AnimatePresence initial={false}>
              {done.map((hw) => (
                <HomeworkRow key={hw.id} hw={hw} done onToggle={() => update(hw.id, { done: false })} onDelete={() => remove(hw.id)} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </PageTransition>

      <AnimatePresence>{showSaved && <SavedToast text="Hausaufgabe gespeichert" />}</AnimatePresence>

      <Fab onClick={() => setOpen(true)} label="Hausaufgabe hinzufügen" />

      <Sheet open={open} onClose={() => setOpen(false)} title="Neue Hausaufgabe">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
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
          <Input label="Aufgabe" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. S. 42, Nr. 3-5" />
          <Input label="Fällig am" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Button type="submit" className="mt-2 w-full">
            Hinzufügen
          </Button>
        </form>
      </Sheet>
    </>
  )
}

function HomeworkRow({ hw, done, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
    >
    <SwipeToDelete onDelete={onDelete}>
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <motion.button
        onClick={onToggle}
        aria-label="Erledigt umschalten"
        whileTap={{ scale: 0.85 }}
        animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          done ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
        }`}
      >
        <AnimatePresence>
          {done && (
            <motion.svg
              key="check"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.polyline
                points="4,12 9,17 20,6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
      <div className="min-w-0 flex-1">
        {hw.subject && <p className="text-xs font-semibold text-[var(--color-accent)]">{hw.subject}</p>}
        <p className={`truncate text-[15px] ${done ? 'line-through text-[var(--color-ink-faint)]' : ''}`}>{hw.title}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-ink-faint)]">{formatDate(hw.dueDate)}</span>
        <button onClick={onDelete} aria-label="Löschen" className="text-[var(--color-ink-faint)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>
    </div>
    </SwipeToDelete>
    </motion.div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
