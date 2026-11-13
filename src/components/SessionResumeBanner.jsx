import { useFitness } from '../context/FitnessContext'
import { useWorkoutSession } from '../context/WorkoutSessionContext'

export default function SessionResumeBanner() {
  const { pendingSession, activeWorkout, resumePendingSession, discardPendingSession, startWorkout } =
    useFitness()
  const { activeSession, cancelSession, conflictSession } = useWorkoutSession()

  if (activeWorkout || conflictSession) return null

  const hasLocal = Boolean(pendingSession?.workoutId)
  const hasRemote = Boolean(activeSession?.id)

  if (!hasLocal && !hasRemote) return null

  const name =
    pendingSession?.workoutName ||
    activeSession?.workout_name ||
    'Treino em andamento'

  const setsDone = (pendingSession?.sessionExercises || []).reduce(
    (sum, ex) => sum + (ex.completedSets || 0),
    0,
  )

  const handleContinue = () => {
    if (hasLocal) {
      resumePendingSession()
      return
    }
    const snap = activeSession?.workout_snapshot
    if (!snap) return
    startWorkout({
      id: snap.id,
      name: snap.name || activeSession.workout_name || 'Treino',
      exercises: snap.exercises || [],
      muscleGroups: snap.muscleGroups || [],
      planId: snap.planId,
      dayNumber: snap.dayNumber,
      estimatedMinutes: snap.estimatedMinutes,
      workoutType: snap.workoutType,
      status: 'Parcial',
    })
  }

  const handleDiscard = async () => {
    if (hasRemote && activeSession?.id) {
      await cancelSession(activeSession.id)
    }
    if (hasLocal) discardPendingSession()
  }

  return (
    <div className="session-resume-banner" role="status">
      <div className="session-resume-banner__copy">
        <p className="session-resume-banner__eyebrow">
          {hasRemote ? 'Sessão ativa na nuvem' : 'Sessão salva neste aparelho'}
        </p>
        <p className="session-resume-banner__title">
          Continuar: <strong>{name}</strong>
          {setsDone > 0
            ? ` · ${setsDone} série${setsDone === 1 ? '' : 's'} feitas`
            : ''}
        </p>
      </div>
      <div className="session-resume-banner__actions">
        <button type="button" className="btn btn--primary btn--sm" onClick={handleContinue}>
          Continuar
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleDiscard}>
          {hasRemote ? 'Cancelar treino' : 'Descartar'}
        </button>
      </div>
    </div>
  )
}