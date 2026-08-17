const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Rejects strings that match the YYYY-MM-DD shape but aren't a real calendar
// date (e.g. "2026-13-45") by round-tripping through Date.UTC and checking
// the components survived unchanged.
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

// Display-only formatting — never used for comparisons or storage, those stay on YYYY-MM-DD strings.
export function formatDateHuman(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS_GENITIVE[m - 1]}`
}

export function formatDateRangeHuman(start: string, end: string): string {
  const [ys, ms] = start.split('-').map(Number)
  const [ye, me] = end.split('-').map(Number)
  const de = Number(end.split('-')[2])
  if (ys === ye && ms === me) {
    const ds = Number(start.split('-')[2])
    return `${ds}–${de} ${MONTHS_GENITIVE[ms - 1]}`
  }
  return `${formatDateHuman(start)} – ${formatDateHuman(end)}`
}
