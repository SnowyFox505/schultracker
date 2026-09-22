import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { useTests } from '../lib/useTests'
import { useHomework } from '../lib/useHomework'
import { dueLabel, progress, useProjects } from '../lib/projects'
import { DEFAULT_PERIODS, JS_DAY_TO_WEEKDAY, colorFor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Card from '../components/ui/Card'
import { TaskIcon, ClockIcon, GridIcon } from '../components/navIcons'
import { flyIn } from '../components/Shine'

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const periodRange = (period) => {
  const [start, end] = DEFAULT_PERIODS.find((p) => p.period === period).time.split('–')
  return { start: toMin(start), end: toMin(end) }
}

export default function Home() {
  const { profile } = useAuth()
  const customColors = profile?.customColors || []
  const { lessons } = useSchedule()
  const { items: homework } = useHomework()
  const { items: tests } = useTests()
  const { items: projects } = useProjects()

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayKeyRaw = JS_DAY_TO_WEEKDAY[now.getDay()]
  const todaysLessons = todayKeyRaw
    ? DEFAULT_PERIODS.map(({ period }) => lessons[`${todayKeyRaw}-${period}`]).filter(Boolean)
    : []

  // The lesson happening right now (if any) — only used to skip straight past a Doppelstunde's
  // second half, never shown itself: while sitting in a lesson you already know you're in it,
  // what's useful on the dashboard is what comes next.
  const currentLesson = todaysLessons.find((l) => nowMin >= periodRange(l.period).start && nowMin < periodRange(l.period).end) || null
  const futureToday = todaysLessons.filter((l) => periodRange(l.period).start > nowMin).sort((a, b) => a.period - b.period)
  const skipDoppelstunde = currentLesson && futureToday[0]?.subject === currentLesson.subject ? 1 : 0
  const nextTodayLesson = futureToday[skipDoppelstunde] || null

  const showTomorrow = !nextTodayLesson
  const displayDate = showTomorrow ? new Date(now.getTime() + 86400000) : now
  const heuteLabel = showTomorrow ? 'Morgen' : 'Heute'
  const heuteKey = JS_DAY_TO_WEEKDAY[displayDate.getDay()]
  const heuteLessons = heuteKey ? DEFAULT_PERIODS.map(({ period }) => lessons[`${heuteKey}-${period}`]).filter(Boolean) : []

  const hero = nextTodayLesson ? { kind: 'next', lesson: nextTodayLesson } : heuteLessons[0] ? { kind: 'day', lesson: heuteLessons[0] } : null

  const openHomework = homework.filter((h) => !h.done)
  const upcoming = [
    ...openHomework.map((h) => ({
      id: `h-${h.id}`,
      kind: 'homework',
      title: h.sketch?.length > 0 ? '✍️ Skizze' : h.title,
      subject: h.subject,
      date: h.dueDate,
    })),
    ...tests.map((t) => ({ id: `t-${t.id}`, kind: 'test', title: t.subject || 'Allgemein', subject: t.topic, date: t.date })),
    ...projects
      .filter((p) => !p.archived && p.dueDate)
      .map((p) => ({ id: `p-${p.id}`, kind: 'project', title: p.name, subject: 'Projekt-Abgabe', date: p.dueDate, to: `/projekte/${p.id}` })),
  ]
    .filter((i) => daysUntil(i.date) >= 0 && daysUntil(i.date) <= 13) // nur die nächsten 2 Wochen
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const weekCount = upcoming.filter((i) => daysUntil(i.date) <= 6).length

  return (
    <PageTransition>
      <p className="text-base font-semibold text-[var(--color-ink-dim)] md:text-lg">{greeting()}</p>
      <h1 className="mb-6 font-[var(--font-display)] text-4xl font-extrabold leading-tight md:mb-8 md:text-5xl">
        {profile?.name?.split(' ')[0] || 'Hey'}
      </h1>

      <div className="md:grid md:grid-cols-[1.1fr_1fr] md:items-start md:gap-6">
        <div>
          <HeroCard hero={hero} heuteLabel={heuteLabel} weekend={!heuteKey} customColors={customColors} />

          <div className="mb-7 grid grid-cols-3 gap-2.5 md:mb-0">
            <StatChip to="/hausaufgaben" i={0} label="Hausaufgaben" value={String(openHomework.length)} />
            <StatChip
              to="/pruefungen"
              i={1}
              label="Nächster Test in"
              value={tests.length === 0 ? '—' : daysUntil(tests[0]?.date) === 0 ? 'Heute' : `${daysUntil(tests[0]?.date)}T`}
            />
            <StatChip i={2} label="Diese Woche" value={String(weekCount)} />
          </div>
        </div>

        <Section title="Steht an">
          {upcoming.length === 0 ? (
            <EmptyNote text="Nichts Dringendes in Sicht." />
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((item, i) => (
                <UpcomingRow key={item.id} item={item} i={i} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </PageTransition>
  )
}

function HeroCard({ hero, heuteLabel, weekend, customColors }) {
  if (!hero) {
    const title = weekend
      ? heuteLabel === 'Heute'
        ? 'Kein Schultag heute'
        : 'Kein Schultag morgen'
      : heuteLabel === 'Heute'
        ? 'Für heute nichts mehr'
        : 'Noch keine Stunden für morgen'
    const sub = weekend ? 'Genieß die freie Zeit.' : heuteLabel === 'Heute' ? 'Der Unterricht ist für heute vorbei.' : 'Im Stundenplan noch nichts eingetragen.'
    return (
      <motion.div {...flyIn(0)} className="mb-5">
        <Card className="!p-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{weekend ? '🎉' : '📭'}</span>
            <div>
              <p className="text-[15px] font-semibold">{title}</p>
              <p className="text-xs text-[var(--color-ink-faint)]">{sub}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }
  const { kind, lesson } = hero
  const color = colorFor(lesson.color, customColors)
  const label = kind === 'next' ? 'Nächste Stunde' : `${heuteLabel} als Erstes`
  const sub = `${lesson.period}. Stunde${lesson.room ? ` · ${lesson.room}` : ''}`

  return (
    <motion.div {...flyIn(0)} className="mb-5">
      <Link to="/stundenplan" className="block">
        <div
          className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] p-5"
          style={{ background: `linear-gradient(135deg, ${color.soft}, var(--color-surface))` }}
        >
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: color.bg }}>
            {label}
          </p>
          <div className="flex items-center gap-3.5">
            <span className="h-11 w-1.5 shrink-0 rounded-full" style={{ background: color.bg }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xl font-extrabold leading-tight">{lesson.subject}</p>
              <p className="mt-0.5 text-sm text-[var(--color-ink-faint)]">{sub}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function StatChip({ to, label, value, i }) {
  const inner = (
    <>
      <span className="font-[var(--font-display)] text-xl font-extrabold text-[var(--color-accent)]">{value}</span>
      <span className="text-[11px] leading-tight text-[var(--color-ink-faint)]">{label}</span>
    </>
  )
  return (
    <motion.div {...flyIn(i, 0.15)}>
      {to ? (
        <Link to={to} className="flex flex-col items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3.5 text-center">
          {inner}
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3.5 text-center">
          {inner}
        </div>
      )}
    </motion.div>
  )
}

// Each kind gets its own icon, color and label so a row is recognizable at a glance, not just by icon.
const KIND_META = {
  homework: { icon: TaskIcon, label: 'Hausaufgabe', to: '/hausaufgaben', bg: 'var(--color-accent)', soft: 'var(--color-accent-soft)' },
  test: { icon: ClockIcon, label: 'Test', to: '/pruefungen', bg: '#60c7ff', soft: '#60c7ff26' },
  project: { icon: GridIcon, label: 'Projekt', bg: '#a78bfa', soft: '#a78bfa26' },
}

function UpcomingRow({ item, i }) {
  const meta = KIND_META[item.kind]
  const Icon = meta.icon
  const d = daysUntil(item.date)
  return (
    <motion.div {...flyIn(i, 0.3)}>
      <Link to={item.to || meta.to} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.soft, color: meta.bg }}>
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.bg }}>
            {meta.label}
          </p>
          <p className="truncate text-[15px] font-semibold leading-tight">{item.title}</p>
          {item.subject && <p className="truncate text-xs text-[var(--color-ink-faint)]">{item.subject}</p>}
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: meta.soft, color: meta.bg }}>
          {d === 0 ? 'Heute' : d === 1 ? 'Morgen' : `in ${d}T`}
        </span>
      </Link>
    </motion.div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
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
