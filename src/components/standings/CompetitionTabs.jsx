function CompetitionTabs({ competitions, activeId, onSelect }) {
  if (!competitions.length) return null

  return (
    <div className="competition-tabs">
      <span className="competition-tabs__label">Campeonatos</span>
      <div className="competition-tabs__scroll">
        {competitions.map((comp) => (
          <button
            key={comp.id}
            type="button"
            className={`competition-tabs__chip ${activeId === comp.id ? 'competition-tabs__chip--active' : ''}`}
            onClick={() => onSelect(comp.id)}
          >
            {comp.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CompetitionTabs
