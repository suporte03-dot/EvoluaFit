import { displayGoalLabel } from './profileIdentity'
import { isCompletedSession } from './completedSession'
import { resolveTodayWorkout } from './todayWorkout'

const LEVELS = ['Iniciante', 'Intermediário', 'Avançado']

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function resolveTrainingLevel({ profile, cloudProfile, generatedPlan, plans } = {}) {
  const planLevel = [generatedPlan?.level, plans?.[0]?.level].find((value) => LEVELS.includes(value)) || ''
  const profileLevel =
    [cloudProfile?.level, profile?.level].find((value) => LEVELS.includes(value)) || ''
  const level = planLevel || profileLevel || ''
  const mismatch = Boolean(planLevel && profileLevel && planLevel !== profileLevel)

  return {
    level,
    planLevel,
    profileLevel,
    mismatch,
    note: mismatch
      ? `Seu perfil está como ${profileLevel}. Esta rotina usa parâmetros de ${planLevel}.`
      : '',
  }
}

export function resolveTrainingGoal({ profile, cloudProfile, generatedPlan, plans, workout } = {}) {
  const planCode = generatedPlan?.objective || generatedPlan?.goal || plans?.[0]?.objective || ''
  const planLabel =
    generatedPlan?.objectiveLabel ||
    displayGoalLabel({
      objective: planCode || profile?.objective,
      cloudGoal: cloudProfile?.goal,
    })
  const workoutGoal = workout?.goal || workout?.objectiveLabel || ''
  const label = planLabel || workoutGoal || ''
  return {
    code: planCode || '',
    label,
  }
}

export function resolveCanonicalNextWorkout({
  workouts = [],
  history = [],
  plans = [],
  generatedPlan = null,
  pendingSession = null,
} = {}) {
  if (pendingSession?.workoutId) {
    const fromList = (workouts || []).find((item) => item.id === pendingSession.workoutId)
    return {
      workout: fromList || pendingSession.workout || null,
      situation: 'partial',
      source: 'session',
      nextWorkout: null,
    }
  }

  const today = resolveTodayWorkout({
    workouts,
    history,
    plans: plans?.length ? plans : generatedPlan ? [generatedPlan] : [],
  })

  return {
    ...today,
    source: 'plan',
  }
}

export function classifyWorkoutDay(dayOrWorkout = {}) {
  const name = String(
    dayOrWorkout.workoutName || dayOrWorkout.name || dayOrWorkout.workoutType || '',
  )
  const type = String(dayOrWorkout.workoutType || '')
  const hay = normalizeText(`${name} ${type}`)

  if (/descanso|recuper/.test(hay) && !/mobil|cardio|along/.test(hay)) {
    return { label: 'Descanso', tone: 'rest' }
  }
  if (/core.*cardio|cardio.*mobil|hybrid/.test(hay)) return { label: 'Core + Cardio', tone: 'core' }
  if (/legs.*leve|perna.*leve/.test(hay)) return { label: 'Pernas leve', tone: 'legs' }
  if (/push|empurr/.test(hay)) return { label: 'Empurrar', tone: 'push' }
  if (/pull|puxar/.test(hay)) return { label: 'Puxar', tone: 'pull' }
  if (/legs|perna|glute|quadr|posterior|panturr|inferior|lower/.test(hay)) {
    return { label: 'Pernas', tone: 'legs' }
  }
  if (/full|corpo/.test(hay)) return { label: 'Corpo todo', tone: 'full' }
  if (/superior|upper/.test(hay)) return { label: 'Superiores', tone: 'push' }
  if (/mobil|along|yoga/.test(hay)) return { label: 'Mobilidade', tone: 'mobility' }
  if (/cardio|hiit|corrida|esteira|aerob/.test(hay)) return { label: 'Cardio', tone: 'cardio' }
  if (/core|abdomen|abdominal/.test(hay)) return { label: 'Core', tone: 'core' }

  return { label: type || name.split('—')[0] || 'Treino', tone: 'full' }
}

export function displayWorkoutName(name = '') {
  return String(name || '')
    .replace(/^Push\b/i, 'Empurrar')
    .replace(/^Pull\b/i, 'Puxar')
    .replace(/^Legs\b/i, 'Pernas')
    .replace(/^Full body\b/i, 'Corpo todo')
    .replace(/^Upper\b/i, 'Superiores')
    .replace(/^Lower\b/i, 'Inferiores')
}

