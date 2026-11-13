import { useState } from 'react'
import { getExerciseProgressStats } from '../utils/progressStorage'
import { getTargetSets, isExerciseComplete } from '../utils/workoutSession'
import ExerciseMedia from './ExerciseMedia'
import ExerciseProgressChart from './ExerciseProgressChart'
import SetChecklist from './SetChecklist'

const STATUS_LABEL = {
  pending: 'Pendente',
  partial: 'Em andamento',
  done: 'Concluído',
}

export default function ExerciseSessionCard({
  exercise,
  index,
  isCurrent = false,
  expanded = false,
  onToggle,
  draft,
  onDraftChange,
  onCompleteSet,
  onSubstitute,
  disabled = false,
}) {
  const [showChart, setShowChart] = useState(false)
  const targetSets = getTargetSets(exercise)
  const done = isExerciseComplete(exercise)
  const status = done ? 'done' : exercise.completedSets > 0 ? 'partial' : 'pending'
  const stats = getExerciseProgressStats(exercise.exerciseId, exercise.name)
  const lastHint =
    stats.lastWeightLabel || (stats.lastWeight != null ? `${stats.lastWeight}` : null)

  // Prefill weight from last session when draft is empty
  const effectiveDraft = {
    weight: draft?.weight || lastHint || '',
    reps: draft?.reps || '',
  }

  return (
    <article
      className={`exercise-session-card${expanded ? ' is-open' : ''}${isCurrent ? ' is-current' : ''}${
        done ? ' is-done' : ''
      }`}
    >
      <button type="button" className="exercise-session-card__header" onClick={onToggle} aria-expanded={expanded}>
        <div className="exercise-session-card__title-row">
          <span className="exercise-session-card__index">{index + 1}</span>
          <div>
            <strong className="exercise-session-card__name">{exercise.name}</strong>
            <p className="exercise-session-card__meta">
              {targetSets} séries · {exercise.reps} reps · Descanso {exercise.restSeconds || 60}s
              {lastHint ? ` · Último peso: ${lastHint}${/kg/i.test(String(lastHint)) ? '' : ' kg'}` : ''}
            </p>
          </div>
        </div>
        <div className="exercise-session-card__status-row">
          <span className={`exercise-session-card__status exercise-session-card__status--${status}`}>
            {STATUS_LABEL[status]}
          </span>
          <span className="exercise-session-card__chevron" aria-hidden="true">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="exercise-session-card__body">
          <ExerciseMedia exercise={exercise} aspectRatio="16/9" compact lazy={false} />

          {(exercise.shortInstruction || exercise.execution?.[0]) && (
            <p className="exercise-session-card__instructions">
              {exercise.shortInstruction || exercise.execution[0]}
            </p>
          )}

          {lastHint && (
            <p className="exercise-session-card__last-weight">
              Último peso registrado: <strong>{lastHint}{/kg/i.test(String(lastHint)) ? '' : ' kg'}</strong>
            </p>
          )}

          <SetChecklist
            slots={exercise.setSlots}
            targetSets={targetSets}
            draft={effectiveDraft}
            onDraftChange={onDraftChange}
            onCompleteSet={onCompleteSet}
            disabled={disabled || done}
          />

          <div className="exercise-session-card__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onSubstitute} disabled={disabled}>
              Substituir exercício
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setShowChart((v) => !v)}
            >
              {showChart ? 'Ocultar progresso' : 'Ver progresso'}
            </button>
          </div>

          {showChart && <ExerciseProgressChart {...stats} />}
        </div>
      )}
    </article>
  )
}
