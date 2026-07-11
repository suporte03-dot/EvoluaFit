import { exercises } from '../data/exercisesData'

export default function ExerciseCard({ exercise, onAdd }) {
  return (
    <article className="exercise-card glass-card">
      <div className="exercise-card__header">
        <h3>{exercise.name}</h3>
        <span className={`level-badge level-badge--${exercise.level.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>
          {exercise.level}
        </span>
      </div>
      <div className="exercise-card__tags">
        <span className="muscle-tag">{exercise.muscleGroup}</span>
        <span className="equipment-tag">{exercise.equipment}</span>
      </div>
      <p className="exercise-card__instructions">{exercise.instructions}</p>
      {exercise.cautions && <p className="exercise-card__caution">⚠️ {exercise.cautions}</p>}
      <div className="exercise-card__meta">
        {exercise.defaultSets}x {exercise.defaultReps} · {exercise.restSeconds}s descanso
      </div>
      {onAdd && (
        <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(exercise)}>
          Adicionar ao treino
        </button>
      )}
    </article>
  )
}
