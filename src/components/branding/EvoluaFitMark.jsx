/**
 * EvoluaFit Mark — E itálico da logonovaajustada.png
 * Três barras + espinha, inclinadas, azul elétrico.
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
  withBackground = false,
}) {
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
      {withBackground ? <rect width="64" height="64" rx="12" fill="#05070A" /> : null}
      <g transform="skewX(-18) translate(8 0)">
        <path
          fill="#2D68FF"
          d="M14 12h30v9H23v7h18v9H23v8h22v9H14V12z"
        />
      </g>
    </svg>
  )
}
