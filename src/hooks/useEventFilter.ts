import { useEffect, useMemo, useState } from 'react'
import type { AppEvent, EventCategory } from '../data/types'
import { ALL_CATEGORIES } from '../data/categories'
import { snapshotWindow } from '../data/events'
import { addDays, isDateInRange, isValidDateString } from '../utils/date'

export type ScreenState = 'empty' | 'has-data' | 'not-found'

const STORAGE_KEY = 'moscow-events-filter'
const DEFAULT_RANGE_DAYS = 7

type CategoryFilter = EventCategory | 'all'

interface StoredFilter {
  selectedDate: string | null
  selectedCategory: CategoryFilter
}

function isCategoryFilter(value: unknown): value is CategoryFilter {
  return value === 'all' || (typeof value === 'string' && ALL_CATEGORIES.includes(value as EventCategory))
}

function readStoredFilter(): StoredFilter | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { selectedDate, selectedCategory } = parsed as Record<string, unknown>
    const dateOk = selectedDate === null || isValidDateString(selectedDate)
    const categoryOk = isCategoryFilter(selectedCategory)
    if (!dateOk || !categoryOk) return null
    return { selectedDate: selectedDate as string | null, selectedCategory: selectedCategory as CategoryFilter }
  } catch {
    // Corrupted or foreign JSON — fall back to the empty state instead of crashing.
    return null
  }
}

export function useEventFilter(events: AppEvent[]) {
  const stored = useMemo(readStoredFilter, [])
  const [selectedDate, setSelectedDate] = useState<string | null>(stored?.selectedDate ?? null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(stored?.selectedCategory ?? 'all')

  useEffect(() => {
    const value: StoredFilter = { selectedDate, selectedCategory }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Storage unavailable (private mode, quota, disabled) — filter still works in-memory.
    }
  }, [selectedDate, selectedCategory])

  const defaultRangeEnd = useMemo(() => addDays(snapshotWindow.start, DEFAULT_RANGE_DAYS - 1), [])

  const { visibleEvents, screenState } = useMemo(() => {
    if (selectedDate === null) {
      const inRange = events.filter(
        (e) =>
          isDateInRange(e.date, snapshotWindow.start, defaultRangeEnd) &&
          (selectedCategory === 'all' || e.category === selectedCategory),
      )
      const state: ScreenState = inRange.length > 0 || selectedCategory === 'all' ? 'empty' : 'not-found'
      return { visibleEvents: inRange, screenState: state }
    }
    const filtered = events.filter(
      (e) => e.date === selectedDate && (selectedCategory === 'all' || e.category === selectedCategory),
    )
    return {
      visibleEvents: filtered,
      screenState: (filtered.length > 0 ? 'has-data' : 'not-found') as ScreenState,
    }
  }, [events, selectedDate, selectedCategory, defaultRangeEnd])

  return {
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    visibleEvents,
    screenState,
    defaultRangeEnd,
  }
}
