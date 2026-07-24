import { getMuscleGroupVisual } from '../../data/muscleGroupVisualConfig'

/**
 * Premium portrait library card — neon PNG art + title + desc + count/arrow.
 * Absolute visual pattern for all muscle-group module cards in EvoluaFit.
 */
export default function MuscleGroupCard({
  group,
  count = 0,
  isActive = false,
  onSelect,
}) {
  const visual = getMuscleGroupVisual(group.id)
  const expanding = Boolean(visual.expanding)
  const neonImage = visual.neonImage

  const style = {
    '--mg-accent': visual.color,
    '--mg-rgb': visual.rgb,
  }

  return (
    <button
      type="button"
      className={[
        'muscle-group-card',
        `muscle-group-card--${visual.tone}`,
        neonImage ? 'muscle-group-card--neon' : '',
        isActive ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={() => onSelect?.(group.id)}
      aria-pressed={isActive}
      aria-label={`${group.label}: ${count} ${count === 1 ? 'exercício' : 'exercícios'}. Ver exercícios`}
    >
      <span className="muscle-group-card__art" aria-hidden="true">
        <span className="muscle-group-card__glow" />
        {neonImage ? (
          <img
            src={neonImage}
            alt=""
            className="muscle-group-card__neon"
            draggable={false}
          />
        ) : null}
      </span>

      <span className="muscle-group-card__body">
        <span className="muscle-group-card__name">{group.label}</span>
        <span className="muscle-group-card__subtitle">{visual.subtitle}</span>
        {expanding ? (
          <em className="muscle-group-card__expanding">em expansão</em>
        ) : null}
      </span>

      <span className="muscle-group-card__footer">
        <span className="muscle-group-card__badge" aria-hidden="true">
          {count}
        </span>
        <span className="muscle-group-card__cta" aria-hidden="true">
          <span className="muscle-group-card__cta-label">Ver</span>
          <span className="muscle-group-card__cta-arrow">→</span>
        </span>
      </span>
    </button>
  )
}
