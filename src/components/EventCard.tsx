import { useEffect, useRef } from 'react'
import type { AppEvent } from '../data/types'
import { CATEGORY_META } from '../data/categories'

interface EventCardProps {
  event: AppEvent
  onClose: () => void
}

export function EventCard({ event, onClose }: EventCardProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const meta = CATEGORY_META[event.category]

  return (
    <div className="event-card__backdrop" onClick={onClose}>
      <div
        className="event-card"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="event-card__close" onClick={onClose} ref={closeButtonRef}>
          Закрыть ✕
        </button>
        <span className="event-card__category" style={{ background: meta.color }}>
          {meta.emoji} {meta.label}
        </span>
        <h2>{event.title}</h2>
        <p className="event-card__meta">
          {event.date}
          {event.startTime ? `, ${event.startTime}` : ''}
        </p>
        <p className="event-card__meta">
          {event.place.title}, {event.place.address}
        </p>
        <p>{event.description}</p>
        <a href={event.sourceUrl} target="_blank" rel="noreferrer">
          Источник (KudaGo)
        </a>
      </div>
    </div>
  )
}
