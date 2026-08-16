const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && DATE_RE.test(value)
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
