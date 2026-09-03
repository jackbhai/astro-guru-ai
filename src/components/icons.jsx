// ============================================================
//  Custom SVG Icons — witchy AMOLED theme (koi emoji nahi)
//  Sab stroke-based, currentColor se color inherit karte hain
// ============================================================

export function Icon({ size = 20, sw = 1.8, className = '', children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7 7 0 0 0 9.7 9.7z" />
  </Icon>
)

export const StarIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5l1.7 5 5.3.1-4.2 3.2 1.5 5.1L12 13.9l-4.3 3 1.5-5.1L5 8.6l5.3-.1z" />
  </Icon>
)

export const SparkIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="3.2" />
  </Icon>
)

export const CrystalIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9.5" r="6" />
    <path d="M12 15.5v2.5M7.5 21h9M12 18l-1.7 3M12 18l1.7 3" />
    <path d="M9.2 8.2a3 3 0 0 1 2-1.7" />
  </Icon>
)

export const TelescopeIcon = (p) => (
  <Icon {...p}>
    <path d="M4.6 6.2l10.5-2.9 1.3 4.9-10.5 2.9z" />
    <path d="M4.6 6.2L3.4 4.4M9.5 10.3L7 21M13 9.4l3 11M7 21h11" />
    <circle cx="19.5" cy="5" r="1.4" />
  </Icon>
)

export const SendIcon = (p) => (
  <Icon {...p}>
    <path d="M21 3L3.5 10.2l7.2 2.6 2.7 7.2z" />
    <path d="M10.7 12.8L21 3" />
  </Icon>
)

export const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10.5h17" />
  </Icon>
)

export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2.5" />
  </Icon>
)

export const PinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-10.2A6.5 6.5 0 0 1 12 4.5a6.5 6.5 0 0 1 6.5 6.3C18.5 15.4 12 21 12 21z" />
    <circle cx="12" cy="10.6" r="2.2" />
  </Icon>
)

export const WarnIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5L1.8 20.2h20.4z" />
    <path d="M12 10v4.5M12 17.8v.2" />
  </Icon>
)

export const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.2" r="1.2" />
  </Icon>
)

export const ScrollIcon = (p) => (
  <Icon {...p}>
    <path d="M6 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 0 2-2V5.5" />
    <path d="M6 3.5a2 2 0 0 0 0 4h4" />
    <path d="M12 9h4M12 12.5h4M12 16h2.5" />
  </Icon>
)

export const OrbitIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <ellipse cx="12" cy="12" rx="9.5" ry="4" />
    <circle cx="20" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
  </Icon>
)

export const HourglassIcon = (p) => (
  <Icon {...p}>
    <path d="M6 3.5h12M6 20.5h12M7.5 3.5c0 5 4.5 5.5 4.5 8.5s-4.5 3.5-4.5 8.5M16.5 3.5c0 5-4.5 5.5-4.5 8.5s4.5 3.5 4.5 8.5" />
  </Icon>
)

export const LampIcon = (p) => (
  <Icon {...p}>
    <path d="M12 8.5c-3 0-6 2-6 5.2.6 1.4 3.2 2.8 6 2.8s5.4-1.4 6-2.8c0-3.2-3-5.2-6-5.2z" />
    <path d="M12 8.5c.5-2 2.2-2.5 2.2-4.5M3.5 20.5h17" />
    <circle cx="14.4" cy="5.2" r=".9" fill="currentColor" stroke="none" />
  </Icon>
)

export const ChevronIcon = (p) => (
  <Icon {...p}>
    <path d="M9 5.5l6.5 6.5L9 18.5" />
  </Icon>
)

export function HeartIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7.5-4.7-9.8-9C.6 8.9 2.3 5.5 5.6 5c2-.3 3.9.7 4.9 2.3C11.5 5.7 13.4 4.7 15.4 5c3.3.5 5 3.9 3.4 7-2.3 4.3-6.8 9-6.8 9Z" />
    </svg>
  )
}

export function RingsIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="14" r="6" />
      <circle cx="15" cy="10" r="6" />
    </svg>
  )
}

export function OmIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" aria-hidden="true">
      <path d="M4 14c0 4 6 6 9 3 2-2 0-5-3-5s-3 5 2 6c4 1 8-2 8-6" />
      <path d="M8 8c2 1 4 1 6-1" />
      <circle cx="12" cy="4" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function SlidersIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.2" fill="#000" />
      <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2.2" fill="#000" />
      <line x1="4" y1="17" x2="20" y2="17" /><circle cx="7" cy="17" r="2.2" fill="#000" />
    </svg>
  )
}

export function PlusIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function MenuIcon({ size = 24, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="18" x2="18" y2="18" />
    </svg>
  )
}
