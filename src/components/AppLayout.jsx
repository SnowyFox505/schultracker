import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import IntroReveal from './IntroReveal'
import { SettingsIcon } from './navIcons'
import { useAuth } from '../context/AuthContext'
import { useSpinNavigate } from '../lib/useSpinNavigate'

export default function AppLayout() {
  const location = useLocation()
  const { profile, justOnboarded, clearJustOnboarded } = useAuth()
  const { spinning, trigger } = useSpinNavigate('/einstellungen')

  return (
    <div className="gradient-warm flex h-dvh w-full flex-col overflow-hidden md:h-auto md:min-h-dvh md:flex-row md:overflow-visible">
      <SideNav />
      <a
        href="/einstellungen"
        onClick={trigger}
        aria-label="Einstellungen"
        className="fixed right-5 top-[calc(env(safe-area-inset-top)+1.25rem)] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)]/80 text-[var(--color-ink-dim)] backdrop-blur-xl md:hidden"
      >
        <SettingsIcon spinning={spinning} />
      </a>
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
    </div>
  )
}
