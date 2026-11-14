/**
 * Propostas do Coach: o motor monta/valida, a IA só sugere mudanças.
 * Tudo aqui é puro (sem React/localStorage) para ser testado em Node.
 */
import { exercises as defaultCatalog } from '../../data/exercisesData.js'
import { objectiveLabels } from '../../data/workoutTemplates.js'
import { generateWorkoutPlan, planToWorkouts } from '../workoutGenerator.js'
import {
  estimateWorkoutMinutes,
  normalizeGoal,
  normalizeLevel,
  prescribeExercise,
  validatePlan,
} from '../prescription/index.js'
import { displayWorkoutName } from '../workoutLabels.js'
import { normalizeVoiceText } from '../voiceIntents.js'

export const CHANGE_TYPES = ['adicionar', 'remover', 'trocar', 'ajustar']
const HOME_EQUIPMENT = ['Peso corporal', 'Halteres', 'Elástico']
const MAX_CHANGES = 12

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function planDays(plan) {
  return plan?.weeklyPlan || plan?.schedule || []
}

function normName(value) {
  return normalizeVoiceText(displayWorkoutName(String(value || '')))
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(value) {
  return normName(value)
    .split(' ')
    .filter((t) => t.length > 1 && !['de', 'da', 'do', 'com', 'na', 'no', 'em', 'e', 'a', 'o'].includes(t))
}

function similarity(a, b) {
  const na = normName(a)
  const nb = normName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) {
    return 0.75 + 0.2 * (Math.min(na.length, nb.length) / Math.max(na.length, nb.length))
  }
  const ta = new Set(tokens(a))
  const tb = new Set(tokens(b))
  if (!ta.size || !tb.size) return 0
  let common = 0
  for (const t of ta) if (tb.has(t)) common += 1
  return common / Math.max(ta.size, tb.size)
}

function bestMatch(name, items, getName, threshold = 0.6) {
  let best = null
  let score = 0
  for (const item of items) {
    const s = similarity(name, getName(item))
    if (s > score) {
      score = s
      best = item
    }
  }
  return score >= threshold ? best : null
}

/** Exercício do catálogo pelo nome (tolerante a acentos/ordem); null se não existir. */
export function matchCatalogExercise(name, catalog = defaultCatalog) {
  if (!name) return null
  const visible = catalog.filter((ex) => !ex.hiddenFromLibrary)
  const byId = visible.find((ex) => ex.id === name)
  if (byId) return byId
  return bestMatch(name, visible, (ex) => ex.name, 0.75)
}

/** Dia da planilha por número ("2", "Dia 2") ou nome ("Puxar B", "Pull B"). */
export function findPlanDayIndex(plan, dia) {
  const days = planDays(plan)
  if (!days.length || dia == null || dia === '') return -1
  const raw = String(dia).trim()
  const asNumber = /^\d+$/.test(raw) ? Number(raw) : Number(raw.match(/^dia\s*(\d+)$/i)?.[1])
  if (Number.isFinite(asNumber) && asNumber > 0) {
    const byDay = days.findIndex((d) => Number(d.day ?? d.dayNumber) === asNumber)
    if (byDay >= 0) return byDay
    return asNumber <= days.length ? asNumber - 1 : -1
  }
  const target = normName(raw)
  const exact = days.findIndex((d) => normName(d.workoutName || d.name) === target)
  if (exact >= 0) return exact
  const partial = days
    .map((d, i) => ({ i, name: normName(d.workoutName || d.name) }))
    .filter(({ name }) => name.startsWith(target) || target.startsWith(name))
  return partial.length === 1 ? partial[0].i : -1
}

function findExerciseIndex(day, name) {
  const list = day.exercises || []
  const hit = bestMatch(name, list, (ex) => ex.name, 0.6)
  return hit ? list.indexOf(hit) : -1
}

function entryFromCatalog(ex, { level, goal }) {
  const rx = prescribeExercise(ex, { level, goal })
  return {
    exerciseId: ex.id,
    name: ex.name,
    muscleGroup: ex.category,
    equipment: ex.equipment,
    sets: rx.sets,
    reps: rx.reps,
    rest: rx.rest,
    restSeconds: rx.restSeconds,
    kind: rx.kind,
    principal: rx.principal,
    observation: rx.observation || ex.shortInstruction || 'Movimento controlado.',
    load: '',
    completed: false,
    level: ex.level,
  }
}

