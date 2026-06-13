import { useEffect, useState } from 'react'
import type { Event } from '../types'
import { SAMPLE_EVENTS } from './events'

// Tries to fetch the live events.json (produced by the scraper in CI),
// falls back to bundled sample data so the UI always has something to show.
export function useEvents(): { events: Event[]; loading: boolean; updatedAt: string | null } {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/events.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { events: Event[]; updatedAt: string }) => {
        if (cancelled) return
        if (Array.isArray(data?.events) && data.events.length > 0) {
          setEvents(data.events)
          setUpdatedAt(data.updatedAt ?? null)
        }
      })
      .catch(() => {
        // Sample data is already in state; nothing to do
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { events, loading, updatedAt }
}
