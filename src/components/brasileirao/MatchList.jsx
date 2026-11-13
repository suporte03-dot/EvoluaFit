function MatchCard({ match, onSelect }) {
  const isLive = match.status === 'Ao vivo'
  const isFinished = match.status === 'Encerrado'
  const hasScore = isFinished || isLive

  return (
    <article
      className={`brasileirao-match card card--clickable ${isLive ? 'brasileirao-match--live' : ''}`}
      onClick={() => onSelect?.(match)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(match)}
      role="button"
      tabIndex={0}
    >
      <div className="brasileirao-match__meta">
        <span>Rodada {match.round}</span>
        <span>{match.date} · {match.time}</span>
        {isLive && <span className="brasileirao-match__live-badge">Ao vivo</span>}
        {!isLive && !isFinished && <span className="brasileirao-match__status">{match.status}</span>}
      </div>

      <div className="brasileirao-match__teams">
        <div className="brasileirao-match__team">
          <span className="brasileirao-match__team-name">{match.home}</span>
          {hasScore && <span className="brasileirao-match__score">{match.homeScore ?? 0}</span>}
        </div>
        <span className="brasileirao-match__vs">{hasScore ? '–' : 'vs'}</span>
        <div className="brasileirao-match__team brasileirao-match__team--away">
          {hasScore && <span className="brasileirao-match__score">{match.awayScore ?? 0}</span>}
          <span className="brasileirao-match__team-name">{match.away}</span>
        </div>
      </div>

      <div className="brasileirao-match__venue">
        <span>{match.stadium}</span>
        <span>{match.city}</span>
      </div>
    </article>
  )
}

function MatchList({ matches, onSelectMatch, groupByRound = false }) {
  if (!matches?.length) {
    return (
      <div className="brasileirao-empty card">
        <p>Nenhum jogo encontrado para o período selecionado.</p>
      </div>
    )
  }

  if (!groupByRound) {
    return (
      <div className="brasileirao-matches">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onSelect={onSelectMatch} />
        ))}
      </div>
    )
  }

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => b - a)

  return (
    <div className="brasileirao-matches brasileirao-matches--grouped">
      {rounds.map((round) => (
        <div key={round} className="brasileirao-matches__round">
          <h4 className="brasileirao-matches__round-title">Rodada {round}</h4>
          <div className="brasileirao-matches__round-list">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <MatchCard key={m.id} match={m} onSelect={onSelectMatch} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MatchList
