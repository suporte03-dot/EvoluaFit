import { useId } from 'react'

export function EvoluaPulseDefs({ id }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4da3ff" />
        <stop offset="48%" stopColor="#7657ff" />
        <stop offset="100%" stopColor="#8a52f5" />
      </linearGradient>
    </defs>
  )
}

export function EvoluaPulseLine({ className = '', animate = true }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`evolua-pulse evolua-pulse--line${animate ? ' is-live' : ''} ${className}`} viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true">
      <EvoluaPulseDefs id={id} />
      <path
        d="M0 7 C 40 2, 80 11, 120 6 S 200 2, 240 7"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EvoluaPulseRing({ value = 0, size = 112 }) {
  const id = useId().replace(/:/g, '')
  const r = 42
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const dash = (pct / 100) * c

  return (
    <svg className="evolua-pulse evolua-pulse--ring" width={size} height={size} viewBox="0 0 108 108" aria-hidden="true">
      <EvoluaPulseDefs id={id} />
      <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(248,250,252,0.08)" strokeWidth="3.5" />
      <circle
        cx="54"
        cy="54"
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 54 54)"
      />
    </svg>
  )
}

export function EvoluaPulseMesh() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="evolua-pulse evolua-pulse--mesh is-live" viewBox="0 0 420 280" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <EvoluaPulseDefs id={id} />
      <path d="M40 220 C 90 80, 150 40, 250 90 S 380 40, 430 110" fill="none" stroke={`url(#${id})`} strokeWidth="1.2" opacity="0.55" />
      <path d="M20 250 C 110 140, 180 90, 280 140 S 400 90, 440 150" fill="none" stroke={`url(#${id})`} strokeWidth="1" opacity="0.28" />
    </svg>
  )
}