/** "4x6-8 · 90s", "3 séries de 10-12, descanso 60 s" → campos. */
export function parseAdjustment(change = {}) {
  const out = {}
  const text = String(change.para || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[×*]/g, 'x')
    .replace(/[–—]/g, '-')
  const setsReps = text.match(/(\d+)\s*(?:x|series? de)\s*(\d+(?:\s*-\s*\d+)?\s*s?)/)
  if (setsReps) {
    out.sets = Number(setsReps[1])
    out.reps = setsReps[2].replace(/\s+/g, '')
  }
  const rest = text.match(
    /(?:descanso|intervalo)\s*(?:de\s*)?(\d+)\s*s?|(\d+)\s*s(?:eg\w*)?\s*(?:de )?(?:descanso|intervalo)|[·,;|]\s*(\d+)\s*s\b/,
  )
  if (rest) out.restSeconds = Number(rest[1] || rest[2] || rest[3])
  if (change.series != null && Number(change.series) > 0) out.sets = Number(change.series)
  if (change.repeticoes) out.reps = String(change.repeticoes)
  if (change.descanso != null && Number(change.descanso) > 0) out.restSeconds = Number(change.descanso)
  return out
}

function describeRx(ex) {
  const rest = ex.restSeconds ?? ex.rest
  return `${ex.sets}×${ex.reps}${rest ? ` · ${rest}s` : ''}`
}

/**
 * Aplica a lista de mudanças da IA e passa o resultado pelo motor.
 * @returns {{ plan, applied, skipped, corrections, warnings, valid }}
 */
export function applyProposalToPlan(plan, mudancas = [], catalog = defaultCatalog) {
  const goal = normalizeGoal(plan?.goal || plan?.objective)
  const level = normalizeLevel(plan?.level)
  const days = planDays(plan).map((day) => ({
    ...day,
    exercises: (day.exercises || []).map((ex) => ({ ...ex })),
  }))
  const applied = []
  const skipped = []
  const skip = (change, motivo) => skipped.push({ ...change, motivo })

  for (const change of (Array.isArray(mudancas) ? mudancas : []).slice(0, MAX_CHANGES)) {
    const tipo = String(change?.tipo || '').toLowerCase()
    if (!CHANGE_TYPES.includes(tipo)) {
      skip(change, 'Tipo de mudança desconhecido.')
      continue
    }
    const dayIdx = findPlanDayIndex({ weeklyPlan: days }, change.dia)
    if (dayIdx < 0) {
      skip(change, `Não encontrei o dia "${change.dia ?? ''}" na planilha.`)
      continue
    }
    const day = days[dayIdx]
    const dayName = displayWorkoutName(day.workoutName || day.name)
    const motivo = String(change.motivo || '').slice(0, 240)

    if (tipo === 'adicionar') {
      const ex = matchCatalogExercise(change.para, catalog)
      if (!ex) {
        skip(change, `"${change.para}" não está no catálogo do app.`)
        continue
      }
      if (day.exercises.some((e) => e.exerciseId === ex.id)) {
        skip(change, `${ex.name} já está em ${dayName}.`)
        continue
      }
      day.exercises.push(entryFromCatalog(ex, { level, goal }))
      applied.push({ tipo, dia: dayName, descricao: `Adicionar ${ex.name}`, motivo })
      continue
    }

    const exIdx = findExerciseIndex(day, change.de)
    if (exIdx < 0) {
      skip(change, `"${change.de ?? ''}" não está em ${dayName}.`)
      continue
    }
    const current = day.exercises[exIdx]

    if (tipo === 'remover') {
      if (day.exercises.length <= 1) {
        skip(change, `${dayName} ficaria sem exercícios.`)
        continue
      }
      day.exercises.splice(exIdx, 1)
      applied.push({ tipo, dia: dayName, descricao: `Remover ${current.name}`, motivo })
      continue
    }

    if (tipo === 'trocar') {
      const ex = matchCatalogExercise(change.para, catalog)
      if (!ex) {
        skip(change, `"${change.para}" não está no catálogo do app.`)
        continue
      }
      if (ex.id !== current.exerciseId && day.exercises.some((e) => e.exerciseId === ex.id)) {
        skip(change, `${ex.name} já está em ${dayName}.`)
        continue
      }
      day.exercises[exIdx] = entryFromCatalog(ex, { level, goal })
      applied.push({ tipo, dia: dayName, descricao: `Trocar ${current.name} por ${ex.name}`, motivo })
      continue
    }

    const adj = parseAdjustment(change)
    if (!Object.keys(adj).length) {
      skip(change, `Ajuste sem séries, repetições ou descanso reconhecíveis para ${current.name}.`)
      continue
    }
    const next = { ...current }
    if (adj.sets) next.sets = adj.sets
    if (adj.reps) next.reps = adj.reps
    if (adj.restSeconds) {
      next.rest = adj.restSeconds
      next.restSeconds = adj.restSeconds
    }
    day.exercises[exIdx] = next
    applied.push({ tipo, dia: dayName, descricao: `Ajustar ${current.name} para ${describeRx(next)}`, motivo })
  }

  const draft = { ...plan, weeklyPlan: days, schedule: days }
  const validated = validatePlan(draft)
  return {
    plan: { ...validated.plan, updatedAt: new Date().toISOString() },
    applied,
    skipped,
    corrections: validated.corrections,
    warnings: validated.warnings,
    valid: validated.valid,
  }
}

