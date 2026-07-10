import { agendaSportFilters, agendaPeriodFilters } from '../../data/agendaData'

function AgendaFilters({
  filtersRef,
  sportFilter,
  periodFilter,
  onSportChange,
  onPeriodChange,
}) {
  return (
    <div className="agenda-filters" ref={filtersRef}>
      <div className="agenda-filters__group">
        <span className="agenda-filters__label">Modalidade</span>
        <div className="agenda-filters__scroll">
          {agendaSportFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`agenda-filters__chip ${sportFilter === filter.id ? 'agenda-filters__chip--active' : ''}`}
              onClick={() => onSportChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="agenda-filters__group">
        <span className="agenda-filters__label">Período</span>
        <div className="agenda-filters__scroll">
          {agendaPeriodFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`agenda-filters__chip agenda-filters__chip--period ${periodFilter === filter.id ? 'agenda-filters__chip--active' : ''}`}
              onClick={() => onPeriodChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgendaFilters
