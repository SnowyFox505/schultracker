import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { SUBJECT_COLORS, colorFor } from '../lib/constants'
import { deleteAccountAndData } from '../lib/deleteAccount'
import PageTransition from '../components/PageTransition'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Sheet from '../components/Sheet'
import ColorPicker from '../components/ColorPicker'
import DeletingOverlay from '../components/DeletingOverlay'

export default function Settings() {
  const { user, profile, requestLogout, updateUserProfile, addCustomColor, removeCustomColor, hidePresetColor } = useAuth()
  const { lessons, setLesson } = useSchedule()
  const subjects = profile?.subjects || []
  const customColors = profile?.customColors || []
  const hiddenColors = profile?.hiddenColors || []

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(SUBJECT_COLORS[0].id)
  const [editingId, setEditingId] = useState(null)
  const [namingId, setNamingId] = useState(null)
  const [nameDraft, setNameDraft] = useState('')

  const [refreshing, setRefreshing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function addSubject() {
    const trimmed = newName.trim()
    if (!trimmed) return
    await updateUserProfile({
      subjects: [...subjects, { id: crypto.randomUUID(), name: trimmed, color: newColor }],
    })
    setNewName('')
    const palette = [...SUBJECT_COLORS.filter((c) => !hiddenColors.includes(c.id)), ...customColors]
    const usedColors = new Set([...subjects.map((s) => s.color), newColor])
    const nextColor = palette.find((c) => !usedColors.has(c.id)) || palette[0]
    setNewColor(nextColor.id)
  }

  async function removeSubject(id) {
    await updateUserProfile({ subjects: subjects.filter((s) => s.id !== id) })
  }

  function lessonsForSubject(name) {
    return Object.values(lessons).filter((l) => l.subject === name)
  }

  async function recolorSubject(id, color) {
    const subj = subjects.find((s) => s.id === id)
    await updateUserProfile({ subjects: subjects.map((s) => (s.id === id ? { ...s, color } : s)) })
    if (subj) {
      await Promise.all(
        lessonsForSubject(subj.name).map((l) => setLesson(l.day, l.period, { ...l, color }))
      )
    }
    setEditingId(null)
  }

  function startRename(s) {
    setNamingId(s.id)
    setNameDraft(s.name)
  }

  async function saveRename(id) {
    const trimmed = nameDraft.trim()
    const subj = subjects.find((s) => s.id === id)
    setNamingId(null)
    if (!trimmed || !subj || trimmed === subj.name) return
    await updateUserProfile({ subjects: subjects.map((s) => (s.id === id ? { ...s, name: trimmed } : s)) })
    await Promise.all(
      lessonsForSubject(subj.name).map((l) => setLesson(l.day, l.period, { ...l, subject: trimmed }))
    )
  }

  async function refreshApp() {
    setRefreshing(true)
    try {
      const regs = await navigator.serviceWorker?.getRegistrations()
      await Promise.all((regs || []).map((r) => r.unregister()))
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch {
      // still reload below
    }
    window.location.reload()
  }

  async function handleDelete(e) {
    e.preventDefault()
    if (!password) return
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteAccountAndData(user, password, {
        beforeAuthDelete: () => new Promise((resolve) => setTimeout(resolve, 3350)),
      })
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError('Falsches Passwort.')
      } else {
        setDeleteError('Löschen fehlgeschlagen. Versuch es nochmal.')
      }
      setDeleting(false)
    }
  }

  return (
    <>
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Einstellungen</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Fächer</h2>
        <Card className="!p-4">
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {subjects.map((s) => {
                const color = colorFor(s.color, customColors)
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-2)] px-3.5 py-3">
                      <button
                        onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                        className="h-6 w-6 shrink-0 rounded-full"
                        style={{ background: color.bg }}
                        aria-label="Farbe ändern"
                      />
                      {namingId === s.id ? (
                        <input
                          autoFocus
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          onBlur={() => saveRename(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.currentTarget.blur()
                            }
                            if (e.key === 'Escape') setNamingId(null)
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] px-2 py-1 text-[15px] font-medium text-[var(--color-ink)] outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startRename(s)}
                          className="flex-1 truncate text-left text-[15px] font-medium"
                        >
                          {s.name}
                        </button>
                      )}
                      <button onClick={() => removeSubject(s.id)} className="text-[var(--color-ink-faint)]" aria-label="Löschen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                      </button>
                    </div>
                    <AnimatePresence>
                      {editingId === s.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden px-1"
                        >
                          <ColorPicker
                            value={s.color}
                            onChange={(id) => recolorSubject(s.id, id)}
                            customColors={customColors}
                            hiddenColors={hiddenColors}
                            onAddCustom={addCustomColor}
                            onRemoveCustom={removeCustomColor}
                            onHidePreset={hidePresetColor}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {subjects.length === 0 && <p className="py-2 text-sm text-[var(--color-ink-faint)]">Noch keine Fächer angelegt.</p>}
          </div>

          <div className="mt-4 flex gap-2 border-t border-[var(--color-border)] pt-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Neues Fach"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              className="flex-1"
            />
            <Button variant="secondary" onClick={addSubject} className="px-4">
              +
            </Button>
          </div>
          <div className="mt-3 px-1">
            <ColorPicker
              value={newColor}
              onChange={setNewColor}
              customColors={customColors}
              hiddenColors={hiddenColors}
              onAddCustom={addCustomColor}
              onRemoveCustom={removeCustomColor}
              onHidePreset={hidePresetColor}
              size="sm"
            />
            <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Farbe lang drücken zum Löschen (Orange bleibt immer).</p>
          </div>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">App</h2>
        <Card className="!p-4">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
            Holt die neueste Version: leert den Zwischenspeicher und lädt die App neu. Deine Daten bleiben erhalten.
          </p>
          <Button variant="secondary" onClick={refreshApp} disabled={refreshing} className="w-full">
            {refreshing ? 'Lädt neu…' : 'App aktualisieren'}
          </Button>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Account</h2>
        <Card className="!p-4">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">{user?.email}</p>
          <Button variant="secondary" onClick={requestLogout} className="w-full">
            Abmelden
          </Button>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-[#ff6b81]">Gefahrenzone</h2>
        <Card className="!p-4 border-[#ff6b8140]">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
            Löscht deinen Account und alle Daten (Stundenplan, Hausaufgaben, Notizen, Tests) unwiderruflich.
          </p>
          <Button
            onClick={() => setDeleteOpen(true)}
            className="w-full !bg-none"
            style={{ background: '#ff6b81', color: '#0a0a0f' }}
          >
            Account löschen
          </Button>
        </Card>
      </section>

      <p className="mt-10 text-center text-xs text-[var(--color-ink-faint)]">Developer: Leopold N.</p>

      <Sheet open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title="Account wirklich löschen?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Das kann nicht rückgängig gemacht werden. Gib dein Passwort ein, um endgültig zu löschen.
        </p>
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <Input
            type="password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dein Passwort"
          />
          {deleteError && <p className="text-sm text-[#ff6b81]">{deleteError}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={deleting} className="flex-1" style={{ background: '#ff6b81', color: '#0a0a0f' }}>
              {deleting ? 'Löscht…' : 'Endgültig löschen'}
            </Button>
          </div>
        </form>
      </Sheet>
    </PageTransition>

      <AnimatePresence>{deleting && <DeletingOverlay />}</AnimatePresence>
    </>
  )
}
