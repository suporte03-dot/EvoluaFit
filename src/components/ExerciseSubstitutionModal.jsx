import { useEffect, useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import {
  findExerciseAlternatives,
  findExercisesByMuscleGroup,
} from '../utils/exerciseSubstitution'
import Modal from './Modal'
import ExerciseMedia from './ExerciseMedia'

/**
 * Modal de catálogo: substituir (mesmo grupo do atual) ou adicionar (grupo escolhido).
 * mode: 'substitute' | 'add'
 */
export default function ExerciseSubstitutionModal({
  isOpen,
  onClose,
  currentExercise = null,
  onSelect,
  mode = 'substitute',
  muscleGroupOptions = [],
  excludeIds = [],
  defaultMuscleGroup = '',
}) {
  const { profile } = useFitness()
  const isAdd = mode === 'add'

  const resolvedDefault =
    defaultMuscleGroup ||
    currentExercise?.muscleGroup ||
    muscleGroupOptions[0] ||
    ''

  const [selectedGroup, setSelectedGroup] = useState(resolvedDefault)

  useEffect(() => {
    if (isOpen) setSelectedGroup(resolvedDefault)
  }, [isOpen, resolvedDefault])

  const activeGroup = isAdd ? selectedGroup || resolvedDefault : currentExercise?.muscleGroup

  const { alternatives, emptyMessage } = useMemo(() => {
    if (isAdd) {
      if (!activeGroup) return { alternatives: [], emptyMessage: 'Selecione um grupo muscular.' }
      return findExercisesByMuscleGroup(activeGroup, {
        userLevel: profile?.level,
        restrictions: profile?.restrictions || [],
        availableEquipment: profile?.equipment || [],
        excludeIds,
        limit: 14,
      })
    }
    if (!currentExercise) return { alternatives: [], emptyMessage: null }
    return findExerciseAlternatives(currentExercise, {
      userLevel: profile?.level,
      restrictions: profile?.restrictions || [],
      availableEquipment: profile?.equipment || [],
      limit: 10,
    })
  }, [isAdd, activeGroup, currentExercise, profile, excludeIds])

  if (!isOpen) return null
  if (!isAdd && !currentExercise) return null

  const title = isAdd ? 'Adicionar exercício' : 'Substituir exercício'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" className="exercise-substitution-modal">
      <div className="exercise-substitution">
        {isAdd ? (
          <div className="exercise-substitution__add-header">
            <p className="exercise-substitution__current">
              Escolha um exercício do mesmo grupo muscular do treino.
            </p>
            {muscleGroupOptions.length > 0 && (
              <label className="form-field">
                <span>Grupo muscular</span>
                <select value={activeGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                  {muscleGroupOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ) : (
          <p className="exercise-substitution__current">
            Substituindo: <strong>{currentExercise.name}</strong>
            {currentExercise.muscleGroup ? ` · ${currentExercise.muscleGroup}` : ''}
          </p>
        )}

        {alternatives.length === 0 ? (
          <p className="exercise-substitution__empty">
            {emptyMessage || 'Nenhuma alternativa encontrada para este grupo.'}
          </p>
        ) : (
          <ul className="exercise-substitution__list">
            {alternatives.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  className="exercise-substitution__option"
                  onClick={() => onSelect(ex)}
                >
                  <ExerciseMedia exercise={ex} aspectRatio="1/1" compact square />
                  <div className="exercise-substitution__option-body">
                    <strong>{ex.name}</strong>
                    <span>
                      {ex.muscleGroup || ex.category}
                      {ex.equipment ? ` · ${ex.equipment}` : ''}
                      {ex.level ? ` · ${ex.level}` : ''}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="exercise-substitution__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}
