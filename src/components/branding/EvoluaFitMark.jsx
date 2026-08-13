import { useId } from 'react'

/**
 * EvoluaFit Mark — PERFORMANCE ELECTRIC
 * E geométrico: 3 barras + espinha, superior avançando (evolução).
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
  withBackground = false,
}) {
  const px = typeof size === 'number' ? size : 40
  const gid = useId().replace(/:/g, '')

  return (
    <svg
      className={`evoluafit-mark ${className}`.trim()}
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="12" y1="52" x2="54" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3578FF" />
          <stop offset="1" stopColor="#7657FF" />
        </linearGradient>
      </defs>

      {withBackground ? <rect width="64" height="64" rx="14" fill="#070A0F" /> : null}

      <rect x="15" y="15" width="6.5" height="34" rx="3.25" fill={`url(#${gid})`} />
      <rect x="21.5" y="42.5" width="17" height="6.5" rx="3.25" fill="#3578FF" />
      <rect x="21.5" y="28.75" width="23" height="6.5" rx="3.25" fill={`url(#${gid})`} />
      <rect x="21.5" y="15" width="27.5" height="6.5" rx="3.25" fill="#7657FF" />
    </svg>
  )
}
