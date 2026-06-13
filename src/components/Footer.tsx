import { SOURCES } from '../types'

export function Footer() {
  const sources = Object.values(SOURCES)
  return (
    <footer className="page-foot">
      <span className="wordmark">Bay Vball</span>
      Bay Area volleyball tournaments. Sources:{' '}
      {sources.map((s, i) => (
        <span key={s.id}>
          <a href={s.homepage} target="_blank" rel="noreferrer">
            {s.shortName}
          </a>
          {i < sources.length - 1 ? ', ' : ''}
        </span>
      ))}
      . Updated daily.
    </footer>
  )
}
