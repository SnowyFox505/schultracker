import { motion } from 'framer-motion'

const SPOTS = [
  { x: [-38, 26, -38], y: [-30, -8, -30], d: 7 },
  { x: [30, -24, 30], y: [26, 4, 26], d: 8.5 },
  { x: [-8, 34, -8], y: [34, 48, 34], d: 6.5 },
]

// kleine Bläschen außerhalb: Position in %, Größe in px
const MINI = [
  { left: '-4%', top: '30%', size: 12, d: 6, delay: 0 },
  { left: '96%', top: '14%', size: 9, d: 7.5, delay: 1.2 },
  { left: '92%', top: '78%', size: 14, d: 8, delay: 0.6 },
  { left: '4%', top: '86%', size: 7, d: 5.5, delay: 2 },
]

const rimMask = 'radial-gradient(circle, transparent 52%, #000 94%)'

export default function BubbleOrb({ names = [] }) {
  return (
    <div className="relative mx-auto mb-6 flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
      {/* weicher Glow */}
      <motion.div
        className="absolute -inset-6 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,122,48,0.28) 45%, transparent 70%)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.03, 1], y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* durchscheinender Körper: innen hell, zum Rand satter */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,200,140,0.42) 0%, rgba(255,150,70,0.6) 50%, rgba(255,115,40,0.82) 85%, rgba(255,150,80,0.95) 100%)',
            boxShadow: '0 0 40px 2px rgba(255,122,48,0.35), inset 0 0 26px rgba(255,200,150,0.35)',
            border: '1px solid rgba(255,215,180,0.45)',
          }}
        />

        {/* schillernder Rand (Seifenblasen-Effekt), dreht sich langsam */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-90 mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 0deg, #ffb37a, #ffe3a8, #b8f0ff, #d9b8ff, #ffb0c8, #ffb37a)',
            WebkitMaskImage: rimMask,
            maskImage: rimMask,
            filter: 'blur(2px)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />

        {/* Glanzlichter */}
        <div className="absolute left-[14%] top-[10%] h-[22%] w-[38%] -rotate-[32deg] rounded-full bg-gradient-to-b from-white/70 to-white/5 blur-[6px]" />
        <div className="absolute left-[24%] top-[32%] h-[5%] w-[5%] rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute bottom-[9%] right-[16%] h-[10%] w-[24%] rotate-[-38deg] rounded-full bg-white/25 blur-[5px]" />
      </motion.div>

      {/* Mini-Bläschen */}
      {MINI.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.85), rgba(255,170,100,0.5) 55%, rgba(255,122,48,0.7))',
            boxShadow: '0 0 10px rgba(255,122,48,0.45)',
          }}
          animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
          transition={{ duration: m.d, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        />
      ))}

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
