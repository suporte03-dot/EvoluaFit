const STORAGE_KEY = 'evoluafit-exercise-feel'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota */
  }
}

function roundLoad(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 2) / 2
}

export function recordExerciseFeel(exerciseKey, feel, weight) {
  if (!exerciseKey || !feel) return
  const map = readAll()
  map[exerciseKey] = {
    feel,
    weight: weight || map[exerciseKey]?.weight || '',
    at: new Date().toISOString(),
  }
  writeAll(map)
}

export function lastExerciseFeel(exerciseKey) {
  if (!exerciseKey) return null
  return readAll()[exerciseKey] || null
}

export function nextLoadSuggestion(exerciseKey, currentWeight) {
  const last = lastExerciseFeel(exerciseKey)
  const base = roundLoad(currentWeight || last?.weight)
  if (!base) return null
  if (last?.feel === 'easy') {
    return { kg: roundLoad(base + Math.max(1, base * 0.025)), copy: 'Última sessão ficou fácil. Suba um pouco a carga.' }
  }
  if (last?.feel === 'hard') {
    return { kg: roundLoad(Math.max(0, base - Math.max(1, base * 0.05))), copy: 'Última sessão pesou. Mantenha ou reduza um pouco.' }
  }
  return { kg: base, copy: 'Repita a carga e busque a mesma qualidade de execução.' }
}

export const FEEL_OPTIONS = [
  { id: 'easy', label: 'Fácil' },
  { id: 'ok', label: 'Na medida' },
  { id: 'hard', label: 'Pesado' },
]
