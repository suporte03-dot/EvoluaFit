export default function SectionTitle({ tag, title, subtitle, id }) {
  return (
    <header className="section-title" id={id}>
      {tag && <span className="section-title__tag">{tag}</span>}
      <h2 className="section-title__heading">{title}</h2>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
    </header>
  )
}
