/**
 * Volume semanal por músculo e etiquetas de grupo derivadas dos exercícios.
 */
import { KINDS, isStrengthKind, normalizeGroup } from './classify.js'
import { MAJOR_GROUPS, VOLUME_GROUPS, WEEKLY_VOLUME, normalizeLevel } from './rules.js'
import { catalogFor, entryGroup, entryKind } from './entry.js'
import { parseSetCount } from './time.js'

const SECONDARY_MAP = [
  [/tr[ií]ceps/i, 'Tríceps'],
  [/b[ií]ceps/i, 'Bíceps'],
  [/ombro|deltoide/i, 'Ombros'],
  [/gl[uú]teo/i, 'Glúteos'],
  [/quadr[ií]ceps|posterior|isquiotibia/i, 'Pernas'],
  [/peit/i, 'Peitoral'],
  [/costas|dorsal|lat[ií]ssimo/i, 'Costas'],
]

function secondaryGroups(ex, primary) {
  const muscles = catalogFor(ex)?.muscles || []
  const out = new Set()
  for (const muscle of muscles.slice(1)) {
    const hit = SECONDARY_MAP.find(([re]) => re.test(muscle))
    if (hit && hit[1] !== primary) out.add(hit[1])
  }
  return [...out]
}

function planDays(plan) {
  return plan?.weeklyPlan || plan?.schedule || []
}

/**
 * Séries por grupo muscular na semana.
 * Diretas por padrão; com `effective`, soma 0,5 por série de composto
 * em que o grupo é músculo secundário.
 * @returns {Record<string, number>}
 */
export function weeklySetsByGroup(plan, { effective = false } = {}) {
  const totals = {}
  for (const day of planDays(plan)) {
    for (const ex of day.exercises || []) {
      const { kind } = entryKind(ex)
      if (!isStrengthKind(kind)) continue
      const group = entryGroup(ex)
      const sets = parseSetCount(ex.sets)
      if (group) totals[group] = (totals[group] || 0) + sets
      if (effective && kind === KINDS.composto) {
        for (const secondary of secondaryGroups(ex, group)) {
          totals[secondary] = (totals[secondary] || 0) + sets * 0.5
        }
      }
    }
  }
  return totals
}

function directGroups(plan) {
  const set = new Set()
  for (const day of planDays(plan)) {
    for (const ex of day.exercises || []) {
      if (isStrengthKind(entryKind(ex).kind)) set.add(entryGroup(ex))
    }
  }
  return set
}

/**
 * Confere o volume semanal contra a faixa do nível.
 * Acima da faixa: séries diretas de todos os grupos de força.
 * Abaixo da faixa: séries efetivas (diretas + 0,5 indiretas) dos grandes grupos.
 * @returns {{ range: number[], byGroup: Record<string, number>, effective: Record<string, number>, below: object[], above: object[] }}
 */
export function checkWeeklyVolume(plan, level) {
  const range = WEEKLY_VOLUME[normalizeLevel(level)]
  const byGroup = weeklySetsByGroup(plan)
  const effective = weeklySetsByGroup(plan, { effective: true })
  const trained = directGroups(plan)
  const below = []
  const above = []
  for (const group of VOLUME_GROUPS) {
    if (!trained.has(group)) continue
    const direct = byGroup[group] || 0
    const total = effective[group] || 0
    if (MAJOR_GROUPS.includes(group) && total < range[0]) below.push({ group, sets: total, min: range[0] })
    if (direct > range[1]) above.push({ group, sets: direct, max: range[1] })
  }
  return { range, byGroup, effective, below, above }
}

/** Etiquetas do treino a partir dos exercícios presentes. */
export function deriveWorkoutTags(exercises = []) {
  const tags = []
  const add = (tag) => {
    if (tag && !tags.includes(tag)) tags.push(tag)
  }
  for (const ex of exercises) {
    const { kind } = entryKind(ex)
    if (kind === KINDS.mobilidade) add('Mobilidade')
    else if (kind === KINDS.cardio) add('Cardio')
    else if (kind === KINDS.core) add(entryGroup(ex) === 'Lombar' ? 'Lombar' : 'Abdômen')
    else add(normalizeGroup(entryGroup(ex)))
  }
  return tags
}
