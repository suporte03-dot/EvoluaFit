import { scrollToSection } from '../utils/scrollToSection'

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaSection,
  secondaryCtaLabel,
  secondaryCtaSection,
  className = '',
  children,
}) {
  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {(ctaLabel && ctaSection) || (secondaryCtaLabel && secondaryCtaSection) || children ? (
        <div className="empty-state__actions">
          {ctaLabel && ctaSection && (
            <button type="button" className="btn btn--primary" onClick={() => scrollToSection(ctaSection)}>
              {ctaLabel}
            </button>
          )}
          {secondaryCtaLabel && secondaryCtaSection && (
            <button
              type="button"
              className="btn btn--ghost"
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
