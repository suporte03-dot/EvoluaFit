import { useId } from 'react'

/**
 * EvoluaFit Mark — E geométrico com barras de progressão
 * (evolução + performance). Funciona como ícone / favicon / assinatura.
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
  withBackground = false,
}) {
  const px = typeof size === 'number' ? size : 40
  const uid = useId().replace(/:/g, '')
  const gMain = `ef-g-${uid}`
  const gGlow = `ef-glow-${uid}`

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
          <stop stopColor="#3578FF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7657FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {withBackground ? (
        <rect width="64" height="64" rx="14" fill="#05070A" />
      ) : null}

      {/* Soft plate */}
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

      {/*
        E como três barras horizontais crescentes à direita + haste vertical —
        leitura de progresso / evolução em movimento.
      */}
      <g fill={`url(#${gMain})`}>
        {/* Haste esquerda */}
        <rect x="16" y="16" width="8" height="32" rx="2.5" />
        {/* Barra superior (curta) */}
        <rect x="24" y="16" width="18" height="7" rx="2.5" />
        {/* Barra média */}
        <rect x="24" y="28.5" width="22" height="7" rx="2.5" />
        {/* Barra inferior (mais longa = progresso) */}
        <rect x="24" y="41" width="26" height="7" rx="2.5" />
      </g>
    </svg>
  )
}
