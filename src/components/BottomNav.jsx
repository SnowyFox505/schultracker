import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const items = [
  { to: '/', label: 'Heute', icon: HomeIcon },
  { to: '/stundenplan', label: 'Plan', icon: GridIcon },
  { to: '/hausaufgaben', label: 'Aufgaben', icon: TaskIcon },
  { to: '/pruefungen', label: 'Tests', icon: ClockIcon },
  { to: '/notizen', label: 'Notizen', icon: NoteIcon },
]

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-base)]/90 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={to === '/'} className="relative flex flex-col items-center gap-1 py-2">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-x-2 -top-1 bottom-0 rounded-2xl bg-[var(--color-surface-2)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'}`}>
                    <Icon />
                  </span>
                  <span
                    className={`relative z-10 text-[11px] font-medium ${
                      isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)]'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="10" x2="9" y2="22" />
    </svg>
  )
}
function TaskIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11.5 11 13.5 15.5 9" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}
function NoteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3.5h11L20 8v12.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M15 3.5V8a1 1 0 0 0 1 1h4" />
      <line x1="8" y1="13" x2="15" y2="13" />
      <line x1="8" y1="16.5" x2="13" y2="16.5" />
    </svg>
  )
}
