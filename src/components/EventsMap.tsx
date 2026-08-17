import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { AppEvent } from '../data/types'
import { CATEGORY_META } from '../data/categories'

const MOSCOW_CENTER: [number, number] = [55.751244, 37.618423]
const DEFAULT_ZOOM = 11

// Markers whose rendered positions fall within this many screen pixels of
// each other are treated as one cluster and fanned out — a fixed lat/lon
// offset can't guarantee visual separation because the same distance in
// degrees covers a different number of pixels at every zoom level.
const CLUSTER_PX = 28
const SPREAD_PX = 20

interface PlacedEvent {
  event: AppEvent
  lat: number
  lon: number
}

function spreadByPixelDistance(events: AppEvent[], map: L.Map): PlacedEvent[] {
  const points = events.map((event) => ({
    event,
    point: map.latLngToLayerPoint([event.place.lat, event.place.lon]),
  }))
  const used = new Array(points.length).fill(false)
  const result: PlacedEvent[] = []

  for (let i = 0; i < points.length; i++) {
    if (used[i]) continue
    const group = [i]
    used[i] = true
    for (let j = i + 1; j < points.length; j++) {
      if (used[j]) continue
      if (points[i].point.distanceTo(points[j].point) < CLUSTER_PX) {
        group.push(j)
        used[j] = true
      }
    }

    if (group.length === 1) {
      const { event } = points[i]
      result.push({ event, lat: event.place.lat, lon: event.place.lon })
      continue
    }

    let centerPoint = L.point(0, 0)
    for (const idx of group) centerPoint = centerPoint.add(points[idx].point)
    centerPoint = centerPoint.divideBy(group.length)

    group.forEach((idx, k) => {
      const angle = (2 * Math.PI * k) / group.length
      const offsetPoint = centerPoint.add([SPREAD_PX * Math.cos(angle), SPREAD_PX * Math.sin(angle)])
      const latlng = map.layerPointToLatLng(offsetPoint)
      result.push({ event: points[idx].event, lat: latlng.lat, lon: latlng.lng })
    })
  }

  return result
}

// Leaflet's own wrapper element around the icon HTML is what actually gets
// `tabindex`/keyboard handling when `keyboard: true` (that's the node
// `marker.getElement()` returns) — the accessible name and keydown listener
// below are attached to *that* element, not this decorative inner span.
function markerIcon(event: AppEvent) {
  const meta = CATEGORY_META[event.category]
  return L.divIcon({
    className: 'event-marker',
    html: `<span style="background:${meta.color}" class="event-marker__pin" aria-hidden="true">${meta.emoji}</span>`,
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

interface EventMarkersProps {
  events: AppEvent[]
  onSelectEvent: (id: number) => void
}

function EventMarkers({ events, onSelectEvent }: EventMarkersProps) {
  const map = useMap()
  const [placed, setPlaced] = useState<PlacedEvent[]>([])

  useEffect(() => {
    function recompute() {
      setPlaced(spreadByPixelDistance(events, map))
    }
    recompute()
    // zoomend: pixel distances between markers change with zoom.
    // moveend: safety net for the rare case fitBounds settles without a zoom
    // change (so no zoomend fires) but the initial computation ran before
    // that settle.
    map.on('zoomend', recompute)
    map.on('moveend', recompute)
    return () => {
      map.off('zoomend', recompute)
      map.off('moveend', recompute)
    }
  }, [events, map])

  return (
    <>
      {placed.map(({ event, lat, lon }) => (
        <Marker
          key={event.id}
          position={[lat, lon]}
          icon={markerIcon(event)}
          eventHandlers={{
            click: () => onSelectEvent(event.id),
            add: (e) => {
              const el = e.target.getElement()
              if (!el) return
              el.setAttribute('aria-label', `${CATEGORY_META[event.category].label}: ${event.title}`)
              el.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                  keyEvent.preventDefault()
                  onSelectEvent(event.id)
                }
              })
            },
          }}
          keyboard
          alt={event.title}
        />
      ))}
    </>
  )
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
      <EventMarkers events={events} onSelectEvent={onSelectEvent} />
    </MapContainer>
  )
}
