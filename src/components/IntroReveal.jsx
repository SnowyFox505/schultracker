import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { colorFor } from '../lib/constants'
import { BubbleIcon, ClockIcon, GridIcon, NoteIcon, TaskIcon } from './navIcons'

const WORDMARK = 'Schultracker'
const DURATION = 7.4
const BURST_AT = 0.7

const SECTIONS = [
  { Icon: GridIcon, label: 'Plan', from: { x: -260, y: -280 } },
  { Icon: TaskIcon, label: 'Aufgaben', from: { x: 260, y: -300 } },
  { Icon: ClockIcon, label: 'Tests', from: { x: -280, y: 260 } },
  { Icon: NoteIcon, label: 'Notizen', from: { x: 40, y: 340 } },
  { Icon: BubbleIcon, label: 'Bubble', from: { x: 280, y: 240 } },
]

// Big moment right after the setup: sparks gather into the logo, it bursts, the wordmark spells out,
// then the app's five areas fly in from all sides, land with a little ripple and become a row.
export default function IntroReveal({ name, subjects = [], customColors = [], onDone }) {
  // Mount-once timer: `onDone` (clearJustOnboarded from AuthContext) is a fresh function on every
  // AuthProvider re-render (e.g. any profile field changing), which would restart this countdown
  // and could leave the overlay stuck forever if renders ever came faster than DURATION.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), DURATION * 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: DURATION, times: [0, 0.88, 1], ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute h-[55vh] w-[55vh] rounded-full bg-[var(--color-accent)]/25 blur-[110px]"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.3, 1.4, 1.55], opacity: [0, 0.9, 0.6, 0.45] }}
        transition={{ duration: DURATION, times: [0, 0.3, 0.65, 1], ease: 'easeOut' }}
      />

      <FloatingSparks />

      {/* logo: sparks are pulled in, then it bursts open */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <GatherSparks />
        <motion.div
          className="absolute h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, #fff 0%, #ffd9a8 35%, rgba(255,122,48,0) 70%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 6], opacity: [0, 1, 0] }}
          transition={{ delay: BURST_AT - 0.05, duration: 0.6, ease: 'easeOut', times: [0, 0.25, 1] }}
        />
        <motion.span
          className="absolute h-28 w-28 rounded-full border-2 border-[#ffb347] shadow-[0_0_30px_#ffb347]"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 0.3, 4], opacity: [0, 0.9, 0] }}
          transition={{ delay: BURST_AT, duration: 1.3, ease: 'easeOut', times: [0, 0.01, 1] }}
        />
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          className="relative h-20 w-20 rounded-[22px] shadow-[0_0_40px_rgba(255,122,48,0.45)]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 1], opacity: 1 }}
          transition={{ delay: BURST_AT, duration: 0.7, ease: 'easeOut' }}
        />
        <Burst />
      </div>

      <motion.div
        className="relative mt-5 flex overflow-hidden font-[var(--font-display)] text-4xl font-extrabold tracking-tight md:text-6xl"
        initial="hidden"
        animate={['show', 'breathe']}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05, delayChildren: 1.1 } },
          breathe: {
            scale: [1, 1, 1.025, 1],
            transition: { duration: DURATION, times: [0, 0.5, 0.65, 0.8], ease: 'easeInOut' },
          },
        }}
        style={{ perspective: 400 }}
      >
        {WORDMARK.split('').map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { y: 40, opacity: 0, rotateX: -70 },
              show: { y: 0, opacity: 1, rotateX: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
            }}
            className="inline-block bg-gradient-to-br from-white to-[var(--color-accent-2)] bg-clip-text text-transparent"
          >
            {ch}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="relative mt-3 h-[2px] w-40 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent md:w-56"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* the five areas fly in from all sides */}
      <div className="relative mt-9 flex gap-3.5 md:gap-5">
        {SECTIONS.map(({ Icon, label, from }, i) => {
          const delay = 2.2 + i * 0.22
          return (
            <div key={label} className="relative flex flex-col items-center gap-2">
              <motion.span
                className="absolute top-0 h-12 w-12 rounded-2xl border-2 border-[var(--color-accent-2)]"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1, 2.2], opacity: [0, 0.9, 0] }}
                transition={{ delay: delay + 0.55, duration: 0.6, ease: 'easeOut', times: [0, 0.01, 1] }}
              />
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[0_0_24px_rgba(255,122,48,0.25)]"
                initial={{ opacity: 0, x: from.x, y: from.y, scale: 0.4, rotate: i % 2 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: [0.4, 1.15, 1], rotate: 0 }}
                transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon />
              </motion.div>
              <motion.span
                className="text-[11px] font-medium text-[var(--color-ink-faint)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.6, duration: 0.4 }}
              >
                {label}
              </motion.span>
            </div>
          )
        })}
      </div>

      {subjects.length > 0 && (
        <motion.div
          className="relative mt-6 flex gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 3.9 } } }}
        >
          {subjects.slice(0, 8).map((s, i) => {
            const color = colorFor(s.color, customColors)
            const fromX = (i % 2 === 0 ? -1 : 1) * (60 + i * 12)
            return (
              <motion.span
                key={s.id || i}
                className="h-3 w-3 rounded-full md:h-4 md:w-4"
                style={{ background: color.bg }}
                variants={{
                  hidden: { opacity: 0, x: fromX, y: -30, scale: 0.3 },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: [0.3, 1.25, 1],
                    transition: { type: 'spring', stiffness: 260, damping: 18 },
                  },
                }}
              />
            )
          })}
        </motion.div>
      )}

      <motion.p
        className="relative mt-7 text-lg font-semibold text-white md:text-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1], y: 0 }}
        transition={{ delay: 4.4, duration: 0.6, times: [0, 0.4, 1] }}
      >
        Startklar, {name?.trim().split(' ')[0] || 'los'}.
      </motion.p>

      <motion.p
        className="relative mt-2 text-xs text-[var(--color-ink-faint)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: 4.9, duration: 2.2, times: [0, 0.2, 0.8, 1] }}
      >
        Made by Leopold
      </motion.p>

      <motion.div
        className="absolute bottom-16 h-1 w-36 overflow-hidden rounded-full bg-white/10 md:w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: DURATION, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  )
}

