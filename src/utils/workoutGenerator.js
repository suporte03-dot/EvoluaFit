import { exercises, parseSets, parseRestSeconds } from '../data/exercisesData'
import { splitTemplates, levelConfig, objectiveLabels } from '../data/workoutTemplates'

/** Aliases → categoria oficial do catálogo */
const CATEGORY_ALIASES = {
  Peito: 'Peitoral',
  Peitoral: 'Peitoral',
  Costas: 'Costas',
  Ombros: 'Ombros',
  Bíceps: 'Bíceps',
  Tríceps: 'Tríceps',
  Antebraço: 'Antebraço',
  Trapézio: 'Trapézio',
  Lombar: 'Lombar',
  Abdômen: 'Abdômen',
  Oblíquos: 'Abdômen',
  Core: 'Abdômen',
  Quadríceps: 'Pernas',
  Posterior: 'Pernas',
  Pernas: 'Pernas',
  Glúteos: 'Glúteos',
  Panturrilha: 'Panturrilha',
  Cardio: 'Cardio',
  Cardiovascular: 'Cardio',
  Mobilidade: 'Mobilidade',
  Alongamento: 'Alongamento',
  Funcional: 'Funcional',
  'Corpo inteiro': 'Funcional',
}

/** Cotas por tipo de treino (máximo desejado por grupo) */
const DAY_QUOTAS = {
  Push: { Peitoral: 2, Ombros: 2, Tríceps: 2 },
  Pull: { Costas: 3, Bíceps: 2, Trapézio: 1, Lombar: 1 },
  Legs: { Pernas: 2, Glúteos: 2, Panturrilha: 1, Abdômen: 1 },
  FullBody: {
    Peitoral: 1,
    Costas: 1,
    Pernas: 1,
    Glúteos: 1,
    Ombros: 1,
    Abdômen: 1,
  },
  Superiores: { Peitoral: 2, Costas: 2, Ombros: 1, Bíceps: 1, Tríceps: 1 },
  Inferiores: { Pernas: 2, Glúteos: 2, Panturrilha: 1, Abdômen: 1 },
  Core: { Abdômen: 3, Lombar: 2 },
  Cardio: { Cardio: 4 },
  Mobilidade: { Mobilidade: 3, Alongamento: 2 },
  HybridRecovery: { Abdômen: 2, Cardio: 2, Mobilidade: 2, Alongamento: 1 },
}

function normalizeCategory(label) {
  return CATEGORY_ALIASES[label] || label
}

function normalizeFocus(focus = []) {
  return [...new Set(focus.map(normalizeCategory))]
}

function inferDayType(name = '', focus = []) {
  const n = String(name).toLowerCase()
  if (/descanso|recuper/.test(n)) return 'Mobilidade'
  if (/core.*cardio|cardio.*mobil|core \+ cardio/.test(n)) return 'HybridRecovery'
  if (/push/.test(n)) return 'Push'
  if (/pull/.test(n)) return 'Pull'
  if (/legs|perna/.test(n)) return 'Legs'
  if (/superior/.test(n)) return 'Superiores'
  if (/inferior/.test(n)) return 'Inferiores'
  if (/core|abd/.test(n)) return 'Core'
  if (/cardio/.test(n)) return 'Cardio'
  if (/mobil|along/.test(n)) return 'Mobilidade'
  if (/full|corpo/.test(n)) return 'FullBody'

  const f = normalizeFocus(focus)
  if (f.includes('Cardio') && f.length <= 2) return 'Cardio'
  if (f.every((c) => ['Mobilidade', 'Alongamento'].includes(c))) return 'Mobilidade'
  if (f.includes('Peitoral') && f.includes('Tríceps')) return 'Push'
  if (f.includes('Costas') && f.includes('Bíceps')) return 'Pull'
  if (f.includes('Pernas') || f.includes('Glúteos')) return 'Legs'
  return 'FullBody'
}

function matchesEquipment(exercise, availableEquipment = []) {
  if (!availableEquipment.length || availableEquipment.includes('Todos')) return true
  if (availableEquipment.includes('Academia completa')) return true
  return availableEquipment.some(
    (eq) =>
      exercise.equipment === eq ||
      (eq === 'Casa' && ['Peso corporal', 'Halteres', 'Elástico', 'Colchonete'].includes(exercise.equipment)),
  )
}

function matchesLevel(exercise, level) {
  const levels = ['Iniciante', 'Intermediário', 'Avançado']
  const userIdx = levels.indexOf(level)
  const exIdx = levels.indexOf(exercise.level)
  if (userIdx < 0 || exIdx < 0) return true
  return exIdx <= userIdx + 1
}

