import { getExerciseById } from '../data/exercisesData'

export function enrichExerciseMedia(exercise) {
  const full = exercise?.exerciseId ? getExerciseById(exercise.exerciseId) : null
  if (!full) return exercise
  return {
    ...full,
    ...exercise,
    muscleGroup: exercise.muscleGroup || full.category,
    sets: exercise.sets ?? full.sets,
    reps: exercise.reps ?? full.reps,
    restSeconds: exercise.restSeconds ?? 60,
  }
}

export function createSessionExercises(workout) {
  return (workout?.exercises || []).map((ex) => {
    const enriched = enrichExerciseMedia(ex)
    return {
      ...enriched,
      exerciseId: enriched.exerciseId || enriched.id,
      completedSets: 0,
      setsLog: [],
      notes: '',
    }
  })
}

export function getTargetSets(exercise) {
  const sets = exercise?.sets
  return typeof sets === 'number' ? sets : parseInt(String(sets), 10) || 3
}

export function isExerciseComplete(exercise) {
  return (exercise.setsLog?.length || 0) >= getTargetSets(exercise)
}

export function isWorkoutComplete(sessionExercises) {
  if (!sessionExercises?.length) return false
  return sessionExercises.every(isExerciseComplete)
}

export function getExerciseProgressLabel(exerciseIndex, totalExercises) {
  return `Exercício ${exerciseIndex + 1} de ${totalExercises}`
}

export function getSetProgressLabel(completedSets, targetSets) {
  return `Série ${Math.min(completedSets + 1, targetSets)} de ${targetSets}`
}

export function buildCompletionPayload(workout, sessionExercises, startTime, sessionNotes, pausedMs = 0) {
  const durationMinutes = Math.max(Math.round((Date.now() - startTime - pausedMs) / 60000), 1)

  return {
    name: workout.name,
    durationMinutes,
    notes: sessionNotes,
    exercises: sessionExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      completedSets: ex.setsLog?.length || 0,
      reps: ex.reps,
      load: ex.setsLog?.length ? ex.setsLog[ex.setsLog.length - 1].load : ex.load || '',
      setsLog: ex.setsLog,
      notes: ex.notes,
    })),
  }
}

export function inferWorkoutType(workout) {
  const groups = workout?.muscleGroups || []
  if (groups.some((g) => ['Peito', 'Ombros', 'Tríceps'].includes(g))) return 'Push'
  if (groups.some((g) => ['Costas', 'Bíceps'].includes(g))) return 'Pull'
  if (groups.some((g) => ['Quadríceps', 'Posterior', 'Glúteos', 'Pernas'].includes(g))) return 'Legs'
  return workout?.type || 'Treino'
}
