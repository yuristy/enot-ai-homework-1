import type { EventCategory } from './types'

interface CategoryMeta {
  label: string
  emoji: string
  color: string
}

// Colors are tuned to hold >= 4.5:1 contrast against white text (used on
// active chips, list-item rails and the event-card band) — the original,
// lighter shades of concert/kids/tour/entertainment failed WCAG AA.
export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  concert: { label: 'Концерт', emoji: '🎵', color: '#b8431a' },
  theater: { label: 'Театр', emoji: '🎭', color: '#8656d1' },
  kids: { label: 'Детям', emoji: '🧒', color: '#1f7d59' },
  cinema: { label: 'Кино', emoji: '🎬', color: '#2a6ee0' },
  party: { label: 'Вечеринка', emoji: '🎉', color: '#d1348a' },
  tour: { label: 'Экскурсия', emoji: '🚶', color: '#8a660e' },
  entertainment: { label: 'Развлечения', emoji: '🎲', color: '#256b91' },
}

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[]
