import { useState } from 'react'
import { motion } from 'framer-motion'

const rand = (a, b) => a + Math.random() * (b - a)

// Calm farewell while the account is really being deleted: the logo slowly dissolves into
// sparks that drift away like embers. It keeps going gently, so it never looks stuck while the
// async delete is still running.
export default function DeletingOverlay() {
  const [sparks] = useState(() =>
    Array.from({ length: 34 }, (_, i) => ({
      x0: rand(-38, 38),
      y0: rand(-38, 38),
      dx: rand(-120, 120),
      dy: rand(-260, -90),
      size: rand(3, 7),
      delay: 1.5 + (i % 17) * 0.13,
      dur: rand(2.2, 3.4),
      pause: rand(0.4, 1.6),
      warm: i % 3,
    }))
  )
  const colors = ['#ffb347', '#ff7c3a', '#ffd9a8']

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#07060a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute h-[45vh] w-[45vh] rounded-full bg-[var(--color-accent)]/20 blur-[100px]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 0.9], opacity: [0, 0.6, 0.25] }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />

      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          className="h-20 w-20 rounded-[22px] shadow-[0_0_40px_rgba(255,122,48,0.4)]"
          initial={{ opacity: 0, scale: 0.7, filter: 'blur(0px)' }}
          animate={{
            opacity: [0, 1, 1, 0.12],
            scale: [0.7, 1, 1.03, 0.92],
            filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(7px)'],
          }}
          transition={{ duration: 4, times: [0, 0.15, 0.38, 1], ease: 'easeInOut' }}
        />

        {sparks.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: s.size, height: s.size, background: colors[s.warm], boxShadow: `0 0 10px ${colors[s.warm]}` }}
            initial={{ x: s.x0, y: s.y0, opacity: 0 }}
            animate={{
              x: [s.x0, s.x0 + s.dx * 0.5, s.x0 + s.dx],
              y: [s.y0, s.y0 + s.dy * 0.5, s.y0 + s.dy],
              opacity: [0, 1, 0],
              scale: [1, 0.9, 0.3],
            }}
            transition={{ duration: s.dur, delay: s.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: s.pause }}
          />
        ))}

        {/* what's left: a small ember that keeps breathing */}
        <motion.div
          className="absolute h-2.5 w-2.5 rounded-full bg-[var(--color-accent-2)] shadow-[0_0_16px_#ffb347]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.35, 0.9], scale: [1, 1.3, 0.9, 1.3] }}
          transition={{ delay: 3.4, duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="relative mt-16 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-ink-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Account wird gelöscht
        <motion.span
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, times: [0, 0.3, 0.75, 1] }}
        >
          …
        </motion.span>
      </motion.p>
      <motion.p
        className="relative mt-2 text-xs text-[var(--color-ink-faint)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        Deine Daten werden sauber entfernt.
      </motion.p>
    </motion.div>
  )
}