export function inferTrackingMode(exercise = {}) {
  const hay = normalizeText(
    [exercise.id, exercise.exerciseId, exercise.name, exercise.type, exercise.category, exercise.muscleGroup, exercise.reps]
      .filter(Boolean)
      .join(' '),
  )
  const reps = normalizeText(exercise.reps)

  if (/prancha|isometr|hold|segundos|s cada lado/.test(hay) || /segundos/.test(reps)) return 'time'
  if (
    /esteira|bicicleta-leve|bike ergom|cardio|aquecimento|desaquecimento|corrida|minutos/.test(hay) ||
    /minutos/.test(reps)
  ) {
    return 'duration'
  }
  if (/mobilidade|alongamento|yoga|gato.?vaca|rotacao toracica/.test(hay)) return 'time'
  return 'reps'
}

function looksLikeStrengthRepRange(reps) {
  return /^\d+\s*[-–]\s*\d+$/.test(String(reps || '').trim()) && !/s|min|seg/i.test(String(reps || ''))
}

export function displayExerciseReps(exercise = {}) {
  const mode = inferTrackingMode(exercise)
  const reps = exercise.reps || ''
  if (mode === 'time' && looksLikeStrengthRepRange(reps)) return '30-45s'
  if (mode === 'duration' && looksLikeStrengthRepRange(reps)) return '8-12 min'
  return reps
}

export function formatExercisePrescription(exercise = {}) {
  const mode = inferTrackingMode(exercise)
  const sets = Number(exercise.sets) || exercise.sets || 1
  const reps = displayExerciseReps(exercise)
  const setLabel = `${sets} ${Number(sets) === 1 ? 'série' : 'séries'}`

  if (!reps) return setLabel
  if (mode === 'time' || mode === 'duration') return `${setLabel} · ${reps}`
  if (/\d/.test(String(reps)) && !/min|seg|s\b|m\b/i.test(String(reps))) {
    return `${setLabel} · ${reps} reps`
  }
  return `${setLabel} · ${reps}`
}

export function isInternalClassification(value) {
  const normalized = normalizeText(value).trim()
  return !normalized || normalized === 'general' || normalized === 'geral' || normalized === 'other'
}

export function displayMovementRole(label) {
  if (isInternalClassification(label)) return ''
  if (String(label).trim() === 'Reto/geral') return 'Reto'
  return label
}

export function lastCompletedResult({ history = [], workouts = [] } = {}) {
  const fromHistory = (history || []).filter((item) => isCompletedSession(item))
  const fromWorkouts = (workouts || []).filter((item) => {
    const status = String(item.status || '').toLowerCase()
    return status === 'realizado' || status === 'completed' || status === 'done'
  })
  const pooled = [...fromHistory, ...fromWorkouts].sort((a, b) => {
    const da = new Date(a.completedAt || a.completed_at || a.date || 0).getTime()
    const db = new Date(b.completedAt || b.completed_at || b.date || 0).getTime()
    return db - da
  })
  const last = pooled[0]
  if (!last) return null

  const volume = last.totalVolume || last.total_volume || last.volume
  const sets = last.completedSets || last.completed_sets
  const name = last.name || last.workout_name || last.workoutName || 'Treino'
  return {
    name,
    date: last.completedAt || last.completed_at || last.date || null,
    volume: Number(volume) || null,
    sets: Number(sets) || null,
    durationMinutes:
      last.durationMinutes ||
      (last.duration_seconds ? Math.round(Number(last.duration_seconds) / 60) : last.estimatedMinutes) ||
      null,
  }
}

export function scoreUnlockProgress({ history = [], workouts = [] } = {}, needed = 3) {
  const seen = new Set()
  let count = 0
  ;(history || []).forEach((item) => {
    if (!isCompletedSession(item)) return
    count += 1
    if (item.workoutId) seen.add(item.workoutId)
  })
  ;(workouts || []).forEach((item) => {
    const status = String(item.status || '').toLowerCase()
    if (status !== 'realizado' && status !== 'completed' && status !== 'done') return
    if (item.id && seen.has(item.id)) return
    count += 1
  })
  return {
    needed,
    count,
    remaining: Math.max(0, needed - count),
    ready: count >= needed,
  }
}
