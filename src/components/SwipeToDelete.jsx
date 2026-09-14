import { motion } from 'framer-motion'

const THRESHOLD = 70

export default function SwipeToDelete({ onDelete, children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-[#ff6b81] pr-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -96, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -THRESHOLD) onDelete()
        }}
        style={{ touchAction: 'pan-y' }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}
