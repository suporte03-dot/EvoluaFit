import { getSportFilters } from '../../services/standingsService'

function StandingsFilters({ activeSport, onSportChange }) {
  const sportFilters = getSportFilters()

  return (
    <div className="standings-filters">
      <span className="standings-filters__label">Modalidade</span>
      <div className="standings-filters__scroll">
        {sportFilters.map((sport) => (
          <button
            key={sport.id}
            type="button"
            className={`standings-filters__chip ${activeSport === sport.id ? 'standings-filters__chip--active' : ''}`}
            onClick={() => onSportChange(sport.id)}
          >
            <span aria-hidden="true">{sport.icon}</span>
            {sport.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StandingsFilters
