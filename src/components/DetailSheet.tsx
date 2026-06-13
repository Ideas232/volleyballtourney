import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { Event } from '../types'
import { SOURCES } from '../types'
import { downloadIcs } from '../utils/ics'

interface Props {
  event: Event
  onClose: () => void
}

export function DetailSheet({ event, onClose }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    setOpen(false)
    setTimeout(onClose, 320)
  }

  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : null
  const dayLabel = `${format(start, 'EEE')} · ${format(start, 'MMM d')}`
  const multi = end ? `(through ${format(end, 'MMM d')})` : null

  const deadlineDays = event.registrationDeadline
    ? differenceInCalendarDays(parseISO(event.registrationDeadline), new Date())
    : null
  const deadlineLabel = event.registrationDeadline
    ? format(parseISO(event.registrationDeadline), 'EEE, MMM d')
    : '—'
  const deadlineSoon = deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 7

  const source = SOURCES[event.source]
  const venueLine = [event.location.venue, event.location.city].filter(Boolean).join(' · ')

  return (
    <>
      <div className={clsx('scrim', { open })} onClick={handleClose} aria-hidden />
      <aside
        className={clsx('sheet', { open })}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="handle" aria-hidden />
        <button className="sheet-close" aria-label="Close" onClick={handleClose}>
          ×
        </button>

        <div className="body">
          <div className="day-tag">{dayLabel}</div>
          <h2 id="sheet-title">
            {event.name}
            {multi && <span className="multi">{multi}</span>}
          </h2>

          {venueLine && (
            <a
              className="venue"
              href={source.homepage}
              target="_blank"
              rel="noreferrer"
            >
              {event.location.venue}
              {event.location.venue && event.location.city && ' · '}
              <span className="city">{event.location.city}</span>
            </a>
          )}

          {event.description && (
            <div className="description">
              {event.description.split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <div className="stats">
            <div className="stat">
              <div className="k">Format</div>
              <div className="v">{event.format ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="k">Fee</div>
              <div className="v">{event.feeUSD != null ? `$${event.feeUSD}/team` : '—'}</div>
            </div>
            <div className="stat">
              <div className="k">Deadline</div>
              <div className={clsx('v', { deadline: deadlineSoon })}>{deadlineLabel}</div>
            </div>
            <div className="stat">
              <div className="k">Source</div>
              <div className="v">{source.shortName}</div>
            </div>
          </div>

          {event.divisions.length > 0 && (
            <>
              <div className="divisions-label">Divisions</div>
              <div className="divisions">
                {event.divisions.map((d) => (
                  <span key={d} className="tag">
                    {d}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="actions">
          {event.registrationUrl && (
            <a
              className="btn primary"
              href={event.registrationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Register / more info ↗
            </a>
          )}
          <button className="btn secondary" type="button" onClick={() => downloadIcs(event)}>
            Add to calendar
          </button>
        </div>
      </aside>
    </>
  )
}
