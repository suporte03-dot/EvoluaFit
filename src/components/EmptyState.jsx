import { scrollToSection } from '../utils/scrollToSection'

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaSection,
  onCta,
  secondaryCtaLabel,
  secondaryCtaSection,
  className = '',
  children,
}) {
  const handlePrimary = () => {
    if (onCta) {
      onCta()
      return
    }
    if (ctaSection) scrollToSection(ctaSection)
  }

  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {(ctaLabel && (ctaSection || onCta)) || (secondaryCtaLabel && secondaryCtaSection) || children ? (
        <div className="empty-state__actions">
          {ctaLabel && (ctaSection || onCta) && (
            <button type="button" className="btn btn--primary" onClick={handlePrimary}>
              {ctaLabel}
            </button>
          )}
          {secondaryCtaLabel && secondaryCtaSection && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => scrollToSection(secondaryCtaSection)}
            >
              {secondaryCtaLabel}
            </button>
          )}
          {children}
        </div>
      ) : null}
    </div>
  )
}