function isRestricted(exercise, restrictions) {
  if (!restrictions.length || !exercise.restrictions?.length) return false
  return exercise.restrictions.some((r) => restrictions.includes(r))
}

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildPool(options) {
  const { level, equipment, restrictions, location } = options
  let pool = exercises.filter(
    (ex) =>
      matchesEquipment(ex, equipment) &&
      matchesLevel(ex, level) &&
      !isRestricted(ex, restrictions),
  )

  if (location === 'Casa' || location === 'Parque') {
    const homeEq = ['Peso corporal', 'Halteres', 'Elástico', 'Colchonete', 'Kettlebell']
    pool = pool.filter((ex) => homeEq.includes(ex.equipment) || ex.category === 'Cardio' || ex.category === 'Mobilidade' || ex.category === 'Alongamento')
  }

  return pool
}

function pickByQuotas(pool, quotas, maxExercises, usedIds, allowReuse = false) {
  const selected = []
  const counts = Object.fromEntries(Object.keys(quotas).map((k) => [k, 0]))
  const orderedGroups = Object.keys(quotas)

  for (const group of orderedGroups) {
    const quota = quotas[group]
    const candidates = shuffle(
      pool.filter(
        (ex) =>
          normalizeCategory(ex.category) === group &&
          (allowReuse || !usedIds.has(ex.id)) &&
          !selected.find((s) => s.id === ex.id),
      ),
    )
    for (const ex of candidates) {
      if (selected.length >= maxExercises) break
      if (counts[group] >= quota) break
      selected.push(ex)
      counts[group] += 1
      usedIds.add(ex.id)
    }
  }

  return selected
}

function fillRemaining(pool, selected, focusGroups, maxExercises, usedIds) {
  if (selected.length >= maxExercises) return selected

  const preferred = shuffle(
    pool.filter(
      (ex) =>
        focusGroups.includes(normalizeCategory(ex.category)) &&
        !selected.find((s) => s.id === ex.id),
    ),
  )

  for (const ex of preferred) {
    if (selected.length >= maxExercises) break
    selected.push(ex)
    usedIds.add(ex.id)
  }
  return selected
}

function emergencyFallback(focusGroups, maxExercises, usedIds) {
  const selected = []
  const byFocus = exercises.filter((ex) => focusGroups.includes(normalizeCategory(ex.category)))
  const any = exercises
  for (const ex of [...shuffle(byFocus), ...shuffle(any)]) {
    if (selected.length >= Math.max(3, maxExercises - 1)) break
    if (selected.find((s) => s.id === ex.id)) continue
    selected.push(ex)
    usedIds.add(ex.id)
  }
  return selected
}

/**
 * Seleciona exercícios para um dia com cotas por grupo.
 */
function buildScopedQuotas(dayType, focusGroups, maxExercises) {
  const base =
    DAY_QUOTAS[dayType] ||
    Object.fromEntries(focusGroups.map((g) => [g, Math.max(1, Math.ceil(maxExercises / Math.max(focusGroups.length, 1)))]))

  const scopedQuotas = {}
  for (const [group, quota] of Object.entries(base)) {
    if (focusGroups.includes(group) || focusGroups.length === 0) {
      scopedQuotas[group] = quota
    }
  }

  // Dias híbridos (ex.: Core + Cardio + Mobilidade): inclui grupos do foco faltantes
  const defaultShare = Math.max(1, Math.ceil(maxExercises / Math.max(focusGroups.length, 1)))
  for (const group of focusGroups) {
    if (!scopedQuotas[group]) scopedQuotas[group] = defaultShare
  }

  if (!Object.keys(scopedQuotas).length) {
    for (const group of focusGroups) scopedQuotas[group] = 2
  }
  return scopedQuotas
}

export function pickExercisesForDay(dayTemplate, options, usedIds = new Set()) {
  const focusGroups = normalizeFocus(dayTemplate.focus || [])
  const dayType = inferDayType(dayTemplate.name, focusGroups)
  const scopedQuotas = buildScopedQuotas(dayType, focusGroups, options.maxExercises)

  const pool = buildPool(options)
  let selected = pickByQuotas(pool, scopedQuotas, options.maxExercises, usedIds, false)

  if (selected.length < Math.min(4, options.maxExercises)) {
    // Segunda passagem: permite reutilizar exercicios raros sem misturar grupos
    const more = pickByQuotas(pool, scopedQuotas, options.maxExercises, usedIds, true)
    for (const ex of more) {
      if (selected.length >= options.maxExercises) break
      if (selected.find((s) => s.id === ex.id)) continue
      selected.push(ex)
      usedIds.add(ex.id)
    }
  }

  if (selected.length < Math.min(3, options.maxExercises)) {
    selected = fillRemaining(pool, selected, focusGroups, options.maxExercises, usedIds)
  }

  let usedFallback = false
  if (selected.length < 3) {
    usedFallback = true
    selected = emergencyFallback(focusGroups, options.maxExercises, usedIds)
  }

  return { selected, usedFallback, dayType, focusGroups }
}

