import { useEffect, useRef, useState } from 'react'
import { animate, motion, useAnimationControls, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EASE = [0.4, 0, 0.2, 1]
const LOGO = 80 // px, same as the Loader logo
const OFFSET = -20 // the Loader's logo sits 20px above screen center
const BURST_AT = 0.75 // seconds until the burst (login version)
const rand = (a, b) => a + Math.random() * (b - a)

// Plays once, right after the first auth check. Signed in: a short wave uncovers the app.
// Not signed in: sparks gather into the logo, it bursts into waves, sparks and rising bubbles that
// uncover the login page, then the logo flies into the page's own logo (#login-logo) and lands
// with a ripple.
export default function AuthReveal() {
  const { user, loading } = useAuth()
  const [kind, setKind] = useState(null)
  const shown = useRef(false)

  useEffect(() => {
    if (loading || shown.current) return
    shown.current = true
    setKind(user ? 'app' : 'login')
  }, [loading, user])

  if (!kind) return null
  return <Reveal kind={kind} onDone={() => setKind(null)} />
}

function makeFx() {
  const angle = (i, n) => (i / n) * Math.PI * 2 + rand(-0.2, 0.2)
  return {
    gather: Array.from({ length: 16 }, (_, i) => {
      const a = angle(i, 16)
      const d = rand(170, 340)
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: rand(4, 8), delay: rand(0, 0.15) }
    }),
    sparks: Array.from({ length: 26 }, (_, i) => {
      const a = angle(i, 26)
      const d = rand(110, 420)
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: rand(4, 9), dur: rand(0.7, 1.2), warm: i % 3 }
    }),
    bubbles: Array.from({ length: 10 }, () => ({
      left: rand(4, 92),
      size: rand(16, 54),
      delay: rand(0, 0.7),
      dur: rand(1.7, 2.5),
      sway: rand(-28, 28),
    })),
  }
}

const SPARK_COLORS = ['#ffb347', '#ff7c3a', '#ffd9a8']
const RINGS = [
  { color: '#ffb347', delay: 0, w: 2 },
  { color: '#ff7c3a', delay: 0.14, w: 3 },
  { color: '#ff6b81', delay: 0.3, w: 2 },
]

