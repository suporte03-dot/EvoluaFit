function TopScorers({ scorers }) {
  if (!scorers?.length) return null

  return (
    <div className="brasileirao-scorers card">
      <div className="brasileirao-table-scroll">
        <table className="brasileirao-table brasileirao-table--scorers">
          <thead className="brasileirao-table__head">
            <tr>
              <th>#</th>
              <th>Jogador</th>
              <th>Clube</th>
              <th>Gols</th>
              <th className="brasileirao-table__hide-sm">Assist.</th>
              <th className="brasileirao-table__hide-sm">J</th>
              <th className="brasileirao-table__hide-xs">Média</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((scorer) => (
              <tr
                key={scorer.position}
                className={`brasileirao-table__row ${scorer.position <= 3 ? `brasileirao-table__row--top${scorer.position}` : ''}`}
              >
                <td className="brasileirao-table__pos">{scorer.position}</td>
                <td className="brasileirao-table__player">{scorer.player}</td>
                <td>{scorer.club}</td>
                <td className="brasileirao-table__goals">{scorer.goals}</td>
                <td className="brasileirao-table__hide-sm">{scorer.assists}</td>
                <td className="brasileirao-table__hide-sm">{scorer.played}</td>
                <td className="brasileirao-table__hide-xs">{scorer.avgGoals.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopScorers
