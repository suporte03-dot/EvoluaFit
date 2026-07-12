import ExerciseMedia from './ExerciseMedia'
import { navigateToExercise } from '../hooks/useHashRoute'
import { GDT_CATEGORY_CHIPS } from '../data/exerciseMediaMap'

function muscleLabel(category) {
  const chip = GDT_CATEGORY_CHIPS.find((c) => c.id === category || c.categories?.includes(category))
  return chip?.label || category
}

export default function ExerciseCard({ exercise, onAdd, onClick, variant = 'default' }) {
  const handleOpen = () => {
    if (onClick) {
      onClick(exercise)
      return
    }
    navigateToExercise(exercise.id)
  }

  if (variant === 'gdt') {
    return (
      <article className="gdt-exercise-card">
        <button
          type="button"
          className="gdt-exercise-card__media"
          onClick={handleOpen}
          aria-label={`Visualizar ${exercise.name}`}
        >
          <ExerciseMedia exercise={exercise} square lazy />
          <span className="gdt-exercise-card__visualizar">Visualizar</span>
        </button>

        <div className="gdt-exercise-card__body">
          <h3 className="gdt-exercise-card__title">{exercise.name}</h3>
          <span className="gdt-exercise-card__muscle">{muscleLabel(exercise.category)}</span>
          {onAdd && (
            <button
              type="button"
              className="gdt-exercise-card__add"
              onClick={() => onAdd(exercise)}
            >
              + Adicionar
            </button>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="exercise-card glass-card exercise-card--interactive">
      <button type="button" className="exercise-card__media-btn" onClick={handleOpen} aria-label={`Ver detalhes de ${exercise.name}`}>
        <ExerciseMedia exercise={exercise} aspectRatio="16/9" compact />
      </button>

      <div className="exercise-card__header">
        <button type="button" className="exercise-card__title-btn" onClick={handleOpen}>
          <h3>{exercise.name}</h3>
        </button>
        <span className={`level-badge level-badge--${exercise.level.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>
          {exercise.level}
        </span>
      </div>

      <div className="exercise-card__tags">
        <span className="muscle-tag">{exercise.muscleGroup || exercise.category}</span>
        <span className="exercise-type-tag">{exercise.type}</span>
        <span className="equipment-tag">{exercise.equipment}</span>
      </div>

      <div className="exercise-card__actions">
        {onAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(exercise)}>
            Adicionar ao treino
          </button>
        )}
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleOpen}>
          Ver exercício
        </button>
      </div>
    </article>
  )
}
