/**
 * Premium visual separator between major Home modules.
 * Decorative when unlabeled; labeled dividers expose accessible text via aria-label.
 */
export default function SectionDivider({ variant = 'default', label }) {
  const hasLabel = Boolean(label?.trim())
  const text = hasLabel ? label.trim() : undefined

  return (
    <div
      className={`section-divider section-divider--${variant}`}
      role={hasLabel ? 'separator' : undefined}
      aria-hidden={hasLabel ? undefined : true}
      aria-label={text}
    >
      <span className="section-divider__line" aria-hidden="true" />
      <span className="section-divider__center" aria-hidden="true">
        <span className="section-divider__marker" />
        {hasLabel && <span className="section-divider__label">{text}</span>}
      </span>
      <span className="section-divider__line" aria-hidden="true" />
    </div>
  )
}
