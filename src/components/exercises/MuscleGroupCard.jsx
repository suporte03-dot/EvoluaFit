import { getMuscleGroupVisual } from '../../data/muscleGroupVisualConfig'

/**
 * Premium letter-badge muscle-group browse card (PT, CO, PN…).
 */
export default function MuscleGroupCard({
  group,
  count = 0,
  isActive = false,
  onSelect,
}) {
  const visual = getMuscleGroupVisual(group.id)
  const expanding = Boolean(visual.expanding)
  const letter = visual.letter || visual.shortCode

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
        isActive ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={() => onSelect?.(group.id)}
      aria-pressed={isActive}
      aria-label={`${group.label}: ${count} ${count === 1 ? 'exercício' : 'exercícios'}`}
    >
      <span className="muscle-group-card__letter" aria-hidden="true">
        {letter}
      </span>

      <span className="muscle-group-card__body">
        <span className="muscle-group-card__name">{group.label}</span>
        <span className="muscle-group-card__subtitle">{visual.subtitle}</span>
        {expanding ? (
          <em className="muscle-group-card__expanding">em expansão</em>
        ) : null}
        <span className="muscle-group-card__cta">
          Ver exercícios
          <span className="muscle-group-card__cta-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>

      <span className="muscle-group-card__badge" aria-hidden="true">
        {count}
      </span>
    </button>
  )
}
