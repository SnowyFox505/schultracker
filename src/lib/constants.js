export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

export const JS_DAY_TO_WEEKDAY = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr' }

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

export function colorFor(colorId, customColors = []) {
  return (
    SUBJECT_COLORS.find((c) => c.id === colorId) ||
    customColors.find((c) => c.id === colorId) ||
    SUBJECT_COLORS[0]
  )
}

export function makeCustomColor(hex) {
  const id = `custom-${hex.replace('#', '').toLowerCase()}`
  return { id, bg: hex, soft: `${hex}26` }
}

// Real per-period times are computed (see src/lib/periods.js) from the user's school start time
// and breaks, not fixed here — this is just the period numbers themselves (how many periods a day
// can have).
export const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8]
