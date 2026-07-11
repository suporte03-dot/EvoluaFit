function FormChip({ result }) {
  const cls =
    result === 'V' ? 'brasileirao-form-chip--win' : result === 'E' ? 'brasileirao-form-chip--draw' : 'brasileirao-form-chip--loss'
  return <span className={`brasileirao-form-chip ${cls}`}>{result}</span>
}

function TeamForm({ teams }) {
  const sorted = [...teams].sort((a, b) => a.position - b.position)

  return (
    <div className="brasileirao-team-form">
      {sorted.map((team) => {
        const wins = team.lastMatches.filter((r) => r === 'V').length
        const draws = team.lastMatches.filter((r) => r === 'E').length
        const losses = team.lastMatches.filter((r) => r === 'D').length

        return (
          <article key={team.id} className="brasileirao-team-form__card card">
            <div className="brasileirao-team-form__header">
              <span className="brasileirao-team-form__pos">{team.position}º</span>
              <div>
                <h4>{team.name}</h4>
                <span className="brasileirao-team-form__pts">{team.points} pts</span>
              </div>
            </div>
            <div className="brasileirao-form-chips brasileirao-form-chips--lg">
              {team.lastMatches.map((r, i) => (
                <FormChip key={`${team.id}-form-${i}`} result={r} />
              ))}
            </div>
            <div className="brasileirao-team-form__summary">
              <span className="brasileirao-team-form__stat brasileirao-team-form__stat--win">{wins}V</span>
              <span className="brasileirao-team-form__stat brasileirao-team-form__stat--draw">{draws}E</span>
              <span className="brasileirao-team-form__stat brasileirao-team-form__stat--loss">{losses}D</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default TeamForm
