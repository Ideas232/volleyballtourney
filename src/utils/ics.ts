import type { Event } from '../types'

function escape(s: string): string {
  return s.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n')
}

function fmtDate(iso: string): string {
  return iso.replace(/-/g, '')
}

function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d))
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

function fmtStamp(): string {
  // YYYYMMDDTHHMMSSZ — current time in UTC
  const d = new Date()
  return (
    d.getUTCFullYear().toString().padStart(4, '0') +
    (d.getUTCMonth() + 1).toString().padStart(2, '0') +
    d.getUTCDate().toString().padStart(2, '0') +
    'T' +
    d.getUTCHours().toString().padStart(2, '0') +
    d.getUTCMinutes().toString().padStart(2, '0') +
    d.getUTCSeconds().toString().padStart(2, '0') +
    'Z'
  )
}

export function eventToIcs(event: Event): string {
  const dtStart = fmtDate(event.startDate)
  const dtEnd = nextDay(event.endDate ?? event.startDate)
  const location = [event.location.venue, event.location.city, event.location.state]
    .filter(Boolean)
    .join(', ')
  const descParts = [
    event.divisions.join(', '),
    event.format ? `Format: ${event.format}` : null,
    event.feeUSD != null ? `Entry: $${event.feeUSD}/team` : null,
    event.registrationDeadline ? `Register by: ${event.registrationDeadline}` : null,
    event.notes,
    event.registrationUrl ?? event.sourceUrl,
  ].filter(Boolean) as string[]

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bay Vball//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@bay-vball`,
    `DTSTAMP:${fmtStamp()}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escape(event.name)}`,
    location ? `LOCATION:${escape(location)}` : null,
    descParts.length ? `DESCRIPTION:${escape(descParts.join('\n'))}` : null,
    `URL:${event.sourceUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[]

  return lines.join('\r\n')
}

export function downloadIcs(event: Event): void {
  const blob = new Blob([eventToIcs(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
