import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { listEligibleAddTargets, targetLabel } from '../utils/libraryAdd.js'
import { workoutDisplayMinutes } from '../utils/workoutDuration'

export default function AddToWorkoutModal({
  exercise,
  workouts = [],
  generatedPlan = null,
  history = [],
  plans = [],
  busy = false,
  onConfirm,
  onCancel,
}) {
  const targets = useMemo(
    () => listEligibleAddTargets(workouts, { generatedPlan, history, plans }),
    [workouts, generatedPlan, history, plans],
  )
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    setSelectedId(targets[0]?.id || null)
  }, [exercise, targets])

  if (!exercise) return null

  const selected = targets.find((w) => w.id === selectedId) || targets[0] || null
  const canConfirm = Boolean(selected) && !busy
  const willCreate = targets.length === 0

  return (
    <Modal
      isOpen={Boolean(exercise)}
      onClose={() => {
        if (!busy) onCancel?.()
      }}
      title="Adicionar exercício"
      size="sm"
      className="add-to-workout-modal"
    >
      <p className="add-to-workout__lead">
        Incluir <strong>{exercise.name}</strong>
        {willCreate
          ? ' em um novo treino na planilha.'
          : targets.length === 1
            ? ' neste treino:'
            : ' em qual treino?'}
      </p>

      {willCreate ? (
        <p className="add-to-workout__create">
          Novo treino: <strong>Treino — {exercise.category || 'Geral'}</strong>
        </p>
      ) : (
        <ul className="add-to-workout__list" role="listbox" aria-label="Treino de destino">
          {targets.map((workout) => {
            const count = (workout.exercises || []).length
            const minutes = workoutDisplayMinutes(workout, 0)
            const active = (selected?.id || selectedId) === workout.id
            return (
              <li key={workout.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`add-to-workout__option${active ? ' is-active' : ''}`}
                  disabled={busy}
                  onClick={() => setSelectedId(workout.id)}
                >
                  <span className="add-to-workout__option-name">{targetLabel(workout)}</span>
                  <span className="add-to-workout__option-meta">
                    {count} {count === 1 ? 'exercício' : 'exercícios'}
                    {minutes > 0 ? ` · ~${minutes} min` : ''}
                    {generatedPlan?.id && workout.planId === generatedPlan.id ? ' · Rotina ativa' : ''}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!willCreate && selected ? (
        <p className="add-to-workout__confirm" role="status">
          Destino: <strong>{targetLabel(selected)}</strong>
        </p>
      ) : null}

      <div className="add-to-workout__actions">
        <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => onCancel?.()}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canConfirm && !willCreate}
          onClick={() => onConfirm?.(willCreate ? null : selected?.id)}
        >
          {busy ? 'Salvando…' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  )
}
