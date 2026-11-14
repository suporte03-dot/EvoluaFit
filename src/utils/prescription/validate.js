/**
 * Valida e corrige treinos/planilhas contra as regras do motor.
 * Nunca altera a entrada: devolve uma cópia corrigida + explicações.
 */
import { KINDS, KIND_LABELS } from './classify.js'
import {
  CALF_REP_LIMITS,
  CORE_REPS,
  CORE_SECONDS,
  RULES_VERSION,
  formatRepRange,
  normalizeGoal,
  normalizeLevel,
  repRange,
  restRule,
  roundRest,
  setsRange,
} from './rules.js'
import { entryKind } from './entry.js'
import { estimateWorkoutMinutes, fitToDuration, parseRepRange, parseRestValue, parseSetCount } from './time.js'
import { checkWeeklyVolume, deriveWorkoutTags } from './volume.js'
import { isTimedCore } from './prescribe.js'

const GOAL_LABELS = {
  forca: 'força',
  hipertrofia: 'hipertrofia',
  saude: 'saúde geral',
  condicionamento: 'condicionamento',
  emagrecimento: 'emagrecimento',
  mobilidade: 'mobilidade',
}

function within(parsed, [lo, hi]) {
  return parsed && parsed.lo >= lo && parsed.hi <= hi
}

function checkReps(ex, kind, principal, goal) {
  if (kind === KINDS.cardio || kind === KINDS.mobilidade) return null
  const parsed = parseRepRange(ex.reps)
  if (kind === KINDS.core) {
    if (parsed?.unit === 's' && within(parsed, CORE_SECONDS)) return null
    if (parsed?.unit === 'reps' && within(parsed, CORE_REPS)) return null
    const to = isTimedCore(ex) ? '30-45s' : formatRepRange(CORE_REPS)
    return { to, reason: 'Core: 20-45 s por série ou 10-15 repetições.' }
  }
  if (kind === KINDS.panturrilha) {
    if (parsed?.unit === 'reps' && within(parsed, CALF_REP_LIMITS)) return null
    return { to: formatRepRange(repRange(kind, principal, goal)), reason: 'Panturrilha: 8-15 repetições.' }
  }
  const range = repRange(kind, principal, goal)
  if (parsed?.unit === 'reps' && within(parsed, range)) return null
  const label = principal ? 'composto principal' : KIND_LABELS[kind].toLowerCase()
  return {
    to: formatRepRange(range),
    reason: `${label[0].toUpperCase()}${label.slice(1)} em ${GOAL_LABELS[goal] || goal}: ${formatRepRange(range)} repetições.`,
  }
}

function checkRest(ex, kind, principal, goal) {
  const rule = restRule(kind, principal, goal)
  const current = parseRestValue(ex)
  const [lo, hi] = rule.range
  if (current % 15 === 0 && current >= lo && current <= hi) return null
  const to = roundRest(rule.value)
  return {
    to,
    reason:
      current % 15 !== 0
        ? `Descanso ajustado para degraus de 15 s (${to} s).`
        : `Descanso fora da faixa (${lo}-${hi} s) para ${KIND_LABELS[kind].toLowerCase()}.`,
  }
}

function checkSets(ex, kind, principal, level) {
  const [lo, hi] = setsRange(kind, principal, level)
  const current = parseSetCount(ex.sets)
  if (current >= lo && current <= hi) return null
  const to = Math.min(hi, Math.max(lo, current))
  return {
    to,
    reason:
      current > hi
        ? `${KIND_LABELS[kind]}: no máximo ${hi} séries por exercício.`
        : `${KIND_LABELS[kind]}: pelo menos ${lo} séries por exercício.`,
  }
}

/** Uma correção por exercício × campo; exercício removido leva só a remoção. */
function mergeCorrections(list) {
  const removed = new Set(list.filter((c) => c.field === 'exercise').map((c) => c.exerciseId || c.name))
  const merged = new Map()
  for (const c of list) {
    const subject = c.exerciseId || c.name || '_'
    if (c.field !== 'exercise' && removed.has(subject)) continue
    const key = `${subject}|${c.field}`
    const prev = merged.get(key)
    if (!prev) {
      merged.set(key, { ...c })
      continue
    }
    prev.to = c.to
    if (!prev.reason.includes(c.reason)) prev.reason = `${prev.reason} ${c.reason}`
  }
  return [...merged.values()].filter((c) => c.field === 'exercise' || String(c.from) !== String(c.to))
}

/**
 * @param {object} workout — { exercises, muscleGroups?, focus? }
 * @param {{ goal?: string, level?: string, minutes?: number, day?: string|number }} ctx
 */
