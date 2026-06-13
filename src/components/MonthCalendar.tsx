import {
  eachDayOfInterval,
  endOfMonth,
  isSameDay,
  isToday,
  startOfMonth,
} from 'date-fns'
import clsx from 'clsx'
import type { Event } from '../types'
import { VolleyballMark } from './VolleyballMark'

interface Props {
  month: Date
  events: Event[]
  selectedDay: Date | null
  onSelectDay: (d: Date) => void
}

const DAY_LABELS: { letter: string; weekend: boolean }[] = [
  { letter: 'S', weekend: true },
  { letter: 'M', weekend: false },
  { letter: 'T', weekend: false },
  { letter: 'W', weekend: false },
  { letter: 'T', weekend: false },
  { letter: 'F', weekend: false },
  { letter: 'S', weekend: true },
]

export function MonthCalendar({ month, events, selectedDay, onSelectDay }: Props) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })

  const leadingBlanks = Array.from({ length: start.getDay() }, () => null)

  const countByDay = new Map<string, number>()
  for (const e of events) {
    countByDay.set(e.startDate, (countByDay.get(e.startDate) ?? 0) + 1)
  }

  return (
    <section className="calendar">
      <div className="day-labels">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className={d.weekend ? 'wknd' : 'wkdy'}>
            {d.letter}
          </span>
        ))}
      </div>

      <div className="grid-days">
        {leadingBlanks.map((_, i) => (
          <div key={`pad-${i}`} aria-hidden />
        ))}

        {days.map((d) => {
          const key = d.toISOString().slice(0, 10)
          const count = countByDay.get(key) ?? 0
          const today = isToday(d)
          const selected = !!(selectedDay && isSameDay(selectedDay, d))
          const weekend = d.getDay() === 0 || d.getDay() === 6

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(d)}
              className={clsx('day-cell', weekend ? 'wknd' : 'wkdy', {
                today,
                selected,
              })}
              aria-pressed={selected}
              aria-label={d.toDateString()}
            >
              <span className="day-num">{d.getDate()}</span>
              {count > 0 && (
                <span className="evs" aria-hidden>
                  <VolleyballMark className="vmark" />
                  {count > 1 && <span className="vmark-count">×{count}</span>}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
