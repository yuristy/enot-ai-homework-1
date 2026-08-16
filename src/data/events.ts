import snapshot from './events-snapshot.json'
import type { AppEvent } from './types'

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
 */
export function loadEvents(): AppEvent[] {
  return snapshot.events as AppEvent[]
}

export const snapshotWindow = {
  start: snapshot.meta.windowStart,
  end: snapshot.meta.windowEnd,
}
