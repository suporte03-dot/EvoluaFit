import ExerciseMedia from './ExerciseMedia'
import { navigateToExercise } from '../hooks/useHashRoute'
import { muscleGroupLabel } from '../data/exerciseMediaMap'

function levelClass(level = 'iniciante') {
  return level
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

export default function ExerciseCard({ exercise, onAdd, onClick, variant = 'default' }) {
  const handleOpen = () => {
    if (onClick) {
      onClick(exercise)
      return
    }
    navigateToExercise(exercise.id)
  }

  const muscle = muscleGroupLabel(exercise.muscleGroup || exercise.category)

  if (variant === 'gdt') {
    return (
      <article className="gdt-exercise-card">
        <button
          type="button"
          className="gdt-exercise-card__media"
          onClick={handleOpen}
          aria-label={`Ver exercício: ${exercise.name}`}
        >
          <ExerciseMedia exercise={exercise} square lazy fit="contain" showPendingBadge />
        </button>

        <div className="gdt-exercise-card__body">
          <button type="button" className="gdt-exercise-card__title-btn" onClick={handleOpen}>
            <h3 className="gdt-exercise-card__title">{exercise.name}</h3>
          </button>

          <div className="gdt-exercise-card__meta">
            <span className="gdt-exercise-card__muscle">{muscle}</span>
            {exercise.equipment && <span className="equipment-tag">{exercise.equipment}</span>}
            {exercise.level && (
              <span className={`level-badge level-badge--sm level-badge--${levelClass(exercise.level)}`}>
                {exercise.level}
              </span>
            )}
            {exercise.type && <span className="exercise-type-tag">{exercise.type}</span>}
          </div>

          <div className="gdt-exercise-card__actions">
            <button type="button" className="gdt-exercise-card__view" onClick={handleOpen}>
              Ver exercício
            </button>
            {onAdd && (
              <button type="button" className="gdt-exercise-card__add" onClick={() => onAdd(exercise)}>
                + Adicionar
              </button>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="exercise-card glass-card exercise-card--interactive">
      <button type="button" className="exercise-card__media-btn" onClick={handleOpen} aria-label={`Ver detalhes de ${exercise.name}`}>
        <ExerciseMedia exercise={exercise} aspectRatio="16/9" compact fit="contain" showPendingBadge />
      </button>

      <div className="exercise-card__header">
        <button type="button" className="exercise-card__title-btn" onClick={handleOpen}>
          <h3>{exercise.name}</h3>
        </button>
        <span className={`level-badge level-badge--${levelClass(exercise.level)}`}>
          {exercise.level}
        </span>
      </div>

      <div className="exercise-card__tags">
        <span className="muscle-tag">{muscle}</span>
        <span className="exercise-type-tag">{exercise.type}</span>
        <span className="equipment-tag">{exercise.equipment}</span>
      </div>

      <div className="exercise-card__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleOpen}>
          Ver exercício
        </button>
        {onAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(exercise)}>
            + Adicionar
          </button>
        )}
      </div>
    </article>
  )
}
