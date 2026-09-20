import { useEffect } from 'react'
import { motion } from 'framer-motion'

const ORB_BG =
  'radial-gradient(circle at 32% 28%, #ffd9a8 0%, var(--color-accent-2) 28%, var(--color-accent) 62%, #b04a12 100%)'
const ORB_SHADOW = '0 0 70px 8px rgba(255,122,48,0.4), inset -16px -20px 44px rgba(120,40,0,0.35)'
const DURATION = { create: 4, join: 4.4, leave: 4.6 }

// Full-screen big moments for the Bubble: "create" spells out the join code inside a growing bubble,
// "join" lets your name dive into an existing bubble (it squishes, ripples and sparkles),
// "leave" wobbles, then pops the bubble into droplets while your name drifts away.
export default function BubbleFx({ mode, code = '', name = '', onDone }) {
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
        {mode === 'join' && <JoinScene name={name} />}
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

function Orb({ animate, transition }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: ORB_BG, boxShadow: ORB_SHADOW }}
        initial={{ scale: 0, opacity: 0 }}
        animate={animate}
        transition={transition}
      />
      <motion.div
        className="absolute left-[18%] top-[13%] h-11 w-16 -rotate-[28deg] rounded-full bg-white/40 blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: animate.opacity }}
        transition={{ delay: transition.delay + 0.4 }}
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
      animate={{ scale: [0.8, 1.9], opacity: [0.7, 0] }}
      transition={{ duration: 1.5, delay: delay + i * 0.35, ease: 'easeOut' }}
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
      <Orb animate={{ scale: [0, 0.3, 1.12, 0.96, 1], opacity: 1 }} transition={{ duration: 1.6, delay: 0.6, ease: 'easeOut' }} />
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

function JoinScene({ name }) {
  return (
    <>
      <RisingBubbles delay={0.2} />
      <Orb
        animate={{ scale: [0, 1.1, 1, 1, 0.86, 1.14, 1], opacity: 1 }}
        transition={{ duration: 2.6, delay: 0.2, times: [0, 0.25, 0.4, 0.5, 0.62, 0.8, 1], ease: 'easeInOut' }}
      />
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
        animate={{ scale: [0.5, 3], opacity: [0.9, 0] }}
        transition={{ duration: 1.1, delay: 1.6, ease: 'easeOut' }}
      />
    </>
  )
}
