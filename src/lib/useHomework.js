import { useSharedList } from './useSharedList'

export function useHomework() {
  return useSharedList('homework', { order: 'dueDate', withDone: true })
}
