import { useId } from 'react'
import { inferWorkoutType } from '../utils/workoutSession'
import { formatDateShort } from '../utils/dateFormat'

const statusClass = {
  Pendente: 'status--pending',
  Realizado: 'status--done',
  Parcial: 'status--partial',
  Pulado: 'status--skipped',
}

function formatExerciseRest(ex) {
  if (ex.rest != null && ex.rest !== '') {
    return typeof ex.rest === 'number' ? `${ex.rest}s` : String(ex.rest)
  }
  if (ex.restSeconds != null) return `${ex.restSeconds}s`
  return null
}

function exerciseNote(ex) {
  return ex.note || ex.observations || ex.obs || null
}

export default function CollapsibleWorkoutCard({
  workout,
  isOpen = false,
  onToggle,
  onStartWorkout,
  onViewWorkout,
  onEdit,
  onDuplicate,
  onComplete,
  onDelete,
  index = 0,
  editingId,
  editName,
  onEditNameChange,
  onSaveEdit,
}) {
  const panelId = useId()
  const type = inferWorkoutType(workout)
  const exerciseCount = workout.exercises?.length || 0
  const duration = workout.estimatedMinutes || 45
  const dateLabel = workout.dayLabel || formatDateShort(workout.date)
  const isEditing = editingId === workout.id

  const handleToggle = () => {
    onToggle?.(workout.id)
  }

  const onHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <article
      className={`workout-card glass-card workout-card--accordion${isOpen ? ' workout-card--expanded' : ''}`}
      style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
    >
      <div
        className="workout-card__summary"
        onClick={isEditing ? undefined : handleToggle}
        onKeyDown={isEditing ? undefined : onHeaderKeyDown}
        role={isEditing ? undefined : 'button'}
        tabIndex={isEditing ? undefined : 0}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className="workout-card__top">
          {isEditing ? (
            <div
              className="workout-card__edit"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <input
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                aria-label="Nome do treino"
              />
              <button
                type="button"
                className="btn btn--sm btn--primary"
                onClick={(e) => onSaveEdit(workout.id, e)}
              >
                Salvar
              </button>
            </div>
          ) : (
            <h3 className="workout-card__name">{workout.name}</h3>
          )}
          <button
            type="button"
            className="workout-card__toggle"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? 'Recolher detalhes do treino' : 'Expandir detalhes do treino'}
          >
            <span className="workout-card__toggle-icon" aria-hidden="true">
              ▼
            </span>
          </button>
        </div>

        <p className="workout-card__meta">
          <span>{type}</span>
          <span aria-hidden="true">·</span>
          <span>{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{duration} min</span>
          <span aria-hidden="true">·</span>
          <span className={`workout-card__status ${statusClass[workout.status] || ''}`}>
            {workout.status}
          </span>
        </p>
      </div>

      <div className="workout-card__primary">
        <button
          type="button"
          className="btn btn--primary btn--sm btn--start-workout"
          onClick={(e) => {
            e.stopPropagation()
            onStartWorkout?.(workout)
          }}
          disabled={workout.status === 'Realizado'}
        >
          Iniciar treino
        </button>
      </div>

      <div
        id={panelId}
        className={`workout-card__panel${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="workout-card__panel-inner">
          {workout.muscleGroups?.length > 0 && (
            <div className="workout-card__muscles">
              {workout.muscleGroups.map((g) => (
                <span key={g} className="muscle-tag">
                  {g}
                </span>
              ))}
            </div>
          )}

          {exerciseCount > 0 && (
            <ul className="workout-card__exercises">
              {workout.exercises.map((ex, i) => {
                const rest = formatExerciseRest(ex)
                const note = exerciseNote(ex)
                return (
                  <li key={`${ex.exerciseId || ex.id || ex.name}-${i}`} className="workout-card__exercise">
                    <strong className="workout-card__exercise-name">{ex.name}</strong>
                    <div className="workout-card__exercise-meta">
                      {ex.sets != null && <span>{ex.sets} séries</span>}
                      {ex.reps != null && <span>{ex.reps} reps</span>}
                      {rest && <span>Descanso {rest}</span>}
                      {ex.load && <span>{ex.load}</span>}
                    </div>
                    {note && <p className="workout-card__exercise-note">{note}</p>}
                  </li>
                )
              })}
            </ul>
          )}

          <div className="workout-card__actions workout-card__actions--extra">
            <button
              type="button"
              className="btn btn--ghost btn--sm workout-card__view"
              onClick={(e) => {
                e.stopPropagation()
                onViewWorkout?.(workout)
              }}
            >
              Ver treino
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(workout, e)
              }}
            >
              Editar
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate?.(workout.id)
              }}
            >
              Duplicar
            </button>
            {workout.status !== 'Realizado' && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onComplete?.(workout, e)
                }}
              >
                Marcar realizado
              </button>
            )}
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(workout.id)
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
