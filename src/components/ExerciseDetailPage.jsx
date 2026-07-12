import { getExerciseById } from '../data/exercisesData'
import { useFitness } from '../context/FitnessContext'
import { clearHashRoute } from '../hooks/useHashRoute'
import ExerciseMedia from './ExerciseMedia'

export default function ExerciseDetailPage({ exerciseId }) {
  const { addExerciseToPlan } = useFitness()
  const exercise = getExerciseById(exerciseId)

  if (!exercise) {
    return (
      <div className="exercise-detail-overlay">
        <div className="exercise-detail glass-card">
          <button type="button" className="exercise-detail__close" onClick={clearHashRoute} aria-label="Fechar">
            ✕
          </button>
          <p className="empty-text">Exercício não encontrado.</p>
        </div>
      </div>
    )
  }

  const handleAdd = () => {
    addExerciseToPlan(exercise)
  }

  return (
    <div className="exercise-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="exercise-detail-title">
      <div className="exercise-detail glass-card">
        <button type="button" className="exercise-detail__close" onClick={clearHashRoute} aria-label="Fechar">
          ✕
        </button>

        <ExerciseMedia exercise={exercise} aspectRatio="16/9" lazy={false} />

        <div className="exercise-detail__header">
          <div>
            <span className="exercise-detail__type">{exercise.type}</span>
            <h1 id="exercise-detail-title" className="exercise-detail__title">
              {exercise.name}
            </h1>
          </div>
          <span className={`level-badge level-badge--${exercise.level.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>
            {exercise.level}
          </span>
        </div>

        <div className="exercise-detail__tags">
          <span className="muscle-tag muscle-tag--primary">{exercise.muscleGroup || exercise.category}</span>
          {(exercise.secondaryMuscles || []).map((m) => (
            <span key={m} className="muscle-tag muscle-tag--muted">
              {m}
            </span>
          ))}
          <span className="equipment-tag">{exercise.equipment}</span>
        </div>

        <div className="exercise-detail__meta-grid">
          <div className="exercise-detail__meta-item">
            <span className="exercise-detail__meta-label">Séries</span>
            <strong>{exercise.sets}</strong>
          </div>
          <div className="exercise-detail__meta-item">
            <span className="exercise-detail__meta-label">Repetições</span>
            <strong>{exercise.reps}</strong>
          </div>
          <div className="exercise-detail__meta-item">
            <span className="exercise-detail__meta-label">Descanso</span>
            <strong>{exercise.rest}</strong>
          </div>
        </div>

        <section className="exercise-detail__section">
          <h2>Benefícios</h2>
          <ul className="exercise-detail__list">
            {exercise.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-detail__section">
          <h2>Execução</h2>
          <ol className="exercise-detail__steps">
            {exercise.execution.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="exercise-detail__section exercise-detail__section--caution">
          <h2>Erros comuns</h2>
          <ul className="exercise-detail__list">
            {exercise.commonMistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-detail__section exercise-modal__section--safety">
          <h2>Cuidados de segurança</h2>
          <ul className="exercise-detail__list">
            {exercise.safetyTips?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="exercise-detail__actions">
          <button type="button" className="btn btn--primary" onClick={handleAdd}>
            Adicionar à minha planilha
          </button>
          <button type="button" className="btn btn--ghost" onClick={clearHashRoute}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
