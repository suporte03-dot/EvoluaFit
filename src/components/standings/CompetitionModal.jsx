import { useEffect } from 'react'
import { formatGoalDifference, getSimulatedNextGames } from '../../utils/standingsUtils'

function CompetitionModal({ competition, selectedTeam, onTeamSelect, onClose }) {
  useEffect(() => {
    if (!competition) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [competition, onClose])

  if (!competition) return null

  const topTeams = competition.teams?.slice(0, 5) ?? []
  const team = selectedTeam
  const teamNextGames = team ? getSimulatedNextGames(team.name, competition) : []

  return (
    <div className="modal competition-modal" role="dialog" aria-modal="true" aria-labelledby="competition-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel competition-modal__panel">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar campeonato">
          ✕
        </button>

        <p className="competition-modal__demo-banner">
          Dados demonstrativos — não representam classificações oficiais.
        </p>

        {team ? (
          <div className="competition-modal__team-view">
            <button type="button" className="competition-modal__back" onClick={() => onTeamSelect(null)}>
              ← Voltar ao campeonato
            </button>
            <h2 id="competition-modal-title" className="competition-modal__title">{team.name}</h2>
            <p className="competition-modal__subtitle">{competition.name} — {competition.season}</p>

            <div className="competition-modal__stats-grid">
              <div className="competition-modal__stat">
                <span className="competition-modal__stat-value">{team.position}º</span>
                <span className="competition-modal__stat-label">Posição</span>
              </div>
              <div className="competition-modal__stat">
                <span className="competition-modal__stat-value">{team.points}</span>
                <span className="competition-modal__stat-label">Pontos</span>
              </div>
              <div className="competition-modal__stat">
                <span className="competition-modal__stat-value">{team.played}</span>
                <span className="competition-modal__stat-label">Jogos</span>
              </div>
              <div className="competition-modal__stat">
                <span className="competition-modal__stat-value">{formatGoalDifference(team.goalDifference)}</span>
                <span className="competition-modal__stat-label">Saldo</span>
              </div>
            </div>

            <div className="competition-modal__record">
              <span>{team.wins}V</span>
              <span>{team.draws}E</span>
              <span>{team.losses}D</span>
              <span>{team.goalsFor} gols marcados</span>
              <span>{team.goalsAgainst} gols sofridos</span>
            </div>

            {(team.form ?? team.performance)?.length > 0 && (
              <div className="competition-modal__form">
                <h3>Forma recente</h3>
                <div className="standings-table__form-dots">
                  {(team.form ?? team.performance).map((r, i) => (
                    <span key={i} className={`standings-form-dot standings-form-dot--${r.toLowerCase()}`}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            {teamNextGames.length > 0 && (
              <section className="competition-modal__section">
                <h3>Próximos jogos (simulados)</h3>
                <ul className="competition-modal__games">
                  {teamNextGames.map((game, i) => (
                    <li key={i} className="competition-modal__game">
                      <span>{game.home} × {game.away}</span>
                      <span>{game.date} · {game.time}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="competition-modal__demo-note">
              Estatísticas ilustrativas para demonstração do módulo Arena 360.
            </p>
          </div>
        ) : (
          <>
            <div className="competition-modal__header">
              <span className={`competition-modal__badge competition-modal__badge--${competition.status === 'Em breve' ? 'soon' : 'live'}`}>
                {competition.status}
              </span>
              <h2 id="competition-modal-title" className="competition-modal__title">{competition.name}</h2>
              <p className="competition-modal__subtitle">
                {competition.season} · {competition.country}
              </p>
            </div>

            <div className="competition-modal__body">
              <section className="competition-modal__section">
                <h3>Formato</h3>
                <p>{competition.format}</p>
              </section>

              <section className="competition-modal__section">
                <h3>Participantes</h3>
                <p>{competition.participants} equipes</p>
              </section>

              {competition.notes && (
                <section className="competition-modal__section">
                  <h3>Sobre</h3>
                  <p>{competition.notes}</p>
                </section>
              )}

              {topTeams.length > 0 && (
                <section className="competition-modal__section">
                  <h3>Classificação (top 5 — demonstrativo)</h3>
                  <ul className="competition-modal__standings-snippet">
                    {topTeams.map((t) => (
                      <li key={t.id}>
                        <button type="button" className="competition-modal__team-btn" onClick={() => onTeamSelect(t)}>
                          <span className="competition-modal__team-pos">{t.position}º</span>
                          <span>{t.name}</span>
                          <span className="competition-modal__team-pts">{t.points} pts</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {competition.nextGames?.length > 0 && (
                <section className="competition-modal__section">
                  <h3>Próximos jogos (simulados)</h3>
                  <ul className="competition-modal__games">
                    {competition.nextGames.map((game, i) => (
                      <li key={i} className="competition-modal__game">
                        <span>{game.home} × {game.away}</span>
                        <span>{game.date} · {game.time}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CompetitionModal
