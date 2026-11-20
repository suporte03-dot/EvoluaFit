/**
 * Fonte única de verdade para o dia da semana da planilha.
 * Dia 1 = Segunda … Dia 7 = Domingo (ordinal do plano, não o calendário civil).
 * A data real (`workout.date`) continua existindo para agenda/histórico.
 */

export const PLAN_WEEKDAYS_LONG = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

export const PLAN_WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function dayIndex(dayNumber) {
  const n = Number(dayNumber)
  if (!Number.isFinite(n) || n < 1) return 0
  return Math.max(0, (Math.floor(n) - 1) % 7)
}

/** Rótulo longo: "Segunda-feira". */
export function planWeekdayLong(dayNumber) {
  return PLAN_WEEKDAYS_LONG[dayIndex(dayNumber)]
}

/** Rótulo curto: "Seg". */
export function planWeekdayShort(dayNumber) {
  return PLAN_WEEKDAYS_SHORT[dayIndex(dayNumber)]
}

/**
 * Resolve o número do dia do plano a partir de um treino ou dia gerado.
 */
export function resolvePlanDayNumber(workoutOrDay, fallbackIndex = 0) {
  const raw =
    workoutOrDay?.dayNumber ??
    workoutOrDay?.day ??
    (fallbackIndex >= 0 ? fallbackIndex + 1 : 1)
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? n : fallbackIndex + 1
}

/** Preferir dayLabel ordinal; se só houver número, calcular. */
export function displayPlanWeekday(workoutOrDay, { short = false } = {}) {
  const dayNumber = resolvePlanDayNumber(workoutOrDay)
  return short ? planWeekdayShort(dayNumber) : planWeekdayLong(dayNumber)
}
