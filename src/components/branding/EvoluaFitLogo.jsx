const LOCKUP_SRC = `${import.meta.env.BASE_URL}branding/evoluafit-lockup.png?v=nobg`
const MARK_SRC = `${import.meta.env.BASE_URL}branding/evoluafit-mark.png`

const SIZE_MAP = {
  small: 36,
  medium: 44,
  large: 52,
}

/**
 * Logo EvoluaFit — lockup aprovada (ícone + EvoluaFit).
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
      {showText ? (
        <img src={LOCKUP_SRC} alt="" className="evoluafit-logo__file" />
      ) : (
        <img
          src={MARK_SRC}
          alt=""
          width={markPx}
          height={markPx}
          className="evoluafit-logo__mark"
        />
      )}
    </span>
  )
}
