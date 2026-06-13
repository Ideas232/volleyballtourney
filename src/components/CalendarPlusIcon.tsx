interface Props {
  className?: string
  size?: number
}

// Calendar-plus icon — line-drawn editorial style.
export function CalendarPlusIcon({ className, size = 20 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <line x1="3.5" y1="9" x2="20.5" y2="9" />
      <line x1="8" y1="3" x2="8" y2="6.5" />
      <line x1="16" y1="3" x2="16" y2="6.5" />
      <line x1="12" y1="12.5" x2="12" y2="17.5" />
      <line x1="9.5" y1="15" x2="14.5" y2="15" />
    </svg>
  )
}
