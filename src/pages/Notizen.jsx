import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../lib/useCollection'
import { colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Fab from '../components/Fab'
import Sheet from '../components/Sheet'
import Button from '../components/ui/Button'

export default function Notizen() {
  const { profile } = useAuth()
  const { items, add, remove } = useCollection('notes', { order: 'createdAt', direction: 'desc' })
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [subject, setSubject] = useState('')

  const subjects = profile?.subjects || []

  async function handleAdd(e) {
    e.preventDefault()
    if (!text.trim()) return
    await add({ text: text.trim(), subject: subject || null })
    setText('')
    setSubject('')
    setOpen(false)
  }

  return (
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Notizen</h1>

      {items.length === 0 && (
        <p className="mt-10 text-center text-[var(--color-ink-faint)]">Noch keine Notizen. Leg direkt los.</p>
      )}

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {items.map((n, i) => {
            const subjMeta = subjects.find((s) => s.name === n.subject)
            const color = subjMeta ? colorFor(subjMeta.color) : null
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.02 }}
                className={`flex min-h-[110px] flex-col justify-between rounded-2xl border border-[var(--color-border)] p-4 ${
                  i % 2 === 0 ? 'col-span-1' : 'col-span-1'
                }`}
                style={{ background: color ? color.soft : 'var(--color-surface)' }}
              >
                <div>
                  {n.subject && (
                    <p className="mb-1 text-xs font-semibold" style={{ color: color?.bg }}>
                      {n.subject}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                </div>
                <button onClick={() => remove(n.id)} className="mt-2 self-end text-[var(--color-ink-faint)]" aria-label="Löschen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Fab onClick={() => setOpen(true)} label="Notiz hinzufügen" />

      <Sheet open={open} onClose={() => setOpen(false)} title="Neue Notiz">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
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
                    background: subject === s.name ? colorFor(s.color).bg : colorFor(s.color).soft,
                    color: subject === s.name ? '#0a0a0f' : colorFor(s.color).bg,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Was möchtest du dir merken?"
            rows={4}
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3.5 text-[16px] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
          />
          <Button type="submit" className="mt-2 w-full">
            Speichern
          </Button>
        </form>
      </Sheet>
    </PageTransition>
  )
}
