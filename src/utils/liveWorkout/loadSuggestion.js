const LOWER_BODY_GROUPS = [
  'pernas',
  'gluteos',
  'quadriceps',
  'posterior',
  'panturrilha',
  'quadril',
  'legs',
  'inferiores',
]

export const LOWER_BODY_INCREMENT_KG = 2.5
export const DEFAULT_UPPER_INCREMENT_KG = 2
export const FIRST_RECORD_MESSAGE = 'Seu primeiro registro cria a referência'

function fold(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** "8-12", "10 a 15", "12" → { min, max }. Retorna null para tempo/distância. */
export function parseRepRange(reps) {
  const raw = fold(reps)
  if (!raw || /min|seg|\ds\b|metro|km/.test(raw)) return null
  const nums = raw.match(/\d+/g)
  if (!nums?.length) return null
  const a = Number(nums[0])
  const b = Number(nums[1] ?? nums[0])
  return { min: Math.min(a, b), max: Math.max(a, b) }
}

export function isLowerBodyExercise(exercise = {}) {
  const hay = [exercise.muscleGroup, exercise.category, exercise.type, ...(exercise.muscles || [])]
    .map(fold)
    .filter(Boolean)
  return hay.some((item) => LOWER_BODY_GROUPS.some((group) => item.includes(group)))
}

export function clampUpperIncrement(kg) {
  const n = Number(kg)
  if (!Number.isFinite(n)) return DEFAULT_UPPER_INCREMENT_KG
  return Math.min(2, Math.max(1, n))
}

function roundLoad(kg) {
  return Math.round(kg * 2) / 2
}

/**
 * Sugestão de carga para hoje a partir das séries da última sessão do exercício.
 * - todas as séries no topo da faixa → +2,5 kg (inferiores) ou +1–2 kg (superiores)
 * - alguma série abaixo do mínimo → manter carga
 * - dentro da faixa → manter carga e buscar mais repetições
 * - sem histórico → primeiro registro cria a referência
 */
export function suggestLoad({ lastSets = [], repRange, lowerBody = false, upperIncrementKg } = {}) {
  const sets = (lastSets || []).filter((s) => Number(s?.reps) > 0)
  if (!sets.length) {
    return { kind: 'first', loadKg: null, deltaKg: 0, message: FIRST_RECORD_MESSAGE }
  }

  const loadKg = Math.max(...sets.map((s) => Number(s.weight) || 0))
  if (!repRange) {
    return {
      kind: 'keep',
      loadKg,
      deltaKg: 0,
      message: loadKg > 0 ? `Mantenha ${formatLoad(loadKg)} kg` : 'Repita o último registro',
    }
  }

  const reps = sets.map((s) => Number(s.reps))
  if (reps.some((r) => r < repRange.min)) {
    return {
      kind: 'keep',
      loadKg,
      deltaKg: 0,
      message: `Mantenha ${formatLoad(loadKg)} kg e busque ${repRange.min} reps em todas as séries`,
    }
  }

  if (loadKg > 0 && reps.every((r) => r >= repRange.max)) {
    const deltaKg = lowerBody ? LOWER_BODY_INCREMENT_KG : clampUpperIncrement(upperIncrementKg)
    const next = roundLoad(loadKg + deltaKg)
    return {
      kind: 'increase',
      loadKg: next,
      deltaKg,
      message: `Suba para ${formatLoad(next)} kg (+${formatLoad(deltaKg)} kg)`,
    }
  }

  return {
    kind: 'hold',
    loadKg,
    deltaKg: 0,
    message:
      loadKg > 0
        ? `Mantenha ${formatLoad(loadKg)} kg e tente +1 rep por série`
        : 'Tente +1 rep por série',
  }
}

export function formatLoad(kg) {
  const n = Number(kg) || 0
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
}

/** Iniciante não deve ver faixas de força (4–6, 6–8) a menos que o exercício seja de força. */
export function normalizeBeginnerReps(reps, { level, strength = false } = {}) {
  if (strength || level !== 'Iniciante') return reps
  const range = parseRepRange(reps)
  if (!range || range.max > 8) return reps
  return '8-12'
}
