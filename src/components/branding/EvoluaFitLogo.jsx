import EvoluaFitMark from './EvoluaFitMark'

const SIZE_MAP = {
  small: 40,
  medium: 56,
  large: 76,
}

/**
 * EvoluaFit brand mark + wordmark.
 */
export default function EvoluaFitLogo({
  size = 'medium',
  compact = false,
  showWordmark = true,
  className = '',
}) {
  const markPx = SIZE_MAP[size] || SIZE_MAP.medium
  const showText = Boolean(showWordmark) && !compact

  return (
    <span
      className={[
        'evoluafit-logo',
        `evoluafit-logo--${SIZE_MAP[size] ? size : 'medium'}`,
        compact ? 'evoluafit-logo--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="EvoluaFit"
      title={compact || !showText ? 'EvoluaFit' : undefined}
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
