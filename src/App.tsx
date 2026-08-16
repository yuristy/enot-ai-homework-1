import { useMemo, useState } from 'react'
import { loadEvents, snapshotWindow } from './data/events'
import { ALL_CATEGORIES, CATEGORY_META } from './data/categories'
import { useEventFilter } from './hooks/useEventFilter'
import { Calendar } from './components/Calendar'
import { EventsMap } from './components/EventsMap'
import { EventCard } from './components/EventCard'
import { formatDateHuman, formatDateRangeHuman } from './utils/date'
import './App.css'

const allEvents = loadEvents()

export default function App() {
  const {
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    visibleEvents,
    screenState,
    defaultRangeEnd,
  } = useEventFilter(allEvents)

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const selectedEvent = useMemo(
    () => visibleEvents.find((e) => e.id === selectedEventId) ?? null,
    [visibleEvents, selectedEventId],
  )

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__eyebrow">Москва · афиша</span>
        <h1>Карта мероприятий</h1>
        <p className="app__subtitle">
          {screenState === 'empty' &&
            `Ближайшие мероприятия: ${formatDateRangeHuman(snapshotWindow.start, defaultRangeEnd)}`}
          {screenState !== 'empty' && selectedDate && `Мероприятия на ${formatDateHuman(selectedDate)}`}
        </p>
      </header>

      <div className="app__controls">
        <Calendar
          events={allEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          initialMonth={snapshotWindow.start}
        />
        <div className="app__filter">
          <div className="app__filter-head">
            <span className="app__eyebrow">Категория</span>
            {selectedDate !== null && (
              <button type="button" className="app__reset" onClick={() => setSelectedDate(null)}>
                Сбросить день ✕
              </button>
            )}
          </div>
          <div className="app__chips" role="group" aria-label="Категория мероприятия">
            <button
              type="button"
              className="app__chip"
              data-active={selectedCategory === 'all'}
              aria-pressed={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              Все
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat]
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  className="app__chip"
                  data-active={active}
                  aria-pressed={active}
                  style={active ? { background: meta.color, borderColor: meta.color } : { borderColor: meta.color }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="app__body">
        <aside className="app__list" aria-label="Список мероприятий">
          {screenState === 'not-found' && (
            <p className="app__empty-message">
              Ничего не найдено на выбранный день и категорию. Попробуйте выбрать другой день или
              категорию «Все».
            </p>
          )}
          {visibleEvents.length === 0 && screenState === 'empty' && (
            <p className="app__empty-message">На ближайшие дни мероприятий в снапшоте нет.</p>
          )}
          <ul>
            {visibleEvents.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className="app__list-item"
                  style={{ borderInlineStartColor: CATEGORY_META[event.category].color }}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <span className="app__list-item-time">{event.startTime ?? '—'}</span>
                  <span className="app__list-item-body">
                    <strong>{event.title}</strong>
                    <span className="app__list-item-place">
                      {CATEGORY_META[event.category].emoji} {event.place.title}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="app__map-wrap">
          <EventsMap events={visibleEvents} onSelectEvent={setSelectedEventId} />
        </main>
      </div>

      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEventId(null)} />}
    </div>
  )
}
