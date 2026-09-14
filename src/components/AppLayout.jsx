import { AnimatePresence } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import IntroReveal from './IntroReveal'
import { SettingsIcon } from './navIcons'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const location = useLocation()
  const { profile, justOnboarded, clearJustOnboarded } = useAuth()

  return (
    <div className="gradient-warm min-h-screen w-full md:flex">
      <SideNav />
      <Link
        to="/einstellungen"
        aria-label="Einstellungen"
        className="safe-top fixed right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)]/80 text-[var(--color-ink-dim)] backdrop-blur-xl md:hidden"
      >
        <SettingsIcon />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="safe-top mx-auto w-full max-w-md px-5 pb-28 pt-6 md:max-w-3xl md:px-10 md:pb-16 md:pt-12 lg:max-w-5xl xl:max-w-6xl">
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
