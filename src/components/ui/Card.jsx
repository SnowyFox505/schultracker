import { motion } from 'framer-motion'
import { TILE } from '../../lib/tile'

export default function Card({ children, className = '', ...props }) {
  return (
    <motion.div
      layout
      className={`p-5 ${TILE} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
