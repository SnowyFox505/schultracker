import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRollout } from '../lib/rollout'
import { refreshApp } from '../lib/refreshApp'
import { UpdatingOverlay } from './UpdateFx'

function seen(version) {
  try {
    return localStorage.getItem('seenRolloutVersion') === version
  } catch {
    return true // storage unavailable — better to stay quiet than nag every load
  }
}
function markSeen(version) {
  try {
    localStorage.setItem('seenRolloutVersion', version)
  } catch {
    // ignore
  }
}

// Tells the user about a release Leopold has explicitly announced (see lib/rollout.js).
// Two flavours: if this tab is still running an older build, an actionable "update now"; if the
// service worker already silently updated it to the announced version, just an FYI toast.
export default function UpdateBanner() {
  const rollout = useRollout()
  const [dismissed, setDismissed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (rollout?.version) setDismissed(seen(rollout.version))
  }, [rollout?.version])

  if (!rollout?.version || dismissed) return null

  const alreadyApplied = __APP_VERSION__ === rollout.version

  function dismiss() {
    markSeen(rollout.version)
    setDismissed(true)
  }

  function update() {
    markSeen(rollout.version)
    setRefreshing(true)
    refreshApp()
  }

  return (
    <>
    <motion.div
      className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xl shadow-black/40 md:left-auto md:right-5 md:mx-0"
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-lg">
        {alreadyApplied ? '✓' : '✨'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-tight">
          {alreadyApplied ? 'App wurde automatisch aktualisiert' : 'Neue Version verfügbar'}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">
          {alreadyApplied ? `Du bist schon auf Version ${rollout.version}.` : `Version ${rollout.version} ist bereit.`}
        </p>
      </div>
      {alreadyApplied ? (
        <button type="button" onClick={dismiss} aria-label="Schließen" className="shrink-0 p-1 text-[var(--color-ink-faint)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={update}
            disabled={refreshing}
            className="rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-black disabled:opacity-60"
          >
            {refreshing ? '…' : 'Aktualisieren'}
          </button>
          <button type="button" onClick={dismiss} aria-label="Schließen" className="p-1 text-[var(--color-ink-faint)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
    <AnimatePresence>{refreshing && <UpdatingOverlay />}</AnimatePresence>
    </>
  )
}
