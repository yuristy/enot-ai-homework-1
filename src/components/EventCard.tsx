import { useEffect, useRef } from 'react'
import type { AppEvent } from '../data/types'
import { CATEGORY_META } from '../data/categories'
import { formatDateHuman } from '../utils/date'

interface EventCardProps {
  event: AppEvent
  onClose: () => void
}

export function EventCard({ event, onClose }: EventCardProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    triggerRef.current = document.activeElement
    closeButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
    }
  }, [onClose])

  const meta = CATEGORY_META[event.category]

  return (
    <div className="event-card__backdrop" onClick={onClose}>
      <div
        className="event-card"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-card__band" style={{ background: meta.color }}>
          <span className="event-card__category">
            <span aria-hidden="true">{meta.emoji}</span> {meta.label}
          </span>
          <button type="button" className="event-card__close" onClick={onClose} ref={closeButtonRef}>
            Закрыть <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="event-card__perforation" aria-hidden="true" />
        <div className="event-card__body">
          <h2>{event.title}</h2>
          <p className="event-card__meta">
            <span className="event-card__time">
              {formatDateHuman(event.date)}
              {event.startTime ? `, ${event.startTime}` : ''}
            </span>
          </p>
          <p className="event-card__meta">
            {event.place.title}, {event.place.address}
          </p>
          <p className="event-card__description">{event.description}</p>
          <a href={event.sourceUrl} target="_blank" rel="noreferrer">
            Источник (KudaGo) →
          </a>
        </div>
      </div>
    </div>
  )
}
