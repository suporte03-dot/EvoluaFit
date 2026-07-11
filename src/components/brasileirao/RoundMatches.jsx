import MatchList from './MatchList'

function RoundMatches({ matches, currentRound, onSelectMatch }) {
  const roundMatches = matches.filter((m) => m.round === currentRound)
  const liveCount = roundMatches.filter((m) => m.status === 'Ao vivo').length
  const scheduledCount = roundMatches.filter((m) => m.status === 'Agendado').length
  const finishedCount = roundMatches.filter((m) => m.status === 'Encerrado').length

  return (
    <div className="brasileirao-round">
      <div className="brasileirao-round__header card">
        <div>
          <h3 className="brasileirao-round__title">Rodada {currentRound}</h3>
          <p className="brasileirao-round__subtitle">Jogos da rodada atual do Brasileirão Série A</p>
        </div>
        <div className="brasileirao-round__stats">
          {liveCount > 0 && <span className="brasileirao-round__stat brasileirao-round__stat--live">{liveCount} ao vivo</span>}
          <span className="brasileirao-round__stat">{scheduledCount} agendados</span>
          <span className="brasileirao-round__stat">{finishedCount} encerrados</span>
        </div>
      </div>

      <MatchList matches={roundMatches} onSelectMatch={onSelectMatch} />
    </div>
  )
}

export default RoundMatches
