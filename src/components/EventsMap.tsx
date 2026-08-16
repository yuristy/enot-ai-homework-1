import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { AppEvent } from '../data/types'
import { CATEGORY_META } from '../data/categories'

const MOSCOW_CENTER: [number, number] = [55.751244, 37.618423]
const DEFAULT_ZOOM = 11

function markerIcon(category: AppEvent['category']) {
  const meta = CATEGORY_META[category]
  return L.divIcon({
    className: 'event-marker',
    html: `<span style="background:${meta.color}" class="event-marker__pin">${meta.emoji}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -28],
  })
}

function FitToEvents({ events }: { events: AppEvent[] }) {
  const map = useMap()
  useEffect(() => {
    if (events.length === 0) {
      map.setView(MOSCOW_CENTER, DEFAULT_ZOOM)
      return
    }
    const bounds = L.latLngBounds(events.map((e) => [e.place.lat, e.place.lon]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [events, map])
  return null
}

interface EventsMapProps {
  events: AppEvent[]
  onSelectEvent: (id: number) => void
}

export function EventsMap({ events, onSelectEvent }: EventsMapProps) {
  return (
    <MapContainer center={MOSCOW_CENTER} zoom={DEFAULT_ZOOM} className="events-map" attributionControl>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitToEvents events={events} />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.place.lat, event.place.lon]}
          icon={markerIcon(event.category)}
          eventHandlers={{ click: () => onSelectEvent(event.id) }}
          keyboard
          alt={event.title}
        />
      ))}
    </MapContainer>
  )
}
