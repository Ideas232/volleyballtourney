export type SourceId = 'nagva' | 'tlsports' | 'fvbl' | 'revco' | 'sfdynasty' | 'noattitudes' | 'volleynation' | 'armada'

export type Surface = 'indoor' | 'sand' | 'grass'

export interface Source {
  id: SourceId
  name: string
  shortName: string
  homepage: string
}

export interface Event {
  id: string
  source: SourceId
  sourceUrl: string
  name: string
  startDate: string // ISO YYYY-MM-DD
  endDate?: string
  location: {
    venue?: string
    city?: string
    state?: string
    coords?: [number, number] // [lng, lat]
  }
  divisions: string[]
  registrationDeadline?: string
  registrationUrl?: string
  notes?: string
  description?: string
  feeUSD?: number
  format?: string  // e.g. "2s", "4s", "6s"
  surface?: Surface
}

export const SOURCES: Record<SourceId, Source> = {
  nagva: {
    id: 'nagva',
    name: 'North American Gay Volleyball Association',
    shortName: 'NAGVA',
    homepage: 'https://www.nagva.org/tournaments',
  },
  tlsports: {
    id: 'tlsports',
    name: 'The League Sports',
    shortName: 'TL Sports',
    homepage: 'https://www.tl-sports.com/tournaments',
  },
  fvbl: {
    id: 'fvbl',
    name: 'FVBL',
    shortName: 'FVBL',
    homepage: 'https://sites.google.com/view/fvbleague/',
  },
  revco: {
    id: 'revco',
    name: 'Revco Volleyball',
    shortName: 'Revco',
    homepage: 'https://www.revcovolleyball.com/',
  },
  sfdynasty: {
    id: 'sfdynasty',
    name: 'SF Dynasty Volleyball',
    shortName: 'SF Dynasty',
    homepage: 'https://sfdynastyvb.com/upcoming-events',
  },
  noattitudes: {
    id: 'noattitudes',
    name: 'No Attitudes Beach Volleyball',
    shortName: 'No Attitudes',
    homepage: 'https://www.noattitudesbeachvolleyball.com/upcoming-events',
  },
  volleynation: {
    id: 'volleynation',
    name: 'VolleyNation',
    shortName: 'VolleyNation',
    homepage: 'https://volleyballlife.com/profile/volleynation',
  },
  armada: {
    id: 'armada',
    name: 'Armada Beach Volleyball',
    shortName: 'Armada',
    homepage: 'https://armadavb.net',
  },
}

export type ViewMode = 'list' | 'calendar' | 'map'
