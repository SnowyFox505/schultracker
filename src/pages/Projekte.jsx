import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { colorFor, SUBJECT_COLORS } from '../lib/constants'
import { dueLabel, progress, useProjects } from '../lib/projects'
import PageTransition from '../components/PageTransition'
import Fab from '../components/Fab'
import Sheet from '../components/Sheet'
import EmptyState from '../components/EmptyState'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { flyIn } from '../components/Shine'

export const EMOJIS = ['🎬', '📊', '📚', '🧪', '🎨', '💻', '🌍', '✏️', '🎵', '🏃']

export default function Projekte() {
  const { user, profile } = useAuth()
  const { items, loading, add } = useProjects()
  const navigate = useNavigate()
  const customColors = profile?.customColors || []
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [color, setColor] = useState(SUBJECT_COLORS[0].id)
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)

  const active = items.filter((p) => !p.archived)
  const archived = items.filter((p) => p.archived)

  function openNew() {
    setName('')
    setEmoji(EMOJIS[0])
    setColor(SUBJECT_COLORS[0].id)
    setDueDate('')
    setOpen(true)
  }

  async function create(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      const id = await add({ name: name.trim(), emoji, color, dueDate: dueDate || null })
      setOpen(false)
      navigate(`/projekte/${id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
    <PageTransition>
      <h1 className="mb-6 pr-28 font-[var(--font-display)] text-3xl font-extrabold md:pr-0 md:text-4xl">Projekte</h1>

      {!loading && active.length === 0 && <EmptyState className="mt-6" text="Noch kein Projekt. Leg dein erstes an." />}

      <div className="flex flex-col gap-3">
        {active.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} uid={user?.uid} customColors={customColors} />
        ))}
      </div>

      {archived.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Archiv, nur lesen</h2>
          <div className="flex flex-col gap-3 opacity-80">
            {archived.map((p, i) => (
              <ProjectCard key={p.id} p={p} i={i} uid={user?.uid} customColors={customColors} />
            ))}
          </div>
        </section>
      )}

    </PageTransition>

      <Fab onClick={openNew} label="Neues Projekt" />

      <Sheet open={open} onClose={() => setOpen(false)} title="Neues Projekt">
        <form onSubmit={create} className="flex flex-col gap-5">
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Deutsch: Film drehen" maxLength={60} />
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-ink-dim)]">Symbol</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
                    emoji === em ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border)]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-ink-dim)]">Farbe</p>
            <div className="flex flex-wrap gap-2.5">
              {[...SUBJECT_COLORS, ...customColors].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.id}
                  onClick={() => setColor(c.id)}
                  className={`h-8 w-8 rounded-full border-2 ${color === c.id ? 'border-white' : 'border-transparent'}`}
                  style={{ background: c.bg }}
                />
              ))}
            </div>
          </div>
          <Input label="Abgabe (optional)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Button type="submit" disabled={busy || !name.trim()} className="w-full">
            Projekt anlegen
          </Button>
        </form>
      </Sheet>
    </>
  )
}

function ProjectCard({ p, i, uid, customColors }) {
  const color = colorFor(p.color, customColors)
  const { total, done, pct } = progress(p)
  const foreign = p.ownerUid && p.ownerUid !== uid
  return (
    <motion.div {...flyIn(i)}>
      <Link
        to={`/projekte/${p.id}`}
        className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform active:scale-[0.985]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: color.soft }}>
            {p.emoji || '📁'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold">{p.name}</span>
            <span className="block truncate text-xs text-[var(--color-ink-faint)]">
              {p.archived ? `Archiv, von ${p.archivedFrom || 'jemandem'}` : dueLabel(p.dueDate)}
              {!p.archived && p.shared && (foreign ? ` · von ${p.ownerName}` : ' · geteilt')}
            </span>
          </span>
        </div>
        {total > 0 && (
          <>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color.bg }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--color-ink-faint)]">
              {done} von {total} {total === 1 ? 'Aufgabe' : 'Aufgaben'} erledigt
            </p>
          </>
        )}
      </Link>
    </motion.div>
  )
}
