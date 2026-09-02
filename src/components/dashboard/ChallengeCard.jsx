export default function ChallengeCard({ challenge }) {
  if (!challenge) {
    return (
      <div className="focus-widget-body">
        <p className="hoje-card__kicker">Metas</p>
        <h3 className="hoje-card__title">Desafio</h3>
        <p className="hoje-card__body">O desafio aparece com o histórico de treinos.</p>
      </div>
    )
  }

  return (
    <div className="focus-widget-body" aria-label="Desafio atual">
      <p className="hoje-card__kicker">Desafio</p>
      <h3 className="hoje-card__title">{challenge.title}</h3>
      <p className="hoje-card__body">{challenge.sentence}</p>
      <div
        className="hoje-xp"
        role="progressbar"
        aria-valuenow={challenge.current}
        aria-valuemin={0}
        aria-valuemax={challenge.target}
      >
        <span style={{ width: `${challenge.pct}%` }} />
      </div>
    </div>
  )
}