function GatherSparks() {
  return Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.2
    const d = 190 + (i % 4) * 45
    return (
      <motion.span
        key={i}
        className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)] shadow-[0_0_10px_#ff7c3a]"
        initial={{ x: Math.cos(angle) * d, y: Math.sin(angle) * d, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0], scale: [1, 1, 0.4] }}
        transition={{ duration: BURST_AT - 0.05, delay: (i % 5) * 0.04, ease: 'easeIn' }}
      />
    )
  })
}

function Burst() {
  return Array.from({ length: 22 }).map((_, i) => {
    const angle = (i / 22) * Math.PI * 2 + (i % 2) * 0.15
    const d = 120 + (i % 4) * 55
    return (
      <motion.span
        key={i}
        className="absolute h-1.5 w-1.5 rounded-full bg-[#ffb347] shadow-[0_0_10px_#ffb347]"
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: Math.cos(angle) * d, y: Math.sin(angle) * d, opacity: [0, 1, 0], scale: [1, 1, 0.3] }}
        transition={{ delay: BURST_AT, duration: 0.9, ease: 'easeOut', times: [0, 0.15, 1] }}
      />
    )
  })
}

function FloatingSparks() {
  const specks = Array.from({ length: 10 })
  return (
    <div className="pointer-events-none absolute inset-0">
      {specks.map((_, i) => {
        const left = 10 + ((i * 37) % 80)
        const delay = 2.6 + (i % 5) * 0.35
        return (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-accent-2)]"
            style={{ left: `${left}%`, top: '58%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: -120 }}
            transition={{ delay, duration: 3, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
