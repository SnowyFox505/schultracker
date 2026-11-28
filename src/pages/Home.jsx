import { useNow } from '../lib/useNow'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../lib/useSchedule'
import { useTests } from '../lib/useTests'
import { useHomework } from '../lib/useHomework'
import { usePeriods } from '../lib/usePeriods'
import { dueLabel, progress, useProjects } from '../lib/projects'
import { PERIOD_NUMBERS, JS_DAY_TO_WEEKDAY, WEEKDAY_LABELS, colorFor, subjectColor } from '../lib/constants'
import PageTransition from '../components/PageTransition'
import Card from '../components/ui/Card'
import { TaskIcon, ClockIcon, GridIcon, ProjectIcon } from '../components/navIcons'
import { flyIn } from '../components/Shine'
import { TILE, PRESS } from '../lib/tile'

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

export default function Home() {
  const { profile } = useAuth()
  const customColors = profile?.customColors || []
  const subjects = profile?.subjects || []
  const { lessons, loading: scheduleLoading } = useSchedule()
  const { periods } = usePeriods()
  const periodRange = (period) => periods.find((p) => p.period === period)
  const schoolEnd = profile?.schoolEnd || {}
  const { items: homework } = useHomework()
  const { items: tests } = useTests()
  const { items: projects } = useProjects()
  // Only real Tests count toward the "Nächster Test" chip — general Termine (kind === 'termin')
  // shouldn't inflate/skew that number. Entries from before the split have no `kind` and count as tests.
  const realTests = tests.filter((t) => (t.kind || 'test') === 'test')

  // The hero card depends on the clock, not just on data changes — re-render every minute so it
  // keeps itself current (next lesson, "day over", …) without the user having to leave and reopen.
  const now = useNow()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayKeyRaw = JS_DAY_TO_WEEKDAY[now.getDay()]
  const todaysLessons = todayKeyRaw
    ? PERIOD_NUMBERS.map((period) => lessons[`${todayKeyRaw}-${period}`]).filter(Boolean)
    : []
  const byPeriod = Object.fromEntries(todaysLessons.map((l) => [l.period, l]))

  const futureToday = todaysLessons.filter((l) => periodRange(l.period).startMin > nowMin).sort((a, b) => a.period - b.period)
  // Skip straight past a Doppelstunde's second half: if the period right before the next upcoming
  // one is the same subject AND has already started (so we're in it, or just came out of it —
  // covers the exact-boundary/gap moment between the two halves too), show the one after instead.
  // Never shown itself: while sitting in a lesson you already know you're in it, what's useful on
  // the dashboard is what comes next.
  const nextIsSecondHalf = (l) => {
    const prev = byPeriod[l.period - 1]
    return prev && prev.subject === l.subject && nowMin >= periodRange(prev.period).startMin
  }
  const skipDoppelstunde = futureToday[0] && nextIsSecondHalf(futureToday[0]) ? 1 : 0
  const nextTodayLesson = futureToday[skipDoppelstunde] || null
  // The lesson actually running right now, if any — shown as the hero only once there's no more
  // "next" lesson left today (e.g. sitting in the last entered lesson of the day); while something
  // is still coming up, "next" is more useful than "you already know you're in this one".
  const currentLesson =
    todaysLessons.find((l) => {
      const r = periodRange(l.period)
      return nowMin >= r.startMin && nowMin < r.endMin
    }) || null

  // A configured Schulschluss time for today (see Stundenplan) overrides the derived "day over"
  // check entirely — trusted over whatever is or isn't entered in the schedule for the rest of today.
  const todayEnd = todayKeyRaw && schoolEnd[todayKeyRaw]
  const dayOverByEnd = todayEnd ? nowMin >= toMin(todayEnd) : null
  const doneForToday = dayOverByEnd !== null ? dayOverByEnd : !nextTodayLesson && !currentLesson
  // Once today is over (or free), look ahead to the next day that has lessons — over the weekend
  // that is Monday, which is exactly what you want to know then.
  const nextSchoolDay = doneForToday ? findNextSchoolDay(now, lessons) : null

  const hero = nextTodayLesson
    ? { kind: 'next', lesson: nextTodayLesson }
    : currentLesson && !doneForToday
      ? { kind: 'current', lesson: currentLesson }
      : nextSchoolDay
        ? { kind: 'day', lesson: nextSchoolDay.lesson, dayLabel: nextSchoolDay.label }
        : null
  // Nothing entered for the rest of today, but a Schulschluss override says we're not done yet.
  const notOverYet = !hero && !doneForToday && todayEnd

  const openHomework = homework.filter((h) => !h.done)
  const upcoming = [
    ...openHomework.map((h) => ({
      id: `h-${h.id}`,
      kind: 'homework',
      title: h.sketch?.length > 0 ? '✍️ Skizze' : h.title,
      subject: h.subject,
      subjectName: h.subject,
      date: h.dueDate,
    })),
    ...tests.map((t) => ({
      id: `t-${t.id}`,
      kind: (t.kind || 'test') === 'termin' ? 'termin' : 'test',
      title: t.subject || 'Allgemein',
      subject: t.topic,
      subjectName: t.subject,
      date: t.date,
    })),
    ...projects
      .filter((p) => !p.archived && p.dueDate)
      .map((p) => ({ id: `p-${p.id}`, kind: 'project', title: p.name, subject: 'Projekt-Abgabe', date: p.dueDate, to: `/projekte/${p.id}` })),
  ]
    .filter((i) => daysUntil(i.date) >= 0 && daysUntil(i.date) <= 13) // nur die nächsten 2 Wochen
    .sort((a, b) => a.date.localeCompare(b.date))

  // Counted before the feed is cut to 8 rows.
  const weekCount = upcoming.filter((i) => daysUntil(i.date) <= 6).length
  // Past tests stay in the list, so skip them here.
  const nextTest = realTests.find((t) => daysUntil(t.date) >= 0)

  return (
    <PageTransition>
      <p className="pr-24 text-[16px] font-semibold text-[var(--color-ink-dim)] md:pr-0 md:text-lg">{greeting()}</p>
      <h1 className="mb-6 break-words pr-24 font-[var(--font-display)] md:pr-0 text-4xl font-extrabold leading-tight md:mb-8 md:text-5xl">
        {profile?.name?.split(' ')[0] || 'Hey'}
      </h1>

      <div className="md:grid md:grid-cols-[1.1fr_1fr] md:items-start md:gap-6">
        <div>
          <HeroCard
            hero={hero}
            periodRange={periodRange}
            hasPlan={Object.keys(lessons).length > 0}
            notOverYet={notOverYet}
            todayEnd={todayEnd}
            customColors={customColors}
            loading={scheduleLoading}
          />

          <div className="mb-7 grid grid-cols-3 gap-2.5 md:mb-0">
            <StatChip to="/hausaufgaben" i={0} icon={TaskIcon} label="Hausaufgaben" value={String(openHomework.length)} />
            <StatChip
              to="/pruefungen"
              i={1}
              icon={ClockIcon}
              label="Nächster Test"
              value={nextTest ? shortDue(daysUntil(nextTest.date)) : '—'}
            />
            <StatChip i={2} icon={GridIcon} label="Diese Woche" value={String(weekCount)} />
          </div>
        </div>

        <div>
        <Section title="Steht an">
          {upcoming.length === 0 ? (
            <EmptyNote text="Nichts Dringendes in Sicht." />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {upcoming.slice(0, 8).map((item, i, shown) => (
                <UpcomingTile
                  key={item.id}
                  item={item}
                  i={i}
                  // the most urgent one is wide; a leftover single tile fills its row too
                  wide={i === 0 || (i === shown.length - 1 && shown.length % 2 === 0)}
                  color={subjectColor(item.subjectName, subjects, customColors)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* mobile has no Projekte tab, so this is the way in */}
        <Link
          to="/projekte"
          className={`mt-2.5 flex items-center gap-3 p-3.5 text-[15px] font-semibold md:hidden ${TILE} ${PRESS}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a78bfa26] text-[#a78bfa]">
            <ProjectIcon />
          </span>
          <span className="flex-1">Projekte</span>
          <span aria-hidden="true" className="text-[var(--color-ink-faint)]">›</span>
        </Link>
        </div>
      </div>
    </PageTransition>
  )
}

function HeroCard({ hero, periodRange, hasPlan, notOverYet, todayEnd, customColors, loading }) {
  if (loading) {
    // The schedule hasn't arrived from Firestore yet (common for a moment right after opening the
    // app) — showing "kein Schultag"/"nichts mehr heute" here would be actively wrong whenever
    // there actually are lessons today, so wait for real data instead of guessing.
    return (
      <div className="mb-5">
        <Card className="!p-5">
          <div className="flex items-center gap-2.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink-faint)]"
              animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm text-[var(--color-ink-faint)]">Lädt deinen Stundenplan …</span>
          </div>
        </Card>
      </div>
    )
  }
  if (!hero) {
    const empty = !hasPlan && !notOverYet
    const title = notOverYet
      ? 'Keine weiteren Stunden heute eingetragen'
      : empty
        ? 'Dein Stundenplan ist noch leer'
        : 'Gerade steht nichts an'
    const sub = notOverYet
      ? `Laut deiner Einstellung hast du noch bis ${todayEnd} Uhr Schule.`
      : empty
        ? 'Trag deine Stunden ein, dann siehst du hier die nächste.'
        : 'Genieß die freie Zeit.'
    const card = (
      <Card className="!p-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{notOverYet ? '⏳' : empty ? '🗓️' : '🎉'}</span>
          <div>
            <p className="text-[15px] font-semibold">{title}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">{sub}</p>
            {empty && <p className="mt-2 text-sm font-semibold text-[var(--color-accent)]">Stundenplan eintragen</p>}
          </div>
        </div>
      </Card>
    )
    return (
      <motion.div {...flyIn(0)} className="mb-5">
        {empty ? <Link to="/stundenplan" className="block">{card}</Link> : card}
      </motion.div>
    )
  }
  const { kind, lesson } = hero
  const color = colorFor(lesson.color, customColors)
  const label = kind === 'next' ? 'Nächste Stunde' : kind === 'current' ? 'Läuft gerade' : `${hero.dayLabel} als Erstes`
  const range = periodRange(lesson.period)
  const facts = [range && `${range.start} – ${range.end}`, `${lesson.period}. Stunde`, lesson.room].filter(Boolean)

  return (
    <motion.div {...flyIn(0)} className="mb-2.5">
      <Link to="/stundenplan" className={`block ${PRESS}`}>
        <div
          className="rounded-[28px] border border-white/[0.09] p-5 shadow-[0_16px_32px_-20px_#000]"
          style={{ background: `linear-gradient(145deg, ${color.bg}40, ${color.bg}12 55%, var(--color-surface))` }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: color.bg }}>
              {label}
            </p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: color.bg, color: '#0a0a0f' }}>
              <GridIcon />
            </span>
          </div>
          <p className="mt-3 truncate text-[34px] font-extrabold leading-tight tracking-tight">{lesson.subject}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <span key={fact} className="rounded-full bg-black/30 px-3 py-1 text-[13px] font-medium tabular-nums text-[var(--color-ink-dim)]">
                {fact}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function StatChip({ to, label, value, icon: Icon, i }) {
  const box = `flex h-full flex-col p-2.5 min-[360px]:p-3 ${TILE}`
  const inner = (
    <>
      <span className="text-[var(--color-ink-faint)]">
        <Icon />
      </span>
      <span className="mt-3 whitespace-nowrap text-[18px] min-[360px]:text-[22px] font-extrabold leading-none tabular-nums text-[var(--color-accent)]">{value}</span>
      <span className="mt-1.5 text-[11px] leading-tight text-[var(--color-ink-faint)]">{label}</span>
    </>
  )
  return (
    <motion.div {...flyIn(i, 0.15)}>
      {to ? (
        <Link to={to} className={`${box} ${PRESS}`}>
          {inner}
        </Link>
      ) : (
        <div className={box}>{inner}</div>
      )}
    </motion.div>
  )
}

// Each kind gets its own icon, color and label so a row is recognizable at a glance, not just by icon.
const KIND_META = {
  homework: { icon: TaskIcon, label: 'Hausaufgabe', to: '/hausaufgaben', bg: 'var(--color-accent)', soft: 'var(--color-accent-soft)' },
  test: { icon: ClockIcon, label: 'Test', to: '/pruefungen', bg: '#60c7ff', soft: '#60c7ff26' },
  termin: { icon: ClockIcon, label: 'Termin', to: '/pruefungen', bg: '#60c7ff', soft: '#60c7ff26' },
  project: { icon: GridIcon, label: 'Projekt', bg: '#a78bfa', soft: '#a78bfa26' },
}

// Icon and label say what kind of entry it is, the colour says which subject.
function UpcomingTile({ item, i, wide, color }) {
  const meta = { ...KIND_META[item.kind], ...(color && { bg: color.bg, soft: color.soft }) }
  const Icon = meta.icon
  const d = daysUntil(item.date)
  return (
    <motion.div {...flyIn(i, 0.3)} className={wide ? 'col-span-2 min-w-0' : 'min-w-0'}>
      <Link to={item.to || meta.to} className={`flex h-full flex-col p-3.5 ${TILE} ${PRESS}`}>
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.soft, color: meta.bg }}>
            <Icon />
          </span>
          <span className="whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold" style={{ background: meta.soft, color: meta.bg }}>
            {d > 1 && wide ? `in ${d} Tagen` : shortDue(d)}
          </span>
        </div>
        <p lang="de" className={`mt-3 line-clamp-2 hyphens-auto break-words font-semibold leading-snug ${wide ? 'text-[17px]' : 'text-[15px]'}`}>{item.title}</p>
        {item.subject && <p className="mt-0.5 truncate text-xs text-[var(--color-ink-faint)]">{item.subject}</p>}
        <p className="mt-auto pt-2 text-[11px] font-semibold" style={{ color: meta.bg }}>
          {meta.label}
        </p>
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

function shortDue(days) {
  return days === 0 ? 'Heute' : days === 1 ? 'Morgen' : `${days} Tage`
}

function findNextSchoolDay(now, lessons) {
  for (let offset = 1; offset <= 7; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const key = JS_DAY_TO_WEEKDAY[date.getDay()]
    if (!key) continue
    const period = PERIOD_NUMBERS.find((p) => lessons[`${key}-${p}`])
    if (period) return { lesson: lessons[`${key}-${period}`], label: offset === 1 ? 'Morgen' : WEEKDAY_LABELS[key] }
  }
  return null
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
