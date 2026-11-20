import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import ExerciseMedia from './ExerciseMedia'
import { planCompleteDay } from '../utils/completeWorkout.js'

export default function CompleteWorkoutModal({
  isOpen,
  onClose,
  workout,
  plan,
  profile,
  onApply,
}) {
  const preview = useMemo(
    () =>
      planCompleteDay(workout, plan, {
        level: profile?.level || plan?.level,
        goal: plan?.objective || plan?.goal || profile?.objective,
        equipment: profile?.equipment || plan?.equipment,
        restrictions: profile?.restrictions || plan?.restrictions,
      }),
    [workout, plan, profile],
  )

  const [selected, setSelected] = useState(() => preview.suggestions.map((_, i) => i))

  useEffect(() => {
    if (isOpen) setSelected(preview.suggestions.map((_, i) => i))
  }, [isOpen, preview.suggestions])

  if (!isOpen || !workout) return null

  const toggle = (index) => {
    setSelected((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const selectedSuggestions = preview.suggestions.filter((_, i) => selected.includes(i))
  const canApply = selectedSuggestions.length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Completar treino" size="md">
      <div className="complete-workout">
        <p className="complete-workout__lead">
          {preview.deficit > 0
            ? `${preview.group}: faltam ~${Math.ceil(preview.deficit)} séries efetivas para a faixa ${preview.range[0]}–${preview.range[1]}.`
            : `${preview.group || 'Grupo'} já está na faixa de volume.`}
        </p>
        <p className="complete-workout__meta">
          Duração estimada: ~{preview.minutesBefore} min → ~{preview.minutesAfter} min (com todos
          marcados).
        </p>

        {preview.suggestions.length === 0 ? (
          <p className="complete-workout__empty">Nenhuma sugestão disponível com seu equipamento.</p>
        ) : (
          <ul className="complete-workout__list">
            {preview.suggestions.map((item, index) => (
              <li key={item.catalog.id}>
                <label className="complete-workout__option">
                  <input
                    type="checkbox"
                    checked={selected.includes(index)}
                    onChange={() => toggle(index)}
                  />
                  <ExerciseMedia exercise={item.catalog} aspectRatio="1/1" compact square />
                  <span>
                    <strong>{item.catalog.name}</strong>
                    <small>
                      {item.sets} séries · {item.entry.reps} · {item.catalog.equipment || '—'}
                    </small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="complete-workout__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canApply}
            onClick={() => onApply?.(selected)}
          >
            Aplicar seleção
          </button>
        </div>
      </div>
    </Modal>
  )
}
