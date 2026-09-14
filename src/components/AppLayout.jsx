import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="gradient-warm min-h-screen w-full md:flex">
      <SideNav />
      <div className="min-w-0 flex-1">
        <div className="safe-top mx-auto w-full max-w-md px-5 pb-28 pt-6 md:max-w-3xl md:px-10 md:pb-16 md:pt-12 lg:max-w-5xl xl:max-w-6xl">
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
