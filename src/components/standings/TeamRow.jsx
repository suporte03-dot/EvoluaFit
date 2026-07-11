function TeamRow({ team, competition, onTeamClick, showForm = true }) {
  const zoneClass = competition?.zones || team.zoneKey
    ? `standings-table__row--zone-${team.zoneKey ?? 'neutral'}`
    : ''
  const isLeader = team.position === 1

  return (
    <tr
      className={`standings-table__row ${zoneClass} ${isLeader ? 'standings-table__row--leader' : ''}`}
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
        <span className="standings-table__pos-num">{team.position}</span>
        {team.qualified && <span className="standings-table__qualified" title="Classificado">✓</span>}
      </td>
      <td className="standings-table__team">
        <span className="standings-table__team-name">{team.name}</span>
      </td>
      <td>{team.played}</td>
      <td>{team.wins}</td>
      <td>{team.draws}</td>
      <td>{team.losses}</td>
      <td className="standings-table__hide-sm">{team.goalsFor}</td>
      <td className="standings-table__hide-sm">{team.goalsAgainst}</td>
      <td className="standings-table__gd">{team.goalDifferenceLabel ?? team.goalDifference}</td>
      <td className="standings-table__pts">{team.points}</td>
      {showForm && (
        <td className="standings-table__form standings-table__hide-xs">
          <span className="standings-table__form-dots" aria-label="Forma recente">
            {(team.form ?? []).map((r, i) => (
              <span key={`${team.id}-form-${i}`} className={`standings-form-dot standings-form-dot--${r.toLowerCase()}`}>
                {r}
              </span>
            ))}
          </span>
        </td>
      )}
    </tr>
  )
}

export default TeamRow
