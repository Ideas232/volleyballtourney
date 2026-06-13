interface Props {
  month: Date
  tournamentCount: number
  onPrev: () => void
  onNext: () => void
}

export function Header({ month, tournamentCount, onPrev, onNext }: Props) {
  const monthName = month.toLocaleDateString('en-US', { month: 'long' })
  const year = month.getFullYear()
  const subtitle =
    tournamentCount === 0
      ? 'No tournaments yet'
      : tournamentCount === 1
        ? '1 tournament'
        : `${tournamentCount} tournaments`

  return (
    <header className="masthead">
      <div>
        <div className="month-block">
          <span className="month">{monthName}</span>
          <span className="year">{year}</span>
        </div>
        <div className="subtitle">{subtitle}</div>
      </div>
      <div className="nav">
        <button type="button" className="nav-btn" aria-label="Previous month" onClick={onPrev}>
          ‹
        </button>
        <button type="button" className="nav-btn" aria-label="Next month" onClick={onNext}>
          ›
        </button>
      </div>
    </header>
  )
}