function Reveal({ kind, onDone }) {
  const [fx] = useState(makeFx)
  const [landed, setLanded] = useState(null)
  const r = useMotionValue(0)
  const soft = 90
  const mask = useMotionTemplate`radial-gradient(circle at 50% calc(50% + ${OFFSET}px), transparent ${r}px, #000 calc(${r}px + ${soft}px))`
  const ringScale = useTransform(r, (v) => Math.max(v, 1) / 100)
  const ringOpacity = useTransform(r, [0, 400, 1200], [0.9, 0.5, 0])
  const logo = useAnimationControls()
  const diag = Math.hypot(window.innerWidth, window.innerHeight)

  useEffect(() => {
    let alive = true
    const html = document.documentElement
    if (kind === 'login') html.dataset.intro = '1'

    async function run() {
      if (kind === 'app') {
        const wave = animate(r, diag, { duration: 0.8, ease: EASE })
        await logo.start({ scale: 1.7, opacity: 0, transition: { duration: 0.55, ease: EASE } })
        await wave
        return
      }
      // gather: the logo breathes in while sparks are pulled into it
      await logo.start({ scale: [1, 0.86, 1.2], transition: { duration: BURST_AT, ease: 'easeInOut' } })
      // burst
      const wave = animate(r, diag, { duration: 1.7, ease: EASE })
      logo.start({ scale: 1, transition: { duration: 0.25 } })
      await sleep(600)
      const el = document.getElementById('login-logo')
      if (el && alive) {
        const t = el.getBoundingClientRect()
        const dx = t.left + t.width / 2 - window.innerWidth / 2
        const dy = t.top + t.height / 2 - (window.innerHeight / 2 + OFFSET)
        await logo.start({ x: dx, y: dy, scale: t.width / LOGO, transition: { duration: 0.9, ease: EASE } })
        setLanded({ x: t.left + t.width / 2, y: t.top + t.height / 2 })
        delete html.dataset.intro
        logo.start({ opacity: 0, transition: { duration: 0.2 } })
        await wave
        await sleep(650)
      } else {
        await wave
        await logo.start({ opacity: 0, scale: 1.4, transition: { duration: 0.3 } })
      }
    }

    run().then(() => {
      if (alive) onDone()
    })
    return () => {
      alive = false
      delete html.dataset.intro
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const center = { top: `calc(50% + ${OFFSET}px)` }
  const login = kind === 'login'

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <div className="gradient-warm absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }} />

      {login && (
        <>
          {/* rising bubbles */}
          {fx.bubbles.map((b, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${b.left}%`,
                bottom: -70,
                width: b.size,
                height: b.size,
                background:
                  'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.75), rgba(255,170,100,0.35) 45%, rgba(255,122,48,0.55))',
                border: '1px solid rgba(255,215,180,0.5)',
                boxShadow: '0 0 16px rgba(255,122,48,0.35)',
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -(window.innerHeight + 140), x: [0, b.sway, -b.sway * 0.6, 0], opacity: [0, 0.9, 0.9, 0] }}
              transition={{ delay: BURST_AT + b.delay, duration: b.dur, ease: 'easeOut' }}
            />
          ))}

          {/* staggered waves */}
          {RINGS.map((ring, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ ...center, border: `${ring.w}px solid ${ring.color}`, boxShadow: `0 0 30px ${ring.color}` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: (diag / 100) * 1.05, opacity: [0, 0.9, 0] }}
              transition={{ delay: BURST_AT + ring.delay, duration: 1.5, ease: EASE, times: [0, 0.08, 1] }}
            />
          ))}

          {/* flash */}
          <motion.div
            className="absolute left-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ ...center, background: 'radial-gradient(circle, #fff 0%, #ffd9a8 35%, rgba(255,122,48,0) 70%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 5], opacity: [0, 1, 0] }}
            transition={{ delay: BURST_AT - 0.05, duration: 0.5, ease: 'easeOut', times: [0, 0.25, 1] }}
          />

          {/* sparks pulled into the logo */}
          {fx.gather.map((g, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 rounded-full bg-[var(--color-accent-2)]"
              style={{ ...center, width: g.s, height: g.s, marginLeft: -g.s / 2, marginTop: -g.s / 2, boxShadow: '0 0 10px #ff7c3a' }}
              initial={{ x: g.x, y: g.y, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0] }}
              transition={{ delay: g.delay, duration: BURST_AT - 0.1 - g.delay, ease: 'easeIn' }}
            />
          ))}

          {/* sparks flung outward */}
          {fx.sparks.map((s, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 rounded-full"
              style={{
                ...center,
                width: s.s,
                height: s.s,
                marginLeft: -s.s / 2,
                marginTop: -s.s / 2,
                background: SPARK_COLORS[s.warm],
                boxShadow: `0 0 12px ${SPARK_COLORS[s.warm]}`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
              animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [1, 1, 0.3] }}
              transition={{ delay: BURST_AT, duration: s.dur, ease: 'easeOut', times: [0, 0.15, 1] }}
            />
          ))}
        </>
      )}

      {/* the wave's leading edge */}
      <motion.div
        className="absolute left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent)] shadow-[0_0_40px_rgba(255,122,48,0.6),inset_0_0_30px_rgba(255,122,48,0.35)]"
        style={{ ...center, scale: ringScale, opacity: ringOpacity }}
      />

      <motion.p
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-faint)]"
        style={{ top: `calc(50% + ${OFFSET + 112}px)` }}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        Schultracker
      </motion.p>

      <motion.img
        src="/icons/icon-192.png"
        alt=""
        animate={logo}
        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        className="absolute left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[22px] shadow-[0_0_40px_rgba(255,122,48,0.45)]"
        style={center}
      />

      {/* landing ripple on the login logo */}
      {landed && (
        <>
          <motion.div
            className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[18px] border-2 border-[var(--color-accent-2)]"
            style={{ left: landed.x, top: landed.y }}
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent-2)]"
                style={{ left: landed.x, top: landed.y, boxShadow: '0 0 8px #ffb347' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: Math.cos(a) * 60, y: Math.sin(a) * 60, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