function rowOf(ex) {
  return {
    key: ex.exerciseId || normName(ex.name),
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.restSeconds ?? ex.rest ?? null,
  }
}

/** Antes × depois por dia (alinhado por posição do dia). */
export function diffPlans(before, after) {
  const a = planDays(before)
  const b = planDays(after)
  const total = Math.max(a.length, b.length)
  const out = []
  for (let i = 0; i < total; i += 1) {
    const dayA = a[i] || null
    const dayB = b[i] || null
    const rowsA = (dayA?.exercises || []).map(rowOf)
    const rowsB = (dayB?.exercises || []).map(rowOf)
    const keysA = new Map(rowsA.map((r) => [r.key, r]))
    const keysB = new Set(rowsB.map((r) => r.key))
    const depois = rowsB.map((r) => {
      const prev = keysA.get(r.key)
      if (!prev) return { ...r, status: dayA ? 'novo' : 'mantido' }
      const same = String(prev.sets) === String(r.sets) && String(prev.reps) === String(r.reps) && String(prev.rest) === String(r.rest)
      return { ...r, status: same ? 'mantido' : 'alterado' }
    })
    const antes = rowsA.map((r) => ({ ...r, status: keysB.has(r.key) ? 'mantido' : 'removido' }))
    const nameA = dayA ? displayWorkoutName(dayA.workoutName || dayA.name) : null
    const nameB = dayB ? displayWorkoutName(dayB.workoutName || dayB.name) : null
    out.push({
      dia: Number(dayB?.day ?? dayA?.day ?? i + 1),
      nomeAntes: nameA,
      nomeDepois: nameB,
      antes: dayA ? antes : null,
      depois: dayB ? depois : null,
      minAntes: dayA ? estimateWorkoutMinutes(dayA.exercises || []) : null,
      minDepois: dayB ? estimateWorkoutMinutes(dayB.exercises || []) : null,
      changed:
        !dayA ||
        !dayB ||
        nameA !== nameB ||
        antes.some((r) => r.status !== 'mantido') ||
        depois.some((r) => r.status !== 'mantido'),
    })
  }
  return out
}

function uniqueRestrictions(...lists) {
  const seen = new Map()
  for (const item of lists.flat()) {
    const label = String(item || '').trim()
    if (!label) continue
    const key = normalizeVoiceText(label)
    if (!seen.has(key)) seen.set(key, label)
  }
  return [...seen.values()]
}

