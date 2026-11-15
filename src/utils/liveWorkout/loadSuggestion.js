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
/** Compostos de inferiores já pesados (leg press, agachamento ≥ 100 kg) sobem de 5 em 5. */
export const HEAVY_LOWER_COMPOUND_KG = 100
export const HEAVY_LOWER_INCREMENT_KG = 5
export const DEFAULT_UPPER_INCREMENT_KG = 2
export const FIRST_RECORD_MESSAGE = 'Primeira vez: escolha uma carga confortável'

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

/** Redução de 5–10% arredondada para anilhas (2,5 kg a partir de 20 kg), sempre abaixo da carga atual. */
function reducedLoad(loadKg, pct) {
  const raw = loadKg * (1 - pct)
  const step = loadKg >= 20 ? 2.5 : 0.5
  const next = Math.round(raw / step) * step
  return Math.max(0, next < loadKg ? next : loadKg - step)
}

/**
 * Sugestão de carga para hoje a partir das séries da última sessão do exercício.
 * - todas as séries no topo da faixa → +2,5 kg (inferiores; +5 kg em compostos ≥ 100 kg) ou +1–2 kg (superiores)
 * - maioria das séries 2+ reps abaixo do mínimo → reduzir 5–10%
 * - alguma série abaixo do mínimo → manter carga
 * - dentro da faixa → manter carga e buscar mais repetições
 * - sem histórico → primeiro registro cria a referência
 */
export function suggestLoad({ lastSets = [], repRange, lowerBody = false, compound = false, upperIncrementKg } = {}) {
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
  const below = reps.filter((r) => r < repRange.min)
  const worst = Math.min(...reps)
  if (loadKg > 0 && below.length > sets.length / 2 && worst <= repRange.min - 2) {
    const pct = worst <= repRange.min - 4 ? 0.1 : 0.05
    const next = reducedLoad(loadKg, pct)
    return {
      kind: 'reduce',
      loadKg: next,
      deltaKg: roundLoad(next - loadKg),
      message: `Reduza para ${formatLoad(next)} kg e busque ${repRange.min} reps com boa técnica`,
    }
  }
  if (below.length) {
    return {
      kind: 'keep',
      loadKg,
      deltaKg: 0,
      message: `Mantenha ${formatLoad(loadKg)} kg e busque ${repRange.min} reps em todas as séries`,
    }
  }

  if (loadKg > 0 && reps.every((r) => r >= repRange.max)) {
    let deltaKg = clampUpperIncrement(upperIncrementKg)
    if (lowerBody) {
      deltaKg = compound && loadKg >= HEAVY_LOWER_COMPOUND_KG ? HEAVY_LOWER_INCREMENT_KG : LOWER_BODY_INCREMENT_KG
    }
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
  if (Number.isInteger(n)) return String(n)
  const fixed = Number.isInteger(n * 10) ? n.toFixed(1) : n.toFixed(2)
  return fixed.replace('.', ',')
}

/** Botões ±2,5 kg: nunca abaixo de 0, sem resíduo de ponto flutuante. */
export function stepLoad(kg, deltaKg) {
  const next = (Number(kg) || 0) + (Number(deltaKg) || 0)
  return Math.max(0, Math.round(next * 100) / 100)
}

export function formatRepRange(range) {
  if (!range) return ''
  return range.min === range.max ? String(range.min) : `${range.min}–${range.max}`
}

/**
 * Alvo de uma série específica a partir da sugestão do dia e da mesma série na última sessão.
 * Retorna null sem histórico (o card de sugestão já orienta o primeiro registro).
 */
export function suggestSetTarget(suggestion, { previous = null, repRange = null } = {}) {
  if (!suggestion || suggestion.kind === 'first' || suggestion.loadKg == null) return null
  const prevKg = Number(previous?.weight) || 0
  const prevReps = Number(previous?.reps) || 0
  const rangeLabel = formatRepRange(repRange)

  if (suggestion.kind === 'increase') {
    const loadKg = prevKg > 0 ? roundLoad(prevKg + suggestion.deltaKg) : suggestion.loadKg
    return { loadKg, reps: repRange?.min ?? prevReps, repsLabel: rangeLabel || String(prevReps) }
  }
  if (suggestion.kind === 'reduce') {
    return { loadKg: suggestion.loadKg, reps: repRange?.min ?? prevReps, repsLabel: rangeLabel || String(prevReps) }
  }
  const loadKg = prevKg > 0 ? prevKg : suggestion.loadKg
  if (suggestion.kind === 'hold' && prevReps > 0) {
    const reps = repRange ? Math.min(prevReps + 1, repRange.max) : prevReps + 1
    return { loadKg, reps, repsLabel: String(reps) }
  }
  const reps = repRange?.min ?? prevReps
  if (!reps) return null
  return { loadKg, reps, repsLabel: rangeLabel || String(reps) }
}

/** "Sugestão: 42,5 kg × 8–10" (ou só reps para peso corporal). */
export function formatSetHint(target) {
  if (!target) return ''
  if (!(target.loadKg > 0)) return `Sugestão: ${target.repsLabel} reps`
  return `Sugestão: ${formatLoad(target.loadKg)} kg × ${target.repsLabel}`
}

/** Iniciante não deve ver faixas de força (4–6, 6–8) a menos que o exercício seja de força. */
export function normalizeBeginnerReps(reps, { level, strength = false } = {}) {
  if (strength || level !== 'Iniciante') return reps
  const range = parseRepRange(reps)
  if (!range || range.max > 8) return reps
  return '8-12'
}
