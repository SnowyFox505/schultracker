import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { NAV_ITEMS, SETTINGS_ITEM } from '../lib/navItems'
import { useSpinNavigate } from '../lib/useSpinNavigate'
import { SettingsIcon } from './navIcons'

export default function SideNav() {
  const { profile, requestLogout } = useAuth()
  const location = useLocation()
  const { spinning, trigger } = useSpinNavigate(SETTINGS_ITEM.to)
  const settingsActive = location.pathname.startsWith(SETTINGS_ITEM.to)

  return (
    <nav className="safe-top sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-8 md:flex lg:w-72">
      <div className="mb-10 px-2">
        <p className="font-[var(--font-display)] text-xl font-extrabold">Schultracker</p>
        {profile?.name && <p className="mt-0.5 text-sm text-[var(--color-ink-faint)]">Hey, {profile.name.split(' ')[0]}</p>}
      </div>

      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className="relative flex items-center gap-3 rounded-2xl px-3.5 py-3">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill-desktop"
                      className="absolute inset-0 rounded-2xl bg-[var(--color-surface-2)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <motion.span
                    key={isActive ? 'active' : 'inactive'}
                    initial={isActive ? { scale: 0.6, y: 3 } : false}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                    className={`relative z-10 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'}`}
                  >
                    <Icon />
                  </motion.span>
                  <span className={`relative z-10 text-[15px] font-medium ${isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-dim)]'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <a href={SETTINGS_ITEM.to} onClick={trigger} className="relative flex items-center gap-3 rounded-2xl px-3.5 py-3">
        {settingsActive && (
          <motion.div
            layoutId="nav-pill-desktop"
            className="absolute inset-0 rounded-2xl bg-[var(--color-surface-2)]"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <motion.span
          key={settingsActive ? 'active' : 'inactive'}
          initial={settingsActive ? { scale: 0.6, y: 3 } : false}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 14 }}
          className={`relative z-10 ${settingsActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'}`}
        >
          <SettingsIcon spinning={spinning} />
        </motion.span>
        <span className={`relative z-10 text-[15px] font-medium ${settingsActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-dim)]'}`}>
          {SETTINGS_ITEM.label}
        </span>
      </a>

      <button
        onClick={requestLogout}
        className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-medium text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Abmelden
      </button>
    </nav>
  )
}
