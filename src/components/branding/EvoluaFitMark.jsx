import { useId } from 'react'

/**
 * EvoluaFit Mark — E geométrico com barras de progressão.
 * compact: barras mais grossas para favicon / sidebar recolhida / header mobile.
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
  withBackground = false,
  compact = false,
}) {
  const px = typeof size === 'number' ? size : 40
  const dense = compact || px <= 40
  const uid = useId().replace(/:/g, '')
  const gMain = `ef-g-${uid}`
  const gGlow = `ef-glow-${uid}`

  const bars = dense
    ? [
        { x: 15, y: 14, w: 10, h: 36 },
        { x: 24, y: 14, w: 20, h: 9 },
        { x: 24, y: 27.5, w: 24, h: 9 },
        { x: 24, y: 41, w: 28, h: 9 },
      ]
    : [
        { x: 16, y: 16, w: 8, h: 32 },
        { x: 24, y: 16, w: 18, h: 7 },
        { x: 24, y: 28.5, w: 22, h: 7 },
        { x: 24, y: 41, w: 26, h: 7 },
      ]

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
        <linearGradient id={gMain} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A8B4FF" />
          <stop offset="0.45" stopColor="#6B7CFF" />
          <stop offset="1" stopColor="#7657FF" />
        </linearGradient>
        <linearGradient id={gGlow} x1="32" y1="10" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7657FF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7657FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {withBackground ? (
        <rect width="64" height="64" rx="14" fill="#05070A" />
      ) : null}

      <rect x="6" y="6" width="52" height="52" rx="14" fill={`url(#${gGlow})`} opacity="0.55" />
      <rect
        x="6.75"
        y="6.75"
        width="50.5"
        height="50.5"
        rx="13.25"
        stroke="rgba(154, 166, 255, 0.28)"
        strokeWidth="1.5"
      />

      <g fill={`url(#${gMain})`}>
        {bars.map((bar) => (
          <rect key={`${bar.x}-${bar.y}`} x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={dense ? 3 : 2.5} />
        ))}
      </g>
    </svg>
  )
}
