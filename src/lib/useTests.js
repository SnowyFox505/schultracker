import { useAuth } from '../context/AuthContext'
import { useSharedList } from './useSharedList'

// Tests are only shared with the Bubble if this user switched "Tests & Termine teilen" on.
export function useTests() {
  const { profile } = useAuth()
  return useSharedList('tests', { order: 'date', shareEnabled: !!profile?.shareTests })
}