const buildExerciseEntry = (exercise, level, objective) => {
  const config = levelConfig[level] || levelConfig['Intermediário']
  let sets = Math.round(parseSets(exercise.sets) * config.setsMultiplier)
  let reps = exercise.reps
  let rest = parseRestSeconds(exercise.rest) + config.restBonus

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
  } else if (objective === 'saude') {
    reps = exercise.reps || '10-12'
    rest = Math.max(60, rest)
  }

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: normalizeCategory(exercise.category),
    sets,
    reps,
    restSeconds: rest,
    load: '',
    completed: false,
    equipment: exercise.equipment,
    level: exercise.level,
  }
}

function getMaxExercises(level, duration, objective) {
  const config = levelConfig[level] || levelConfig['Iniciante']
  let max = config.maxExercises
  if (duration <= 30) max = Math.max(3, max - 2)
  else if (duration <= 40) max = Math.max(4, max - 1)
  else if (duration >= 70) max = Math.min(8, max + 1)

  if (objective === 'saude') max = Math.min(max, level === 'Iniciante' ? 5 : 6)
  if (level === 'Iniciante') max = Math.min(max, 5)
  if (level === 'Intermediário') max = Math.min(Math.max(max, 5), 7)
  if (level === 'Avançado') max = Math.min(Math.max(max, 6), 8)
  return max
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
  const days = Math.min(Math.max(Number(daysPerWeek) || 3, 2), 7)
  const template = splitTemplates[days] || splitTemplates[3]
  const normalizedRestrictions = []
  ;(restrictions || []).forEach((r) => {
    const key = String(r).toLowerCase()
    if (key.includes('joelho')) normalizedRestrictions.push('joelho')
    if (key.includes('lombar') || key.includes('costas')) normalizedRestrictions.push('lombar')
    if (key.includes('ombro')) normalizedRestrictions.push('ombro')
  })

  const maxExercises = getMaxExercises(level, duration, objective)
  const usedIds = new Set()
  let usedFallback = false

  const schedule = template.map((dayTemplate) => {
    const { selected, usedFallback: dayFallback, focusGroups } = pickExercisesForDay(
      dayTemplate,
      {
        level,
        equipment,
        restrictions: normalizedRestrictions,
        maxExercises: /descanso|mobil|cardio/i.test(dayTemplate.name)
          ? Math.min(4, maxExercises)
          : maxExercises,
        location,
      },
      usedIds,
    )
    if (dayFallback) usedFallback = true

    return {
      day: dayTemplate.day,
      name: dayTemplate.name,
      focus: focusGroups.length ? focusGroups : normalizeFocus(dayTemplate.focus),
      estimatedMinutes: duration,
      exercises: selected.map((ex) => buildExerciseEntry(ex, level, objective)),
    }
  })

  const safetyNotes = [
    'Aqueça 5–10 minutos antes de cada sessão.',
    'Priorize técnica sobre carga.',
    'Respeite sinais de fadiga e inclua recuperação adequada.',
    'Plano demonstrativo. Ajuste com um profissional de educação física conforme sua condição, objetivo e limitações.',
  ]

  if (normalizedRestrictions.includes('joelho')) {
    safetyNotes.push('Exercícios de alto impacto foram reduzidos por segurança do joelho.')
  }
  if (normalizedRestrictions.includes('lombar')) {
    safetyNotes.push('Movimentos com alta demanda lombar foram evitados ou controlados.')
  }
  if (normalizedRestrictions.includes('ombro')) {
    safetyNotes.push('Amplitude e cargas de ombro foram priorizadas com segurança.')
  }
  if (usedFallback) {
    safetyNotes.push('Alguns exercícios foram completados com sugestões alternativas.')
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
    usedFallback,
    safetyNotes,
    disclaimer:
      'Plano demonstrativo. Ajuste com um profissional de educação física conforme sua condição, objetivo e limitações.',
  }
}

export function planToWorkouts(plan) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date()
  const startDay = today.getDay() === 0 ? 1 : today.getDay()
  const spacing = Math.max(1, Math.floor(7 / Math.max(plan.daysPerWeek || plan.schedule.length, 1)))

  return plan.schedule.map((day, index) => {
    const targetDay = (startDay - 1 + index * spacing) % 7
    const workoutDate = new Date(today)
    let diff = (targetDay - today.getDay() + 7) % 7
    if (diff === 0 && index > 0) diff = 7
    workoutDate.setDate(today.getDate() + diff + Math.floor(index / 7) * 7)

    return {
      id: `workout-${plan.id}-${day.day}`,
      planId: plan.id,
      name: day.name,
      date: workoutDate.toISOString().split('T')[0],
      dayLabel: dayNames[workoutDate.getDay()],
      muscleGroups: day.focus,
      exercises: day.exercises.map((ex) => ({ ...ex })),
      status: 'Pendente',
      estimatedMinutes: day.estimatedMinutes,
      createdAt: new Date().toISOString(),
    }
  })
}