export function validateWorkout(workout = {}, ctx = {}) {
  const goal = normalizeGoal(ctx.goal)
  const level = normalizeLevel(ctx.level)
  const day = ctx.day ?? workout.workoutName ?? workout.name ?? null
  const corrections = []
  const warnings = []
  const original = workout.exercises || []
  const minutesBefore = estimateWorkoutMinutes(original)

  let exercises = original.map((ex) => {
    const { kind, principal } = entryKind(ex)
    const next = { ...ex }
    const reps = checkReps(ex, kind, principal, goal)
    if (reps) {
      corrections.push({ day, exerciseId: ex.exerciseId, name: ex.name, field: 'reps', from: ex.reps, to: reps.to, reason: reps.reason })
      next.reps = reps.to
    }
    const rest = checkRest(ex, kind, principal, goal)
    if (rest) {
      corrections.push({
        day,
        exerciseId: ex.exerciseId,
        name: ex.name,
        field: 'rest',
        from: parseRestValue(ex),
        to: rest.to,
        reason: rest.reason,
      })
      next.rest = rest.to
      next.restSeconds = rest.to
    }
    const sets = checkSets(ex, kind, principal, level)
    if (sets) {
      corrections.push({
        day,
        exerciseId: ex.exerciseId,
        name: ex.name,
        field: 'sets',
        from: parseSetCount(ex.sets),
        to: sets.to,
        reason: sets.reason,
      })
      next.sets = sets.to
    }
    return next
  })

  if (Number(ctx.minutes) > 0) {
    const fitted = fitToDuration(exercises, ctx.minutes)
    for (const change of fitted.changes) {
      corrections.push({
        day,
        exerciseId: change.exerciseId,
        name: change.name,
        field: change.type === 'remove' ? 'exercise' : 'sets',
        from: change.from,
        to: change.to,
        reason: change.reason,
      })
    }
    exercises = fitted.exercises
  }

  const currentTags = workout.muscleGroups || workout.focus || []
  const tags = deriveWorkoutTags(exercises)
  const extraTags = currentTags.filter((tag) => !tags.includes(tag))
  if (extraTags.length && exercises.length) {
    corrections.push({
      day,
      exerciseId: null,
      name: null,
      field: 'muscleGroups',
      from: currentTags.join(', '),
      to: tags.join(', '),
      reason: `Etiqueta sem exercício correspondente removida: ${extraTags.join(', ')}.`,
    })
  }

  const minutesAfter = estimateWorkoutMinutes(exercises)
  const corrected = {
    ...workout,
    exercises,
    ...(exercises.length ? { muscleGroups: tags } : {}),
    ...('focus' in workout && exercises.length ? { focus: tags } : {}),
    ...('estimatedDuration' in workout ? { estimatedDuration: minutesAfter } : {}),
    estimatedMinutes: minutesAfter,
  }

  if (Number(ctx.minutes) > 0 && minutesAfter > Math.floor(ctx.minutes * 1.1)) {
    warnings.push(`O composto principal sozinho já passa de ${ctx.minutes} min.`)
  }

  const merged = mergeCorrections(corrections)
  return {
    valid: merged.length === 0,
    workout: corrected,
    corrections: merged,
    warnings,
    minutesBefore,
    minutesAfter,
  }
}

export function planContext(plan = {}) {
  return {
    goal: plan.goal || plan.objective,
    level: plan.level,
    minutes: Number(plan.minutesPerWorkout ?? plan.duration) || 0,
  }
}

/**
 * Valida todos os dias de uma planilha.
 * @returns {{ valid, plan, corrections, warnings, days: object[] }}
 */
export function validatePlan(plan = {}, ctx = {}) {
  const base = { ...planContext(plan), ...ctx }
  const days = plan.weeklyPlan || plan.schedule || []
  const results = days.map((day) =>
    validateWorkout(day, { ...base, day: day.workoutName || day.name || day.day }),
  )
  const weeklyPlan = results.map((r) => r.workout)
  const corrections = results.flatMap((r) => r.corrections)
  const warnings = results.flatMap((r) => r.warnings)
  const correctedPlan = {
    ...plan,
    weeklyPlan,
    schedule: weeklyPlan,
    rulesVersion: RULES_VERSION,
  }
  const volume = checkWeeklyVolume(correctedPlan, base.level)
  for (const item of volume.below) {
    warnings.push(
      `${item.group}: ${Math.round(item.sets)} séries por semana, abaixo da faixa do nível (${volume.range[0]}-${volume.range[1]}). A duração escolhida limita o volume.`,
    )
  }
  for (const item of volume.above) {
    warnings.push(
      `${item.group}: ${Math.round(item.sets)} séries por semana, acima da faixa do nível (${volume.range[0]}-${volume.range[1]}).`,
    )
  }
  return {
    valid: corrections.length === 0,
    plan: correctedPlan,
    corrections,
    warnings,
    days: results,
    volume,
  }
}

/** Planilha salva com regras antigas e que muda ao ser validada. */
export function planNeedsUpgrade(plan) {
  if (!plan) return false
  const days = plan.weeklyPlan || plan.schedule || []
  if (!days.length) return false
  return !validatePlan(plan).valid
}
