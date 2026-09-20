import SubPage from '../components/SubPage'
import { CHANGELOG } from '../lib/changelog'

export default function SettingsUpdates() {
  return (
    <SubPage title="Was ist neu">
      <div className="flex flex-col gap-3">
        {CHANGELOG.map((entry, i) => (
          <div
            key={entry.version}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
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
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[var(--color-ink-dim)]">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SubPage>
  )
}
