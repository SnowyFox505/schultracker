import { useEffect } from 'react'
import { motion } from 'framer-motion'

const GLASS_BG =
  'radial-gradient(circle at 50% 50%, rgba(255,200,140,0.42) 0%, rgba(255,150,70,0.6) 50%, rgba(255,115,40,0.82) 85%, rgba(255,150,80,0.95) 100%)'
const GLASS_SHADOW = '0 0 70px 8px rgba(255,122,48,0.4), inset 0 0 26px rgba(255,200,150,0.35)'
const RIM = 'conic-gradient(from 0deg, #ffb37a, #ffe3a8, #b8f0ff, #d9b8ff, #ffb0c8, #ffb37a)'
const RIM_MASK = 'radial-gradient(circle, transparent 52%, #000 94%)'
const DURATION = { create: 4, join: 4.4, leave: 4.6 }

// Full-screen big moments for the Bubble: "create" spells out the join code inside a growing bubble,
// "join" lets your name dive into an existing bubble (it squishes, ripples and sparkles),
// "leave" wobbles, then pops the bubble into droplets while your name drifts away.
export default function BubbleFx({ mode, code = '', name = '', names = [], onDone }) {
  const duration = DURATION[mode]

  useEffect(() => {
    const t = setTimeout(onDone, duration * 1000)
    return () => clearTimeout(t)
  }, [onDone, duration])

  const title =
    mode === 'create' ? 'Deine Bubble ist bereit!' : mode === 'join' ? 'Willkommen in der Bubble!' : `Bis bald${name ? `, ${name.split(' ')[0]}` : ''}!`
  const subtitle =
    mode === 'create' ? 'Teile den Code mit deinen Freunden.' : mode === 'join' ? 'Ab jetzt geht es gemeinsam.' : 'Du hast die Bubble verlassen.'
  const textDelay = mode === 'create' ? 2.9 : mode === 'join' ? 2.7 : 2.6

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration, times: [0, 0.07, 0.88, 1] }}
    >
      <motion.div
        className="absolute h-[60vh] w-[60vh] rounded-full bg-[var(--color-accent)]/25 blur-[110px]"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.2, 1.35], opacity: mode === 'leave' ? [0, 0.8, 0.15] : [0, 0.8, 0.5] }}
        transition={{ duration, ease: 'easeOut' }}
      />

      <div className="relative flex h-72 w-72 items-center justify-center">
        {mode === 'create' && <CreateScene code={code} />}
        {mode === 'join' && <JoinScene name={name} others={names.filter((n) => n !== name)} />}
        {mode === 'leave' && <LeaveScene name={name} />}
      </div>

      <motion.p
        className="relative mt-10 text-center font-[var(--font-display)] text-2xl font-extrabold text-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: textDelay, duration: 0.6 }}
      >
        {title}
      </motion.p>
      <motion.p
        className="relative mt-2 text-sm text-[var(--color-ink-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: textDelay + 0.35, duration: 0.6 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  )
}

// The same glass soap-bubble look as the orb on the Bubble page.
function Orb({ animate, transition }) {
  return (
    <motion.div className="absolute inset-0" initial={{ scale: 0, opacity: 0 }} animate={animate} transition={transition}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: GLASS_BG, boxShadow: GLASS_SHADOW, border: '1px solid rgba(255,215,180,0.45)' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full opacity-90 mix-blend-screen"
        style={{ background: RIM, WebkitMaskImage: RIM_MASK, maskImage: RIM_MASK, filter: 'blur(2px)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute left-[14%] top-[10%] h-[22%] w-[38%] -rotate-[32deg] rounded-full bg-gradient-to-b from-white/70 to-white/5 blur-[6px]" />
      <div className="absolute left-[24%] top-[32%] h-[5%] w-[5%] rounded-full bg-white/60 blur-[2px]" />
      <div className="absolute bottom-[9%] right-[16%] h-[10%] w-[24%] rotate-[-38deg] rounded-full bg-white/25 blur-[5px]" />
    </motion.div>
  )
}

// Sparks pulled from all sides into the middle, right before something appears there.
function Gather({ count = 18, duration = 0.9, delay = 0 }) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.2
    const d = 200 + (i % 4) * 40
    const stagger = (i % 6) * 0.05
    return (
      <motion.span
        key={i}
        className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)] shadow-[0_0_10px_#ff7c3a]"
        initial={{ x: Math.cos(angle) * d, y: Math.sin(angle) * d, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0], scale: [1, 1, 0.4] }}
        transition={{ duration, delay: delay + stagger, ease: 'easeIn' }}
      />
    )
  })
}

// Flash + shock ring when the bubble "lands".
function Burst({ delay }) {
  return (
    <>
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        style={{ background: 'radial-gradient(circle, #fff 0%, #ffd9a8 35%, rgba(255,122,48,0) 70%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 6], opacity: [0, 1, 0] }}
        transition={{ delay, duration: 0.55, ease: 'easeOut', times: [0, 0.25, 1] }}
      />
      <motion.span
        className="absolute h-64 w-64 rounded-full border-2 border-[#ffb347] shadow-[0_0_30px_#ffb347]"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 0.3, 2.6], opacity: [0, 0.9, 0] }}
        transition={{ delay, duration: 1.2, ease: 'easeOut', times: [0, 0.01, 1] }}
      />
    </>
  )
}

