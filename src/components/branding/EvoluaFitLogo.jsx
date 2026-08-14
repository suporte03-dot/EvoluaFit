import EvoluaFitMark from './EvoluaFitMark'
import officialLogoUrl from '../../assets/branding/evoluafit-logo-official.png'

const SIZE_MAP = {
  small: 36,
  medium: 44,
  large: 52,
}

/**
 * Logo oficial extraída de novalogopersonalizada.jpg
 */
export default function EvoluaFitLogo({
  size = 'medium',
  compact = false,
  showWordmark = true,
  className = '',
}) {
  const markPx = SIZE_MAP[size] || SIZE_MAP.medium
  const sizeName = SIZE_MAP[size] ? size : 'medium'

  if (compact || !showWordmark) {
    return (
      <span
        className={['evoluafit-logo', `evoluafit-logo--${sizeName}`, 'evoluafit-logo--compact', className]
          .filter(Boolean)
          .join(' ')}
        aria-label="EvoluaFit"
        title="EvoluaFit"
      >
        <EvoluaFitMark size={markPx} className="evoluafit-logo__mark" />
      </span>
    )
  }

  return (
    <span
      className={['evoluafit-logo', `evoluafit-logo--${sizeName}`, className].filter(Boolean).join(' ')}
      aria-label="EvoluaFit"
      title="EvoluaFit"
    >
      <img
        src={officialLogoUrl}
        alt=""
        className="evoluafit-logo__file"
        decoding="async"
      />
    </span>
  )
}
