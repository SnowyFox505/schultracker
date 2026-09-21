import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { colorFor } from '../lib/constants'
import { compressImage } from '../lib/imageCompress'
import { dueLabel, progress, sharingMode, useProjects } from '../lib/projects'
import PageTransition from '../components/PageTransition'
import Sheet from '../components/Sheet'
import Button from '../components/ui/Button'
import { flyIn } from '../components/Shine'

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

function normalizeUrl(raw) {
  const u = raw.trim()
  if (!u) return ''
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

const inputCls =
  'min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[16px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]'

export default function ProjektDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { items, loading, update, remove, setSharing, bubbleId } = useProjects()
  const project = items.find((p) => p.id === id)
  const [members, setMembers] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!bubbleId) return
    return onSnapshot(doc(db, 'bubbles', bubbleId), (snap) => setMembers(snap.data()?.memberNames || {}))
  }, [bubbleId])

  if (!project) {
    return (
      <PageTransition>
        <BackLink />
        <p className="mt-6 text-center text-[var(--color-ink-faint)]">{loading ? 'Lädt …' : 'Dieses Projekt gibt es nicht (mehr).'}</p>
      </PageTransition>
    )
  }

  const uid = user?.uid
  const isOwner = !project.ownerUid || project.ownerUid === uid
  const editable = !project.archived
  const color = colorFor(project.color, profile?.customColors || [])
  const { total, pct } = progress(project)
  const mode = sharingMode(project)
  const others = Object.entries(members).filter(([memberUid]) => memberUid !== uid)

  async function safe(fn) {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  async function removeProject() {
    setConfirmDelete(false)
    navigate('/projekte')
    await remove(project)
  }

  return (
    <PageTransition>
      <BackLink />

      <motion.div {...flyIn(0)} className="mb-5 flex items-start gap-3.5 pr-24 md:pr-0">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: color.soft }}>
          {project.emoji || '📁'}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-[var(--font-display)] text-2xl font-extrabold leading-tight md:text-3xl">{project.name}</h1>
          <p className="mt-0.5 text-sm text-[var(--color-ink-faint)]">
            {project.archived ? `Archiv, von ${project.archivedFrom || 'jemandem'}, nur lesen` : dueLabel(project.dueDate)}
            {!project.archived && project.shared && !isOwner && ` · von ${project.ownerName}`}
          </p>
        </div>
      </motion.div>

      {total > 0 && (
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <motion.div className="h-full rounded-full" style={{ background: color.bg }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      )}

      {editable && (
        <Block title="Abgabe" i={1}>
          <input
            type="date"
            value={project.dueDate || ''}
            onChange={(e) => update(project, { dueDate: e.target.value || null })}
            className={`${inputCls} w-full flex-none`}
          />
        </Block>
      )}

      <Tasks project={project} editable={editable} update={update} color={color} i={2} />
      <Dates project={project} editable={editable} update={update} color={color} i={3} />
      <Links project={project} editable={editable} update={update} i={4} />
      <Photo project={project} editable={editable} update={update} onOpen={() => setLightbox(true)} i={5} />
      <Notes project={project} editable={editable} update={update} i={6} />

      {editable && isOwner && (
        <Block title="Teilen" i={7}>
          {!bubbleId ? (
            <p className="text-sm text-[var(--color-ink-dim)]">
              Tritt einer Bubble bei, um Projekte zu teilen. <Link to="/bubble" className="font-semibold text-[var(--color-accent)]">Zur Bubble</Link>
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['private', 'Nur ich'],
                  ['all', 'Ganze Bubble'],
                  ['some', 'Bestimmte'],
                ].map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    disabled={busy}
                    onClick={() => safe(() => setSharing(project, m, m === 'some' ? others.map(([u]) => u).slice(0, 1) : []))}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                      mode === m ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-ink-dim)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {mode === 'some' && (
                <div className="mt-3 flex flex-col gap-2">
                  {others.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Es sind noch keine anderen in deiner Bubble.</p>}
                  {others.map(([memberUid, name]) => {
                    const on = (project.visibleTo || []).includes(memberUid)
                    return (
                      <button
                        key={memberUid}
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          safe(() =>
                            setSharing(
                              project,
                              'some',
                              on ? (project.visibleTo || []).filter((u) => u !== memberUid && u !== uid) : [...(project.visibleTo || []), memberUid]
                            )
                          )
                        }
                        className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-2)] px-3.5 py-2.5 text-left"
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 text-xs text-black ${on ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                          {on ? '✓' : ''}
                        </span>
                        <span className="text-[15px] font-medium">{name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
                Wer Zugriff hat, kann alles bearbeiten. Nur du kannst das Projekt löschen oder die Freigabe ändern.
              </p>
            </>
          )}
        </Block>
      )}

      <div className="mt-8 text-center">
        <button type="button" onClick={() => (isOwner || project.archived ? setConfirmDelete(true) : removeProject())} className="text-sm font-medium text-[var(--color-ink-faint)] active:text-[#ff6b81]">
          {isOwner || project.archived ? 'Projekt löschen' : 'Für mich ausblenden'}
        </button>
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Projekt löschen?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          „{project.name}“ wird gelöscht{project.shared ? ', auch bei allen, mit denen du es geteilt hast' : ''}. Das lässt sich nicht rückgängig machen.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setConfirmDelete(false)} className="flex-1">
            Abbrechen
          </Button>
          <Button type="button" onClick={removeProject} className="flex-1">
            Löschen
          </Button>
        </div>
      </Sheet>

      <AnimatePresence>
        {lightbox && project.photo && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <img src={project.photo} alt="" className="max-h-full max-w-full rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function BackLink() {
  return (
    <Link to="/projekte" className="mb-3 -ml-1 flex items-center gap-1 text-sm font-medium text-[var(--color-ink-faint)] active:opacity-70">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,5 8,12 15,19" />
      </svg>
      Projekte
    </Link>
  )
}

function Block({ title, i = 0, children }) {
  return (
    <motion.section {...flyIn(i)} className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">{title}</h2>
      {children}
    </motion.section>
  )
}

function AddRow({ children, onAdd, disabled }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onAdd()
      }}
      className="mt-3 flex items-end gap-2"
    >
      {children}
      <button type="submit" disabled={disabled} aria-label="Hinzufügen" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-xl font-bold text-black disabled:opacity-40">
        +
      </button>
    </form>
  )
}

