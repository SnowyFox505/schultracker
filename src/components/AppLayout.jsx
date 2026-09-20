import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import IntroReveal from './IntroReveal'
import LoggingOutOverlay from './LoggingOutOverlay'
import Sheet from './Sheet'
import Button from './ui/Button'
import { BubbleIcon, SettingsIcon } from './navIcons'
import { UpdatedBurst } from './UpdateFx'
import { useAuth } from '../context/AuthContext'
import { useSpinNavigate } from '../lib/useSpinNavigate'

export default function AppLayout() {
  const location = useLocation()
  const { profile, justOnboarded, clearJustOnboarded, logoutFlow, cancelLogout, beginLogout, logout } = useAuth()
  const { spinning, trigger } = useSpinNavigate('/einstellungen')
  const [justUpdated, setJustUpdated] = useState(() => {
    try {
      const v = sessionStorage.getItem('justUpdated') === '1'
      sessionStorage.removeItem('justUpdated')
      return v
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!justUpdated) return
    const t = setTimeout(() => setJustUpdated(false), 3000)
    return () => clearTimeout(t)
  }, [justUpdated])

  return (
    <div className="gradient-warm flex h-[var(--app-height,100dvh)] w-full flex-col overflow-hidden md:h-auto md:min-h-dvh md:flex-row md:overflow-visible">
      <SideNav />
      <a
        href="/einstellungen"
        onClick={trigger}
        aria-label="Einstellungen"
        className="fixed right-5 top-[calc(env(safe-area-inset-top)+1.25rem)] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)]/80 text-[var(--color-ink-dim)] backdrop-blur-xl md:hidden"
      >
        <SettingsIcon spinning={spinning} />
      </a>
      <Link
        to="/bubble"
        aria-label="Bubble"
        className={`fixed right-[4.5rem] top-[calc(env(safe-area-inset-top)+1.25rem)] z-30 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl md:hidden ${
          location.pathname === '/bubble'
            ? 'bg-[var(--color-accent)] text-black'
            : 'bg-[var(--color-surface)]/80 text-[var(--color-ink-dim)]'
        }`}
      >
        <BubbleIcon />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto md:overflow-visible">
        <div className="safe-top mx-auto w-full max-w-md px-5 pb-6 pt-6 md:max-w-3xl md:px-10 md:pb-16 md:pt-12 lg:max-w-5xl xl:max-w-6xl">
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav />

      <AnimatePresence>
        {justOnboarded && (
          <IntroReveal
            name={justOnboarded.name}
            subjects={justOnboarded.subjects}
            customColors={profile?.customColors || []}
            onDone={clearJustOnboarded}
          />
        )}
      </AnimatePresence>

      <Sheet open={logoutFlow === 'confirm'} onClose={cancelLogout} title="Wirklich abmelden?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Du wirst ausgeloggt und musst dich beim nächsten Mal wieder anmelden.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={cancelLogout} className="flex-1">
            Abbrechen
          </Button>
          <Button type="button" onClick={beginLogout} className="flex-1">
            Ja, abmelden
          </Button>
        </div>
      </Sheet>

      <AnimatePresence>{justUpdated && <UpdatedBurst />}</AnimatePresence>

      <AnimatePresence>
        {logoutFlow === 'running' && <LoggingOutOverlay name={profile?.name} onDone={logout} />}
      </AnimatePresence>
    </div>
  )
}
