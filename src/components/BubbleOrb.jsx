import { motion } from 'framer-motion'

const SPOTS = [
  { x: [-38, 26, -38], y: [-30, -8, -30], d: 7 },
  { x: [30, -24, 30], y: [26, 4, 26], d: 8.5 },
  { x: [-8, 34, -8], y: [34, 48, 34], d: 6.5 },
]

export default function BubbleOrb({ names = [] }) {
  return (
    <div className="relative mx-auto mb-6 flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 28%, #ffd9a8 0%, var(--color-accent-2) 28%, var(--color-accent) 62%, #b04a12 100%)',
          boxShadow: '0 0 60px 6px rgba(255,122,48,0.35), inset -14px -18px 40px rgba(120,40,0,0.35)',
        }}
        animate={{ scale: [1, 1.035, 1], y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute left-[18%] top-[13%] h-10 w-16 -rotate-[28deg] rounded-full bg-white/40 blur-md" />
      {names.map((name, i) => {
        const spot = SPOTS[i % SPOTS.length]
        return (
          <motion.span
            key={name + i}
            className="absolute rounded-full bg-white/85 px-3.5 py-1.5 text-sm font-bold text-[#7a2f08] shadow-lg"
            animate={{ x: spot.x, y: spot.y }}
            transition={{ duration: spot.d, repeat: Infinity, ease: 'easeInOut' }}
          >
            {name}
          </motion.span>
        )
      })}
    </div>
  )
}
