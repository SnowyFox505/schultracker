import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from '../lib/navItems'

export default function BottomNav() {
  return (
    <nav className="safe-bottom shrink-0 border-t border-[var(--color-border)] bg-[var(--color-base)]/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {NAV_ITEMS.filter((item) => item.to !== '/bubble' && item.to !== '/projekte').map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={to === '/'} className="relative flex flex-col items-center gap-1 py-2">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill-mobile"
                      className="absolute inset-x-2 -top-1 bottom-0 rounded-2xl bg-[var(--color-surface-2)]"
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
                  <span
                    className={`relative z-10 text-center text-[11px] font-medium leading-tight ${
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
