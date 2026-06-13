// Transforms dataset/events.json (flat scraper schema) into public/data/events.scraped.json
// (app schema: { updatedAt, events: Event[] }). Promote by copying to events.json when reviewed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const IN = resolve(ROOT, 'dataset/events.json')
const OUT = resolve(ROOT, 'public/data/events.scraped.json')

type SourceId =
  | 'nagva' | 'tlsports' | 'fvbl' | 'revco' | 'sfdynasty'
  | 'noattitudes' | 'volleynation' | 'armada'
type Surface = 'indoor' | 'sand' | 'grass'

interface Event {
  id: string
  source: SourceId
  sourceUrl: string
  name: string
  startDate: string
  endDate?: string
  location: { venue?: string; city?: string; state?: string; coords?: [number, number] }
  divisions: string[]
  registrationDeadline?: string
  registrationUrl?: string
  notes?: string
  description?: string
  feeUSD?: number
  format?: string
  surface?: Surface
}

interface Raw {
  event_name?: string
  organizer?: string
  event_type?: string
  date?: string
  start_time?: string
  end_time?: string
  location_name?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: number | string
  longitude?: number | string
  price?: string
  registration_fee?: string
  registration_url?: string
  source_id?: string
  source_url?: string
  registration_status?: string
  skill_level?: string
  division?: string
  gender?: string
  age_group?: string
  format?: string
  capacity?: string
  contact_email?: string
  contact_phone?: string
  description?: string
  notes?: string
}

const SOURCE_MAP: Record<string, SourceId> = {
  volleyballlife: 'volleynation',
  sfdynastyvb: 'sfdynasty',
  fvbleague: 'fvbl',
  tlsports: 'tlsports',
  noattitudes: 'noattitudes',
  gdoc: 'fvbl',
}

function sourceFromUrl(url?: string): SourceId | undefined {
  if (!url) return undefined
  let host = ''
  try {
    host = new URL(url).host.replace(/^www\./, '')
  } catch {
    return undefined
  }
  if (host.endsWith('volleyballlife.com')) return 'volleynation'
  if (host === 'sfdynastyvb.com') return 'sfdynasty'
  if (host === 'sites.google.com') return 'fvbl'
  if (host === 'docs.google.com') return 'fvbl'
  if (host === 'tl-sports.com') return 'tlsports'
  if (host === 'noattitudesbeachvolleyball.com') return 'noattitudes'
  return undefined
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function toIsoDate(s?: string): string | undefined {
  if (!s) return undefined
  const t = s.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const range = t.match(/^(\d{4}-\d{2}-\d{2})\s*(?:to|–|—|-)\s*\d{4}-\d{2}-\d{2}$/)
  if (range) return range[1]
  const d = new Date(t)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return undefined
}

function rangeEndDate(s?: string): string | undefined {
  if (!s) return undefined
  const m = s.trim().match(/^\d{4}-\d{2}-\d{2}\s*(?:to|–|—|-)\s*(\d{4}-\d{2}-\d{2})$/)
  return m?.[1]
}

function parseFee(s?: string): number | undefined {
  if (!s) return undefined
  const m = String(s).match(/\$?\s*(\d+(?:\.\d+)?)/)
  if (!m) return undefined
  const n = Number(m[1])
  return Number.isFinite(n) ? n : undefined
}

function inferFormat(raw: Raw): string | undefined {
  const name = (raw.event_name || '').toLowerCase()
  const fmt = (raw.format || '').toLowerCase()
  const text = `${fmt} ${name}`
  if (/\b(doubles|2['’]?s|2v2)\b/.test(text)) return '2s'
  if (/\b(triples|3['’]?s|3v3)\b/.test(text)) return '3s'
  if (/\b(quads|4['’]?s|4v4)\b/.test(text)) return '4s'
  if (/\b(sixes|6['’]?s|6v6)\b/.test(text)) return '6s'
  if (/\b9\s*man|9-man\b/.test(text)) return '9-man'
  return raw.format || undefined
}

function inferSurface(raw: Raw): Surface | undefined {
  const text = `${raw.event_type || ''} ${raw.format || ''} ${raw.location_name || ''} ${raw.event_name || ''} ${raw.notes || ''}`.toLowerCase()
  if (/\bindoor|gym\b/.test(text)) return 'indoor'
  if (/\bgrass\b/.test(text)) return 'grass'
  if (/\bbeach|sand\b/.test(text)) return 'sand'
  return undefined
}

function inferDivisions(raw: Raw): string[] {
  const out = new Set<string>()
  const name = (raw.event_name || '').toLowerCase()
  const div = (raw.division || '').toLowerCase()
  const gender = (raw.gender || '').toLowerCase()
  const text = `${name} ${div} ${gender}`
  if (/\brev(erse)?\s*(coed|co)\b|rev co/.test(text)) out.add('Reverse Coed')
  else if (/\bcoed\b|\bco-ed\b/.test(text)) out.add('Coed')
  if (/\bwomen('s)?\b/.test(text)) out.add("Women's")
  if (/\bmen('s)?\b/.test(text)) out.add("Men's")
  if (raw.skill_level) out.add(raw.skill_level)
  if (raw.age_group) out.add(raw.age_group)
  return Array.from(out)
}

function transform(raw: Raw, idx: number): Event | null {
  const sourceId = SOURCE_MAP[raw.source_id || ''] ?? sourceFromUrl(raw.source_url)
  if (!sourceId) return null
  const startDate = toIsoDate(raw.date)
  const name = raw.event_name?.trim()
  if (!name || !startDate) return null

  const lat = num(raw.latitude)
  const lng = num(raw.longitude)

  const ev: Event = {
    id: `${sourceId}-${slugify(name)}-${startDate}-${idx}`,
    source: sourceId,
    sourceUrl: raw.source_url || '',
    name,
    startDate,
    location: {
      venue: raw.location_name?.trim() || undefined,
      city: raw.city?.trim() || undefined,
      state: raw.state?.trim() || undefined,
      coords: lat != null && lng != null ? [lng, lat] : undefined,
    },
    divisions: inferDivisions(raw),
  }
  const endDate = rangeEndDate(raw.date)
  if (endDate && endDate !== startDate) ev.endDate = endDate
  const feeUsd = parseFee(raw.registration_fee || raw.price)
  if (feeUsd != null) ev.feeUSD = feeUsd
  const fmt = inferFormat(raw)
  if (fmt) ev.format = fmt
  const surface = inferSurface(raw)
  if (surface) ev.surface = surface
  if (raw.registration_url) ev.registrationUrl = raw.registration_url
  if (raw.notes) ev.notes = raw.notes
  if (raw.description) ev.description = raw.description
  return ev
}

function main() {
  if (!existsSync(IN)) {
    console.error(`Missing input: ${IN}`)
    process.exit(1)
  }
  const rawArr: Raw[] = JSON.parse(readFileSync(IN, 'utf8'))
  const events = rawArr
    .map((r, i) => transform(r, i))
    .filter((e): e is Event => e !== null)

  const out = {
    updatedAt: new Date().toISOString(),
    events,
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2))
  console.log(`Wrote ${events.length}/${rawArr.length} events to ${OUT}`)
}

main()
