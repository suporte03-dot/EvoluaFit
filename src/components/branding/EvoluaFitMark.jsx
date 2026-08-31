import { useId } from 'react'

/**
 * EvoluaFit Mark — E geométrico com cortes diagonais e avanço ascendente.
 * compact: barras mais densas para favicon / sidebar recolhida / header.
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
  const shear = dense ? -10 : -12
  const radius = dense ? 1.6 : 1.35

  const stem = dense
    ? { x: 15.5, y: 12.5, w: 11, h: 39 }
    : { x: 16.5, y: 13.5, w: 9.5, h: 37 }

  const bars = dense
    ? [
        { x: 26.5, y: 12.5, w: 20, h: 9.4 },
        { x: 26.5, y: 26.3, w: 24.5, h: 9.4 },
        { x: 26.5, y: 40.1, w: 29, h: 9.4 },
      ]
    : [
        { x: 26, y: 13.5, w: 18.5, h: 7.8 },
        { x: 26, y: 28.1, w: 23, h: 7.8 },
        { x: 26, y: 42.7, w: 27.5, h: 7.8 },
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
        <linearGradient id={gMain} x1="14" y1="10" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8EC4FF" />
          <stop offset="0.42" stopColor="#6B72FF" />
          <stop offset="1" stopColor="#7A45F0" />
        </linearGradient>
      </defs>

      {withBackground ? <rect width="64" height="64" rx="14" fill="#0B1220" /> : null}

      <g transform={`translate(32 32) skewX(${shear}) translate(-32 -32)`} fill={`url(#${gMain})`}>
        <rect x={stem.x} y={stem.y} width={stem.w} height={stem.h} rx={radius} />
        {bars.map((bar) => (
          <rect key={bar.y} x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={radius} />
        ))}
      </g>
    </svg>
  )
}
