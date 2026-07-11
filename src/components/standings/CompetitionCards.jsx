function CompetitionCards({ competitions, activeId, onSelect, onViewTable }) {
  if (!competitions.length) return null

  return (
    <div className="competition-cards">
      {competitions.map((comp) => (
        <article
          key={comp.id}
          className={`competition-cards__card card ${activeId === comp.id ? 'competition-cards__card--active' : ''}`}
          onClick={() => onSelect(comp.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(comp.id)
            }
          }}
        >
          <div className="competition-cards__header">
            <span className={`competition-cards__status competition-cards__status--${comp.status === 'Em breve' ? 'soon' : 'live'}`}>
              {comp.status}
            </span>
            <span className="competition-cards__season">{comp.season}</span>
          </div>
          <h3 className="competition-cards__name">{comp.name}</h3>
          <p className="competition-cards__summary">{comp.cardSummary}</p>
          <div className="competition-cards__meta">
            <span>{comp.country}</span>
            <span>{comp.participants} participantes</span>
          </div>
          {comp.type !== 'coming-soon' && (
            <button
              type="button"
              className="competition-cards__btn btn btn--sm btn--primary"
              onClick={(e) => {
                e.stopPropagation()
                onViewTable(comp.id)
              }}
            >
              Ver tabela
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

export default CompetitionCards
