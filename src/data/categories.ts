import type { EventCategory } from './types'

interface CategoryMeta {
  label: string
  emoji: string
  color: string
}

export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  concert: { label: 'Концерт', emoji: '🎵', color: '#e0592a' },
  theater: { label: 'Театр', emoji: '🎭', color: '#8656d1' },
  kids: { label: 'Детям', emoji: '🧒', color: '#2aa876' },
  cinema: { label: 'Кино', emoji: '🎬', color: '#2a6ee0' },
  party: { label: 'Вечеринка', emoji: '🎉', color: '#d1348a' },
  tour: { label: 'Экскурсия', emoji: '🚶', color: '#c9932a' },
  entertainment: { label: 'Развлечения', emoji: '🎲', color: '#3a9bd1' },
}

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[]
