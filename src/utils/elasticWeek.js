/**
 * Semana elástica: redistribui os treinos pendentes da semana (seg–dom) nos dias
 * que restam. Treinos feitos nunca se movem; no máximo 1 treino por dia; evita o
 * mesmo grupo em dias seguidos quando dá; se faltar dia, o menos importante fica de fora.
 */
import { KINDS, entryGroup, entryKind } from './prescription/index.js'
import { displayWorkoutName } from './workoutLabels.js'
import { WEEK_PLAN_WEEKDAYS, localDateKey, mondayOf } from './weekPlan.js'

const GROUP_MERGE = { Glúteos: 'Pernas', Panturrilha: 'Pernas', Quadríceps: 'Pernas', Posterior: 'Pernas' }
const STRENGTH_KINDS = new Set([KINDS.composto, KINDS.isolado, KINDS.panturrilha])

const COST = { conflict: 100, moved: 3, newDay: 1, inversion: 1 }

function isDone(w) {
  const s = String(w?.status || '').toLowerCase()
  return ['realizado', 'completed', 'done', 'parcial', 'partial'].includes(s)
}

function isRestEntry(w) {
  if (w?.isRest) return true
  if (String(w?.status || '').toLowerCase() === 'descanso') return true
  return /^(descanso|recupera)/.test(String(w?.name || '').toLowerCase()) && !(w?.exercises || []).length
}

function addDays(key, n) {
  const d = new Date(`${key}T12:00:00`)
  d.setDate(d.getDate() + n)
  return localDateKey(d)
}

const focusCache = new WeakMap()

/** Grupos principais do treino (≥ 2 exercícios de força ou o do primeiro exercício). */
export function workoutFocusGroups(workout) {
  if (workout && focusCache.has(workout)) return focusCache.get(workout)
  const counts = new Map()
  let first = ''
  for (const ex of workout?.exercises || []) {
    if (!STRENGTH_KINDS.has(entryKind(ex).kind)) continue
    const raw = entryGroup(ex)
    const group = GROUP_MERGE[raw] || raw
    if (!group) continue
    if (!first) first = group
    counts.set(group, (counts.get(group) || 0) + 1)
  }
  const focus = new Set([...counts.entries()].filter(([, n]) => n >= 2).map(([g]) => g))
  if (first) focus.add(first)
  if (!focus.size) {
    for (const g of workout?.muscleGroups || []) focus.add(GROUP_MERGE[g] || g)
  }
  if (workout) focusCache.set(workout, focus)
  return focus
}

export function sameFocus(a, b) {
  if (!a || !b) return false
  const fa = workoutFocusGroups(a)
  const fb = workoutFocusGroups(b)
  for (const g of fa) if (fb.has(g)) return true
  return false
}

/** Prioridade para ficar na semana: compostos pesam mais que acessórios. */
export function workoutImportance(workout) {
  return (workout?.exercises || []).reduce((sum, ex) => {
    const { kind } = entryKind(ex)
    if (kind === KINDS.composto) return sum + 3
    if (kind === KINDS.isolado || kind === KINDS.panturrilha) return sum + 1
    return sum + 0.5
  }, 0)
}

function nameOf(w) {
  return displayWorkoutName(w?.name || 'Treino')
}

/**
 * @param {{ workouts: object[], now?: Date, planStart?: string }} input
 * @returns {{ needed, moves, dropped, days, conflicts, summary, pendingCount, missedCount }}
 */
