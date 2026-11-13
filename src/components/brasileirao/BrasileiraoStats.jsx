function StatCard({ icon, label, value, detail }) {
  return (
    <article className="brasileirao-stat-card card">
      <span className="brasileirao-stat-card__icon" aria-hidden="true">{icon}</span>
      <div>
        <p className="brasileirao-stat-card__label">{label}</p>
        <h4 className="brasileirao-stat-card__value">{value}</h4>
        {detail && <p className="brasileirao-stat-card__detail">{detail}</p>}
      </div>
    </article>
  )
}

function getUnbeatenStreak(teams) {
  let best = { team: null, streak: 0 }
  teams.forEach((team) => {
    let streak = 0
    for (let i = team.lastMatches.length - 1; i >= 0; i -= 1) {
      if (team.lastMatches[i] === 'D') break
      streak += 1
    }
    if (streak > best.streak) best = { team: team.name, streak }
  })
  return best
}

function BrasileiraoStats({ teams }) {
  const bestAttack = [...teams].sort((a, b) => b.goalsFor - a.goalsFor)[0]
  const bestDefense = [...teams].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]
  const bestGd = [...teams].sort((a, b) => b.goalDifference - a.goalDifference)[0]
  const mostWins = [...teams].sort((a, b) => b.wins - a.wins)[0]
  const mostDraws = [...teams].sort((a, b) => b.draws - a.draws)[0]
  const mostLosses = [...teams].sort((a, b) => b.losses - a.losses)[0]
  const unbeaten = getUnbeatenStreak(teams)

  return (
    <div className="brasileirao-stats">
      <StatCard
        icon="⚽"
        label="Melhor ataque"
        value={bestAttack.name}
        detail={`${bestAttack.goalsFor} gols marcados`}
      />
      <StatCard
        icon="🛡️"
        label="Melhor defesa"
        value={bestDefense.name}
        detail={`${bestDefense.goalsAgainst} gols sofridos`}
      />
      <StatCard
        icon="📈"
        label="Melhor saldo"
        value={bestGd.name}
        detail={`${bestGd.goalDifference > 0 ? '+' : ''}${bestGd.goalDifference} de saldo`}
      />
      <StatCard
        icon="🔥"
        label="Invicto recente"
        value={unbeaten.team ?? '—'}
        detail={unbeaten.streak ? `${unbeaten.streak} jogos sem derrota` : 'Sem sequência'}
      />
      <StatCard
        icon="🏆"
        label="Mais vitórias"
        value={mostWins.name}
        detail={`${mostWins.wins} vitórias`}
      />
      <StatCard
        icon="🤝"
        label="Mais empates"
        value={mostDraws.name}
        detail={`${mostDraws.draws} empates`}
      />
      <StatCard
        icon="📉"
        label="Mais derrotas"
        value={mostLosses.name}
        detail={`${mostLosses.losses} derrotas`}
      />
    </div>
  )
}

export default BrasileiraoStats
