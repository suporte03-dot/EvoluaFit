import { scrollToSection } from '../../utils/scrollToSection'

export default function CoachInsightCard({ insights }) {
  const items = insights?.items || []

  return (
    <div className="focus-widget-body" aria-label="Insights da semana">
      <p className="hoje-card__kicker">Coach</p>
      <h3 className="hoje-card__title">Insight do Coach</h3>
      {items.length ? (
        <>
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
        </>
      ) : (
        <p className="hoje-card__body">Conclua um treino para o insight aparecer com números reais.</p>
      )}
    </div>
  )
}
