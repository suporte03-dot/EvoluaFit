import { useEffect, useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import {
  findExerciseAlternatives,
  findExercisesByMuscleGroup,
} from '../utils/exerciseSubstitution'
import { muscleGroups, equipmentTypes, levelTypes } from '../data/exercisesData.js'
import { classifyExercise, KINDS } from '../utils/prescription/classify.js'
import Modal from './Modal'
import ExerciseMedia from './ExerciseMedia'

function ExerciseOption({ ex, onSelect, disabled = false, badge = null }) {
  return (
    <li>
      <button
        type="button"
        className="exercise-substitution__option"
        onClick={() => !disabled && onSelect(ex)}
        disabled={disabled}
        aria-disabled={disabled}
      >
        <ExerciseMedia exercise={ex} aspectRatio="1/1" compact square />
        <div className="exercise-substitution__option-body">
          <strong>
            {ex.name}
            {badge ? <span className="exercise-substitution__badge">{badge}</span> : null}
            {disabled ? <span className="exercise-substitution__badge">Já no treino</span> : null}
          </strong>
          <span>
            {ex.muscleGroup || ex.category}
            {ex.equipment ? ` · ${ex.equipment}` : ''}
            {ex.level ? ` · ${ex.level}` : ''}
          </span>
        </div>
      </button>
    </li>
  )
}

function sortBasicsFirst(list, userLevel) {
  return [...list].sort((a, b) => {
    const ka = classifyExercise(a)
    const kb = classifyExercise(b)
    const score = (ex, k) => {
      let s = 0
      if (k.kind === KINDS.composto) s += k.principal ? 5 : 3
      if (k.kind === KINDS.isolado) s += 1
      if (ex.level === userLevel) s += 1
      if (ex.level === 'Avançado' && userLevel !== 'Avançado') s -= 2
      return s
    }
    return score(b, kb) - score(a, ka)
  })
}

/**
 * Modal de catálogo: substituir ou adicionar.
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
  const groupOptions = muscleGroupOptions.length ? muscleGroupOptions : muscleGroups

  const resolvedDefault =
    defaultMuscleGroup ||
    currentExercise?.muscleGroup ||
    groupOptions[0] ||
    ''

  const [selectedGroup, setSelectedGroup] = useState(resolvedDefault)
  const [query, setQuery] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState(profile?.level || '')

  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(resolvedDefault)
      setQuery('')
      setEquipmentFilter('')
      setLevelFilter(profile?.level || '')
    }
  }, [isOpen, resolvedDefault, profile?.level])

  const activeGroup = isAdd ? selectedGroup || resolvedDefault : currentExercise?.muscleGroup
  const excluded = new Set((excludeIds || []).filter(Boolean))

  const catalog = useMemo(() => {
    if (isAdd) {
      if (!activeGroup) {
        return { alternatives: [], secondaryAlternatives: [], emptyMessage: 'Selecione um grupo muscular.' }
      }
      return findExercisesByMuscleGroup(activeGroup, {
        userLevel: levelFilter || profile?.level,
        restrictions: profile?.restrictions || [],
        availableEquipment: profile?.equipment || [],
        excludeIds: [],
        limit: 40,
        secondaryLimit: 16,
      })
    }
    if (!currentExercise) return { alternatives: [], secondaryAlternatives: [], emptyMessage: null }
    const result = findExerciseAlternatives(currentExercise, {
      userLevel: levelFilter || profile?.level,
      restrictions: profile?.restrictions || [],
      availableEquipment: profile?.equipment || [],
      limit: 24,
    })
    return { ...result, secondaryAlternatives: result.secondaryAlternatives || [] }
  }, [isAdd, activeGroup, currentExercise, profile, levelFilter])

  const filterList = (list) => {
    const q = query.trim().toLowerCase()
    return sortBasicsFirst(
      (list || []).filter((ex) => {
        if (equipmentFilter && String(ex.equipment || '') !== equipmentFilter) return false
        if (levelFilter && ex.level && LEVEL_RANK(ex.level) > LEVEL_RANK(levelFilter) + 1) return false
        if (q && !String(ex.name || '').toLowerCase().includes(q)) return false
        return true
      }),
      profile?.level,
    )
  }

  const alternatives = filterList(catalog.alternatives)
  const secondaryAlternatives = filterList(catalog.secondaryAlternatives)

  if (!isOpen) return null
  if (!isAdd && !currentExercise) return null

  const title = isAdd ? 'Adicionar exercício' : 'Substituir exercício'
  const hasPrimary = alternatives.length > 0
  const hasSecondary = isAdd && secondaryAlternatives.length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" className="exercise-substitution-modal">
      <div className="exercise-substitution">
        {isAdd ? (
          <div className="exercise-substitution__add-header">
            <p className="exercise-substitution__current">
              Começa no grupo do dia; você pode trocar para incluir, por exemplo, tríceps no peito.
            </p>
            <label className="form-field">
              <span>Buscar</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome do exercício"
              />
            </label>
            <label className="form-field">
              <span>Grupo muscular</span>
              <select value={activeGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                {groupOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <div className="exercise-substitution__filters">
              <label className="form-field">
                <span>Equipamento</span>
                <select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {equipmentTypes.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Nível</span>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {levelTypes.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <p className="exercise-substitution__current">
            Substituindo: <strong>{currentExercise.name}</strong>
            {currentExercise.muscleGroup ? ` · ${currentExercise.muscleGroup}` : ''}
          </p>
        )}

        {!hasPrimary && !hasSecondary ? (
          <p className="exercise-substitution__empty">
            {catalog.emptyMessage || 'Nenhuma alternativa encontrada para este grupo.'}
          </p>
        ) : (
          <>
            {hasPrimary ? (
              <ul className="exercise-substitution__list" aria-label="Exercícios do grupo principal">
                {alternatives.map((ex) => (
                  <ExerciseOption
                    key={ex.id}
                    ex={ex}
                    onSelect={onSelect}
                    disabled={excluded.has(ex.id)}
                  />
                ))}
              </ul>
            ) : (
              <p className="exercise-substitution__empty">
                Nenhum exercício com este grupo como principal.
              </p>
            )}
            {hasSecondary ? (
              <div className="exercise-substitution__secondary">
                <h3 className="exercise-substitution__secondary-title">
                  Também trabalha {activeGroup}
                </h3>
                <ul className="exercise-substitution__list" aria-label={`Também trabalha ${activeGroup}`}>
                  {secondaryAlternatives.map((ex) => (
                    <ExerciseOption
                      key={ex.id}
                      ex={ex}
                      onSelect={onSelect}
                      disabled={excluded.has(ex.id)}
                      badge={ex.category || ex.muscleGroup}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </>
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

function LEVEL_RANK(level) {
  return { Iniciante: 1, Intermediário: 2, Avançado: 3 }[level] || 2
}
