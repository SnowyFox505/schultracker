import { Link } from 'react-router-dom'
import PageTransition from './PageTransition'

export default function SubPage({ title, children }) {
  return (
    <PageTransition>
      <Link
        to="/einstellungen"
        className="mb-3 -ml-1 flex items-center gap-1 text-sm font-medium text-[var(--color-ink-faint)] active:opacity-70"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,5 8,12 15,19" />
        </svg>
        Einstellungen
      </Link>
      <h1 className="mb-6 pr-28 font-[var(--font-display)] text-3xl font-extrabold md:pr-0 md:text-4xl">{title}</h1>
      {children}
    </PageTransition>
  )
}
