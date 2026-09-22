import { motion } from 'framer-motion'
import { useState } from 'react'
import SubPage from '../components/SubPage'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { ADMIN_EMAIL, announceRelease, useRollout } from '../lib/rollout'
import { CHANGELOG } from '../lib/changelog'

export default function SettingsUpdates() {
  const { user } = useAuth()
  const rollout = useRollout()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isAdmin = user?.email === ADMIN_EMAIL

  async function release() {
    setBusy(true)
    setError('')
    try {
      await announceRelease()
    } catch (err) {
      console.error(err)
      setError(`Hat nicht geklappt: ${err?.code || err?.message || 'unbekannter Fehler'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <SubPage title="Was ist neu">
      {isAdmin && (
        <div className="mb-6 rounded-2xl border border-dashed border-[var(--color-border)] p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Entwickler</p>
          <p className="mb-3 text-sm text-[var(--color-ink-dim)]">
            Diese Version: <strong>{__APP_VERSION__}</strong> · Für Nutzer freigegeben: <strong>{rollout?.version || 'noch keine'}</strong>
            <br />
            Angemeldet als: <strong>{user?.email}</strong>
          </p>
          <Button variant="secondary" onClick={release} disabled={busy || rollout?.version === __APP_VERSION__} className="w-full">
            {rollout?.version === __APP_VERSION__ ? 'Bereits freigegeben' : busy ? 'Wird freigegeben…' : 'Dieses Update jetzt ankündigen'}
          </Button>
          {error && <p className="mt-2 text-sm text-[#ff6b81]">{error}</p>}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {CHANGELOG.map((entry, i) => (
          <motion.div
            key={entry.version}
            className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            initial={{ opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: Math.min(i, 5) * 0.09 }}
          >
            {i === 0 && (
              <>
                {/* the newest entry glows once, and a shine sweeps across it */}
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[var(--color-accent)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 0] }}
                  transition={{ duration: 2.4, delay: 0.5, times: [0, 0.2, 0.6, 1] }}
                />
                <motion.span
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: '0%' }}
                  animate={{ x: '420%' }}
                  transition={{ duration: 1.1, delay: 0.7, ease: 'easeInOut' }}
                />
              </>
            )}
            <div className="mb-2 flex items-center gap-2.5">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  i === 0 ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                }`}
              >
                {entry.version}
              </span>
              <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{entry.title}</p>
              {entry.date && <span className="shrink-0 text-xs text-[var(--color-ink-faint)]">{entry.date}</span>}
            </div>
            <ul className="flex flex-col gap-1 pl-1">
              {entry.items.map((item, j) => (
                <motion.li
                  key={item}
                  className="flex gap-2 text-sm text-[var(--color-ink-dim)]"
                  initial={i === 0 ? { opacity: 0, x: -14 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + j * 0.12, duration: 0.4 }}
                >
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SubPage>
  )
}