function Sparks({ count = 16, delay, dist = 170, color = 'bg-[var(--color-accent-2)]', size = 'h-1.5 w-1.5' }) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.15
    const d = dist + (i % 3) * 45
    return (
      <motion.span
        key={i}
        className={`absolute rounded-full ${color} ${size}`}
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: Math.cos(angle) * d, y: Math.sin(angle) * d, opacity: [0, 1, 0], scale: [0.5, 1.1, 0.3] }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    )
  })
}

function Ripples({ delay, count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <motion.span
      key={i}
      className="absolute h-72 w-72 rounded-full border-2 border-[var(--color-accent-2)]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 0.8, 1.9], opacity: [0, 0.7, 0] }}
      transition={{ duration: 1.5, delay: delay + i * 0.35, ease: 'easeOut', times: [0, 0.01, 1] }}
    />
  ))
}

function RisingBubbles({ delay, count = 10 }) {
  return Array.from({ length: count }).map((_, i) => {
    const size = 8 + ((i * 7) % 16)
    return (
      <motion.span
        key={i}
        className="absolute rounded-full border border-white/40 bg-white/10"
        style={{ width: size, height: size, left: `${8 + ((i * 37) % 84)}%`, bottom: '-6%' }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -330 - (i % 4) * 40, opacity: [0, 0.8, 0] }}
        transition={{ duration: 2.2 + (i % 3) * 0.4, delay: delay + i * 0.15, ease: 'easeOut' }}
      />
    )
  })
}

function CreateScene({ code }) {
  return (
    <>
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-[var(--color-accent)]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />
      <Gather />
      <Burst delay={0.75} />
      <Orb animate={{ scale: [0, 0.3, 1.12, 0.96, 1], opacity: 1 }} transition={{ duration: 1.6, delay: 0.85, ease: 'easeOut' }} />
      <div className="relative flex gap-2 font-[var(--font-display)] text-4xl font-extrabold tracking-widest text-white drop-shadow">
        {code.split('').map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24, scale: 0.4 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 2 + i * 0.12 }}
          >
            {ch}
          </motion.span>
        ))}
      </div>
      <Sparks delay={2.5} />
    </>
  )
}

const OTHER_SPOTS = [
  { x: [-46, -22, -46], y: [-52, -36, -52], d: 3.2 },
  { x: [40, 64, 40], y: [40, 56, 40], d: 3.7 },
]

function JoinScene({ name, others }) {
  return (
    <>
      <RisingBubbles delay={0.2} />
      <Gather delay={0} />
      <Orb
        animate={{ scale: [0, 1.1, 1, 1, 0.86, 1.14, 1], opacity: 1 }}
        transition={{ duration: 2.6, delay: 0.2, times: [0, 0.25, 0.4, 0.5, 0.62, 0.8, 1], ease: 'easeInOut' }}
      />
      {others.slice(0, 2).map((other, i) => (
        <motion.span
          key={other + i}
          className="absolute rounded-full bg-white/85 px-3.5 py-1.5 text-sm font-bold text-[#7a2f08] shadow-lg"
          initial={{ opacity: 0, scale: 0.4, x: OTHER_SPOTS[i].x[0], y: OTHER_SPOTS[i].y[0] }}
          animate={{ opacity: 1, scale: 1, x: OTHER_SPOTS[i].x, y: OTHER_SPOTS[i].y }}
          transition={{
            opacity: { delay: 0.9 + i * 0.25, duration: 0.4 },
            scale: { delay: 0.9 + i * 0.25, type: 'spring', stiffness: 220, damping: 12 },
            x: { delay: 1.3, duration: OTHER_SPOTS[i].d, repeat: Infinity, ease: 'easeInOut' },
            y: { delay: 1.3, duration: OTHER_SPOTS[i].d, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {other}
        </motion.span>
      ))}
      <motion.span
        className="relative rounded-full bg-white/90 px-5 py-2 text-lg font-bold text-[#7a2f08] shadow-xl"
        initial={{ y: 320, opacity: 0, scale: 0.5, rotate: -12 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 1 }}
      >
        {name || 'Du'}
      </motion.span>
      <Ripples delay={1.9} />
      <Sparks delay={1.9} count={20} />
    </>
  )
}

function LeaveScene({ name }) {
  return (
    <>
      <Orb
        animate={{ scale: [0, 1.05, 1, 1.08, 0.94, 1.12, 1.9], opacity: [1, 1, 1, 1, 1, 1, 0] }}
        transition={{ duration: 2.6, delay: 0.1, times: [0, 0.22, 0.34, 0.5, 0.64, 0.82, 1], ease: 'easeInOut' }}
      />
      <motion.span
        className="relative rounded-full bg-white/90 px-5 py-2 text-lg font-bold text-[#7a2f08] shadow-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 1, 1], y: [0, 0, 0, -220], x: [0, 0, 0, 40], opacity: [0, 1, 1, 0], rotate: [0, 0, 0, 14] }}
        transition={{ duration: 2.9, delay: 0.5, times: [0, 0.2, 0.7, 1] }}
      >
        {name || 'Du'}
      </motion.span>
      <Sparks delay={1.6} count={26} dist={200} color="bg-[var(--color-accent)]" size="h-2 w-2" />
      <Sparks delay={1.7} count={14} dist={130} />
      <motion.span
        className="absolute h-40 w-40 rounded-full border-4 border-[var(--color-accent-2)]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 0.5, 3], opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.1, delay: 1.6, ease: 'easeOut', times: [0, 0.01, 1] }}
      />
    </>
  )
}
