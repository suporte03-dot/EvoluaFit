function num(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const n = parseFloat(String(value ?? '').replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function setVolume(set) {
  if (!set?.completed) return 0
  return num(set.weight ?? set.load) * num(set.reps)
}

export function exerciseVolume(exercise) {
  return (exercise?.setSlots || []).reduce((sum, set) => sum + setVolume(set), 0)
}

export function sessionVolume(exercises = []) {
  return (exercises || []).reduce((sum, ex) => sum + exerciseVolume(ex), 0)
}

export function completedSetCount(exercises = []) {
  return (exercises || []).reduce(
    (sum, ex) => sum + (ex?.setSlots || []).filter((s) => s.completed).length,
    0,
  )
}

/** Volume por grupo muscular com % do total, maior primeiro. */
export function volumeByMuscle(exercises = []) {
  const totals = new Map()
  for (const ex of exercises || []) {
    const kg = exerciseVolume(ex)
    if (kg <= 0) continue
    const group = ex.muscleGroup || ex.category || 'Outros'
    totals.set(group, (totals.get(group) || 0) + kg)
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0)
  if (total <= 0) return []
  return [...totals.entries()]
    .map(([group, kg]) => ({ group, kg, pct: Math.round((kg / total) * 100) }))
    .sort((a, b) => b.kg - a.kg)
}

const kgFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** 4820 → "4.820 kg" */
export function formatVolumeKg(kg) {
  return `${kgFormatter.format(Math.round(num(kg)))} kg`
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mmss = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return h > 0 ? `${h}:${mmss}` : mmss
}
