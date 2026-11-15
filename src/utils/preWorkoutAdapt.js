import { adjustDayWorkout } from './dayAdjust.js'

/**
 * Aplica o check-in pré-treino ao treino da sessão.
 * check: { sleep: 'poor'|'ok'|'good', energy: 'low'|'ok'|'high', pain, painGroup, minutes }
 * `minutes` vazio/0 = tempo normal. Não altera `estimatedMinutes` salvo.
 */
export function adaptWorkoutForCheck(workout, check = {}, ctx = {}) {
  if (!workout) return workout
  const result = adjustDayWorkout(workout, check, ctx)
  return {
    ...result.workout,
    estimatedMinutes: workout.estimatedMinutes,
    preWorkoutCheck: check,
    sessionAdjustSummary: result.summary,
  }
}
