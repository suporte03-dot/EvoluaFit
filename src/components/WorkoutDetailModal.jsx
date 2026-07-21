import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { enrichWorkoutDetail } from '../data/workoutTemplates'
import { navigateToExercise } from '../hooks/useHashRoute'
import { appendExerciseToList, replaceExerciseInList } from '../utils/exerciseSubstitution'
import { summarizeDayVolume } from '../utils/workoutGenerator'
import DayVolumeSummary from './DayVolumeSummary'
import ExerciseMedia from './ExerciseMedia'
import ExerciseSubstitutionModal from './ExerciseSubstitutionModal'
import Modal from './Modal'

function persistableExercises(list) {
  return (list || []).map((ex) => ({
    exerciseId: ex.exerciseId,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    sets: ex.sets,
    reps: ex.reps,
    restSeconds: ex.restSeconds,
    load: ex.load || '',
    note: ex.note || '',
    movementType: ex.movementType,
    movementRoleLabel: ex.movementRoleLabel,
  }))
}

export default function WorkoutDetailModal({ workout, isOpen, onClose }) {
  const { startWorkout, addWorkoutToPlan, updateWorkout, showToast, profile } = useFitness()
  const [substituteIndex, setSubstituteIndex] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const detail = useMemo(() => enrichWorkoutDetail(workout), [workout])
  const isAdvanced = profile?.level === 'Avançado'
  const canEdit = Boolean(workout?.id)

  const muscleOptions = useMemo(() => {
    const fromWorkout = workout?.muscleGroups || detail?.secondaryMuscleGroups || []
    const fromExercises = (workout?.exercises || []).map((ex) => ex.muscleGroup).filter(Boolean)
    const main = detail?.mainMuscleGroup ? [detail.mainMuscleGroup] : []
    return [...new Set([...main, ...fromWorkout, ...fromExercises].filter(Boolean))]
  }, [workout, detail])

  if (!isOpen || !detail) return null

  const volumeText =
    workout?.volumeSummary ||
    summarizeDayVolume(workout?.exercises || detail.exercises, workout?.workoutType || detail.type).text

  const handleStart = () => {
    startWorkout(detail.sourceWorkout)
    onClose()
  }

  const handleAddToPlan = () => {
    addWorkoutToPlan(detail.sourceWorkout)
  }

  const handleSubstitute = (catalogEx) => {
    if (substituteIndex == null || !workout?.id) return
    const next = replaceExerciseInList(workout.exercises || [], substituteIndex, catalogEx, true)
    updateWorkout(workout.id, {
      exercises: persistableExercises(next),
      volumeSummary: summarizeDayVolume(next, workout.workoutType || detail.type).text,
    })
    setSubstituteIndex(null)
    showToast('Exercício substituído com sucesso!')
  }

  const handleAddExercise = (catalogEx) => {
    if (!workout?.id) return
    const next = appendExerciseToList(workout.exercises || [], catalogEx, { sets: 3, reps: '8-12' })
    updateWorkout(workout.id, {
      exercises: persistableExercises(next),
      volumeSummary: summarizeDayVolume(next, workout.workoutType || detail.type).text,
    })
    setShowAdd(false)
    showToast('Exercício adicionado ao treino!')
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={detail.name} size="xl" className="workout-detail-modal">
        <div className="workout-detail">
          <div className="workout-detail__badges">
            <span className="workout-detail__badge">{detail.type}</span>
            {detail.status && (
              <span className={`status-badge status--${detail.status === 'Realizado' ? 'done' : 'pending'}`}>
                {detail.status}
              </span>
            )}
          </div>

          <DayVolumeSummary
            exercises={workout?.exercises || detail.exercises}
            dayType={workout?.workoutType || detail.type}
            volumeSummary={volumeText}
          />

          <div className="workout-detail__meta-grid">
            <div className="workout-detail__meta-item">
              <span className="workout-detail__meta-label">Objetivo</span>
              <strong>{detail.goal}</strong>
            </div>
            <div className="workout-detail__meta-item">
              <span className="workout-detail__meta-label">Nível</span>
              <strong>{detail.level}</strong>
            </div>
            <div className="workout-detail__meta-item">
              <span className="workout-detail__meta-label">Duração</span>
              <strong>{detail.duration} min</strong>
            </div>
            <div className="workout-detail__meta-item">
              <span className="workout-detail__meta-label">Frequência</span>
              <strong>{detail.frequency}</strong>
            </div>
          </div>

          <div className="workout-detail__section">
            <h3 className="workout-detail__section-title">Grupos musculares</h3>
            <div className="workout-detail__tags">
              <span className="muscle-tag muscle-tag--primary">{detail.mainMuscleGroup}</span>
              {detail.secondaryMuscleGroups.map((g) => (
                <span key={g} className="muscle-tag">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="workout-detail__section">
            <h3 className="workout-detail__section-title">Equipamentos</h3>
            <div className="workout-detail__tags">
              {detail.equipment.map((eq) => (
                <span key={eq} className="equipment-tag">
                  {eq}
                </span>
              ))}
            </div>
          </div>

          <div className="workout-detail__section">
            <h3 className="workout-detail__section-title">Benefícios deste treino</h3>
            <ul className="workout-detail__benefits">
              {detail.benefits.map((benefit) => (
                <li key={benefit} className="workout-detail__benefit-card">
                  <span className="workout-detail__benefit-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="workout-detail__section">
            <div className="workout-detail__section-head">
              <h3 className="workout-detail__section-title">Exercícios ({detail.exercises.length})</h3>
              {canEdit && isAdvanced && (
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setShowAdd(true)}>
                  Adicionar exercício
                </button>
              )}
            </div>
            <div className="workout-detail__exercises">
              {detail.exercises.map((ex, i) => (
                <div key={`${ex.id || ex.name}-${i}`} className="workout-detail__exercise-card">
                  {ex.mediaUrl && (
                    <ExerciseMedia
                      exercise={ex}
                      aspectRatio="16/9"
                      compact
                      showPlaceholderName={false}
                    />
                  )}
                  <div className="workout-detail__exercise-body">
                    <div className="workout-detail__exercise-header">
                      {ex.id ? (
                        <button
                          type="button"
                          className="workout-detail__exercise-link"
                          onClick={() => navigateToExercise(ex.id)}
                        >
                          {ex.name}
                        </button>
                      ) : (
                        <strong>{ex.name}</strong>
                      )}
                      <span className="muscle-tag">{ex.muscleGroup || ex.category}</span>
                    </div>

                    {ex.type && <span className="exercise-type-tag">{ex.type}</span>}
                    {(ex.movementRoleLabel || workout?.exercises?.[i]?.movementRoleLabel) && (
                      <span className="exercise-role-tag">
                        {ex.movementRoleLabel || workout.exercises[i].movementRoleLabel}
                      </span>
                    )}

                    {ex.muscles?.length > 0 && (
                      <div className="workout-detail__exercise-muscles">
                        {ex.muscles.map((m) => (
                          <span key={m} className="muscle-tag muscle-tag--sm">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="workout-detail__exercise-meta">
                      <span>{ex.sets} séries</span>
                      <span>{ex.reps} reps</span>
                      <span>Descanso {ex.rest}</span>
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setSubstituteIndex(i)}
                      >
                        Substituir exercício
                      </button>
                    )}

                    {ex.benefits?.length > 0 && (
                      <div className="workout-detail__exercise-block">
                        <h4>Benefícios</h4>
                        <ul>
                          {ex.benefits.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ex.execution?.length > 0 && (
                      <div className="workout-detail__exercise-block">
                        <h4>Execução</h4>
                        <ol>
                          {ex.execution.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {ex.commonMistakes?.length > 0 && (
                      <div className="workout-detail__exercise-block workout-detail__exercise-block--caution">
                        <h4>Erros comuns</h4>
                        <ul>
                          {ex.commonMistakes.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ex.note && <p className="workout-detail__exercise-note">{ex.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="workout-detail__section workout-detail__section--caution">
            <h3 className="workout-detail__section-title">Cuidados</h3>
            <ul className="workout-detail__precautions">
              {detail.precautions.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="modal__footer--sticky workout-detail__actions">
            <button
              type="button"
              className="btn btn--primary btn--start-workout"
              onClick={handleStart}
              disabled={detail.status === 'Realizado'}
            >
              Iniciar treino
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleAddToPlan}>
              Adicionar à planilha
            </button>
          </div>
        </div>
      </Modal>

      <ExerciseSubstitutionModal
        isOpen={substituteIndex != null}
        onClose={() => setSubstituteIndex(null)}
        currentExercise={
          substituteIndex != null
            ? workout?.exercises?.[substituteIndex] || detail.exercises[substituteIndex]
            : null
        }
        onSelect={handleSubstitute}
      />

      <ExerciseSubstitutionModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        mode="add"
        muscleGroupOptions={muscleOptions.length ? muscleOptions : ['Peitoral', 'Ombros', 'Tríceps']}
        defaultMuscleGroup={muscleOptions[0] || 'Peitoral'}
        excludeIds={(workout?.exercises || []).map((ex) => ex.exerciseId).filter(Boolean)}
        onSelect={handleAddExercise}
      />
    </>
  )
}
