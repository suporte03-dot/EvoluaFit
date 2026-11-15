/** Prévia antes/depois da semana elástica. */
export default function ElasticWeekPreview({ plan, onApply, onDismiss }) {
  if (!plan?.needed && !plan?.dropped?.length) return null

  return (
    <div className="elastic-week" role="region" aria-label="Reorganizar semana">
      <p className="elastic-week__summary">{plan.summary}</p>
      <ol className="elastic-week__days" aria-label="Prévia da semana">
        {plan.days.map((day) => (
          <li
            key={day.key}
            className={`elastic-week__day${day.isToday ? ' is-today' : ''}${day.changed ? ' is-changed' : ''}${
              day.past && day.beforeState === 'Não realizado' ? ' is-missed' : ''
            }`}
          >
            <span className="elastic-week__wd">{day.label}</span>
            <div className="elastic-week__pair">
              <span>
                <small>Antes</small>
                <strong>{day.before || 'Folga'}</strong>
              </span>
              <span aria-hidden="true">→</span>
              <span>
                <small>Depois</small>
                <strong>{day.after || 'Folga'}</strong>
              </span>
            </div>
          </li>
        ))}
      </ol>
      <div className="elastic-week__actions">
        <button type="button" className="dash-hero__cta" onClick={onApply}>
          Aplicar
        </button>
        <button type="button" className="dash-hero__more" onClick={onDismiss}>
          Ignorar
        </button>
      </div>
    </div>
  )
}
