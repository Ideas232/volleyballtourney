interface Props {
  className?: string
  size?: number
}

// Editorial volleyball mark — circle with three curved seams.
// Slight fill so it reads at small sizes against either light or dark bg.
export function VolleyballMark({ className, size = 18 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.4" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="9.4" fill="none" />
      <path d="M 12 2.6 C 7.5 6.5, 7.5 17.5, 12 21.4" fill="none" />
      <path d="M 3.4 9 C 9 11, 15 11, 20.6 9" fill="none" />
      <path d="M 3.4 15 C 9 13, 15 13, 20.6 15" fill="none" />
    </svg>
  )
}
