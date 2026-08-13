/**
 * EvoluaFit Mark — PERFORMANCE ELECTRIC
 * Três barras inclinadas formando E (conforme capa de login).
 */
import { useId } from 'react'

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
        <linearGradient id={gid} x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3578FF" />
          <stop offset="1" stopColor="#7657FF" />
        </linearGradient>
      </defs>

      {withBackground ? <rect width="64" height="64" rx="14" fill="#070A0F" /> : null}

      {/* Três barras inclinadas (E em movimento) */}
      <g transform="translate(32 32) rotate(-18) translate(-32 -32)">
        <rect x="14" y="14" width="34" height="8" rx="4" fill={`url(#${gid})`} />
        <rect x="14" y="28" width="28" height="8" rx="4" fill={`url(#${gid})`} />
        <rect x="14" y="42" width="22" height="8" rx="4" fill={`url(#${gid})`} />
      </g>
    </svg>
  )
}
