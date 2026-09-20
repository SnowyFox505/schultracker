import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import { BubbleIcon } from '../components/navIcons'

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const PaletteIcon = () => (
  <svg {...svg}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1.4-1.3-1.5-1.3-2.7 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="11" cy="7" r="1" />
    <circle cx="16" cy="8.5" r="1" />
  </svg>
)
const BellIcon = () => (
  <svg {...svg}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)
const RefreshIcon = () => (
  <svg {...svg}>
    <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" />
  </svg>
)
const UserIcon = () => (
  <svg {...svg}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
  </svg>
)

export default function Settings() {
  const { user, profile } = useAuth()
  const subjectCount = (profile?.subjects || []).length
  const push = profile?.push || {}
  const pushLabel = push.enabled ? `An, ${push.homework?.time || '18:00'} Uhr` : 'Aus'
  const bubbleLabel = profile?.bubbleId ? `Code ${profile.bubbleId}` : 'Nicht beigetreten'

  return (
    <PageTransition>
      <h1 className="mb-6 pr-28 font-[var(--font-display)] text-3xl font-extrabold md:pr-0 md:text-4xl">Einstellungen</h1>

      <div className="mb-6 flex items-center gap-3.5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-lg font-extrabold text-black">
          {(profile?.name || '?').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold" style={{ color: '#ff7c3a' }}>{profile?.name || 'Du'}</p>
          <p className="truncate text-sm text-[var(--color-ink-faint)]">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Row to="/einstellungen/faecher" icon={<PaletteIcon />} title="Fächer und Farben" hint={`${subjectCount} ${subjectCount === 1 ? 'Fach' : 'Fächer'}`} />
        <Row to="/einstellungen/benachrichtigungen" icon={<BellIcon />} title="Benachrichtigungen" hint={pushLabel} />
        <Row to="/bubble" icon={<BubbleIcon />} title="Bubble" hint={bubbleLabel} />
        <Row to="/einstellungen/app" icon={<RefreshIcon />} title="App aktualisieren" hint="Neueste Version holen" />
        <Row to="/einstellungen/account" icon={<UserIcon />} title="Account" hint="Abmelden, Konto löschen" />
      </div>

      <p className="mt-10 text-center text-xs text-[var(--color-ink-faint)]">Developer: Leopold N.</p>
      <p className="mt-1 text-center text-[11px] text-[var(--color-ink-faint)]">Version {__APP_VERSION__} · {__BUILD_LABEL__}</p>
    </PageTransition>
  )
}

function Row({ to, icon, title, hint }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition-transform active:scale-[0.985]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="block truncate text-xs text-[var(--color-ink-faint)]">{hint}</span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-ink-faint)]">
        <polyline points="9,5 16,12 9,19" />
      </svg>
    </Link>
  )
}
