import { isCompletedSession } from './completedSession.js'
import { displayWorkoutName } from './workoutLabels.js'

export const WEEK_PLAN_WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/** Chave YYYY-MM-DD no fuso local (toISOString usa UTC e vira o dia após 21h em UTC-3). */
export function localDateKey(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function mondayOf(ref = new Date()) {
  const d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  const weekday = d.getDay()
  d.setDate(d.getDate() + (weekday === 0 ? -6 : 1 - weekday))
  return d
}

function isDoneStatus(status) {
  const s = String(status || '').toLowerCase()
  return s === 'realizado' || s === 'completed' || s === 'done' || s === 'parcial' || s === 'partial'
}

function isRestEntry(entry) {
  return Boolean(entry?.isRest) || String(entry?.status || '').toLowerCase() === 'descanso'
}

/**
 * Dias da semana corrente (seg–dom) para o card "Sua semana".
 * Um dia só fica "Não realizado" se havia treino agendado, já passou, não foi feito
 * e é posterior ao início do plano.
 */
export function buildWeekPlanDays({ generatedPlan, workouts = [], history = [], today, now = new Date() } = {}) {
  const monday = mondayOf(now)
  const todayKey = localDateKey(now)
  const planStart = generatedPlan?.startDate ? localDateKey(generatedPlan.startDate) : ''
  const planDays = generatedPlan?.weeklyPlan || generatedPlan?.schedule || []

  const doneByKey = new Map()
  for (const session of history || []) {
    if (!isCompletedSession(session)) continue
    const key = localDateKey(session.completedAt || session.completed_at || session.date)
    if (key && !doneByKey.has(key)) doneByKey.set(key, session)
  }

  return WEEK_PLAN_WEEKDAYS.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const key = localDateKey(date)
    const dayEntries = (workouts || []).filter((w) => localDateKey(w?.date) === key)
    const scheduled = dayEntries.find((w) => !isRestEntry(w)) || null
    const session = doneByKey.get(key) || null
    const beforePlan = Boolean(planStart) && key < planStart
    const planDay = !scheduled && !beforePlan && key >= todayKey ? planDays[index] || null : null

    const item = scheduled || session || planDay
    const rawName = scheduled?.name || session?.name || planDay?.workoutName || planDay?.name || ''
    const name = displayWorkoutName(rawName)
    const done = isDoneStatus(scheduled?.status) || Boolean(session)
    const isToday = key === todayKey
    const rest = !name && !done
    const missed = !done && Boolean(scheduled) && !beforePlan && key < todayKey
    const isNext = Boolean(
      !done &&
        !missed &&
        !rest &&
        today?.workout &&
        (today.workout.id === scheduled?.id || today.workout.name === rawName) &&
        ['ready', 'partial', 'returning', 'no_workout_today'].includes(today.situation),
    )

    let state = 'Aberto'
    if (rest) state = 'Folga'
    else if (done) state = 'Feito'
    else if (isToday) state = 'Hoje'
    else if (missed) state = 'Não realizado'
    else if (key < todayKey) state = '—'
    else if (isNext) state = 'Próximo'

    return { label, key, name, item, done, isToday, isNext, missed, rest, state }
  })
}

/** "Faltam 3 dias de treino nesta semana. Hoje: Empurrar — Peito e Tríceps" */
export function weekSummaryLine(days = []) {
  const todayDay = days.find((d) => d.isToday)
  const remaining = days.filter(
    (d) => !d.rest && !d.done && !d.missed && todayDay && d.key >= todayDay.key,
  ).length
  const anyDone = days.some((d) => d.done)

  let first
  if (remaining === 1) first = 'Falta 1 dia de treino nesta semana.'
  else if (remaining > 1) first = `Faltam ${remaining} dias de treino nesta semana.`
  else if (anyDone) first = 'Treinos da semana concluídos.'
  else first = 'Nenhum treino restante nesta semana.'

  let todayLabel = 'descanso'
  if (todayDay && !todayDay.rest) todayLabel = todayDay.done ? `${todayDay.name || 'treino'} (feito)` : todayDay.name
  return { remaining, text: first, today: todayLabel }
}
