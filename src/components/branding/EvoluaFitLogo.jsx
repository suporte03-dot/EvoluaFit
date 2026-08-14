import EvoluaFitMark from './EvoluaFitMark'
import wordmarkUrl from '../../assets/branding/evoluafit-wordmark.png'

const SIZE_MAP = {
  small: 40,
  medium: 56,
  large: 76,
}

/**
 * Logo oficial extraído de logonovaajustada.png
 */
export default function EvoluaFitLogo({
  size = 'medium',
  compact = false,
  showWordmark = true,
  className = '',
}) {
  const markPx = SIZE_MAP[size] || SIZE_MAP.medium
  const showFile = Boolean(showWordmark) && !compact

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
      title="EvoluaFit"
    >
      {showFile ? (
        <img
          src={wordmarkUrl}
          alt=""
          className="evoluafit-logo__file"
          width={220}
          height={60}
        />
      ) : (
        <EvoluaFitMark size={markPx} className="evoluafit-logo__mark" />
      )}
    </span>
  )
}
