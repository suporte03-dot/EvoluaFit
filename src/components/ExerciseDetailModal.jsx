import ExerciseMedia from './ExerciseMedia'
import { useFitness } from '../context/FitnessContext'
import { GDT_CATEGORY_CHIPS } from '../data/exerciseMediaMap'

function levelClass(level = 'iniciante') {
  return level
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function muscleLabel(category) {
  const chip = GDT_CATEGORY_CHIPS.find((c) => c.id === category || c.categories?.includes(category))
  return chip?.label || category
}

export default function ExerciseDetailModal({ exercise, isOpen, onClose }) {
  const { addExerciseToPlan } = useFitness()

  if (!isOpen || !exercise) return null

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAdd = () => {
    addExerciseToPlan(exercise)
  }

  const benefits = Array.isArray(exercise.benefits) ? exercise.benefits : []
  const commonMistakes = Array.isArray(exercise.commonMistakes) ? exercise.commonMistakes : []
  const safetyTips = Array.isArray(exercise.safetyTips) ? exercise.safetyTips : []
  const executionSteps = exercise.executionSteps || exercise.execution || []
  const category = exercise.muscleGroup || exercise.category

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

        <div className="exercise-modal__hero">
          <ExerciseMedia exercise={exercise} aspectRatio="4/3" lazy={false} fit="contain" />
        </div>

        <div className="exercise-modal__header">
          <div>
            <h2 id="exercise-modal-title" className="exercise-modal__title">
              {exercise.name}
            </h2>
          </div>
          <span className={`level-badge level-badge--${levelClass(exercise.level)}`}>
            {exercise.level}
          </span>
        </div>

        <div className="exercise-modal__tags">
          <span className="muscle-tag muscle-tag--primary">{muscleLabel(category)}</span>
          <span className="equipment-tag">{exercise.equipment}</span>
          {exercise.type && <span className="exercise-type-tag">{exercise.type}</span>}
        </div>

        {exercise.shortInstruction && (
          <section className="exercise-modal__section">
            <h3>Instrução</h3>
            <p className="exercise-modal__instruction">{exercise.shortInstruction}</p>
          </section>
        )}

        {executionSteps.length > 0 && (
          <section className="exercise-modal__section">
            <h3>Execução passo a passo</h3>
            <ol className="exercise-modal__steps">
              {executionSteps.map((step, i) => (
                <li key={`${step}-${i}`}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {benefits.length > 0 && (
          <section className="exercise-modal__section">
            <h3>Benefícios</h3>
            <ul className="exercise-modal__list">
              {benefits.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {commonMistakes.length > 0 && (
          <section className="exercise-modal__section exercise-modal__section--caution">
            <h3>Erros comuns</h3>
            <ul className="exercise-modal__list">
              {commonMistakes.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {safetyTips.length > 0 && (
          <section className="exercise-modal__section exercise-modal__section--safety">
            <h3>Cuidados de segurança</h3>
            <ul className="exercise-modal__list">
              {safetyTips.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

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
