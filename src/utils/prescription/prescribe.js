/**
 * Prescrição de séries × repetições × descanso por exercício.
 */
import { KINDS, classifyExercise } from './classify.js'
import {
  CORE_REPS,
  defaultSets,
  formatRepRange,
  normalizeGoal,
  normalizeLevel,
  repRange,
  restRule,
  roundRest,
} from './rules.js'
import { parseRepRange } from './time.js'

function fold(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function isTimedCore(exercise = {}) {
  const hay = fold(`${exercise.id || ''} ${exercise.name || ''}`)
  if (/prancha|isometr|hollow|pallof|superman|bird.?dog|dead.?bug/.test(hay)) return true
  const parsed = parseRepRange(exercise.reps)
  return parsed?.unit === 's'
}

const OBSERVATIONS = {
  forca: {
    composto: 'Carga desafiadora com execução limpa; não force além da técnica.',
    isolado: 'Isolador: controle total, sem roubar no movimento.',
  },
  hipertrofia: {
    composto: 'Pare a 1–2 repetições da falha, com amplitude completa.',
    isolado: 'Cadência controlada e contração no fim do movimento.',
  },
  default: {
    composto: 'Ritmo controlado e boa forma em todas as séries.',
    isolado: 'Movimento controlado, sem pressa.',
  },
}

function observationFor(kind, goal) {
  if (kind === KINDS.core) return 'Mantenha o core firme e a respiração constante.'
  if (kind === KINDS.mobilidade) return 'Movimento suave, sem forçar amplitude dolorosa.'
  if (kind === KINDS.cardio) return 'Ritmo em que ainda dá para conversar.'
  if (kind === KINDS.panturrilha) return 'Amplitude completa: suba na ponta e desça até alongar.'
  const table = OBSERVATIONS[goal] || OBSERVATIONS.default
  return kind === KINDS.isolado ? table.isolado : table.composto
}

/**
 * @param {object} exercise — item do catálogo (ou entrada com exerciseId/categoria)
 * @param {{ level?: string, goal?: string, recovery?: boolean }} ctx
 * @returns {{ kind, principal, sets, reps, rest, restSeconds, observation, timed }}
 */
export function prescribeExercise(exercise, ctx = {}) {
  const level = normalizeLevel(ctx.level)
  const goal = normalizeGoal(ctx.goal)
  const { kind, principal } = classifyExercise(exercise)
  let sets = defaultSets(kind, principal, level, goal)
  let reps
  let timed = false

  if (kind === KINDS.cardio) {
    const parsed = parseRepRange(exercise.reps)
    reps = parsed?.unit === 'min' ? String(exercise.reps) : '10-15 min'
    timed = true
  } else if (kind === KINDS.mobilidade) {
    reps = '30-45s'
    timed = true
  } else if (kind === KINDS.core) {
    timed = isTimedCore(exercise)
    reps = timed ? (level === 'Iniciante' ? '20-30s' : '30-45s') : formatRepRange(CORE_REPS)
  } else {
    reps = formatRepRange(repRange(kind, principal, goal))
  }

  let rest = restRule(kind, principal, goal).value
  if (kind === KINDS.core && (goal === 'condicionamento' || goal === 'emagrecimento')) rest = 30

  if (ctx.recovery) sets = Math.min(sets, 3)

  rest = roundRest(rest)
  return {
    kind,
    principal,
    sets,
    reps,
    rest,
    restSeconds: rest,
    observation: observationFor(kind, goal),
    timed,
  }
}
