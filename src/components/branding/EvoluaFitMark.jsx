import { useId } from 'react'

/**
 * EvoluaFit Mark — E itálico do mockup oficial.
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
  withBackground = false,
}) {
  const px = typeof size === 'number' ? size : 40
  const gid = `ef-mark-${useId().replace(/:/g, '')}`

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
        <linearGradient id={gid} x1="18" y1="8" x2="44" y2="56">
          <stop stopColor="#9AA6FF" />
          <stop offset="1" stopColor="#7657FF" />
        </linearGradient>
      </defs>
      {withBackground ? <rect width="64" height="64" rx="12" fill="#05070A" /> : null}
      <g transform="skewX(-18) translate(8 0)">
        <path fill={`url(#${gid})`} d="M14 12h30v9H23v7h18v9H23v8h22v9H14V12z" />
      </g>
    </svg>
  )
}
