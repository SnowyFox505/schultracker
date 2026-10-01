import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTests } from '../lib/useTests'
import { useSavedToast } from '../lib/useSavedToast'
import { colorFor } from '../lib/constants'
import { compressImage } from '../lib/imageCompress'
import { buildIcs, openIcsImport } from '../lib/ics'
import PageTransition from '../components/PageTransition'
import Fab from '../components/Fab'
import Sheet from '../components/Sheet'
import SavedToast from '../components/SavedToast'
import EmptyState from '../components/EmptyState'
import SwipeToDelete from '../components/SwipeToDelete'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const MAX_PHOTOS = 4

export default function Pruefungen() {
  const { profile } = useAuth()
  const { items, add, update, remove } = useTests()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [kind, setKind] = useState('test')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [date, setDate] = useState('')
  const [photos, setPhotos] = useState([])
  const [viewing, setViewing] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [showSaved, triggerSaved] = useSavedToast()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(() => new Set())

  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []

  function toggleSelectMode() {
    setSelectMode((v) => !v)
    setSelected(new Set())
  }

  function toggleSelected(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function exportSelected() {
    const toExport = items.filter((i) => selected.has(i.id))
    if (!toExport.length) return
    openIcsImport(buildIcs(toExport))
    setSelectMode(false)
    setSelected(new Set())
  }

  function openAdd() {
    setEditingId(null)
    setKind('test')
    setSubject('')
    setTopic('')
    setDate('')
    setPhotos([])
    setOpen(true)
  }

  function openEdit(test) {
    setEditingId(test.id)
    setKind(test.kind || 'test')
    setSubject(test.subject || '')
    setTopic(test.topic || '')
    setDate(test.date)
    setPhotos(test.photos || [])
    setOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date) return
    if (editingId) {
      await update(items.find((i) => i.id === editingId), { kind, subject, topic: topic.trim(), date, photos })
    } else {
      await add({ kind, subject, topic: topic.trim(), date, photos })
    }
    setKind('test')
    setSubject('')
    setTopic('')
    setDate('')
    setPhotos([])
    setEditingId(null)
    setOpen(false)
    triggerSaved()
  }

  async function addPhotos(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length)
    e.target.value = ''
    if (!files.length) return
    setPhotoBusy(true)
    try {
      const done = await Promise.all(files.map((f) => compressImage(f)))
      setPhotos((p) => [...p, ...done].slice(0, MAX_PHOTOS))
    } catch {
      // unreadable image — ignore
    }
    setPhotoBusy(false)
  }

  return (
    <>
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-y-2 pr-28 md:pr-0">
        <h1 className="font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Tests / Termine</h1>
        {items.length > 0 && (
          <button
            onClick={toggleSelectMode}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selectMode ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-ink-dim)]'
            }`}
          >
            {selectMode ? 'Fertig' : 'Auswählen'}
          </button>
        )}
      </div>

      {items.length === 0 && (
        <EmptyState className="mt-6" text="Keine anstehenden Tests oder Termine. Trag welche ein, sobald sie anstehen." />
      )}

      <div className="flex flex-col gap-2.5 pb-20 md:grid md:grid-cols-2 md:gap-3 md:pb-0">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <TestRow
              key={t.id}
              test={t}
              subjects={subjects}
              customColors={customColors}
              onDelete={() => remove(t)}
              onEdit={() => openEdit(t)}
              onPhoto={setViewing}
              selectMode={selectMode}
              selected={selected.has(t.id)}
              onToggleSelect={() => toggleSelected(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </PageTransition>

      <AnimatePresence>{showSaved && <SavedToast text="Gespeichert" />}</AnimatePresence>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xl shadow-black/40 md:bottom-5 md:left-auto md:right-5 md:mx-0"
          >
            <span className="pl-1 text-sm font-medium text-[var(--color-ink-dim)]">{selected.size} ausgewählt</span>
            <Button onClick={exportSelected} className="!w-auto !px-4 !py-2 text-sm">
              In Kalender exportieren
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectMode && <Fab onClick={openAdd} label="Test/Termin hinzufügen" />}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? (kind === 'termin' ? 'Termin bearbeiten' : 'Test bearbeiten') : kind === 'termin' ? 'Neuer Termin' : 'Neuer Test'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind('test')}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
              style={{
                background: kind === 'test' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                color: kind === 'test' ? '#0a0a0f' : 'var(--color-ink-dim)',
              }}
            >
              📝 Test
            </button>
            <button
              type="button"
              onClick={() => setKind('termin')}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
              style={{
                background: kind === 'termin' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                color: kind === 'termin' ? '#0a0a0f' : 'var(--color-ink-dim)',
              }}
            >
              📅 Termin
            </button>
          </div>
          {subjects.length > 0 ? (
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
          ) : (
            <Input label="Fach" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Mathe" />
          )}
          <Input label="Thema (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Quadratische Gleichungen" />
          <Input label="Datum" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <div>
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink-dim)]">Fotos (optional)</span>
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative h-16 w-16">
                  <img src={src} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <button
                    type="button"
                    aria-label="Foto entfernen"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b81] text-xs font-bold text-black"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-2xl text-[var(--color-ink-faint)] active:opacity-70">
                  {photoBusy ? '…' : '📷'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
                </label>
              )}
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">Bis zu {MAX_PHOTOS} Fotos, werden verkleinert gespeichert.</p>
          </div>
          <Button type="submit" className="mt-2 w-full">
            {editingId ? 'Speichern' : kind === 'termin' ? 'Termin hinzufügen' : 'Test hinzufügen'}
          </Button>
        </form>
      </Sheet>

      <AnimatePresence>
        {viewing && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewing(null)}
          >
            <img src={viewing} alt="" className="max-h-full max-w-full rounded-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function TestRow({ test, subjects, customColors, onDelete, onEdit, onPhoto, selectMode, selected, onToggleSelect }) {
  const subjMeta = subjects.find((s) => s.name === test.subject)
  const color = subjMeta ? colorFor(subjMeta.color, customColors) : colorFor('orange', customColors)
  const daysLeft = daysUntil(test.date)
  const urgent = daysLeft === 0 || daysLeft === 1

  const row = (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      {selectMode && (
        <button
          type="button"
          onClick={onToggleSelect}
          aria-label={selected ? 'Auswahl entfernen' : 'Auswählen'}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
          }`}
        >
          {selected && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      )}
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: color.soft }}>
        <span className="text-[10px] font-semibold uppercase" style={{ color: color.bg }}>
          {monthShort(test.date)}
        </span>
        <span className="text-base font-bold" style={{ color: color.bg }}>
          {dayOfMonth(test.date)}
        </span>
      </div>
      <button type="button" onClick={selectMode ? onToggleSelect : onEdit} className="min-w-0 flex-1 text-left">
        <p className="text-[15px] font-semibold">
          {test.subject || 'Allgemein'}
          {test.kind === 'termin' && <span className="ml-1.5 text-[11px] font-medium text-[var(--color-ink-faint)]">· Termin</span>}
        </p>
        {test.topic && <p className="truncate text-sm text-[var(--color-ink-dim)]">{test.topic}</p>}
        {test.photos?.length > 0 && (
          <div className="mt-1.5 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {test.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                onClick={(e) => {
                  e.stopPropagation()
                  onPhoto(src)
                }}
                className="h-9 w-9 cursor-pointer rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </button>
      <div className="flex flex-col items-end gap-1">
        <motion.span
          animate={urgent ? { scale: [1, 1.09, 1] } : {}}
          transition={urgent ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
          className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: color.soft, color: color.bg }}
        >
          {daysLeft === 0 ? 'Heute' : daysLeft === 1 ? 'Morgen' : daysLeft > 0 ? `in ${daysLeft} Tagen` : 'vorbei'}
        </motion.span>
        {!selectMode && (
          <button onClick={onDelete} aria-label="Löschen" className="text-[var(--color-ink-faint)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
    >
      {selectMode ? row : <SwipeToDelete onDelete={onDelete}>{row}</SwipeToDelete>}
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
