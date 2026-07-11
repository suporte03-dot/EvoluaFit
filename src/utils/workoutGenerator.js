import { exercises } from '../data/exercisesData'
import { splitTemplates, levelConfig, objectiveLabels } from '../data/workoutTemplates'

const restrictionMap = {
  joelho: ['joelho'],
  lombar: ['lombar'],
  ombro: ['ombro'],
}

const normalizeRestrictions = (restrictions = []) => {
  if (!restrictions.length) return []
  return restrictions.map((r) => r.toLowerCase().replace(/\s+/g, ''))
}

const matchesEquipment = (exercise, availableEquipment = []) => {
  if (!availableEquipment.length || availableEquipment.includes('Todos')) return true
  return availableEquipment.some(
    (eq) =>
      exercise.equipment === eq ||
      (eq === 'Academia completa' && exercise.equipment !== 'Elástico') ||
      (eq === 'Casa' && ['Peso corporal', 'Halteres', 'Elástico'].includes(exercise.equipment)),
  )
}

const matchesLevel = (exercise, level) => {
  const levels = ['Iniciante', 'Intermediário', 'Avançado']
  const userIdx = levels.indexOf(level)
  const exIdx = levels.indexOf(exercise.level)
  return exIdx <= userIdx + 1
}

const isRestricted = (exercise, restrictions) => {
  if (!restrictions.length || !exercise.restrictions) return false
  return exercise.restrictions.some((r) => restrictions.includes(r))
}

const pickExercisesForDay = (focus, options) => {
  const { level, equipment, restrictions, maxExercises, location } = options

  let pool = exercises.filter(
    (ex) =>
      (focus.includes(ex.muscleGroup) || focus.includes('Corpo inteiro')) &&
      matchesEquipment(ex, equipment) &&
      matchesLevel(ex, level) &&
      !isRestricted(ex, restrictions),
  )

  if (location === 'Casa') {
    pool = pool.filter((ex) =>
      ['Peso corporal', 'Halteres', 'Elástico'].includes(ex.equipment),
    )
  }

  const selected = []
  const usedGroups = new Set()

  for (const ex of pool) {
    if (selected.length >= maxExercises) break
    if (!usedGroups.has(ex.muscleGroup) || focus.length <= 2) {
      selected.push(ex)
      usedGroups.add(ex.muscleGroup)
    }
  }

  if (selected.length < 3) {
    for (const ex of pool) {
      if (selected.length >= maxExercises) break
      if (!selected.find((s) => s.id === ex.id)) selected.push(ex)
    }
  }

  return selected
}

const buildExerciseEntry = (exercise, level, objective) => {
  const config = levelConfig[level] || levelConfig['Intermediário']
  let sets = Math.round(exercise.defaultSets * config.setsMultiplier)
  let reps = exercise.defaultReps
  let rest = exercise.restSeconds + config.restBonus

  if (objective === 'emagrecimento') {
    reps = '12-15'
    rest = Math.max(45, rest - 15)
  } else if (objective === 'forca') {
    reps = '4-6'
    rest = rest + 30
    sets = Math.min(sets + 1, 5)
  } else if (objective === 'condicionamento') {
    reps = '15-20'
    rest = 45
  }

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets,
    reps,
    restSeconds: rest,
    load: '',
    completed: false,
  }
}

export function generateWorkoutPlan({
  objective = 'saude',
  level = 'Iniciante',
  daysPerWeek = 3,
  duration = 45,
  location = 'Academia',
  equipment = ['Academia completa'],
  restrictions = [],
}) {
  const days = Math.min(Math.max(daysPerWeek, 2), 6)
  const template = splitTemplates[days] || splitTemplates[3]
  const config = levelConfig[level] || levelConfig['Iniciante']
  const normalizedRestrictions = normalizeRestrictions(restrictions)

  const restrictionKeys = []
  normalizedRestrictions.forEach((r) => {
    if (r.includes('joelho')) restrictionKeys.push('joelho')
    if (r.includes('lombar') || r.includes('costas')) restrictionKeys.push('lombar')
    if (r.includes('ombro')) restrictionKeys.push('ombro')
  })

  const maxExercises = duration <= 30 ? config.maxExercises - 1 : config.maxExercises

  const schedule = template.map((dayTemplate) => {
    const dayExercises = pickExercisesForDay(dayTemplate.focus, {
      level,
      equipment,
      restrictions: restrictionKeys,
      maxExercises,
      location,
    }).map((ex) => buildExerciseEntry(ex, level, objective))

    return {
      day: dayTemplate.day,
      name: dayTemplate.name,
      focus: dayTemplate.focus,
      estimatedMinutes: duration,
      exercises: dayExercises,
    }
  })

  const safetyNotes = [
    'Aqueça 5-10 minutos antes de cada sessão.',
    'Priorize técnica sobre carga.',
    'Descanse pelo menos 1 dia entre treinos do mesmo grupo muscular.',
  ]

  if (restrictionKeys.includes('joelho')) {
    safetyNotes.push('Exercícios de alto impacto foram substituídos por alternativas de menor stress no joelho.')
  }
  if (restrictionKeys.includes('lombar')) {
    safetyNotes.push('Movimentos com flexão excessiva de coluna foram evitados.')
  }
  if (restrictionKeys.includes('ombro')) {
    safetyNotes.push('Amplitude reduzida em exercícios de ombro para maior segurança.')
  }

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    objective,
    objectiveLabel: objectiveLabels[objective] || objective,
    level,
    daysPerWeek: days,
    duration,
    location,
    equipment,
    restrictions,
    schedule,
    safetyNotes,
    disclaimer:
      'Plano demonstrativo. Ajuste com um profissional de educação física antes de iniciar.',
  }
}

export function planToWorkouts(plan) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date()
  const startDay = today.getDay() === 0 ? 1 : today.getDay()

  return plan.schedule.map((day, index) => {
    const targetDay = ((startDay - 1 + index * Math.floor(7 / plan.daysPerWeek)) % 7)
    const workoutDate = new Date(today)
    const diff = (targetDay - today.getDay() + 7) % 7
    workoutDate.setDate(today.getDate() + (diff === 0 && index > 0 ? 7 : diff))

    return {
      id: `workout-${plan.id}-${day.day}`,
      planId: plan.id,
      name: day.name,
      date: workoutDate.toISOString().split('T')[0],
      dayLabel: dayNames[targetDay],
      muscleGroups: day.focus,
      exercises: day.exercises.map((ex) => ({ ...ex })),
      status: 'Pendente',
      estimatedMinutes: day.estimatedMinutes,
      createdAt: new Date().toISOString(),
    }
  })
}
