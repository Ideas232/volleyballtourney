import { useMemo, useState } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { useEvents } from './data/useEvents'
import type { Event } from './types'
import { Header } from './components/Header'
import { MonthCalendar } from './components/MonthCalendar'
import { EventList } from './components/EventList'
import { DetailSheet } from './components/DetailSheet'
import { Footer } from './components/Footer'

function App() {
  const { events } = useEvents()
  const [month, setMonth] = useState<Date>(new Date(2026, 5, 1)) // June 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const eventsThisMonth = useMemo(
    () =>
      events
        .filter((e) => {
          const d = parseISO(e.startDate)
          return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, month],
  )

  const visibleEvents = useMemo(() => {
    if (!selectedDay) return eventsThisMonth
    return eventsThisMonth.filter((e) => isSameDay(parseISO(e.startDate), selectedDay))
  }, [eventsThisMonth, selectedDay])

  return (
    <div className="mx-auto min-h-full max-w-md pb-24">
      <Header
        month={month}
        tournamentCount={eventsThisMonth.length}
        onPrev={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        onNext={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
      />

      <MonthCalendar
        month={month}
        events={eventsThisMonth}
        selectedDay={selectedDay}
        onSelectDay={(d) =>
          setSelectedDay((prev) => (prev && isSameDay(prev, d) ? null : d))
        }
      />

      <div className="px-7 pt-10 pb-2 text-center text-stone-300 dark:text-stone-700" aria-hidden>
        <span className="text-[18px] tracking-[0.5em]">※</span>
      </div>

      <SectionHeader selectedDay={selectedDay} />

      <EventList
        events={visibleEvents}
        groupByDay={!selectedDay}
        onSelectEvent={setSelectedEvent}
      />

      <Footer />

      {selectedEvent && (
        <DetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}

function SectionHeader({ selectedDay }: { selectedDay: Date | null }) {
  return (
    <div className="px-7 pt-8 pb-3">
      <h2 className="font-serif text-[22px] italic font-normal text-stone-900 dark:text-stone-100">
        {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'All upcoming'}
      </h2>
    </div>
  )
}

export default App
