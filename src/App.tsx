import { useMemo, useState } from 'react'
import { loadEvents, snapshotWindow } from './data/events'
import { ALL_CATEGORIES, CATEGORY_META } from './data/categories'
import { useEventFilter } from './hooks/useEventFilter'
import { Calendar } from './components/Calendar'
import { EventsMap } from './components/EventsMap'
import { EventCard } from './components/EventCard'
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
        <h1>Карта мероприятий Москвы</h1>
        <p className="app__subtitle">
          {screenState === 'empty' && `Ближайшие мероприятия: ${snapshotWindow.start} – ${defaultRangeEnd}`}
          {screenState === 'has-data' && `Мероприятия на ${selectedDate}`}
          {screenState === 'not-found' && `Мероприятия на ${selectedDate}`}
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
          <label htmlFor="category-select">Категория</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
          >
            <option value="all">Все категории</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
              </option>
            ))}
          </select>
          {selectedDate !== null && (
            <button type="button" className="app__reset" onClick={() => setSelectedDate(null)}>
              Сбросить день
            </button>
          )}
        </div>
      </div>

      <div className="app__body">
        <aside className="app__list" aria-label="Список мероприятий">
          {screenState === 'not-found' && (
            <p className="app__empty-message">
              Ничего не найдено на выбранный день и категорию. Попробуйте выбрать другой день или
              категорию «Все категории».
            </p>
          )}
          {visibleEvents.length === 0 && screenState === 'empty' && (
            <p className="app__empty-message">На ближайшие дни мероприятий в снапшоте нет.</p>
          )}
          <ul>
            {visibleEvents.map((event) => (
              <li key={event.id}>
                <button type="button" className="app__list-item" onClick={() => setSelectedEventId(event.id)}>
                  <span className="app__list-item-emoji">{CATEGORY_META[event.category].emoji}</span>
                  <span>
                    <strong>{event.title}</strong>
                    <br />
                    {event.date}
                    {event.startTime ? `, ${event.startTime}` : ''} · {event.place.title}
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
