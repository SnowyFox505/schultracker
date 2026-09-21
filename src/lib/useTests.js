import { useAuth } from '../context/AuthContext'
import { useSharedList } from './useSharedList'

// Two separate per-user switches: shareTests (my tests go to the Bubble) and seeTests (I see the others').
// seeTests defaults to shareTests for accounts from before the split.
export function useTests() {
  const { profile } = useAuth()
  return useSharedList('tests', {
    order: 'date',
    shareEnabled: !!profile?.shareTests,
    viewEnabled: profile?.seeTests ?? !!profile?.shareTests,
  })
}
