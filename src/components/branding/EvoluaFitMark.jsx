/**
 * Monograma EvoluaFit — E + trajetória ascendente.
 */
export default function EvoluaFitMark({ size = 40, className = '' }) {
  const px = typeof size === 'number' ? size : 40
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
      <rect width="64" height="64" rx="16" fill="#14161A" />
      <path
        d="M16 46c10-2 16-12 17-22 2 12 9 20 21 20"
        stroke="#F7F7F2"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M14 44C24 30 32 16 50 12"
        stroke="#FF5A3D"
        strokeWidth="4.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M44 8.5l11.5 2.8-5.8 10.5L44 8.5z" fill="#D9FF43" />
    </svg>
  )
}