/** Resolve as entradas do motor: pedido > perfil > planilha ativa > padrão. */
export function resolvePlanInputs(slots = {}, profile = {}, activePlan = null, extraRestrictions = []) {
  const pick = (fromSlot, fromProfile, fromPlan, fallback) => {
    if (fromSlot) return [fromSlot, 'pedido']
    if (fromProfile) return [fromProfile, 'perfil']
    if (fromPlan) return [fromPlan, 'planilha']
    return [fallback, 'padrão']
  }
  const [goal, goalSrc] = pick(slots.objective, profile.objective, activePlan?.goal || activePlan?.objective, 'saude')
  const [level, levelSrc] = pick(slots.level, profile.level, activePlan?.level, 'Iniciante')
  const [days, daysSrc] = pick(
    Number(slots.daysPerWeek) || null,
    Number(profile.daysPerWeek) || null,
    Number(activePlan?.daysPerWeek) || null,
    3,
  )
  const [minutes, minutesSrc] = pick(
    Number(slots.minutes) || null,
    Number(profile.duration) || null,
    Number(activePlan?.minutesPerWorkout ?? activePlan?.duration) || null,
    45,
  )
  const [location, locationSrc] = pick(slots.location, profile.location, activePlan?.location, 'Academia')
  let equipment
  if (location === 'Casa') equipment = slots.location === 'Casa' || !profile.equipment?.length ? HOME_EQUIPMENT : profile.equipment
  else if (slots.location === 'Academia') equipment = ['Academia completa']
  else equipment = profile.equipment?.length ? profile.equipment : ['Academia completa']

  return {
    inputs: {
      goal: normalizeGoal(goal),
      level: normalizeLevel(level),
      daysPerWeek: Math.min(7, Math.max(2, Number(days) || 3)),
      minutes: Math.min(120, Math.max(20, Number(minutes) || 45)),
      location,
      equipment,
      restrictions: uniqueRestrictions(slots.restrictions || [], profile.restrictions || [], extraRestrictions),
    },
    sources: { goal: goalSrc, level: levelSrc, daysPerWeek: daysSrc, minutes: minutesSrc, location: locationSrc },
  }
}

export function goalLabel(goal) {
  return objectiveLabels[goal] || goal
}

/** Planilha nova montada 100% pelo motor. */
export function buildPlanProposal({ slots = {}, profile = {}, activePlan = null, extraRestrictions = [], reason = 'pedido' } = {}) {
  const { inputs, sources } = resolvePlanInputs(slots, profile, activePlan, extraRestrictions)
  const raw = generateWorkoutPlan({
    goal: inputs.goal,
    level: inputs.level,
    daysPerWeek: inputs.daysPerWeek,
    duration: inputs.minutes,
    location: inputs.location,
    equipment: inputs.equipment,
    restrictions: inputs.restrictions,
  })
  const validated = validatePlan(raw)
  const plan = validated.plan
  return {
    id: uid('proposal'),
    kind: 'new_plan',
    reason,
    titulo: `Nova planilha: ${inputs.daysPerWeek} dias · ${goalLabel(inputs.goal)} · ${inputs.level}`,
    plan,
    basePlanId: activePlan?.id || null,
    inputs,
    sources,
    diff: diffPlans(activePlan, plan),
    applied: [],
    skipped: [],
    corrections: validated.corrections,
    warnings: [...(raw.volumeWarnings || []), ...validated.warnings].filter(
      (w, i, all) => typeof w === 'string' && all.indexOf(w) === i,
    ),
    createdAt: new Date().toISOString(),
  }
}

/** Proposta de edição vinda da IA, já corrigida pelo motor. */
export function buildEditProposal(activePlan, aiProposal = {}, catalog = defaultCatalog) {
  const result = applyProposalToPlan(activePlan, aiProposal.mudancas || [], catalog)
  return {
    id: uid('proposal'),
    kind: 'edit_plan',
    reason: 'ia',
    titulo: String(aiProposal.titulo || 'Ajuste da planilha').slice(0, 120),
    plan: result.plan,
    basePlanId: activePlan?.id || null,
    inputs: null,
    sources: null,
    diff: diffPlans(activePlan, result.plan),
    applied: result.applied,
    skipped: result.skipped,
    corrections: result.corrections,
    warnings: result.warnings,
    createdAt: new Date().toISOString(),
  }
}

export function proposalHasChanges(proposal) {
  return Boolean(proposal?.diff?.some((d) => d.changed))
}

const SOURCE_LABELS = { pedido: 'do seu pedido', perfil: 'do seu perfil', planilha: 'da planilha ativa', padrão: 'do padrão do app' }

