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
import Button from '../components/ui/Button'
import SketchPad, { SketchThumbnail, strokesFromFirestore, strokesToFirestore } from '../components/SketchPad'

export default function Notizen() {
  const { profile } = useAuth()
  const { items, add, update, remove } = useCollection('notes', { order: 'createdAt', direction: 'desc' })
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [text, setText] = useState('')
  const [mode, setMode] = useState('text')
  const [sketch, setSketch] = useState([])
  const [subject, setSubject] = useState('')
  const [showSaved, triggerSaved] = useSavedToast()

  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []

  function openAdd() {
    setEditingId(null)
    setText('')
    setMode('text')
    setSketch([])
    setSubject('')
    setOpen(true)
  }

  function openEdit(note) {
    const hasSketch = note.sketch && note.sketch.length > 0
    setEditingId(note.id)
    setMode(hasSketch ? 'sketch' : 'text')
    setText(hasSketch ? '' : note.text || '')
    setSketch(hasSketch ? strokesFromFirestore(note.sketch) : [])
    setSubject(note.subject || '')
    setOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'text' && !text.trim()) return
    if (mode === 'sketch' && sketch.length === 0) return
    const data = {
      text: mode === 'text' ? text.trim() : '',
      sketch: mode === 'sketch' ? strokesToFirestore(sketch) : null,
      subject: subject || null,
    }
    if (editingId) {
      await update(editingId, data)
    } else {
      await add(data)
    }
    setText('')
    setSketch([])
    setMode('text')
    setSubject('')
    setEditingId(null)
    setOpen(false)
    triggerSaved()
  }

  return (
    <>
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Notizen</h1>

      {items.length === 0 && <EmptyState className="mt-6" text="Noch keine Notizen. Leg direkt los." />}

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {items.map((n, i) => {
            const subjMeta = subjects.find((s) => s.name === n.subject)
            const color = subjMeta ? colorFor(subjMeta.color, customColors) : null
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: -26, rotate: i % 2 === 0 ? -5 : 5, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.03 }}
              >
              <SwipeToDelete onDelete={() => remove(n.id)}>
                <div
                  className="flex min-h-[110px] flex-col justify-between rounded-2xl border border-[var(--color-border)] p-4"
                  style={{ background: color ? color.soft : 'var(--color-surface)' }}
                >
                  <button type="button" onClick={() => openEdit(n)} className="text-left">
                    {n.subject && (
                      <p className="mb-1 text-xs font-semibold" style={{ color: color?.bg }}>
                        {n.subject}
                      </p>
                    )}
                    {n.sketch && n.sketch.length > 0 ? (
                      <SketchThumbnail strokes={strokesFromFirestore(n.sketch)} className="h-14 w-full text-[var(--color-ink)]" />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                    )}
                  </button>
                  <button onClick={() => remove(n.id)} className="mt-2 self-end text-[var(--color-ink-faint)]" aria-label="Löschen">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
              </SwipeToDelete>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </PageTransition>

      <AnimatePresence>{showSaved && <SavedToast text="Notiz gespeichert" />}</AnimatePresence>

      <Fab onClick={openAdd} label="Notiz hinzufügen" />

      <Sheet open={open} onClose={() => setOpen(false)} title={editingId ? 'Notiz bearbeiten' : 'Neue Notiz'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubject('')}
                className="rounded-full px-3.5 py-2 text-sm font-medium"
                style={{
                  background: subject === '' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: subject === '' ? '#0a0a0f' : 'var(--color-ink-dim)',
                }}
              >
                Allgemein
              </button>
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
          <div className="flex gap-1 rounded-full bg-[var(--color-surface-2)] p-1">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === 'text' ? 'bg-[var(--color-accent)] text-black' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode('sketch')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === 'sketch' ? 'bg-[var(--color-accent)] text-black' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              ✍️ Handschrift
            </button>
          </div>
          {mode === 'text' ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Was möchtest du dir merken?"
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3.5 text-[16px] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
            />
          ) : (
            <SketchPad value={sketch} onChange={setSketch} />
          )}
          <Button type="submit" className="mt-2 w-full">
            Speichern
          </Button>
        </form>
      </Sheet>
    </>
  )
}
