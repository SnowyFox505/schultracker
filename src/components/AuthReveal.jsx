import { useEffect, useRef, useState } from 'react'
import { animate, motion, useAnimationControls, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EASE = [0.4, 0, 0.2, 1]
const LOGO = 80 // px, same as the Loader logo
const OFFSET = -20 // the Loader's logo sits 20px above screen center

// Plays once, right after the first auth check: the Loader's logo stays put while a wave grows out
// of it and uncovers the page underneath. On the login page the logo then flies into the page's
// own logo (#login-logo); when already signed in it's a short version.
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

function Reveal({ kind, onDone }) {
  const r = useMotionValue(0)
  const soft = 90
  const mask = useMotionTemplate`radial-gradient(circle at 50% calc(50% + ${OFFSET}px), transparent ${r}px, #000 calc(${r}px + ${soft}px))`
  const ringScale = useTransform(r, (v) => Math.max(v, 1) / 100)
  const ringOpacity = useTransform(r, [0, 400, 1200], [0.9, 0.5, 0])
  const logo = useAnimationControls()

  useEffect(() => {
    let alive = true
    const html = document.documentElement
    const diag = Math.hypot(window.innerWidth, window.innerHeight)
    if (kind === 'login') html.dataset.intro = '1'

    async function run() {
      if (kind === 'app') {
        const wave = animate(r, diag, { duration: 0.8, ease: EASE })
        await logo.start({ scale: 1.7, opacity: 0, transition: { duration: 0.55, ease: EASE } })
        await wave
        return
      }
      await sleep(300)
      const wave = animate(r, diag, { duration: 1.6, ease: EASE })
      await sleep(450)
      const el = document.getElementById('login-logo')
      if (el && alive) {
        const t = el.getBoundingClientRect()
        await logo.start({
          x: t.left + t.width / 2 - window.innerWidth / 2,
          y: t.top + t.height / 2 - (window.innerHeight / 2 + OFFSET),
          scale: t.width / LOGO,
          transition: { duration: 0.85, ease: EASE },
        })
        await wave
        delete html.dataset.intro
        await logo.start({ opacity: 0, transition: { duration: 0.2 } })
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

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div className="gradient-warm absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }} />
      <motion.div
        className="absolute left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent)] shadow-[0_0_40px_rgba(255,122,48,0.6),inset_0_0_30px_rgba(255,122,48,0.35)]"
        style={{ top: `calc(50% + ${OFFSET}px)`, scale: ringScale, opacity: ringOpacity }}
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
        style={{ top: `calc(50% + ${OFFSET}px)` }}
      />
    </div>
  )
}