/** Explicação determinística e concreta (usada quando a IA não responde). */
export function describeProposal(proposal) {
  if (!proposal) return ''
  const lines = []
  if (proposal.kind === 'new_plan') {
    const { inputs, sources } = proposal
    const dayNames = planDays(proposal.plan).map((d) => displayWorkoutName(d.workoutName || d.name))
    const mins = proposal.diff.map((d) => d.minDepois).filter((m) => m != null)
    const range = mins.length ? `${Math.min(...mins)}–${Math.max(...mins)} min` : `~${inputs.minutes} min`
    lines.push(
      `Montei uma planilha de ${inputs.daysPerWeek} dias para ${goalLabel(inputs.goal).toLowerCase()}, nível ${inputs.level}, ${
        inputs.location === 'Casa' ? 'em casa' : 'na academia'
      }, com sessões de ${range}.`,
    )
    lines.push(`Divisão: ${dayNames.join(' · ')}.`)
    const bySource = {}
    for (const [key, label] of [
      ['daysPerWeek', 'dias'],
      ['level', 'nível'],
      ['goal', 'objetivo'],
      ['minutes', 'duração'],
      ['location', 'local'],
    ]) {
      const src = sources?.[key]
      if (!src) continue
      bySource[src] = [...(bySource[src] || []), label]
    }
    const origin = Object.entries(bySource)
      .map(([src, labels]) => `${labels.join(', ')} vieram ${SOURCE_LABELS[src] || src}`)
      .join('; ')
    if (origin) lines.push(`${origin[0].toUpperCase()}${origin.slice(1)}.`)
    if (inputs.restrictions?.length) {
      lines.push(`Evitei sobrecarga em: ${inputs.restrictions.join(', ').toLowerCase()}.`)
    }
    lines.push('Cada dia começa pelos compostos principais; séries, repetições e descansos seguem as regras do motor para o seu nível e objetivo.')
  } else {
    if (proposal.applied.length) lines.push(`Preparei ${proposal.applied.length} mudança(s) na sua planilha.`)
    if (proposal.skipped.length) lines.push(`${proposal.skipped.length} sugestão(ões) não puderam ser aplicadas.`)
  }
  if (proposal.corrections.length) {
    lines.push(`O motor de prescrição corrigiu ${proposal.corrections.length} item(ns) — veja os motivos abaixo.`)
  }
  lines.push('Confira o antes e depois e toque em Aplicar para salvar, ou Ignorar.')
  return lines.join(' ')
}

/** Resumo compacto da proposta para a IA explicar (sem dados pessoais). */
export function summarizeProposalForAI(proposal) {
  if (!proposal) return null
  return {
    tipo: proposal.kind,
    titulo: proposal.titulo,
    entradas: proposal.inputs
      ? {
          objetivo: proposal.inputs.goal,
          nivel: proposal.inputs.level,
          dias: proposal.inputs.daysPerWeek,
          minutos: proposal.inputs.minutes,
          local: proposal.inputs.location,
          restricoes: proposal.inputs.restrictions,
        }
      : null,
    dias: proposal.diff.map((d) => ({
      dia: d.dia,
      nome: d.nomeDepois,
      minutos: d.minDepois,
      exercicios: (d.depois || []).map((r) => `${r.name} ${r.sets}×${r.reps}${r.rest ? ` · ${r.rest}s` : ''}`),
    })),
    correcoes: proposal.corrections.slice(0, 8).map((c) => c.reason),
  }
}

const PENDING_STATUSES = ['', 'pendente', 'planned', 'pending', 'agendado']

function isPendingPlanWorkout(w) {
  if (w?.isRest) return false
  return PENDING_STATUSES.includes(String(w?.status || '').toLowerCase())
}

/**
 * Próximo estado ao aplicar uma proposta: plano para savePlan + lista completa de treinos.
 * Remove pendentes da planilha anterior (sem duplicar) e preserva concluídos/parciais.
 */
export function computePlanApplication({ activePlan = null, nextPlan, workouts = [], referenceDate = new Date() } = {}) {
  if (!nextPlan || !planDays(nextPlan).length) return null
  const plan = { ...nextPlan, updatedAt: new Date().toISOString() }
  const replacedIds = new Set([activePlan?.id, plan.id].filter(Boolean))
  const kept = workouts.filter((w) => !(replacedIds.has(w.planId) && isPendingPlanWorkout(w)))
  const removed = workouts.length - kept.length
  const doneSlots = new Set(
    kept.filter((w) => w.planId === plan.id && !isPendingPlanWorkout(w)).map((w) => `${w.dayNumber}|${w.date}`),
  )
  const keptIds = new Set(kept.map((w) => w.id))
  const stamp = Date.now().toString(36)
  const fresh = planToWorkouts(plan, referenceDate)
    .filter((w) => !doneSlots.has(`${w.dayNumber}|${w.date}`))
    .map((w) => (keptIds.has(w.id) ? { ...w, id: `${w.id}-${stamp}` } : w))
  return { plan, workouts: [...fresh, ...kept], added: fresh.length, removed }
}
