import { useEffect } from 'react'

const DEMO_LINEUP = {
  home: ['Goleiro', 'Lateral Dir.', 'Zagueiro', 'Zagueiro', 'Lateral Esq.', 'Volante', 'Meia', 'Meia', 'Ponta', 'Ponta', 'Centroavante'],
  away: ['Goleiro', 'Lateral Dir.', 'Zagueiro', 'Zagueiro', 'Lateral Esq.', 'Volante', 'Meia', 'Meia', 'Ponta', 'Ponta', 'Centroavante'],
}

function getH2H(home, away, allMatches) {
  return allMatches
    .filter(
      (m) =>
        m.status === 'Encerrado' &&
        ((m.home === home && m.away === away) || (m.home === away && m.away === home)),
    )
    .slice(0, 5)
}

function MatchModal({ match, allMatches, onClose }) {
  useEffect(() => {
    if (!match) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [match, onClose])

  if (!match) return null

  const h2h = getH2H(match.home, match.away, allMatches)
  const isLive = match.status === 'Ao vivo'
  const isFinished = match.status === 'Encerrado'
  const hasScore = isFinished || isLive

  return (
    <div className="modal brasileirao-match-modal" role="dialog" aria-modal="true" aria-labelledby="match-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel brasileirao-match-modal__panel">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar jogo">
          ✕
        </button>

        <div className="brasileirao-match-modal__header">
          <span className="brasileirao-match-modal__round">Rodada {match.round}</span>
          {isLive && <span className="brasileirao-match__live-badge">Ao vivo</span>}
          <span className="brasileirao-match-modal__datetime">{match.date} · {match.time}</span>
        </div>

        <h2 id="match-modal-title" className="brasileirao-match-modal__scoreline">
          <span>{match.home}</span>
          {hasScore ? (
            <strong>{match.homeScore ?? 0} – {match.awayScore ?? 0}</strong>
          ) : (
            <strong>vs</strong>
          )}
          <span>{match.away}</span>
        </h2>

        <p className="brasileirao-match-modal__venue">
          {match.stadium} · {match.city}
        </p>

        <div className="brasileirao-match-modal__status">
          Status: <strong>{match.status}</strong>
        </div>

        <section className="brasileirao-match-modal__section">
          <h3>Resumo</h3>
          <p>
            {isFinished
              ? `Partida encerrada entre ${match.home} e ${match.away}. Dados demonstrativos para acompanhamento do campeonato.`
              : isLive
                ? `Jogo em andamento no ${match.stadium}. Acompanhe os lances na cobertura da Arena 360.`
                : `Confronto agendado para ${match.date} às ${match.time}. Estádio: ${match.stadium}.`}
          </p>
        </section>

        <section className="brasileirao-match-modal__section">
          <h3>Escalações (demonstrativo)</h3>
          <div className="brasileirao-match-modal__lineups">
            <div>
              <h4>{match.home}</h4>
              <ul>
                {DEMO_LINEUP.home.map((p) => (
                  <li key={`${match.id}-h-${p}`}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>{match.away}</h4>
              <ul>
                {DEMO_LINEUP.away.map((p) => (
                  <li key={`${match.id}-a-${p}`}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="brasileirao-match-modal__section">
          <h3>Histórico H2H</h3>
          {h2h.length === 0 ? (
            <p className="empty-state empty-state--compact">Sem confrontos recentes registrados.</p>
          ) : (
            <ul className="brasileirao-match-modal__h2h">
              {h2h.map((m) => (
                <li key={`h2h-${m.id}`}>
                  {m.home} {m.homeScore}–{m.awayScore} {m.away}
                  <span> · {m.date}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default MatchModal
