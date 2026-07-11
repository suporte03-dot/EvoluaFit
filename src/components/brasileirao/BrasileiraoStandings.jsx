import { BRASILEIRAO_ZONE_COLORS, BRASILEIRAO_ZONE_LABELS } from '../../data/brasileiraoData'
import { formatGoalDifference } from '../../utils/standingsUtils'

function FormChip({ result }) {
  const cls =
    result === 'V' ? 'brasileirao-form-chip--win' : result === 'E' ? 'brasileirao-form-chip--draw' : 'brasileirao-form-chip--loss'
  return <span className={`brasileirao-form-chip ${cls}`}>{result}</span>
}

function BrasileiraoStandings({ teams }) {
  if (!teams?.length) return null

  const legend = [
    { key: 'leader', label: 'Líder', color: '#FFD166' },
    { key: 'libertadores', label: BRASILEIRAO_ZONE_LABELS.libertadores, color: BRASILEIRAO_ZONE_COLORS.libertadores },
    { key: 'pre-libertadores', label: BRASILEIRAO_ZONE_LABELS['pre-libertadores'], color: BRASILEIRAO_ZONE_COLORS['pre-libertadores'] },
    { key: 'sul-americana', label: BRASILEIRAO_ZONE_LABELS['sul-americana'], color: BRASILEIRAO_ZONE_COLORS['sul-americana'] },
    { key: 'relegation', label: BRASILEIRAO_ZONE_LABELS.relegation, color: BRASILEIRAO_ZONE_COLORS.relegation },
  ]

  return (
    <div className="brasileirao-standings card">
      <div className="brasileirao-table-scroll">
        <table className="brasileirao-table">
          <thead className="brasileirao-table__head">
            <tr>
              <th>Posição</th>
              <th>Clube</th>
              <th>Pts</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th className="brasileirao-table__hide-sm">GP</th>
              <th className="brasileirao-table__hide-sm">GC</th>
              <th>SG</th>
              <th className="brasileirao-table__hide-xs">Aprov.</th>
              <th>Últimos jogos</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.id}
                className={`brasileirao-table__row brasileirao-table__row--${team.zone} ${team.position === 1 ? 'brasileirao-table__row--leader' : ''}`}
              >
                <td className="brasileirao-table__pos">{team.position}</td>
                <td className="brasileirao-table__club">
                  <span className="brasileirao-table__short">{team.shortName}</span>
                  <span className="brasileirao-table__name">{team.name}</span>
                </td>
                <td className="brasileirao-table__pts">{team.points}</td>
                <td>{team.played}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td className="brasileirao-table__hide-sm">{team.goalsFor}</td>
                <td className="brasileirao-table__hide-sm">{team.goalsAgainst}</td>
                <td className="brasileirao-table__gd">{formatGoalDifference(team.goalDifference)}</td>
                <td className="brasileirao-table__hide-xs">{team.performance}%</td>
                <td>
                  <div className="brasileirao-form-chips">
                    {team.lastMatches.map((r, i) => (
                      <FormChip key={`${team.id}-${i}`} result={r} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="brasileirao-legend" aria-label="Legenda das zonas">
        {legend.map((item) => (
          <span key={item.key} className="brasileirao-legend__item">
            <span className="brasileirao-legend__swatch" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default BrasileiraoStandings
