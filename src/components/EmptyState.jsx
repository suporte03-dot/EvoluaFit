import { scrollToSection } from '../utils/scrollToSection'

export default function EmptyState({ icon, title, description, ctaLabel, ctaSection }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {ctaLabel && ctaSection && (
        <button type="button" className="btn btn--primary" onClick={() => scrollToSection(ctaSection)}>
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
