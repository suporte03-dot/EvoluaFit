const PHASE_LABELS = {
  grupos: 'Grupos',
  oitavas: 'Oitavas de final',
  quartas: 'Quartas de final',
  semifinal: 'Semifinal',
  final: 'Final',
}

function MatchCard({ match, onTeamClick }) {
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const homeWins = hasScore && match.homeScore > match.awayScore
  const awayWins = hasScore && match.awayScore > match.homeScore

  const handleTeamClick = (name, e) => {
    if (!onTeamClick || name === 'A definir') return
    e.stopPropagation()
    onTeamClick({ name })
  }

  return (
    <div className={`knockout-match ${match.status === 'Agendado' ? 'knockout-match--scheduled' : ''}`}>
      <div className="knockout-match__date">{match.date}</div>
      <div className="knockout-match__teams">
        <button
          type="button"
          className={`knockout-match__team ${homeWins ? 'knockout-match__team--winner' : ''}`}
          onClick={(e) => handleTeamClick(match.home, e)}
          disabled={match.home === 'A definir'}
        >
          {match.home}
        </button>
        <span className="knockout-match__score">
          {hasScore ? `${match.homeScore} × ${match.awayScore}` : 'vs'}
        </span>
        <button
          type="button"
          className={`knockout-match__team ${awayWins ? 'knockout-match__team--winner' : ''}`}
          onClick={(e) => handleTeamClick(match.away, e)}
          disabled={match.away === 'A definir'}
        >
          {match.away}
        </button>
      </div>
      {match.leg && <span className="knockout-match__leg">{match.leg}</span>}
      {match.status && (
        <span className={`knockout-match__status knockout-match__status--${match.status === 'Agendado' ? 'soon' : 'done'}`}>
          {match.status}
        </span>
      )}
    </div>
  )
}

function KnockoutBracket({
  knockout,
  activePhase = 'oitavas',
  onPhaseChange,
  showPhaseTabs = true,
  hasGroups = false,
  onTeamClick,
}) {
  if (!knockout) return null

  const phaseKeys = Object.keys(knockout).filter((key) => knockout[key]?.length > 0)
  const allPhases = hasGroups ? ['grupos', ...phaseKeys] : phaseKeys
  const currentPhase = allPhases.includes(activePhase) ? activePhase : allPhases[0]

  if (currentPhase === 'grupos') return null

  const matches = knockout[currentPhase] ?? []

  return (
    <div className="knockout-bracket card">
      {showPhaseTabs && allPhases.length > 1 && (
        <div className="knockout-bracket__phases">
          {allPhases.map((phase) => (
            <button
              key={phase}
              type="button"
              className={`knockout-bracket__phase ${currentPhase === phase ? 'knockout-bracket__phase--active' : ''}`}
              onClick={() => onPhaseChange?.(phase)}
            >
              {PHASE_LABELS[phase] ?? phase}
            </button>
          ))}
        </div>
      )}

      <h3 className="knockout-bracket__title">{PHASE_LABELS[currentPhase] ?? currentPhase}</h3>
      <p className="knockout-bracket__demo-note">Confrontos ilustrativos — dados demonstrativos.</p>

      {matches.length === 0 ? (
        <p className="empty-state empty-state--compact">Fase ainda não definida.</p>
      ) : (
        <div className="knockout-bracket__grid">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} onTeamClick={onTeamClick} />
          ))}
        </div>
      )}
    </div>
  )
}

export default KnockoutBracket
