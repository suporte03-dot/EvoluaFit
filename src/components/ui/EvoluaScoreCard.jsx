import { SCORE_DIMENSION_LABELS } from '../../utils/evoluaScore'

export default function EvoluaScoreCard({ score }) {
  if (!score) {
    return (
      <div className="evolua-score evolua-score--empty">
        <p className="evolua-score__kicker">Evolua Score</p>
        <p className="evolua-score__empty-copy">
          Complete seus primeiros treinos para liberar seu indicador de consistência.
        </p>
      </div>
    )
  }

  return (
    <div className="evolua-score" aria-label={`Evolua Score ${score.label}. ${score.band || ''}`}>
      <div className="evolua-score__top">
        <p className="evolua-score__kicker">Evolua Score</p>
        <strong className="evolua-score__value">{score.label}</strong>
        {score.band ? <p className="evolua-score__band">{score.band}</p> : null}
      </div>
      <div
        className="evolua-score__bar"
        role="progressbar"
        aria-valuenow={score.value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${score.value}%` }} />
      </div>
      {score.dimensions?.length ? (
        <ul className="evolua-score__dims">
          {score.dimensions.map((dim) => (
            <li key={dim.key}>
              <span>{SCORE_DIMENSION_LABELS[dim.key] || dim.key}</span>
              <strong>{dim.value}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="evolua-score__hint">{score.hint}</p>
    </div>
  )
}
