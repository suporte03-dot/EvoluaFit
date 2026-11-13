export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`ef-empty ${className}`.trim()} role="status">
      <h3 className="ef-empty__title">{title}</h3>
      {description ? <p className="ef-empty__desc">{description}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
