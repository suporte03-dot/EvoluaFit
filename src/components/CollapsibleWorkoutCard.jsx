import { useId, useState } from 'react'
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
  index = 0,
  editingId,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onStart,
  onView,
  onDuplicate,
  onMarkDone,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const type = inferWorkoutType(workout)
  const exerciseCount = workout.exercises?.length || 0
  const duration = workout.estimatedMinutes || 45
  const dateLabel = workout.dayLabel || formatDateShort(workout.date)
  const isEditing = editingId === workout.id

  const toggle = () => setOpen((v) => !v)

  const onHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <article
      className={`workout-card glass-card workout-card--accordion${open ? ' workout-card--expanded' : ''}`}
      style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
    >
      <div
        className="workout-card__summary"
        onClick={isEditing ? undefined : toggle}
        onKeyDown={isEditing ? undefined : onHeaderKeyDown}
        role={isEditing ? undefined : 'button'}
        tabIndex={isEditing ? undefined : 0}
        aria-expanded={open}
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
            <div className="workout-card__heading">
              <h3 className="workout-card__name">{workout.name}</h3>
              <span className="workout-card__type">{type}</span>
            </div>
          )}
          <span className={`status-badge ${statusClass[workout.status] || ''}`}>{workout.status}</span>
        </div>

        <p className="workout-card__meta">
          <span>{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{duration} min</span>
        </p>

        {workout.muscleGroups?.length > 0 && (
          <div className="workout-card__muscles">
            {workout.muscleGroups.map((g) => (
              <span key={g} className="muscle-tag">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="workout-card__primary">
        <button
          type="button"
          className="btn btn--primary btn--sm btn--start-workout"
          onClick={() => onStart(workout)}
          disabled={workout.status === 'Realizado'}
        >
          Iniciar treino
        </button>
        <button
          type="button"
          className="workout-card__toggle"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Recolher detalhes do treino' : 'Expandir detalhes do treino'}
        >
          <span aria-hidden="true">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      <div
        id={panelId}
        className={`workout-card__panel${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="workout-card__panel-inner">
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
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onView(workout)}>
              Ver treino
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={(e) => onStartEdit(workout, e)}>
              Editar
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onDuplicate(workout.id)}>
              Duplicar
            </button>
            {workout.status !== 'Realizado' && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={(e) => onMarkDone(workout, e)}>
                Marcar realizado
              </button>
            )}
            <button type="button" className="btn btn--danger btn--sm" onClick={() => onDelete(workout.id)}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
