import { getMuscleGroupVisual } from '../../data/muscleGroupVisualConfig'
import { MuscleGroupIllustration } from './MuscleGroupIllustrations'

/**
 * Premium anatomical muscle-group browse card — matches reference composition.
 */
export default function MuscleGroupCard({
  group,
  count = 0,
  index,
  isActive = false,
  onSelect,
}) {
  const visual = getMuscleGroupVisual(group.id)
  const expanding = Boolean(visual.expanding)
  const orderLabel = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null

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
      <span className="muscle-group-card__glow" aria-hidden="true" />

      <span className="muscle-group-card__top">
        {orderLabel ? (
          <span className="muscle-group-card__order" aria-hidden="true">
            {orderLabel}
          </span>
        ) : (
          <span className="muscle-group-card__order muscle-group-card__order--spacer" aria-hidden="true" />
        )}
        <span className="muscle-group-card__code" aria-hidden="true">
          {visual.shortCode}
        </span>
      </span>

      <span className="muscle-group-card__body">
        <span className="muscle-group-card__name">{group.label}</span>
        <span className="muscle-group-card__subtitle">{visual.subtitle}</span>
        <span className="muscle-group-card__count">
          {count} {count === 1 ? 'exercício' : 'exercícios'}
        </span>
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

      <span className="muscle-group-card__art" aria-hidden="true">
        <MuscleGroupIllustration name={visual.illustration} />
      </span>
    </button>
  )
}