function RemoveX({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Entfernen" className="shrink-0 p-1 text-[var(--color-ink-faint)]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="6" y1="18" x2="18" y2="6" />
      </svg>
    </button>
  )
}

function Tasks({ project, editable, update, color, i }) {
  const [text, setText] = useState('')
  const tasks = project.tasks || []
  const save = (next) => update(project, { tasks: next })
  return (
    <Block title="Aufgaben" i={i}>
      {tasks.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Noch keine Aufgaben.</p>}
      <div className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 py-1.5">
              <motion.button
                type="button"
                disabled={!editable}
                whileTap={{ scale: 0.85 }}
                onClick={() => save(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                aria-label="Erledigt umschalten"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                style={t.done ? { background: color.bg, borderColor: color.bg } : { borderColor: 'var(--color-border)' }}
              >
                {t.done && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <motion.polyline points="4,12 9,17 20,6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
                  </svg>
                )}
              </motion.button>
              <span className={`min-w-0 flex-1 break-words text-[15px] ${t.done ? 'text-[var(--color-ink-faint)] line-through' : ''}`}>{t.text}</span>
              {editable && <RemoveX onClick={() => save(tasks.filter((x) => x.id !== t.id))} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {editable && (
        <AddRow
          disabled={!text.trim()}
          onAdd={() => {
            save([...tasks, { id: newId(), text: text.trim(), done: false }])
            setText('')
          }}
        >
          <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Neue Aufgabe" maxLength={120} />
        </AddRow>
      )}
    </Block>
  )
}

function Dates({ project, editable, update, color, i }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const dates = [...(project.dates || [])].sort((a, b) => a.date.localeCompare(b.date))
  const save = (next) => update(project, { dates: next })
  return (
    <Block title="Wichtige Daten" i={i}>
      {dates.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Noch keine Daten.</p>}
      <div className="flex flex-wrap gap-2">
        {dates.map((d) => (
          <span key={d.id} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium" style={{ background: color.soft, color: color.bg }}>
            {d.title}: {formatDate(d.date)}
            {editable && (
              <button type="button" onClick={() => save((project.dates || []).filter((x) => x.id !== d.id))} aria-label="Entfernen" className="text-base leading-none opacity-70">
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {editable && (
        <AddRow
          disabled={!title.trim() || !date}
          onAdd={() => {
            save([...(project.dates || []), { id: newId(), title: title.trim(), date }])
            setTitle('')
            setDate('')
          }}
        >
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Dreh" maxLength={40} />
          <input type="date" className={`${inputCls} max-w-[9.5rem]`} value={date} onChange={(e) => setDate(e.target.value)} />
        </AddRow>
      )}
    </Block>
  )
}

function Links({ project, editable, update, i }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const links = project.links || []
  const save = (next) => update(project, { links: next })
  return (
    <Block title="Links" i={i}>
      {links.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">Noch keine Links.</p>}
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <div key={l.id} className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-2)] px-3.5 py-2.5">
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{l.title || l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
              <span className="block truncate text-xs text-[var(--color-ink-faint)]">{l.url.replace(/^https?:\/\//, '')}</span>
            </a>
            <span className="text-[var(--color-ink-faint)]">↗</span>
            {editable && <RemoveX onClick={() => save(links.filter((x) => x.id !== l.id))} />}
          </div>
        ))}
      </div>
      {editable && (
        <AddRow
          disabled={!url.trim()}
          onAdd={() => {
            save([...links, { id: newId(), title: title.trim(), url: normalizeUrl(url) }])
            setTitle('')
            setUrl('')
          }}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel (optional)" maxLength={60} />
            <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Adresse, z. B. youtube.com" inputMode="url" autoCapitalize="none" />
          </div>
        </AddRow>
      )}
    </Block>
  )
}

function Photo({ project, editable, update, onOpen, i }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!project.photo && !editable) return null
  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      await update(project, { photo: await compressImage(file) })
    } catch {
      setError('Das Foto konnte nicht gespeichert werden.')
    }
    setBusy(false)
  }
  return (
    <Block title="Foto" i={i}>
      {project.photo ? (
        <div className="relative">
          <button type="button" onClick={onOpen} className="block w-full">
            <img src={project.photo} alt="Projektfoto" className="max-h-64 w-full rounded-xl object-cover" />
          </button>
          {editable && (
            <button type="button" onClick={() => update(project, { photo: null })} className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
              Entfernen
            </button>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-5 text-sm font-medium text-[var(--color-ink-dim)]">
          {busy ? 'Wird gespeichert …' : '📷 Foto hinzufügen (1)'}
          <input type="file" accept="image/*" className="hidden" onChange={pick} />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-[#ff6b81]">{error}</p>}
    </Block>
  )
}

function Notes({ project, editable, update, i }) {
  const [text, setText] = useState(project.notes || '')
  const lastSaved = useRef(project.notes || '')
  const timer = useRef(null)

  // pick up changes from other people, unless we're mid-edit
  useEffect(() => {
    if ((project.notes || '') !== lastSaved.current && text === lastSaved.current) {
      setText(project.notes || '')
      lastSaved.current = project.notes || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.notes])

  useEffect(() => () => clearTimeout(timer.current), [])

  function save(value) {
    if (value === lastSaved.current) return
    lastSaved.current = value
    update(project, { notes: value })
  }

  return (
    <Block title="Notizen" i={i}>
      <textarea
        value={text}
        readOnly={!editable}
        onChange={(e) => {
          setText(e.target.value)
          clearTimeout(timer.current)
          const v = e.target.value
          timer.current = setTimeout(() => save(v), 700)
        }}
        onBlur={() => save(text)}
        rows={5}
        placeholder="Ideen, Material, was du nicht vergessen willst …"
        className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-[16px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
      />
    </Block>
  )
}
