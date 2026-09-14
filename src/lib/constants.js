export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

export const WEEKDAY_LABELS = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
}

export const SUBJECT_COLORS = [
  { id: 'orange', bg: '#ff7c3a', soft: '#ff7c3a26' },
  { id: 'amber', bg: '#ffb347', soft: '#ffb34726' },
  { id: 'rose', bg: '#ff6b81', soft: '#ff6b8126' },
  { id: 'violet', bg: '#a78bfa', soft: '#a78bfa26' },
  { id: 'sky', bg: '#60c7ff', soft: '#60c7ff26' },
  { id: 'mint', bg: '#4ade80', soft: '#4ade8026' },
  { id: 'yellow', bg: '#facc15', soft: '#facc1526' },
  { id: 'slate', bg: '#94a3b8', soft: '#94a3b826' },
]

export function colorFor(colorId) {
  return SUBJECT_COLORS.find((c) => c.id === colorId) || SUBJECT_COLORS[0]
}

export const DEFAULT_PERIODS = [
  { period: 1, time: '08:00–08:45' },
  { period: 2, time: '08:50–09:35' },
  { period: 3, time: '09:55–10:40' },
  { period: 4, time: '10:45–11:30' },
  { period: 5, time: '11:45–12:30' },
  { period: 6, time: '12:35–13:20' },
  { period: 7, time: '13:30–14:15' },
  { period: 8, time: '14:20–15:05' },
]
