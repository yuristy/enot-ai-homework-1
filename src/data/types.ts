export type EventCategory =
  | 'cinema'
  | 'concert'
  | 'entertainment'
  | 'kids'
  | 'party'
  | 'theater'
  | 'tour'

export interface EventPlace {
  title: string
  address: string
  lat: number
  lon: number
}

/**
 * Normalized shape used by the whole app. Decoupled from the raw KudaGo API
 * response on purpose — swapping the loader implementation (snapshot -> live
 * API) only needs to keep producing this same type.
 */
export interface AppEvent {
  id: number
  title: string
  category: EventCategory
  date: string // YYYY-MM-DD, Europe/Moscow
  startTime: string | null // HH:MM or null
  place: EventPlace
  description: string
  sourceUrl: string
}
