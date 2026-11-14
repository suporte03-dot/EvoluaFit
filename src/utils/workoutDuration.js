import { estimateWorkoutMinutes } from './prescription/time.js'

const DONE = /realizado|parcial|completed|done|partial|conclu/i

/**
 * Minutos exibidos de um treino.
 * Treino já feito: duração registrada na sessão. Senão: recalculado pelo motor
 * a partir das séries e descansos (não usa a duração escolhida no perfil).
 */
export function workoutDisplayMinutes(workout, fallback = null) {
  if (!workout) return fallback
  const done = DONE.test(String(workout.status || '')) && workout.completedAt
  if (done && Number(workout.estimatedMinutes) > 0) return Number(workout.estimatedMinutes)
  const exercises = workout.exercises || []
  if (exercises.length) return estimateWorkoutMinutes(exercises)
  const stored = Number(workout.estimatedMinutes ?? workout.estimatedDuration ?? workout.durationMinutes)
  return stored > 0 ? stored : fallback
}
