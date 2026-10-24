/**
 * Recorde pessoal = maior carga já registrada com reps ≥ às do recorde anterior.
 * Sem registro anterior não há recorde: o primeiro registro só cria a referência.
 */

function toSet(entry) {
  return {
    weight: Number(entry?.weight) || 0,
    reps: Number(entry?.reps) || 0,
    date: entry?.date || entry?.completedAt || null,
  }
}

export function findRecord(entries = []) {
  let best = null
  for (const raw of entries || []) {
    const set = toSet(raw)
    if (set.weight <= 0 || set.reps <= 0) continue
    if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
      best = set
    }
  }
  return best
}

export function isPersonalRecord(set, record) {
  if (!record) return false
  const next = toSet(set)
  if (next.weight <= 0 || next.reps <= 0) return false
  return next.weight > record.weight && next.reps >= record.reps
}

export function recordGainPct(previous, next) {
  const before = Number(previous?.weight) || 0
  const after = Number(next?.weight) || 0
  if (before <= 0 || after <= 0) return 0
  return Math.round(((after - before) / before) * 100)
}

/** Maior carga por sessão (dia), mais recentes por último. */
export function bestLoadBySession(entries = [], limit = 4) {
  const byDay = new Map()
  for (const raw of entries || []) {
    const set = toSet(raw)
    if (set.weight <= 0 || !set.date) continue
    const day = String(set.date).slice(0, 10)
    const current = byDay.get(day)
    if (!current || set.weight > current.weight) byDay.set(day, { date: day, weight: set.weight })
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-limit)
}

export function weeksBetween(fromDate, toDate = new Date()) {
  if (!fromDate) return 0
  const ms = new Date(toDate) - new Date(fromDate)
  return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)))
}
