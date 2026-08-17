import { useEffect, useMemo, useState } from 'react'
import type { AppEvent } from '../data/types'
import { formatDateHuman } from '../utils/date'

interface CalendarProps {
  events: AppEvent[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  initialMonth: string // YYYY-MM-DD, any date within the month to show first
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function Calendar({ events, selectedDate, onSelectDate, initialMonth }: CalendarProps) {
  const [year, initialMonthIndex] = (selectedDate ?? initialMonth).split('-').map(Number)
  const [cursor, setCursor] = useState({ year, month: initialMonthIndex - 1 })

  // Keep the visible month in sync with a selectedDate set from outside
  // (e.g. restored from localStorage on load) rather than only reacting to
  // in-calendar navigation.
  useEffect(() => {
    if (!selectedDate) return
    const [y, m] = selectedDate.split('-').map(Number)
    setCursor((prev) => (prev.year === y && prev.month === m - 1 ? prev : { year: y, month: m - 1 }))
  }, [selectedDate])

  const eventCountByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) {
      map.set(event.date, (map.get(event.date) ?? 0) + 1)
    }
    return map
  }, [events])

  const firstOfMonth = new Date(Date.UTC(cursor.year, cursor.month, 1))
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate()
  // Convert Sunday(0)-based getUTCDay() to Monday-first offset.
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(Date.UTC(prev.year, prev.month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" onClick={() => goToMonth(-1)} aria-label="Предыдущий месяц">
          ‹
        </button>
        <span className="calendar__title">
          {MONTH_LABELS[cursor.month]} {cursor.year}
        </span>
        <button type="button" onClick={() => goToMonth(1)} aria-label="Следующий месяц">
          ›
        </button>
      </div>
      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar__grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} className="calendar__cell calendar__cell--blank" />
          const dateKey = toDateKey(cursor.year, cursor.month, day)
          const count = eventCountByDate.get(dateKey) ?? 0
          const isSelected = dateKey === selectedDate
          const label = `${formatDateHuman(dateKey)}${count > 0 ? `, мероприятий: ${count}` : ', мероприятий нет'}`
          return (
            <button
              key={dateKey}
              type="button"
              className={`calendar__cell calendar__day${isSelected ? ' calendar__day--selected' : ''}`}
              aria-pressed={isSelected}
              aria-label={label}
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
            >
              <span>{day}</span>
              {count > 0 && <span className="calendar__dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
