import ExerciseMedia from './ExerciseMedia'
import { useFitness } from '../context/FitnessContext'

export default function ExerciseDetailModal({ exercise, isOpen, onClose }) {
  const { addExerciseToPlan } = useFitness()

  if (!isOpen || !exercise) return null

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAdd = () => {
    addExerciseToPlan(exercise)
  }

  return (
    <div
      className="exercise-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-modal-title"
      onClick={handleBackdrop}
    >
      <div className="exercise-modal glass-card">
        <button type="button" className="exercise-modal__close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <ExerciseMedia exercise={exercise} aspectRatio="16/9" lazy={false} />

        <div className="exercise-modal__header">
          <div>
            <span className="exercise-modal__type">{exercise.type}</span>
            <h2 id="exercise-modal-title" className="exercise-modal__title">
              {exercise.name}
            </h2>
          </div>
          <span
            className={`level-badge level-badge--${exercise.level.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
          >
            {exercise.level}
          </span>
        </div>

        <div className="exercise-modal__tags">
          <span className="muscle-tag muscle-tag--primary">{exercise.muscleGroup || exercise.category}</span>
          {exercise.muscles?.map((m) => (
            <span key={m} className="muscle-tag">
              {m}
            </span>
          ))}
          <span className="equipment-tag">{exercise.equipment}</span>
        </div>

        <div className="exercise-modal__meta-grid">
          <div className="exercise-modal__meta-item">
            <span className="exercise-modal__meta-label">Séries</span>
            <strong>{exercise.sets}</strong>
          </div>
          <div className="exercise-modal__meta-item">
            <span className="exercise-modal__meta-label">Repetições</span>
            <strong>{exercise.reps}</strong>
          </div>
          <div className="exercise-modal__meta-item">
            <span className="exercise-modal__meta-label">Descanso</span>
            <strong>{exercise.rest}</strong>
          </div>
        </div>

        <section className="exercise-modal__section">
          <h3>Benefícios</h3>
          <ul className="exercise-modal__list">
            {exercise.benefits?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-modal__section">
          <h3>Execução passo a passo</h3>
          <ol className="exercise-modal__steps">
            {(exercise.executionSteps || exercise.execution)?.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="exercise-modal__section exercise-modal__section--caution">
          <h3>Erros comuns</h3>
          <ul className="exercise-modal__list">
            {exercise.commonMistakes?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-modal__section exercise-modal__section--safety">
          <h3>Cuidados de segurança</h3>
          <ul className="exercise-modal__list">
            {exercise.safetyTips?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="exercise-modal__actions">
          <button type="button" className="btn btn--primary" onClick={handleAdd}>
            Adicionar ao treino
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
