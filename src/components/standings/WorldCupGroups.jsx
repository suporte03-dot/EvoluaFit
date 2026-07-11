import { formatGoalDifference } from '../../utils/standingsUtils'

const PHASES = [
  { id: 'grupos', label: 'Grupos' },
  { id: 'oitavas', label: 'Oitavas' },
  { id: 'quartas', label: 'Quartas' },
  { id: 'semifinal', label: 'Semifinal' },
  { id: 'final', label: 'Final' },
]

function GroupTable({ group, onTeamClick }) {
  return (
    <div className="world-cup-groups__group card">
      <h4 className="world-cup-groups__group-name">{group.name}</h4>
      <div className="standings-table-scroll">
        <table className="standings-table standings-table--compact">
          <thead className="standings-table__head">
            <tr>
              <th>Posição</th>
              <th>Seleção</th>
              <th>J</th>
              <th>Pts</th>
              <th>SG</th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team, index) => {
              const qualified = index < 2
              return (
                <tr
                  key={team.id}
                  className={`standings-table__row ${qualified ? 'standings-table__row--zone-classification' : ''}`}
                  onClick={() => onTeamClick?.(team)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onTeamClick?.(team)
                    }
                  }}
                >
                  <td className="standings-table__pos">
                    {team.position}
                    {qualified && <span className="standings-table__qualified" title="Classificado">✓</span>}
                  </td>
                  <td className="standings-table__team">{team.name}</td>
                  <td>{team.played}</td>
                  <td className="standings-table__pts">{team.points}</td>
                  <td className="standings-table__gd">{formatGoalDifference(team.goalDifference)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WorldCupGroups({ competition, activePhase, onPhaseChange, onTeamClick, knockoutComponent }) {
  const showGroups = activePhase === 'grupos'

  return (
    <div className="world-cup-groups">
      <div className="world-cup-groups__phases">
        {PHASES.map((phase) => (
          <button
            key={phase.id}
            type="button"
            className={`world-cup-groups__phase ${activePhase === phase.id ? 'world-cup-groups__phase--active' : ''}`}
            onClick={() => onPhaseChange(phase.id)}
          >
            {phase.label}
          </button>
        ))}
      </div>

      {showGroups ? (
        <>
          <p className="world-cup-groups__demo-note">Grupos ilustrativos — dados demonstrativos da Copa 2026.</p>
          <div className="world-cup-groups__grid">
            {competition.groups?.map((group) => (
              <GroupTable key={group.id} group={group} onTeamClick={onTeamClick} />
            ))}
          </div>
          <div className="standings-legend">
            <span className="standings-legend__item">
              <span className="standings-legend__swatch" style={{ background: '#00E887' }} />
              Classificados para o mata-mata
            </span>
          </div>
        </>
      ) : (
        knockoutComponent
      )}
    </div>
  )
}

export default WorldCupGroups
