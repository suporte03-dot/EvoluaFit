import { scrollToSection } from '../../utils/scrollToSection'

export default function CoachInsightCard({ insights }) {
  const items = insights?.items || []
  if (!items.length) return null

  return (
    <section className="hoje-card" aria-label="Insights da semana">
      <p className="hoje-card__kicker">Insights</p>
      <h3 className="hoje-card__title">O que os treinos mostram</h3>
      {insights.fallbackNote ? <p className="hoje-card__note">{insights.fallbackNote}</p> : null}
      <ul className="hoje-insights">
        {items.map((item) => (
          <li key={item.id}>
            <p className="hoje-insights__title">{item.title}</p>
            <p className="hoje-insights__evidence">{item.evidence}</p>
            {item.ctaSection ? (
              <button type="button" onClick={() => scrollToSection(item.ctaSection)}>
                {item.ctaLabel || 'Ver'}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
