import snapshot from './events-snapshot.json'
import type { AppEvent } from './types'
import { ALL_CATEGORIES } from './categories'
import { isValidDateString } from '../utils/date'

const TIME_RE = /^\d{2}:\d{2}$/

function isValidAppEvent(value: unknown): value is AppEvent {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  if (typeof e.id !== 'number') return false
  if (typeof e.title !== 'string' || e.title.length === 0) return false
  if (typeof e.category !== 'string' || !ALL_CATEGORIES.includes(e.category as AppEvent['category'])) return false
  if (typeof e.date !== 'string' || !isValidDateString(e.date)) return false
  if (e.startTime !== null && (typeof e.startTime !== 'string' || !TIME_RE.test(e.startTime))) return false
  if (typeof e.description !== 'string') return false
  if (typeof e.sourceUrl !== 'string') return false

  const place = e.place as Record<string, unknown> | undefined
  if (typeof place !== 'object' || place === null) return false
  if (typeof place.title !== 'string' || typeof place.address !== 'string') return false
  if (typeof place.lat !== 'number' || !Number.isFinite(place.lat)) return false
  if (typeof place.lon !== 'number' || !Number.isFinite(place.lon)) return false

  return true
}

/**
 * Single seam for event data access. Every component reads events through
 * this module and only knows the `AppEvent` shape — never the raw snapshot
 * or KudaGo API response shape directly.
 *
 * Today this reads the bundled static snapshot (no network call, so a clean
 * checkout has nothing that can fail over the network). Swapping to the live
 * KudaGo API later means replacing the body of `loadEvents` with a `fetch`
 * that maps the raw response into the same `AppEvent[]` — nothing else in
 * the app changes.
 *
 * Rows are validated here, at the seam, rather than trusted with a type
 * assertion — a malformed row (bad category, non-finite coordinates, missing
 * field) is dropped and logged instead of crashing the whole screen.
 */
export function loadEvents(): AppEvent[] {
  const raw = snapshot.events as unknown[]
  const valid = raw.filter(isValidAppEvent)
  if (valid.length !== raw.length) {
    console.warn(`loadEvents: dropped ${raw.length - valid.length} malformed event(s) from the snapshot`)
  }
  return valid
}

export const snapshotWindow = {
  start: snapshot.meta.windowStart,
  end: snapshot.meta.windowEnd,
}
