/**
 * Monograma EvoluaFit — curva ascendente + seta de evolução.
 * Funciona de favicon (24px) até banner.
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
      <rect width="64" height="64" rx="16" fill="#161412" />
      <path
        d="M14 44c8-1 14-8 16-16 2 10 8 16 20 16"
        stroke="#f6f1ea"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 44c10-14 18-28 36-32"
        stroke="#ff5a2f"
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M42 8.5l12 3.2-6.4 11.2-5.6-14.4z" fill="#e8ff47" />
    </svg>
  )
}
