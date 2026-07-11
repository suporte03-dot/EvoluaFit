import ExerciseMedia from './ExerciseMedia'
import { navigateToExercise } from '../hooks/useHashRoute'

export default function ExerciseCard({ exercise, onAdd, onClick }) {
  const handleOpen = () => {
    if (onClick) {
      onClick(exercise)
      return
    }
    navigateToExercise(exercise.id)
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

      <p className="exercise-card__instructions">
        {exercise.shortInstruction || exercise.execution?.[0] || exercise.benefits?.[0]}
      </p>

      {exercise.commonMistakes?.[0] && (
        <p className="exercise-card__caution">⚠️ {exercise.commonMistakes[0]}</p>
      )}

      <div className="exercise-card__meta">
        {exercise.sets} séries · {exercise.reps} · {exercise.rest}
      </div>

      <div className="exercise-card__actions">
        {onAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(exercise)}>
            Adicionar ao treino
          </button>
        )}
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleOpen}>
          Ver detalhes
        </button>
      </div>
    </article>
  )
}
