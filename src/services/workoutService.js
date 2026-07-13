import storageService from './storageService'

/**
 * Workout persistence layer — localStorage now (evoluafit-data key via storageService).
 *
 * Future Supabase integration:
 * - `workout_history` table for session summaries
 * - `workout_sets` table for per-set load/reps/rest (one row per completed set)
 *   columns: id, user_id, history_id, exercise_id, set_number, load, reps, rest_seconds, completed_at
 */

export function buildHistoryEntry(workoutId, sessionData) {
  return {
    id: `hist-${Date.now()}`,
    workoutId,
    name: sessionData.name,
    completedAt: new Date().toISOString(),
    durationMinutes: sessionData.durationMinutes,
    exercises: sessionData.exercises,
    notes: sessionData.notes || '',
  }
}

/**
 * Saves workout history entry to localStorage.
 * @returns {object} The saved history entry
 */
export function saveWorkoutHistory(workoutId, sessionData) {
  const entry = buildHistoryEntry(workoutId, sessionData)
  storageService.addHistoryEntry(entry)

  // Future: await supabase.from('workout_history').insert({ ...entry, user_id })
  // Future: flatten sessionData.exercises setsLog into workout_sets rows

  return entry
}

/**
 * Updates workout status in localStorage after session completion.
 */
export function markWorkoutCompleted(workoutId, sessionData) {
  const workouts = storageService.getWorkouts()
  const updated = workouts.map((w) =>
    w.id === workoutId
      ? {
          ...w,
          status: 'Realizado',
          completedAt: new Date().toISOString(),
          exercises: sessionData.exercises,
        }
      : w,
  )
  storageService.setWorkouts(updated)
  return updated
}
