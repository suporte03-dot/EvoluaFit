/**
 * Mapa corporal: séries semanais por músculo vs. faixa do nível.
 * Usa histórico concluído (séries reais); se vazio, cai no volume do plano.
 */
import { isCompletedSession } from './completedSession.js'
import { startOfWeek, endOfWeek } from './progressMetrics.js'
import {
  WEEKLY_VOLUME,
  VOLUME_GROUPS,
  normalizeLevel,
  weeklySetsByGroup,
  normalizeGroup,
} from './prescription/index.js'

function parseSets(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value))
  if (Array.isArray(value)) return value.filter((s) => s?.completed || s?.done).length || value.length
  const n = parseInt(String(value ?? '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function sessionInWeek(entry, start, end) {
  const raw = entry?.completedAt || entry?.completed_at || entry?.date || entry?.started_at
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return false
  return d >= start && d < end
}

function setsFromExercise(ex) {
  if (Array.isArray(ex?.setSlots)) {
    const done = ex.setSlots.filter((s) => s?.completed || s?.done).length
    if (done > 0) return done
  }
  if (Array.isArray(ex?.sets) && typeof ex.sets[0] === 'object') {
    const done = ex.sets.filter((s) => s?.completed || s?.done).length
    if (done > 0) return done
  }
  return parseSets(ex?.setsCompleted ?? ex?.completedSets ?? ex?.sets)
}

/**
 * Séries concluídas por grupo na semana corrente (histórico local).
 * @returns {Record<string, number>}
 */
export function weeklySetsFromHistory(history = [], referenceDate = new Date()) {
  const start = startOfWeek(referenceDate)
  const end = endOfWeek(referenceDate)
  const totals = {}
  for (const entry of history || []) {
    if (!isCompletedSession(entry)) continue
    if (!sessionInWeek(entry, start, end)) continue
    for (const ex of entry.exercises || entry.sessionExercises || []) {
      const group = normalizeGroup(ex.muscleGroup || ex.category || '')
      if (!group || !VOLUME_GROUPS.includes(group)) continue
      const sets = setsFromExercise(ex)
      if (sets <= 0) continue
      totals[group] = (totals[group] || 0) + sets
    }
  }
  return totals
}

/**
 * @returns {{
 *   level: string,
 *   range: number[],
 *   byGroup: Record<string, number>,
 *   source: 'history'|'plan'|'empty',
 *   rows: Array<{ group: string, sets: number, status: 'below'|'ok'|'above'|'idle', min: number, max: number, ratio: number }>
 * }}
 */
export function buildBodyVolumeMap({
  history = [],
  plan = null,
  level = 'Intermediário',
  referenceDate = new Date(),
} = {}) {
  const lvl = normalizeLevel(level)
  const range = WEEKLY_VOLUME[lvl] || WEEKLY_VOLUME.Intermediário
  const fromHistory = weeklySetsFromHistory(history, referenceDate)
  const historyTotal = Object.values(fromHistory).reduce((a, b) => a + b, 0)
  let byGroup = fromHistory
  let source = historyTotal > 0 ? 'history' : 'empty'

  if (historyTotal <= 0 && plan) {
    byGroup = weeklySetsByGroup(plan)
    const planTotal = Object.values(byGroup).reduce((a, b) => a + b, 0)
    source = planTotal > 0 ? 'plan' : 'empty'
  }

  const [min, max] = range
  const rows = VOLUME_GROUPS.map((group) => {
    const sets = byGroup[group] || 0
    let status = 'idle'
    if (sets > 0) {
      if (sets < min) status = 'below'
      else if (sets > max) status = 'above'
      else status = 'ok'
    }
    const ratio = max > 0 ? Math.min(1.35, sets / max) : 0
    return { group, sets, status, min, max, ratio }
  })

  return { level: lvl, range, byGroup, source, rows }
}

export function bodyVolumeSummary(map) {
  if (!map || map.source === 'empty') {
    return 'Conclua treinos nesta semana para ver o volume por músculo no mapa.'
  }
  const active = map.rows.filter((r) => r.sets > 0)
  const below = active.filter((r) => r.status === 'below')
  const above = active.filter((r) => r.status === 'above')
  const prefix = map.source === 'plan' ? 'Volume do plano' : 'Volume desta semana'
  if (!active.length) return `${prefix}: ainda sem séries nos grupos principais.`
  if (below.length && !above.length) {
    return `${prefix}: ${below.map((r) => r.group).join(', ')} abaixo da faixa (${map.range[0]}–${map.range[1]} séries).`
  }
  if (above.length && !below.length) {
    return `${prefix}: ${above.map((r) => r.group).join(', ')} acima da faixa (${map.range[0]}–${map.range[1]} séries).`
  }
  if (below.length && above.length) {
    return `${prefix}: alguns músculos fora da faixa ${map.range[0]}–${map.range[1]} do nível ${map.level}.`
  }
  return `${prefix}: grupos treinados dentro da faixa ${map.range[0]}–${map.range[1]} (${map.level}).`
}
