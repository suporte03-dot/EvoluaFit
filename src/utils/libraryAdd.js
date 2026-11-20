import { parseRestSeconds, parseSets } from '../data/exercisesData.js'
import { displayWorkoutName } from './workoutLabels.js'

function isPendingStatus(status) {
  const s = String(status || '').toLowerCase()
  return (
    s === 'pendente' ||
    s === 'parcial' ||
    s === 'planejado' ||
    s === 'planned' ||
    s === 'pending' ||
    s === 'partial' ||
    s === 'em andamento' ||
    s === 'in_progress'
  )
}

function isRestWorkout(w) {
  if (w?.isRest) return true
  const name = String(w?.name || w?.workoutType || '').toLowerCase()
  return /descanso|recuper/.test(name)
}

function toDateKey(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function todayWorkoutId(workouts = []) {
  const today = toDateKey(new Date())
  const hit = (workouts || []).find(
    (w) => isEligibleAddTarget(w) && toDateKey(w.date) === today,
  )
  return hit?.id || null
}

/** Treinos em que faz sentido incluir um exercício da Biblioteca. */
export function isEligibleAddTarget(workout) {
  if (!workout || isRestWorkout(workout)) return false
  return isPendingStatus(workout.status)
}

/**
 * Ordena destinos: treino de hoje → rotina ativa (planId) → demais pendentes.
 * @returns {object[]}
 */
export function listEligibleAddTargets(
  workouts = [],
  { generatedPlan = null } = {},
) {
  const eligible = (workouts || []).filter(isEligibleAddTarget)
  if (!eligible.length) return []

  const todayId = todayWorkoutId(eligible)
  const planId = generatedPlan?.id

  return [...eligible].sort((a, b) => {
    const score = (w) => {
      let s = 0
      if (todayId && w.id === todayId) s += 100
      if (planId && w.planId === planId) s += 40
      if (w.date) s += 5
      return s
    }
    const diff = score(b) - score(a)
    if (diff !== 0) return diff
    return String(a.date || '').localeCompare(String(b.date || ''))
  })
}

export function createLibraryAppendId() {
  return `lib-add-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Entrada de exercício com token único para desfazer só esta inclusão. */
export function buildLibraryExerciseEntry(exercise, { appendId } = {}) {
  if (!exercise) return null
  const id = appendId || createLibraryAppendId()
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.category || exercise.muscleGroup,
    sets: parseSets(exercise.sets),
    reps: exercise.reps,
    restSeconds: parseRestSeconds(exercise.rest),
    load: '',
    libraryAppendId: id,
  }
}

export function appendLibraryExercise(workout, entry) {
  if (!workout || !entry) return workout
  return {
    ...workout,
    exercises: [...(workout.exercises || []), entry],
    muscleGroups: [...new Set([...(workout.muscleGroups || []), entry.muscleGroup].filter(Boolean))],
  }
}

/** Remove exatamente a inclusão marcada por `libraryAppendId`. */
export function removeLibraryAppend(workout, appendId) {
  if (!workout || !appendId) return { workout, removed: false }
  const exercises = workout.exercises || []
  const idx = exercises.findIndex((ex) => ex?.libraryAppendId === appendId)
  if (idx < 0) return { workout, removed: false }
  const next = exercises.slice()
  next.splice(idx, 1)
  return {
    workout: {
      ...workout,
      exercises: next,
      muscleGroups: [...new Set(next.map((ex) => ex.muscleGroup).filter(Boolean))],
    },
    removed: true,
  }
}

export function targetLabel(workout) {
  return displayWorkoutName(workout?.name) || 'Treino'
}

/**
 * Atualiza o dia correspondente no plano gerado para espelhar os exercícios da rotina.
 */
export function syncPlanDayExercises(plans = [], workout) {
  if (!workout?.planId || workout.dayNumber == null) return plans
  const dayNumber = Number(workout.dayNumber)
  return (plans || []).map((plan) => {
    if (plan.id !== workout.planId) return plan
    const key = plan.weeklyPlan ? 'weeklyPlan' : plan.schedule ? 'schedule' : null
    if (!key) return plan
    const days = plan[key] || []
    return {
      ...plan,
      [key]: days.map((day) => {
        const dayNum = Number(day.day ?? day.dayNumber)
        if (dayNum !== dayNumber) return day
        return {
          ...day,
          exercises: (workout.exercises || []).map((ex) => ({ ...ex })),
          muscleGroups: workout.muscleGroups || day.muscleGroups || day.focus,
          estimatedMinutes: workout.estimatedMinutes ?? day.estimatedMinutes,
        }
      }),
    }
  })
}

/** Encontra treino salvo da rotina que corresponde a um dia do plano gerado. */
export function findActiveWorkoutForPlanDay(workouts = [], plan, day) {
  if (!plan?.id || !day) return null
  const dayNumber = Number(day.day ?? day.dayNumber)
  const name = day.workoutName || day.name
  return (
    (workouts || []).find(
      (w) => w.planId === plan.id && Number(w.dayNumber ?? w.day) === dayNumber,
    ) ||
    (workouts || []).find(
      (w) => w.planId === plan.id && String(w.name || '') === String(name || ''),
    ) ||
    null
  )
}
