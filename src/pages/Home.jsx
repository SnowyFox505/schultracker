import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { useCollection } from '../lib/useCollection'
import { DEFAULT_PERIODS, JS_DAY_TO_WEEKDAY, colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Card from '../components/ui/Card'

export default function Home() {
  const { profile } = useAuth()
  const customColors = profile?.customColors || []
  const { lessons } = useSchedule()
  const { items: homework } = useCollection('homework', { order: 'dueDate', direction: 'asc' })
  const { items: tests } = useCollection('tests', { order: 'date', direction: 'asc' })

  const todayKey = JS_DAY_TO_WEEKDAY[new Date().getDay()]
  const todayLessons = todayKey
    ? DEFAULT_PERIODS.map(({ period }) => lessons[`${todayKey}-${period}`]).filter(Boolean)
    : []

  const openHomework = homework.filter((h) => !h.done).slice(0, 4)
  const upcomingTests = tests.filter((t) => daysUntil(t.date) >= 0 && daysUntil(t.date) <= 21).slice(0, 3)

  return (
    <PageTransition>
      <p className="text-base font-semibold text-[var(--color-ink-dim)] md:text-lg">{greeting()}</p>
      <h1 className="mb-7 font-[var(--font-display)] text-4xl font-extrabold leading-tight md:mb-10 md:text-5xl">
        {profile?.name?.split(' ')[0] || 'Hey'}
      </h1>

      <div className="md:grid md:grid-cols-3 md:items-start md:gap-6">
      <Section title="Heute" linkTo="/stundenplan">
        {!todayKey ? (
          <EmptyNote text="Heute ist Wochenende 🎉" />
        ) : todayLessons.length === 0 ? (
          <EmptyNote text="Keine Stunden eingetragen." />
        ) : (
          <div className="flex flex-col gap-2">
            {todayLessons.map((l, i) => {
              const color = colorFor(l.color, customColors)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5"
                >
                  <span className="h-9 w-1 rounded-full" style={{ background: color.bg }} />
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold">{l.subject}</p>
                    {l.room && <p className="text-xs text-[var(--color-ink-faint)]">{l.room}</p>}
                  </div>
                  <span className="text-xs font-medium text-[var(--color-ink-faint)]">{l.period}. Stunde</span>
                </motion.div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Fällige Aufgaben" linkTo="/hausaufgaben">
        {openHomework.length === 0 ? (
          <EmptyNote text="Alles erledigt. Nice." />
        ) : (
          <div className="flex flex-col gap-2">
            {openHomework.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                <div className="flex-1">
                  {h.subject && <p className="text-xs font-semibold text-[var(--color-accent)]">{h.subject}</p>}
                  <p className="text-[15px]">{h.title}</p>
                </div>
                <span className="text-xs text-[var(--color-ink-faint)]">{formatDate(h.dueDate)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Anstehende Tests" linkTo="/pruefungen">
        {upcomingTests.length === 0 ? (
          <EmptyNote text="Keine Tests in Sicht." />
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingTests.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">{t.subject || 'Allgemein'}</p>
                  {t.topic && <p className="text-xs text-[var(--color-ink-faint)]">{t.topic}</p>}
                </div>
                <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-accent)]">
                  {daysUntil(t.date) === 0 ? 'Heute' : `in ${daysUntil(t.date)}T`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
      </div>
    </PageTransition>
  )
}

function Section({ title, linkTo, children }) {
  return (
    <div className="mb-7 md:mb-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link to={linkTo} className="text-sm font-medium text-[var(--color-ink-faint)]">
          Alle →
        </Link>
      </div>
      {children}
    </div>
  )
}

function EmptyNote({ text }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2.5">
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink-faint)]"
          animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.35, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-sm text-[var(--color-ink-faint)]">{text}</span>
      </div>
    </Card>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Guten Morgen'
  if (h < 17) return 'Hey'
  return 'Guten Abend'
}

function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
