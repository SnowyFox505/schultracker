import { useAuth } from '../context/AuthContext'
import { useBreaks } from './useBreaks'
import { computePeriods } from './periods'

// This user's real period start/end times (see periods.js), derived from profile.schoolStart and
// their configured breaks instead of a fixed table.
export function usePeriods() {
  const { profile } = useAuth()
  const { breaks, loading } = useBreaks()
  return { periods: computePeriods(profile?.schoolStart, breaks), loading }
}
