import { useId } from 'react'
import { BRAND } from '../data/siteData'

/** Ícone "Pulso de evolução" — linha ascendente de energia e progresso */
export function BrandIcon({ size = 36, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const gradId = `pulse-grad-${uid}`
  const glowId = `pulse-glow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="34" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E58F" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#00E58F" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5FFFB8" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill="#111827"
        stroke="rgba(0, 229, 143, 0.22)"
        strokeWidth="1.25"
      />

      <path
        d="M9 31 H 13"
        stroke="#9CA3AF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.28"
      />

      <path
        d="M9 31 H 12.5 L 14.5 27 L 16.5 33.5 L 18.5 24.5 L 21.5 27.5 L 25 21.5 L 29 16 L 33 11.5 L 37.5 7.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      <path
        d="M33 11.5 L 37.5 7.5 L 37.5 12"
        stroke="#00E58F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      <circle cx="37.5" cy="7.5" r="2.25" fill="#00E58F" filter={`url(#${glowId})`} />
    </svg>
  )
}

function SloganText({ slogan, highlight }) {
  if (!highlight || !slogan.includes(highlight)) {
    return <span className="brand-logo__slogan-muted">{slogan}</span>
  }

  const idx = slogan.indexOf(highlight)
  const before = slogan.slice(0, idx)
  const after = slogan.slice(idx + highlight.length)

  return (
    <>
      <span className="brand-logo__slogan-muted">{before}</span>
      <span className="brand-logo__slogan-highlight">
        {highlight}
        {after}
      </span>
    </>
  )
}

/**
 * Logo EvoluaFit — "Pulso de evolução".
 * Props: compact, iconOnly, name, slogan, sloganHighlight, iconSize, className
 */
export default function BrandLogo({
  iconSize = 36,
  compact = false,
  iconOnly = false,
  name = BRAND.name,
  slogan = BRAND.slogan,
  sloganHighlight = BRAND.sloganHighlight,
  className = '',
}) {
  if (iconOnly) {
    return <BrandIcon size={iconSize} className={`brand-logo__icon ${className}`.trim()} />
  }

  const fitIndex = name.toLowerCase().indexOf('fit')
  const evoluaPart = fitIndex > 0 ? name.slice(0, fitIndex) : name
  const fitPart = fitIndex > 0 ? name.slice(fitIndex) : ''
  const showSlogan = !compact && Boolean(slogan)

  return (
    <div className={`brand-logo ${compact ? 'brand-logo--compact' : ''} ${className}`.trim()}>
      <BrandIcon size={iconSize} className="brand-logo__icon" />
      <div className="brand-logo__text">
        <span className="brand-logo__name" aria-label={name}>
          <span className="brand-logo__evolua">{evoluaPart}</span>
          {fitPart && <span className="brand-logo__fit">{fitPart}</span>}
        </span>
        {showSlogan && (
          <span className="brand-logo__slogan">
            <SloganText slogan={slogan} highlight={sloganHighlight} />
          </span>
        )}
      </div>
    </div>
  )
}