export function planElasticWeek({ workouts = [], now = new Date(), planStart = '' } = {}) {
  const monday = mondayOf(now)
  const todayKey = localDateKey(now)
  const weekKeys = WEEK_PLAN_WEEKDAYS.map((_, i) => addDays(localDateKey(monday), i))
  const inWeek = new Set(weekKeys)
  const start = planStart ? localDateKey(planStart) : ''

  const week = (workouts || []).filter((w) => w && !isRestEntry(w) && inWeek.has(localDateKey(w.date)))
  const fixedByKey = new Map()
  for (const w of week) {
    if (isDone(w) && !fixedByKey.has(localDateKey(w.date))) fixedByKey.set(localDateKey(w.date), w)
  }
  const pending = week
    .filter((w) => !isDone(w) && !(start && localDateKey(w.date) < start))
    .sort((a, b) => localDateKey(a.date).localeCompare(localDateKey(b.date)))
  const missedCount = pending.filter((w) => localDateKey(w.date) < todayKey).length

  const openDays = weekKeys.filter((key) => key >= todayKey && !fixedByKey.has(key))
  const plannedDays = new Set(week.map((w) => localDateKey(w.date)))

  let candidates = pending.map((w, order) => ({ w, order, from: localDateKey(w.date) }))
  const dropped = []
  // Só sai quem já passou: um treino futuro descartado ficaria no mesmo dia de outro.
  while (candidates.length > openDays.length) {
    let worst = -1
    for (let i = 0; i < candidates.length; i += 1) {
      if (candidates[i].from >= todayKey) continue
      if (worst < 0 || workoutImportance(candidates[i].w) < workoutImportance(candidates[worst].w)) worst = i
    }
    if (worst < 0) break
    dropped.push(candidates[worst])
    candidates = candidates.filter((_, i) => i !== worst)
  }

  const best = { cost: Infinity, assign: null }
  const assign = new Map()
  const used = new Set()

  const occupantOf = (key) => fixedByKey.get(key) || assign.get(key)?.w || null

  const search = (dayIdx, placed, cost) => {
    if (cost >= best.cost) return
    if (placed === candidates.length) {
      best.cost = cost
      best.assign = new Map(assign)
      return
    }
    if (dayIdx >= openDays.length) return
    const day = openDays[dayIdx]
    const daysLeft = openDays.length - dayIdx
    const itemsLeft = candidates.length - placed

    for (const item of candidates) {
      if (used.has(item)) continue
      let add = 0
      if (sameFocus(occupantOf(addDays(day, -1)), item.w)) add += COST.conflict
      const nextFixed = fixedByKey.get(addDays(day, 1))
      if (nextFixed && sameFocus(nextFixed, item.w)) add += COST.conflict
      if (item.from !== day) add += COST.moved
      if (!plannedDays.has(day)) add += COST.newDay
      for (const other of candidates) {
        if (other !== item && !used.has(other) && other.order < item.order) add += COST.inversion
      }
      used.add(item)
      assign.set(day, item)
      search(dayIdx + 1, placed + 1, cost + add)
      assign.delete(day)
      used.delete(item)
    }
    if (daysLeft > itemsLeft) search(dayIdx + 1, placed, cost)
  }
  if (candidates.length <= openDays.length) search(0, 0, 0)

  const finalAssign = best.assign || new Map()
  const toDateById = new Map()
  for (const [day, item] of finalAssign) toDateById.set(item.w.id, day)

  const moves = candidates
    .filter((item) => toDateById.get(item.w.id) && toDateById.get(item.w.id) !== item.from)
    .map((item) => ({ id: item.w.id, name: nameOf(item.w), fromDate: item.from, toDate: toDateById.get(item.w.id) }))
    .sort((a, b) => a.toDate.localeCompare(b.toDate))

  let conflicts = 0
  const afterByKey = new Map(fixedByKey)
  for (const [day, item] of finalAssign) afterByKey.set(day, item.w)
  for (const item of dropped) if (!afterByKey.has(item.from)) afterByKey.set(item.from, item.w)

  const days = weekKeys.map((key, i) => {
    const before = week.find((w) => localDateKey(w.date) === key) || null
    const after = afterByKey.get(key) || null
    const prev = i > 0 ? afterByKey.get(weekKeys[i - 1]) : null
    if (after && prev && key >= todayKey && sameFocus(prev, after)) conflicts += 1
    const stateOf = (w) => {
      if (!w) return 'Folga'
      if (isDone(w)) return 'Feito'
      return key < todayKey ? 'Não realizado' : key === todayKey ? 'Hoje' : 'Planejado'
    }
    return {
      key,
      label: WEEK_PLAN_WEEKDAYS[i],
      isToday: key === todayKey,
      past: key < todayKey,
      before: before ? nameOf(before) : '',
      beforeState: stateOf(before),
      after: after ? nameOf(after) : '',
      afterState: stateOf(after),
      changed: (before?.id || null) !== (after?.id || null),
    }
  })

  const droppedOut = dropped.map((item) => ({ id: item.w.id, name: nameOf(item.w), fromDate: item.from }))
  let summary = ''
  if (moves.length) {
    summary = `${moves.length} ${moves.length === 1 ? 'treino muda' : 'treinos mudam'} de dia para caber no que resta da semana.`
    if (droppedOut.length) {
      summary += ` ${droppedOut.map((d) => d.name).join(', ')} fica de fora desta semana (sem dia livre).`
    }
  } else if (droppedOut.length || candidates.length > openDays.length) {
    summary = 'Não há dias livres suficientes nesta semana para encaixar os treinos pendentes.'
  } else {
    summary = 'Sua semana já está organizada.'
  }

  return {
    needed: moves.length > 0,
    moves,
    dropped: droppedOut,
    days,
    conflicts,
    summary,
    pendingCount: pending.length,
    missedCount,
    todayKey,
  }
}
