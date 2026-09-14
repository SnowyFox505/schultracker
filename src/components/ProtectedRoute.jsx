import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (profile && !profile.onboardingComplete) return <Navigate to="/onboarding" replace />

  return <Outlet />
}

export function OnboardingRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/" replace />

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader />
  if (user && profile?.onboardingComplete) return <Navigate to="/" replace />
  if (user && profile && !profile.onboardingComplete) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
