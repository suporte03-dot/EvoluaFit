import EvoluaFitMark from './EvoluaFitMark'

const SIZE_MAP = {
  small: 36,
  medium: 44,
  large: 52,
}

/**
 * Logo EvoluaFit — E itálico + wordmark nítido (padrão do mockup).
 */
export default function EvoluaFitLogo({
  size = 'medium',
  compact = false,
  showWordmark = true,
  className = '',
}) {
  const markPx = SIZE_MAP[size] || SIZE_MAP.medium
  const sizeName = SIZE_MAP[size] ? size : 'medium'
  const showText = Boolean(showWordmark) && !compact

  return (
    <span
      className={[
        'evoluafit-logo',
        `evoluafit-logo--${sizeName}`,
        compact ? 'evoluafit-logo--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="EvoluaFit"
      title="EvoluaFit"
    >
      <EvoluaFitMark size={markPx} className="evoluafit-logo__mark" />
      {showText ? (
        <span className="evoluafit-logo__wordmark" aria-hidden="true">
          <span className="evoluafit-logo__wordmark-main">Evolua</span>
          <span className="evoluafit-logo__wordmark-accent">Fit</span>
        </span>
      ) : null}
    </span>
  )
}
