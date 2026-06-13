import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import type { Event } from '../types'
import { SOURCES } from '../types'
import { CalendarPlusIcon } from './CalendarPlusIcon'
import { downloadIcs } from '../utils/ics'
import { forwardRef } from 'react'

interface Props {
  event: Event
  onClick?: () => void
  showDayLabel?: boolean
  dayLabel?: string
}

export const EventCard = forwardRef<HTMLElement, Props>(function EventCard(
  { event, onClick, showDayLabel = true, dayLabel: dayLabelProp },
  ref,
) {
  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : null
  const dayLabel = dayLabelProp ?? `${format(start, 'EEE')} · ${format(start, 'MMM d')}`
  const multi = end ? `(through ${format(end, 'MMM d')})` : null

  const deadlineDays = event.registrationDeadline
    ? differenceInCalendarDays(parseISO(event.registrationDeadline), new Date())
    : null
  const showDeadline = deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 14

  const sourceShort = SOURCES[event.source].shortName
  const formatTag =
    event.format && event.feeUSD != null
      ? `${event.format} · $${event.feeUSD}`
      : event.format
        ? event.format
        : null

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    downloadIcs(event)
  }

  return (
    <article
      ref={ref}
      className="event"
      data-day={start.getDate()}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="event-head">
        {showDayLabel ? <span className="day-tag">{dayLabel}</span> : <span aria-hidden />}
        <button
          type="button"
          className="bookmark-btn"
          aria-label={`Add ${event.name} to calendar`}
          onClick={handleSave}
        >
          <CalendarPlusIcon size={22} />
        </button>
      </div>

      <h3 className="event-title">
        {event.name}
        {multi && <span className="multi"> {multi}</span>}
      </h3>

      <p className="event-meta">
        {event.location.venue && <span className="roman">{event.location.venue}</span>}
        {event.location.venue && event.location.city && ' · '}
        {event.location.city}
      </p>

      <div className="event-foot">
        <div className="tags">
          {event.divisions.slice(0, 4).map((d) => (
            <span key={d} className="tag">
              {d}
            </span>
          ))}
          {formatTag && <span className="tag">{formatTag}</span>}
          {showDeadline && (
            <span className="tag deadline">
              {deadlineDays === 0
                ? 'register today'
                : `register in ${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
        <span className="via">
          via {sourceShort} <span className="arrow">→</span>
        </span>
      </div>
    </article>
  )
})
