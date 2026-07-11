import { buildLegend, formatStandingsRow } from '../../utils/standingsUtils'
import TeamRow from './TeamRow'

function StandingsTable({ competition, onTeamClick }) {
  if (!competition?.teams?.length) return null

  const teams = competition.teams.map((t) => formatStandingsRow(t, competition))
  const legend = buildLegend(competition)

  return (
    <div className="standings-table-wrap card">
      <div className="standings-table-wrap__header">
        <h3 className="standings-table-wrap__title">{competition.name}</h3>
        <span className="standings-table-wrap__format">{competition.format}</span>
      </div>

      <div className="standings-table-scroll">
        <table className="standings-table">
          <thead className="standings-table__head">
            <tr>
              <th scope="col">Posição</th>
              <th scope="col">Time</th>
              <th scope="col" title="Jogos">J</th>
              <th scope="col" title="Vitórias">V</th>
              <th scope="col" title="Empates">E</th>
              <th scope="col" title="Derrotas">D</th>
              <th scope="col" className="standings-table__hide-sm" title="Gols pró">GP</th>
              <th scope="col" className="standings-table__hide-sm" title="Gols contra">GC</th>
              <th scope="col" title="Saldo de gols">SG</th>
              <th scope="col" title="Pontos">Pts</th>
              <th scope="col" className="standings-table__hide-xs">Forma</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <TeamRow
                key={team.id}
                team={team}
                competition={competition}
                onTeamClick={onTeamClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {legend.length > 0 && (
        <div className="standings-legend" aria-label="Legenda das zonas">
          {legend.map((item) => (
            <span key={item.key} className="standings-legend__item">
              <span
                className="standings-legend__swatch"
                style={{ background: item.color === 'var(--border)' ? 'transparent' : item.color, border: item.key === 'neutral' ? '1px solid var(--border)' : 'none' }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default StandingsTable
