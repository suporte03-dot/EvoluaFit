export default function ChallengeCard({ challenge }) {
  if (!challenge) return null

  return (
    <section className="hoje-card" aria-label="Desafio atual">
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
    </section>
  )
}
