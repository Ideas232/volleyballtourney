import { format, parseISO } from 'date-fns'
import type { Event } from '../types'
import { EventCard } from './EventCard'

interface Props {
  events: Event[]
  groupByDay: boolean
  onSelectEvent: (e: Event) => void
}

export function EventList({ events, groupByDay, onSelectEvent }: Props) {
  if (events.length === 0) {
    return (
      <div className="border-t border-stone-200 px-7 py-10 text-center text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">
        No tournaments on this day.
      </div>
    )
  }

  if (!groupByDay) {
    return (
      <div className="border-t border-stone-900 dark:border-stone-100">
        {events.map((e) => (
          <EventCard key={e.id} event={e} onClick={() => onSelectEvent(e)} showDayLabel={false} />
        ))}
      </div>
    )
  }

  // Group by date
  const groups = new Map<string, Event[]>()
  for (const e of events) {
    if (!groups.has(e.startDate)) groups.set(e.startDate, [])
    groups.get(e.startDate)!.push(e)
  }

  return (
    <div className="border-t border-stone-900 dark:border-stone-100">
      {Array.from(groups.entries()).map(([dateKey, list]) => (
        <div key={dateKey}>
          {list.map((e, i) => (
            <EventCard
              key={e.id}
              event={e}
              onClick={() => onSelectEvent(e)}
              showDayLabel={i === 0}
              dayLabel={format(parseISO(dateKey), 'EEE, MMM d').toUpperCase()}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
