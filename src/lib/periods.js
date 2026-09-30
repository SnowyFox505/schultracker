import { PERIOD_NUMBERS } from './constants'

// Real per-period start/end times, computed from the user's actual school start time (45 min per
// lesson, back-to-back unless a break is configured after that period via useBreaks.js) instead of
// a fixed, school-specific time table. Mirrored (not imported — see the duplication note on
// api/cron-notify.js's own copy) so the server-side push cron can compute the same times.
export const LESSON_MINUTES = 45
export const DEFAULT_SCHOOL_START = '07:50'

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// `breaks`: the map from useBreaks() (afterPeriod -> { duration } in minutes). A period with no
// entry there runs straight into the next one.
export function computePeriods(schoolStart, breaks = {}) {
  let startMin = toMin(schoolStart || DEFAULT_SCHOOL_START)
  return PERIOD_NUMBERS.map((period) => {
    const endMin = startMin + LESSON_MINUTES
    const p = { period, start: toTime(startMin), end: toTime(endMin), startMin, endMin }
    startMin = endMin + (breaks[String(period)]?.duration || 0)
    return p
  })
}
