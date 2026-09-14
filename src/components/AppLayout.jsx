import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="gradient-warm min-h-screen w-full">
      <div className="safe-top mx-auto max-w-md px-5 pb-28 pt-6">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  )
}
