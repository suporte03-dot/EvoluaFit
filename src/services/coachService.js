/**
 * Coach — motor local + IA via /api/coach (chave só no servidor).
 *
 * - Pedidos claros de planilha: o motor monta (buildPlanProposal); a IA só explica.
 * - Perguntas livres: IA (requestCoachAI); propostas da IA passam pelo motor (buildEditProposal).
 * - Dor/lesão: guarda local determinística (detectPainMention), sem IA.
 * - Falha da IA: mensagem honesta + "Tentar de novo" (sem resposta genérica).
 */

import { exercises, getExerciseById } from '../data/exercisesData'
import { planToWorkouts } from '../utils/workoutGenerator'
import { generateCoachInsights } from '../utils/coachInsights'
import { formatSignedDelta } from '../utils/bodyEvolutionMetrics'
import { parseAppVoiceCommand } from '../utils/voiceIntents'
import { buildCatchUpWorkout, detectMissedWorkouts } from '../utils/adaptiveWeek'
import { resolveCanonicalNextWorkout } from '../utils/trainingIdentity'
import { displayWorkoutName } from '../utils/workoutLabels'
import { objectiveLabels } from '../data/workoutTemplates'
import { buildCatalogDigest, buildCoachAIContext } from '../utils/coach/context.js'
import {
  buildEditProposal,
  buildPlanProposal,
  describeProposal,
  proposalHasChanges,
  summarizeProposalForAI,
} from '../utils/coach/proposal.js'
import { detectPainMention, painReplyText } from '../utils/coach/safety.js'
import { requestCoachAI } from './coach/aiClient'

/** Chave local exigida pelo produto (histórico do Coach). */
export const COACH_STORAGE_KEY = 'coach_messages_local'

/** Migração: chave antiga do Coach. */
const LEGACY_STORAGE_KEY = 'evoluafit-coach-messages'

export const COACH_SAFETY_FOOTER = [
  'Este plano é informativo e não substitui orientação profissional.',
  'Respeite seus limites e pare em caso de dor.',
  'Em caso de lesão, dor persistente ou condição médica, procure um profissional de educação física ou saúde.',
  'Progresso saudável é gradual — evite treino excessivo e comparações com terceiros.',
].join(' ')

export const QUICK_PROMPTS = {
  hoje: 'O que treinar hoje?',
  montarTreino: 'Montar treino personalizado com base no meu perfil.',
  ajustar: 'Ajustar minha planilha atual.',
  explicar: 'Explicar um exercício da minha rotina.',
  rapido30: 'Treino rápido de 30 min',
  casa: 'Treino em casa',
  descanso: 'Sugestão de descanso/mobilidade',
}

export const QUICK_CHIPS = [
  { id: 'hoje', label: 'O que treinar hoje?', prompt: QUICK_PROMPTS.hoje },
  { id: 'montar', label: 'Montar treino', prompt: QUICK_PROMPTS.montarTreino },
  { id: 'ajustar', label: 'Ajustar minha planilha', prompt: QUICK_PROMPTS.ajustar },
  { id: 'explicar', label: 'Explicar exercício', prompt: QUICK_PROMPTS.explicar },
  { id: 'rapido30', label: 'Treino rápido de 30 min', prompt: QUICK_PROMPTS.rapido30 },
  { id: 'casa', label: 'Treino em casa', prompt: QUICK_PROMPTS.casa },
  { id: 'descanso', label: 'Sugestão de descanso/mobilidade', prompt: QUICK_PROMPTS.descanso },
  {
    id: 'espelho',
    label: 'Meu Espelho Evolutivo',
    prompt: 'Como minhas medidas evoluíram nos últimos 90 dias?',
  },
]

export const EMPTY_EXAMPLES = [
  { label: 'O que treinar hoje?', prompt: QUICK_PROMPTS.hoje },
  { label: 'Montar um treino completo', prompt: QUICK_PROMPTS.montarTreino },
  { label: 'Treino rápido de 30 min', prompt: QUICK_PROMPTS.rapido30 },
  { label: 'Mobilidade e recuperação', prompt: QUICK_PROMPTS.descanso },
]

const ACTION = {
  SAVE: 'save',
  START: 'start',
  RELATED: 'related',
  VARIATION: 'variation',
  COPY: 'copy',
}

export const COACH_ACTIONS = ACTION

const PUSH_MUSCLES = ['Peito', 'Peitoral', 'Ombros', 'Tríceps']
const PULL_MUSCLES = ['Costas', 'Bíceps']
const LEG_MUSCLES = ['Quadríceps', 'Posterior', 'Glúteos', 'Pernas', 'Panturrilha']
const HOME_EQUIPMENT = ['Peso corporal', 'Halteres', 'Elástico']

function delay(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function uid(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatList(items) {
  return items.map((item) => `• ${item}`).join('\n')
}

function withSafety(body) {
  return `${body.trim()}\n\n---\n${COACH_SAFETY_FOOTER}`
}

function getLastSession(history = []) {
  return (history || []).find((entry) => {
    const status = String(entry?.status || '').toLowerCase()
    if (status === 'cancelled' || status === 'canceled' || status === 'cancelado') return false
    return Boolean(entry)
  }) || null
}

function getLastSessionMuscles(history = []) {
  const last = getLastSession(history)
  return last?.exercises?.map((e) => e.muscleGroup).filter(Boolean) || []
}

function detectSplit(muscles) {
  if (muscles.some((m) => LEG_MUSCLES.includes(m))) return 'legs'
  if (muscles.some((m) => PUSH_MUSCLES.includes(m))) return 'push'
  if (muscles.some((m) => PULL_MUSCLES.includes(m))) return 'pull'
  return null
}

function daysSince(dateIso) {
  if (!dateIso) return 99
  const t = new Date(dateIso).getTime()
  if (Number.isNaN(t)) return 99
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24))
}

function pickAlternatives(exercise, count = 3) {
  if (!exercise) return []
  return exercises
    .filter(
      (ex) =>
        ex.id !== exercise.id &&
        ex.category === exercise.category &&
        (ex.level === exercise.level || !exercise.level),
    )
    .slice(0, count)
}

function filterPool(focus = [], { home = false, level } = {}) {
  return exercises.filter((ex) => {
    const matchFocus = !focus.length || focus.includes(ex.category) || focus.includes(ex.muscleGroup)
    const matchHome = !home || HOME_EQUIPMENT.includes(ex.equipment)
    const matchLevel = !level || !ex.level || ex.level === level || level === 'Iniciante'
    return matchFocus && matchHome && matchLevel
  })
}

function workoutActions(hasWorkout) {
  if (!hasWorkout) return [ACTION.COPY]
  return [ACTION.SAVE, ACTION.START, ACTION.RELATED, ACTION.VARIATION, ACTION.COPY]
}

function buildBlocks({ title, reason, workout, careNotes = [] }) {
  return {
    title: title || 'Sugestão do Coach',
    reason: reason || '',
    workout: workout || null,
    careNotes: careNotes.length
      ? careNotes
      : [
          'Aqueça 5–10 minutos antes de iniciar.',
          'Mantenha a técnica controlada e pare se sentir dor.',
          'Hidrate-se e respeite o descanso entre sessões.',
        ],
  }
}

function formatWorkoutBlock(workout) {
  if (!workout?.exercises?.length) return ''
  const lines = workout.exercises.map(
    (e) =>
      `• **${e.name}** — ${e.sets}×${e.reps}${e.restSeconds ? ` · descanso ${e.restSeconds}s` : ''}${
        e.muscleGroup ? ` (${e.muscleGroup})` : ''
      }`,
  )
  return [
    `## ${workout.name}`,
    `Grupos: ${(workout.muscleGroups || []).join(', ') || 'variados'}`,
    `Duração estimada: ~${workout.estimatedMinutes || 40} min`,
    '',
    '**Exercícios sugeridos:**',
    ...lines,
  ].join('\n')
}

function formatResponseBody({ title, reason, workout, careNotes }) {
  const parts = [`## ${title}`, '', reason]
  if (workout) {
    parts.push('', formatWorkoutBlock(workout))
  }
  if (careNotes?.length) {
    parts.push('', '**Cuidados:**', formatList(careNotes))
  }
  return withSafety(parts.filter(Boolean).join('\n'))
}

function makeResult({ title, reason, workout, careNotes, suggestion, relatedMuscleGroup, extraActions }) {
  const blocks = buildBlocks({ title, reason, workout, careNotes })
  const answer = formatResponseBody(blocks)
  const actions = extraActions || workoutActions(Boolean(workout || suggestion?.type === 'workout' || suggestion?.type === 'plan'))
  return {
    answer,
    blocks,
    actions,
    suggestion: suggestion || (workout ? { type: 'workout', data: workout } : null),
    relatedMuscleGroup: relatedMuscleGroup || workout?.muscleGroups?.[0] || null,
    relatedWorkout: workout || suggestion?.data || null,
  }
}

/**
 * Cria um treino curto concreto a partir da biblioteca local.
 */
export function createQuickWorkout(options = {}) {
  const {
    profile = {},
    focus = ['Peitoral', 'Costas'],
    minutes = 30,
    home = false,
    name,
  } = options

  const maxExercises = minutes <= 25 ? 3 : minutes <= 35 ? 4 : 5
  const preferredHome = home || profile.location === 'Casa'
  let pool = filterPool(focus, { home: preferredHome, level: profile.level })

  if (pool.length < maxExercises) {
    pool = filterPool(focus, { home: false, level: profile.level })
  }
  if (!pool.length) {
    pool = exercises.slice(0, maxExercises)
  }

  const selected = pool.slice(0, maxExercises)
  const today = new Date().toISOString().split('T')[0]
  const groups = [...new Set(selected.map((ex) => ex.category))]

  return {
    id: `coach-workout-${Date.now()}`,
    name: name || `Treino sugerido — ${groups.slice(0, 2).join(' + ') || 'geral'}`,
    date: today,
    muscleGroups: groups.length ? groups : focus,
    status: 'Pendente',
    estimatedMinutes: minutes,
    source: 'coach-ia',
    exercises: selected.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.category,
      sets: minutes <= 25 ? 3 : 4,
      reps: ex.reps || '10-12',
      restSeconds: minutes <= 30 ? 60 : 75,
      load: '',
    })),
    createdAt: new Date().toISOString(),
  }
}

function migrateLegacyMessages(raw) {
  if (!Array.isArray(raw) || !raw.length) return []
  // Já no formato role-based
  if (raw[0]?.role) return raw

  const migrated = []
  for (const entry of raw) {
    if (entry.question) {
      migrated.push({
        id: `${entry.id || uid()}-u`,
        role: 'user',
        content: entry.question,
        createdAt: entry.createdAt || new Date().toISOString(),
        actions: null,
        relatedWorkout: null,
      })
    }
    if (entry.answer) {
      migrated.push({
        id: entry.id || uid('coach'),
        role: 'coach',
        content: entry.answer,
        createdAt: entry.createdAt || new Date().toISOString(),
        actions: entry.actions || [ACTION.COPY],
        relatedWorkout: entry.relatedWorkout || null,
        blocks: entry.blocks || null,
        suggestion: entry.suggestion || null,
        relatedMuscleGroup: entry.relatedMuscleGroup || null,
      })
    }
  }
  return migrated
}

export function loadCoachMessages() {
  try {
    const raw = localStorage.getItem(COACH_STORAGE_KEY)
    if (raw) {
      const parsed = migrateLegacyMessages(JSON.parse(raw))
      if (parsed.length && !localStorage.getItem(COACH_STORAGE_KEY + ':migrated')) {
        localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(parsed))
      }
      return parsed
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const migrated = migrateLegacyMessages(JSON.parse(legacy))
      localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }
    return []
  } catch {
    return []
  }
}

/** Propostas guardam a planilha inteira; só as mais recentes ficam no aparelho. */
const MAX_STORED_PROPOSALS = 3

function persistMessages(messages) {
  let proposals = 0
  const capped = messages.slice(0, 80).map((msg) => {
    if (!msg?.proposal) return msg
    proposals += 1
    if (proposals <= MAX_STORED_PROPOSALS) return msg
    return { ...msg, proposal: null, proposalStatus: msg.proposalStatus === 'applied' ? 'applied' : 'expired' }
  })
  try {
    localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(capped))
  } catch {
    // Quota cheia: mantém a conversa só em memória.
  }
  return capped
}

/** Ordem cronológica estável: em empate de horário, pergunta antes da resposta. */
export function sortCoachMessages(messages = []) {
  return [...messages].sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt)
    if (diff) return diff
    if (a.role === b.role) return 0
    return a.role === 'user' ? -1 : 1
  })
}

/**
 * Persiste par pergunta/resposta no formato role-based (mais recente primeiro).
 * Shape: { id, role, content, createdAt, actions, relatedWorkout, proposal?, failed? }
 */
export function saveCoachExchange(question, result) {
  const asked = Date.now()
  const userMsg = {
    id: uid('user'),
    role: 'user',
    content: question,
    createdAt: new Date(asked).toISOString(),
    actions: null,
    relatedWorkout: null,
  }
  const coachMsg = {
    id: uid('coach'),
    role: 'coach',
    content: result.answer,
    createdAt: new Date(asked + 1).toISOString(),
    actions: result.actions || [ACTION.COPY],
    relatedWorkout: result.relatedWorkout || result.suggestion?.data || null,
    blocks: result.blocks || null,
    suggestion: result.suggestion || null,
    relatedMuscleGroup: result.relatedMuscleGroup || null,
    proposal: result.proposal || null,
    proposalStatus: result.proposal ? 'pending' : null,
    failed: Boolean(result.failed),
    retryQuestion: result.failed ? result.retryQuestion || question : null,
    source: result.source || null,
  }

  const messages = loadCoachMessages()
  const next = [coachMsg, userMsg, ...messages]
  persistMessages(next)
  return { userMsg, coachMsg }
}

export function updateCoachMessage(id, patch = {}) {
  const messages = loadCoachMessages()
  const next = messages.map((m) => (m.id === id ? { ...m, ...patch } : m))
  return persistMessages(next)
}

/** @deprecated use saveCoachExchange — mantido para compat */
export function saveCoachMessage(question, answer, meta = {}) {
  return saveCoachExchange(question, {
    answer,
    actions: meta.actions || [ACTION.COPY],
    relatedWorkout: meta.relatedWorkout || null,
    blocks: meta.blocks || null,
    suggestion: meta.suggestion || null,
    relatedMuscleGroup: meta.relatedMuscleGroup || null,
  }).coachMsg
}

export function clearCoachMessages() {
  localStorage.removeItem(COACH_STORAGE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

/**
 * Short recommendation cards for Coach UI — grounded in profile/history.
 * Never auto-applies; caller must confirm via apply/ignore.
 */
export function getContextualRecommendations(context = {}) {
  const { profile = {}, workouts = [], history = [], performance, generatedPlan, plans } = context
  const last = getLastSession(history)
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const days = daysSince(last?.completedAt || last?.date)
  const pending = workouts.filter((w) => w.status === 'Pendente')
  const canonical = resolveCanonicalNextWorkout({
    workouts,
    history,
    plans,
    generatedPlan,
  })
  const planWorkout = canonical.workout || canonical.nextWorkout
  const cards = []

  if (!workouts.length && !history.length) {
    cards.push({
      id: 'rec-start-plan',
      title: 'Montar primeira planilha',
      reason: 'Ainda não há rotina salva neste aparelho.',
      impact: 'Você ganha treinos claros por dia, com grupos e duração definidos.',
      action: 'plan',
      suggestion: null,
    })
    return cards
  }

  const missed = detectMissedWorkouts(workouts, new Date(), { history })
  if (missed.count >= 2) {
    const catchUp = buildCatchUpWorkout(missed.items)
    if (catchUp) {
      cards.push({
        id: 'rec-catchup',
        title: 'Recuperar a semana em uma sessão',
        reason: missed.sentence,
        impact: `Prévia: ${(catchUp.exercises || []).slice(0, 4).map((ex) => ex.name).join(', ')}.`,
        action: 'start_workout',
        suggestion: { type: 'workout', data: catchUp },
      })
    }
  } else if (missed.count === 1 && missed.items[0]?.id) {
    const today = todayKeyLocal()
    const busyToday = pending.some((w) => w.date === today && w.id !== missed.items[0].id)
    if (!busyToday) {
      cards.push({
        id: 'rec-missed-one',
        title: `Mover para hoje: ${displayWorkoutName(missed.items[0].name)}`,
        reason: 'Há um treino atrasado e nada agendado para hoje.',
        impact: 'O treino atrasado passa para hoje no calendário, sem acumular dois.',
        action: 'save_workout',
        suggestion: { type: 'reschedule', data: { id: missed.items[0].id, date: today } },
      })
    }
  }

  // O treino do dia já está em Hoje; com rotina ativa não sugerimos treinos avulsos concorrentes.
  const freeform = !planWorkout

  if (freeform && (streak >= 4 || days < 1)) {
    const workout = createQuickWorkout({
      profile,
      focus: ['Mobilidade', 'Alongamento'],
      minutes: 25,
      name: 'Mobilidade e recuperação',
    })
    cards.push({
      id: 'rec-recovery',
      title: 'Priorizar recuperação hoje',
      reason:
        days < 1
          ? 'Você já treinou recentemente.'
          : `Sequência de ${streak} dias — o corpo precisa de descanso ativo.`,
      impact: 'Reduz sobrecarga e ajuda a manter o hábito sem exagerar no volume.',
      action: 'save_workout',
      suggestion: { type: 'workout', data: workout },
    })
  } else if (freeform && pending.length) {
    // Há treino pendente: ele já aparece em Hoje/Meus treinos — repetir não muda nada.
  } else if (freeform && lastSplit === 'push') {
    const workout = createQuickWorkout({
      profile,
      focus: ['Costas', 'Bíceps'],
      minutes: profile.duration || 45,
      name: 'Puxar — costas e bíceps',
    })
    cards.push({
      id: 'rec-pull',
      title: 'Equilibrar com treino de puxar',
      reason: 'Última sessão enfatizou empurrar (peito/ombros/tríceps).',
      impact: 'Balanceia volume entre empurrar e puxar na semana.',
      action: 'save_workout',
      suggestion: { type: 'workout', data: workout },
    })
  } else if (freeform && lastSplit === 'pull') {
    const workout = createQuickWorkout({
      profile,
      focus: ['Quadríceps', 'Posterior', 'Glúteos'],
      minutes: profile.duration || 45,
      name: 'Pernas — inferiores',
    })
    cards.push({
      id: 'rec-legs',
      title: 'Incluir dia de pernas',
      reason: 'Última sessão foi de puxar (costas/bíceps).',
      impact: 'Completa o ciclo de grupos principais com volume moderado.',
      action: 'save_workout',
      suggestion: { type: 'workout', data: workout },
    })
  } else if (freeform && lastSplit === 'legs') {
    const workout = createQuickWorkout({
      profile,
      focus: ['Peitoral', 'Ombros', 'Tríceps'],
      minutes: profile.duration || 45,
      name: 'Empurrar — peito e tríceps',
    })
    cards.push({
      id: 'rec-push',
      title: 'Retomar treino de empurrar',
      reason: 'Última sessão foi de inferiores.',
      impact: 'Alterna estímulos e evita repetir o mesmo grupo em sequência.',
      action: 'save_workout',
      suggestion: { type: 'workout', data: workout },
    })
  }

  if (days >= 5 && last) {
    cards.push({
      id: 'rec-return',
      title: 'Retomar com volume confortável',
      reason: `Há ${days} dias sem treino registrado.`,
      impact: 'Recomeço gradual favorece técnica e adesão — sem pressa por carga alta.',
      action: 'short',
      suggestion: null,
    })
  }

  // Volume alto: o Aplicar pede ao Coach uma proposta de ajuste (antes/depois), não salva nada sozinho.
  const heavyPending = pending.find((w) => (w.exercises || []).length >= 8)
  if (heavyPending) {
    const name = displayWorkoutName(heavyPending.name)
    cards.push({
      id: 'rec-volume',
      title: 'Volume alto em um dia',
      reason: `"${name}" tem ${heavyPending.exercises.length} exercícios.`,
      impact: 'Peça uma proposta com 1–2 movimentos a menos e veja o antes e depois antes de aplicar.',
      action: 'adjust',
      prompt: `Reduza o volume do treino ${name}: remova 1 ou 2 exercícios menos importantes.`,
      suggestion: null,
    })
  }

  return cards.slice(0, 4)
}

/**
 * Resumo inteligente para os cards da UI (sem chamar “IA”).
 */
export function getCoachSummary(context = {}) {
  const { profile, workouts = [], history = [], performance, generatedPlan, plans } = context
  const last = getLastSession(history)
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const days = daysSince(last?.completedAt || last?.date)
  const pending = workouts.filter((w) => w.status === 'Pendente')
  const hasData = Boolean(profile?.objective || workouts.length || history.length)
  const canonical = resolveCanonicalNextWorkout({ workouts, history, plans, generatedPlan })
  const planWorkout = canonical.workout || canonical.nextWorkout

  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  const weeklyWorkouts = history.filter((h) => {
    const status = String(h.status || '').toLowerCase()
    if (status === 'cancelled' || status === 'canceled' || status === 'cancelado') return false
    const d = new Date(h.completedAt || h.date)
    return !Number.isNaN(d.getTime()) && d >= weekStart
  }).length

  let nextSuggestion = planWorkout?.name || pending[0]?.name || ''
  let recommendedGroup = (planWorkout?.muscleGroups || pending[0]?.muscleGroups || [])[0] || ''
  let attention =
    'Respeite limites, aqueça bem e pare se sentir dor. Progresso consistente vale mais que intensidade excessiva.'

  if (!hasData) {
    nextSuggestion = ''
    recommendedGroup = ''
    attention = 'Sem histórico ainda — comece com volume moderado e foque na técnica.'
  } else if (planWorkout) {
    nextSuggestion = displayWorkoutName(planWorkout.name)
    recommendedGroup = (planWorkout.muscleGroups || [])[0] || recommendedGroup
    if (canonical.situation === 'completed') {
      attention = 'Sessão de hoje registrada. O próximo passo segue a rotina ativa.'
    }
  } else if (streak >= 4 || days < 1) {
    nextSuggestion = 'Descanso ativo ou mobilidade'
    recommendedGroup = 'Mobilidade'
    attention = 'Você treinou recentemente. Priorize recuperação antes de nova sessão intensa.'
  } else if (lastSplit === 'push') {
    nextSuggestion = 'Dia de puxar (costas e bíceps)'
    recommendedGroup = 'Costas'
  } else if (lastSplit === 'pull') {
    nextSuggestion = 'Dia de pernas / inferiores'
    recommendedGroup = 'Pernas'
  } else if (lastSplit === 'legs') {
    nextSuggestion = 'Dia de empurrar (peito, ombros, tríceps)'
    recommendedGroup = 'Peitoral'
  } else if (pending.length) {
    const next = performance?.nextWorkout || pending[0]
    nextSuggestion = next.name || 'Seguir planilha pendente'
    recommendedGroup = (next.muscleGroups || [])[0] || 'Variado'
  }

  return {
    nextSuggestion,
    lastWorkout: last
      ? {
          name: displayWorkoutName(last.name) || 'Treino anterior',
          date: last.completedAt || last.date || null,
          muscles: lastMuscles,
        }
      : null,
    recommendedGroup,
    attention,
    hasData,
    level: profile?.level || null,
    objective: profile?.objective || null,
    streak,
    weeklyWorkouts,
  }
}

export async function getTodaySuggestion(context = {}) {
  await delay()

  const { profile = {}, workouts = [], history = [], performance, generatedPlan, plans } = context
  const insightPack = generateCoachInsights({
    history,
    workouts,
    summaries: context.summaries || [],
    records: context.records || [],
    weekly: context.weekly || {},
  })
  const insightLine = insightPack.items[0]?.evidence
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const daysSinceLast = daysSince(history[0]?.completedAt || history[0]?.date)
  const objective = objectiveLabels[profile?.objective] || ''
  const pending = workouts.filter((w) => w.status === 'Pendente')
  const hasData = Boolean(profile?.objective || workouts.length || history.length)
  const canonical = resolveCanonicalNextWorkout({ workouts, history, plans, generatedPlan })
  const planWorkout = canonical.workout || canonical.nextWorkout

  let title = 'Treino equilibrado'
  let focus = ['Peitoral', 'Costas', 'Pernas']
  let reason = hasData
    ? `Orientações com base na sua rotina e no seu histórico${objective ? ` (${objective})` : ''}.`
    : 'Seu primeiro treino cria a referência para acompanhar sua evolução.'
  if (insightLine) reason = `${reason} ${insightLine}`

  if (planWorkout && canonical.situation !== 'completed') {
    const preview = (planWorkout.exercises || []).slice(0, 4).map((ex) => ex.name).filter(Boolean)
    const planName = displayWorkoutName(planWorkout.name)
    return makeResult({
      title: planName,
      reason:
        canonical.situation === 'no_workout_today'
          ? `Nada agendado para hoje na rotina. O próximo treino é ${planName}.`
          : `Este é o treino da rotina ativa — o mesmo da tela Hoje.${preview.length ? ` Prévia: ${preview.join(', ')}.` : ''}`,
      workout: planWorkout,
      suggestion: { type: 'workout', data: planWorkout },
      relatedMuscleGroup: (planWorkout.muscleGroups || [])[0] || null,
      careNotes: [
        'Aqueça 5–10 min antes.',
        'Ajuste a carga para manter boa técnica.',
        'Pare se sentir dor (desconforto ≠ dor).',
      ],
    })
  }

  if (streak >= 4 || daysSinceLast < 1) {
    title = 'Descanso ativo / mobilidade'
    focus = ['Mobilidade', 'Alongamento']
    reason =
      'Você treinou vários dias seguidos ou fez sessão recente. Priorize recuperação: caminhada leve, alongamento ou mobilidade de 20–30 min.'
    const workout = createQuickWorkout({
      profile,
      focus,
      minutes: 25,
      name: 'Sessão de mobilidade e recuperação',
    })
    return makeResult({
      title,
      reason,
      workout,
      careNotes: [
        'Evite cargas altas e falha muscular hoje.',
        'Sono e hidratação também fazem parte do progresso.',
        'Retome o treino de força quando se sentir recuperado.',
      ],
      relatedMuscleGroup: 'Mobilidade',
    })
  }

  if (lastSplit === 'push') {
    title = 'Dia de puxar'
    focus = ['Costas', 'Bíceps']
    reason = 'Como o último treino foi de empurrar (peito, ombros, tríceps), hoje faz sentido trabalhar costas e bíceps.'
  } else if (lastSplit === 'pull') {
    title = 'Dia de pernas'
    focus = ['Pernas', 'Glúteos']
    reason = 'Após puxar, o próximo passo natural no split é pernas — quadríceps, posterior e glúteos.'
  } else if (lastSplit === 'legs') {
    title = 'Dia de empurrar'
    focus = ['Peitoral', 'Ombros', 'Tríceps']
    reason = 'Depois de pernas, retome o ciclo com empurrar para manter equilíbrio entre grupos.'
  } else if (pending.length) {
    const next = performance?.nextWorkout || pending[0]
    return makeResult({
      title: `Seguir planilha: ${displayWorkoutName(next.name)}`,
      reason: `Você tem treino pendente na planilha. Manter a rotina ajuda a consistência sem exagerar no volume.`,
      workout: next,
      suggestion: { type: 'workout', data: next },
      relatedMuscleGroup: (next.muscleGroups || [])[0] || null,
      careNotes: [
        'Aqueça 5–10 min antes.',
        'Ajuste a carga para manter boa técnica.',
        'Pare se sentir dor (desconforto ≠ dor).',
      ],
    })
  }

  const workout = createQuickWorkout({
    profile,
    focus,
    minutes: profile?.duration || 45,
    name: title,
  })

  return makeResult({
    title,
    reason,
    workout,
    relatedMuscleGroup: focus[0],
  })
}

/** Alias / API pedida: gera sugestão de treino (planilha ou sessão). */
export async function generateWorkoutSuggestion(context = {}, options = {}) {
  return generateWorkoutPlan(context, options)
}

function activePlanOf(context = {}) {
  return context.generatedPlan || context.plans?.[0] || null
}

function proposalResult(proposal, explanation, { source = 'engine', prefix = '' } = {}) {
  const text = [prefix, explanation].filter(Boolean).join('\n\n')
  return {
    answer: text,
    blocks: { title: proposal.titulo, reason: explanation, workout: null, careNotes: [] },
    actions: [ACTION.COPY],
    suggestion: null,
    proposal,
    source,
    relatedMuscleGroup: null,
    relatedWorkout: null,
  }
}

/**
 * Planilha nova pelo motor. A IA (se disponível) só escreve a explicação;
 * sem IA, a explicação determinística descreve a proposta concreta.
 */
export async function answerPlanBuild(context = {}, slots = {}, question = '') {
  const proposal = buildPlanProposal({
    slots,
    profile: context.profile || {},
    activePlan: activePlanOf(context),
  })
  let explanation = describeProposal(proposal)
  let source = 'engine'
  try {
    const ai = await requestCoachAI({
      question: question || 'Explique esta planilha.',
      mode: 'explain_proposal',
      context: buildCoachAIContext(context),
      proposal: summarizeProposalForAI(proposal),
    })
    explanation = ai.resposta.trim()
    source = 'engine+ia'
  } catch {
    // Sem IA: fica a explicação do motor.
  }
  return proposalResult(proposal, explanation, { source })
}

export async function generateWorkoutPlan(context = {}, options = {}) {
  return answerPlanBuild(
    context,
    {
      objective: options.objective,
      level: options.level,
      daysPerWeek: options.daysPerWeek,
      minutes: options.minutes,
      location: options.location || (options.home ? 'Casa' : null),
      restrictions: options.restrictions || [],
    },
    options.question || QUICK_PROMPTS.montarTreino,
  )
}

export async function explainExercise(exerciseOrId, _context) {
  await delay()

  let exercise =
    typeof exerciseOrId === 'object' && exerciseOrId
      ? exerciseOrId
      : getExerciseById(exerciseOrId)

  if (!exercise && typeof exerciseOrId === 'string') {
    const q = exerciseOrId.toLowerCase()
    exercise = exercises.find((ex) => ex.name.toLowerCase().includes(q))
  }

  if (!exercise) {
    return makeResult({
      title: 'Exercício não encontrado',
      reason:
        'Não encontrei esse exercício nos módulos. Escolha um da lista ou digite o nome com mais detalhes.',
      workout: null,
      careNotes: ['Use o seletor de exercícios ou abra Grupos musculares para escolher um movimento.'],
      extraActions: [ACTION.RELATED, ACTION.COPY],
    })
  }

  const alternatives = pickAlternatives(exercise)
  const steps = exercise.executionSteps || exercise.execution || []
  const benefits = exercise.benefits || []
  const mistakes = exercise.commonMistakes || []
  const safety = exercise.safetyTips || []

  const title = exercise.name
  const reason = [
    `**Para que serve:** ${exercise.shortInstruction || steps[0] || 'Fortalecimento e condicionamento muscular.'}`,
    '',
    `**Músculos:** ${(exercise.muscles || [exercise.category]).join(', ')}`,
    '',
    '**Como executar:**',
    formatList(
      steps.length
        ? steps
        : ['Posicione-se com postura neutra.', 'Execute o movimento de forma controlada.', 'Respire de forma ritmada.'],
    ),
    benefits.length ? `\n**Benefícios:**\n${formatList(benefits)}` : '',
    mistakes.length ? `\n**Erros comuns:**\n${formatList(mistakes)}` : '',
    alternatives.length ? `\n**Alternativas:** ${alternatives.map((a) => a.name).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    answer: withSafety(
      [`## ${title}`, '', reason, '', '**Cuidados:**', formatList(safety.length ? safety : ['Mantenha controle e pare se sentir dor.'])].join(
        '\n',
      ),
    ),
    blocks: buildBlocks({
      title,
      reason: exercise.shortInstruction || 'Fortalecimento e condicionamento muscular.',
      workout: null,
      careNotes: safety.length ? safety : ['Mantenha controle e pare se sentir dor.'],
    }),
    actions: [ACTION.RELATED, ACTION.COPY],
    suggestion: { type: 'exercise', data: exercise },
    relatedMuscleGroup: exercise.category,
    relatedWorkout: null,
    exerciseId: exercise.id,
  }
}

export async function adjustWorkoutPlan(context = {}, request = 'trocar') {
  await delay()

  const { profile = {}, workouts = [] } = context
  const pending = workouts.find((w) => w.status === 'Pendente')
  const req = String(request || 'trocar').toLowerCase()

  if (!pending) {
    const planResult = await generateWorkoutPlan(context)
    return {
      ...planResult,
      answer: `Você não tem treinos pendentes na planilha. Preparei uma planilha completa para começar.\n\n${planResult.answer}`,
    }
  }

  let title = 'Ajuste da planilha'
  let reason = ''
  let workout

  if (req.includes('casa') || req === 'casa') {
    title = `${pending.name} (versão casa)`
    reason = `Adaptei **${pending.name}** para treino em casa com halteres, elástico e peso corporal. Volume um pouco mais leve para facilitar a recuperação.`
    workout = {
      ...pending,
      id: `coach-adj-${Date.now()}`,
      name: `${pending.name} (Casa)`,
      estimatedMinutes: Math.max(25, (pending.estimatedMinutes || 45) - 10),
      source: 'coach-ia',
      exercises: (pending.exercises || [])
        .map((ex) => {
          const full = getExerciseById(ex.exerciseId)
          const alt = exercises.find(
            (e) =>
              e.category === (full?.category || ex.muscleGroup) && HOME_EQUIPMENT.includes(e.equipment),
          )
          if (!alt) return { ...ex, sets: Math.max(2, (ex.sets || 3) - 1) }
          return {
            exerciseId: alt.id,
            name: alt.name,
            muscleGroup: alt.category,
            sets: Math.max(2, (ex.sets || 3) - 1),
            reps: alt.reps || ex.reps,
            restSeconds: ex.restSeconds || 60,
            load: '',
          }
        })
        .slice(0, 5),
    }
  } else if (req.includes('volume') || req === 'volume') {
    title = `${pending.name} (volume reduzido)`
    reason = `Reduzi o volume de **${pending.name}** em 1 série por exercício para facilitar a recuperação, sem abandonar a rotina.`
    workout = {
      ...pending,
      id: `coach-adj-${Date.now()}`,
      source: 'coach-ia',
      exercises: (pending.exercises || []).map((ex) => ({
        ...ex,
        sets: Math.max(2, (ex.sets || 3) - 1),
      })),
    }
  } else if (req.includes('dura') || req.includes('30') || req === 'duracao') {
    title = 'Versão enxuta (~30 min)'
    reason = `Treino enxuto baseado em **${pending.name}**, com foco nos movimentos principais.`
    workout = createQuickWorkout({
      profile: { ...profile, duration: 30 },
      focus: pending.muscleGroups || ['Peitoral', 'Costas'],
      minutes: 30,
      name: `${pending.name} (30 min)`,
    })
  } else {
    const first = pending.exercises?.[0]
    const full = getExerciseById(first?.exerciseId)
    const alts = full ? pickAlternatives(full, 1) : []
    if (alts.length) {
      title = 'Troca de exercício sugerida'
      reason = `Sugiro trocar **${first.name}** por **${alts[0].name}** no treino ${pending.name} — mesmo grupo muscular (${alts[0].category}).`
      workout = {
        ...pending,
        id: `coach-adj-${Date.now()}`,
        source: 'coach-ia',
        exercises: pending.exercises.map((ex, i) =>
          i === 0
            ? {
                exerciseId: alts[0].id,
                name: alts[0].name,
                muscleGroup: alts[0].category,
                sets: ex.sets,
                reps: alts[0].reps || ex.reps,
                restSeconds: ex.restSeconds,
                load: '',
              }
            : ex,
        ),
      }
    } else {
      return makeResult({
        title: 'Ajuste sugerido',
        reason: `Não encontrei alternativa direta para ${first?.name || 'o exercício'}. Considere reduzir carga ou amplitude, mantendo boa técnica.`,
        workout: pending,
        suggestion: { type: 'workout', data: pending },
      })
    }
  }

  return makeResult({
    title,
    reason,
    workout,
    relatedMuscleGroup: (workout.muscleGroups || [])[0] || null,
  })
}

export async function createRecoverySuggestion(context = {}) {
  await delay()
  const workout = createQuickWorkout({
    profile: context.profile || {},
    focus: ['Mobilidade', 'Alongamento'],
    minutes: 25,
    name: 'Mobilidade e recuperação',
  })

  return makeResult({
    title: 'Descanso ativo e mobilidade',
    reason:
      'Quando o corpo pede recuperação, priorize mobilidade, caminhada leve e alongamento. Isso ajuda a manter o hábito sem sobrecarregar.',
    workout,
    careNotes: [
      'Evite treino intenso ou falha muscular hoje.',
      'Durma bem e hidrate-se.',
      'Retome a força quando se sentir recuperado — sem pressa por resultados rápidos.',
    ],
    relatedMuscleGroup: 'Mobilidade',
  })
}

export async function createHomeWorkoutSuggestion(context = {}) {
  await delay()
  const profile = context.profile || {}
  const workout = createQuickWorkout({
    profile,
    focus: ['Peitoral', 'Costas', 'Pernas', 'Abdômen'],
    minutes: profile.duration || 35,
    home: true,
    name: 'Treino em casa',
  })

  return makeResult({
    title: 'Treino em casa',
    reason:
      'Monte uma sessão prática com peso corporal, halteres ou elástico. Foque em técnica e amplitude confortável.',
    workout,
    relatedMuscleGroup: workout.muscleGroups?.[0] || 'Funcional',
  })
}

export async function createShortWorkoutSuggestion(context = {}, minutes = 30) {
  await delay()
  const profile = context.profile || {}
  const lastSplit = detectSplit(getLastSessionMuscles(context.history || []))
  let focus = ['Peitoral', 'Costas', 'Abdômen']
  if (lastSplit === 'push') focus = ['Costas', 'Bíceps']
  if (lastSplit === 'pull') focus = ['Pernas', 'Glúteos']
  if (lastSplit === 'legs') focus = ['Peitoral', 'Ombros']

  const workout = createQuickWorkout({
    profile,
    focus,
    minutes,
    name: `Treino rápido (${minutes} min)`,
  })

  return makeResult({
    title: `Treino rápido de ${minutes} min`,
    reason: `Com pouco tempo, priorize ${focus.slice(0, 2).join(' e ')} em circuito com descansos curtos (45–60s) e aquecimento breve.`,
    workout,
    relatedMuscleGroup: focus[0],
  })
}

/** Gera variação alternativa a partir de um treino/sugestão anterior. */
export async function generateVariation(context = {}, relatedWorkout = null) {
  await delay()
  const base = relatedWorkout
  const focus =
    base?.muscleGroups?.length > 0
      ? base.muscleGroups
      : detectSplit(getLastSessionMuscles(context.history || [])) === 'push'
        ? ['Costas', 'Bíceps']
        : ['Peitoral', 'Ombros', 'Tríceps']

  const minutes = base?.estimatedMinutes || context.profile?.duration || 40
  const workout = createQuickWorkout({
    profile: context.profile || {},
    focus,
    minutes,
    home: context.profile?.location === 'Casa',
    name: base?.name ? `${base.name} (variação)` : 'Variação sugerida',
  })

  // Embaralha pool pegando exercícios diferentes quando possível
  const usedIds = new Set((base?.exercises || []).map((e) => e.exerciseId))
  const alts = filterPool(focus, {
    home: context.profile?.location === 'Casa',
    level: context.profile?.level,
  }).filter((ex) => !usedIds.has(ex.id))

  if (alts.length >= 3) {
    workout.exercises = alts.slice(0, workout.exercises.length).map((ex, i) => ({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.category,
      sets: workout.exercises[i]?.sets || 3,
      reps: ex.reps || '10-12',
      restSeconds: workout.exercises[i]?.restSeconds || 60,
      load: '',
    }))
    workout.muscleGroups = [...new Set(workout.exercises.map((e) => e.muscleGroup))]
  }

  return makeResult({
    title: 'Variação do treino',
    reason: 'Aqui vai uma alternativa com exercícios diferentes no mesmo foco — útil para variar estímulo sem abandonar a rotina.',
    workout,
    relatedMuscleGroup: focus[0],
  })
}

/**
 * Prepara payload para salvar na planilha via FitnessContext.
 * Não persiste sozinho — o React deve chamar addWorkoutToPlan / savePlan / addPlanWorkouts.
 */
export function saveCoachSuggestionToPlan(suggestion) {
  if (!suggestion) return null

  if (suggestion.type === 'plan' && suggestion.data) {
    return {
      kind: 'plan',
      plan: suggestion.data,
      workouts: planToWorkouts(suggestion.data),
      sampleWorkout: suggestion.sampleWorkout || null,
    }
  }

  if (suggestion.type === 'workout' && suggestion.data) {
    return {
      kind: 'workout',
      workout: {
        ...suggestion.data,
        id: suggestion.data.id || `workout-${Date.now()}`,
        status: suggestion.data.status || 'Pendente',
        date: suggestion.data.date || new Date().toISOString().split('T')[0],
        createdAt: suggestion.data.createdAt || new Date().toISOString(),
      },
    }
  }

  if (suggestion.type === 'exercise' && suggestion.data) {
    return { kind: 'exercise', exercise: suggestion.data }
  }

  if (suggestion.type === 'schedule' && suggestion.data) {
    return { kind: 'schedule', workout: suggestion.data }
  }

  if (suggestion.type === 'reschedule' && suggestion.data) {
    return { kind: 'reschedule', id: suggestion.data.id, date: suggestion.data.date }
  }

  if (suggestion.type === 'reorganize' && suggestion.data?.moves) {
    return { kind: 'reorganize', moves: suggestion.data.moves }
  }

  if (suggestion.type === 'rest_day' && suggestion.data?.date) {
    return { kind: 'rest_day', date: suggestion.data.date }
  }

  return null
}

function answerBodyEvolution(context = {}) {
  const body = context.bodyEvolution
  if (!body?.count) {
    return makeResult({
      title: 'Espelho Evolutivo',
      reason:
        'Ainda não há registros no Espelho Evolutivo. Abra Evolução → Espelho e crie o primeiro check-in para eu comentar apenas as medidas que você informar.',
      careNotes: [
        'Eu descrevo somente números registrados por você.',
        'Não faço julgamento de aparência.',
      ],
    })
  }

  const lines = []
  if (body.count === 1) {
    lines.push(
      `Há 1 registro no Espelho Evolutivo (${body.latestDate || 'data não informada'}). Continue registrando para visualizar comparações.`,
    )
  } else {
    lines.push(`Há ${body.count} registros, do primeiro (${body.firstDate || '—'}) ao mais recente (${body.latestDate || '—'}).`)
    const keys = [
      ['waist', 'cintura', 'cm'],
      ['arm', 'braço', 'cm'],
      ['chest', 'peito', 'cm'],
      ['hips', 'quadril', 'cm'],
      ['thigh', 'coxa', 'cm'],
      ['weight', 'peso', 'kg'],
    ]
    keys.forEach(([key, label, unit]) => {
      const a = body.first?.[key]
      const b = body.latest?.[key]
      if (a == null || b == null) return
      const delta = formatSignedDelta(b - a, unit)
      if (delta) lines.push(`Sua ${label} foi de ${a} ${unit} para ${b} ${unit} (${delta}).`)
    })
    if (lines.length === 1) {
      lines.push('Os registros ainda não têm medidas comparáveis nos mesmos campos.')
    }
  }

  return makeResult({
    title: 'Meu Espelho Evolutivo',
    reason: lines.join(' '),
    careNotes: [
      'Estes números vêm só dos check-ins que você salvou.',
      'Não são diagnóstico, previsão ou julgamento de aparência.',
    ],
  })
}

function isPendingWorkout(w) {
  const s = String(w?.status || '').toLowerCase()
  return !w?.isRest && ['pendente', 'planned', 'pending', 'parcial', 'partial'].includes(s)
}

function todayKeyLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function answerScheduleVoice(context, intent) {
  await delay()
  const workouts = context.workouts || []

  if (intent.type === 'reorganize') {
    const missed = detectMissedWorkouts(workouts)
    if (!missed.count) {
      return makeResult({
        title: 'Sem atraso nesta semana',
        reason: 'Não há treinos atrasados para reorganizar.',
      })
    }
    return {
      ...makeResult({
        title: 'Reorganizar a semana',
        reason: missed.sentence || 'Vou mover os treinos atrasados para os dias que restam.',
      }),
      suggestion: { type: 'reorganize', autoApply: true, data: { moves: missed.moves } },
      actions: [ACTION.SAVE, ACTION.COPY],
    }
  }

  if (intent.type === 'rest') {
    const date = intent.slots?.date || todayKeyLocal()
    return {
      ...makeResult({
        title: 'Descanso na agenda',
        reason: `Marquei descanso em ${date}. Priorize sono, hidratação e mobilidade leve.`,
      }),
      suggestion: { type: 'rest_day', autoApply: true, data: { date } },
      actions: [ACTION.SAVE, ACTION.COPY],
    }
  }

  if (intent.type === 'postpone') {
    const today = todayKeyLocal()
    const target = workouts.find((w) => isPendingWorkout(w) && w.date === today) || workouts.find(isPendingWorkout)
    const date = intent.slots?.date || todayKeyLocal()
    if (!target?.id) {
      return makeResult({
        title: 'Nada para adiar',
        reason: 'Não encontrei um treino pendente para mover. Monte a planilha primeiro.',
      })
    }
    return {
      ...makeResult({
        title: 'Treino adiado',
        reason: `${target.name} vai para ${date}.`,
      }),
      suggestion: { type: 'reschedule', autoApply: true, data: { id: target.id, date } },
      actions: [ACTION.SAVE, ACTION.COPY],
    }
  }

  const date = intent.slots?.date || todayKeyLocal()
  const name = intent.slots?.name || 'Treino'
  const workout = {
    id: `voice-cal-${Date.now()}`,
    name,
    date,
    workoutType: intent.slots?.workoutType || name,
    muscleGroups: [],
    exercises: [],
    estimatedMinutes: 45,
    status: 'Pendente',
    source: 'voice',
    createdAt: new Date().toISOString(),
  }

  return {
    ...makeResult({
      title: `${name} na agenda`,
      reason: `Agendei ${name} para ${date}. Abra o calendário se quiser ajustar horário ou exercícios.`,
      workout,
    }),
    suggestion: { type: 'schedule', autoApply: true, data: workout },
    relatedWorkout: workout,
    actions: [ACTION.SAVE, ACTION.START, ACTION.COPY],
  }
}

function matchIntent(question) {
  const q = question.toLowerCase()

  if (/gordo|gord[oa]|feio|corpo ruim|precisa emagrecer|corpo perfeito|defeito/.test(q)) {
    return { type: 'body_guard' }
  }
  if (/espelho evolutivo|minhas medidas|medida(s)? evolu|como minha cintura|percentual de gordura/.test(q)) {
    return { type: 'body' }
  }
  if (/descans|mobilidade|recupera|cansad|fadig|sem energia/.test(q)) return { type: 'recovery' }
  if (/30\s*min|pouco tempo|treino curto|r[aá]pid/.test(q)) return { type: 'short' }
  if (/casa|halter|home|el[aá]stico/.test(q)) return { type: 'home' }
  if (/trocar|substituir|alterar exerc/.test(q)) return { type: 'swap' }
  if (/push|pull|legs|ppl|divis[aã]o|organizar/.test(q)) return { type: 'split' }
  if (/qual grupo|treinar hoje|o que treinar|o que treino|treino hoje|hoje\??$/.test(q)) return { type: 'today' }
  if (/montar|criar|gerar|planilha|treino personalizado/.test(q)) return { type: 'plan' }
  if (/explic|como faz|para que serve/.test(q)) return { type: 'explain' }
  if (/ajust|adapt|reduz|volume|academia/.test(q)) return { type: 'adjust' }

  return { type: 'general' }
}

const FAILURE_DETAILS = {
  not_authenticated: 'Entre na sua conta para conversar com o Coach.',
  ai_not_configured: 'O Coach IA ainda não foi ativado no servidor.',
  rate_limited: 'Muitas perguntas em pouco tempo — espere um minuto.',
  timeout: 'A resposta demorou demais.',
  ai_timeout: 'A resposta demorou demais.',
  network_error: 'Verifique sua conexão.',
}

function coachFailure(question, code) {
  const detail = FAILURE_DETAILS[code]
  return {
    answer: `Não consegui responder agora, tente de novo.${detail ? ` ${detail}` : ''}`,
    blocks: null,
    actions: [],
    suggestion: null,
    failed: true,
    retryQuestion: question,
    errorCode: code || 'unknown',
  }
}

/** Dor/lesão: resposta local e determinística, com alternativa pelo motor quando há região. */
function answerPain(context, pain, appIntent) {
  const profile = context.profile || {}
  const activePlan = activePlanOf(context)
  const canBuild = pain.restrictions.length > 0 && Boolean(activePlan || profile.objective || profile.level)
  const proposal = canBuild
    ? buildPlanProposal({
        slots: appIntent?.domain === 'build' ? appIntent.slots : {},
        profile,
        activePlan,
        extraRestrictions: pain.restrictions,
        reason: 'dor',
      })
    : null
  const text = painReplyText(pain, { proposalReady: Boolean(proposal) })
  if (proposal) {
    proposal.titulo = `Alternativa sem sobrecarregar ${pain.regions.join(', ')}`
    return proposalResult(proposal, `${text}\n\n${describeProposal(proposal)}`, { source: 'safety' })
  }
  return {
    answer: text,
    blocks: { title: 'Cuidado com dor ou lesão', reason: text, workout: null, careNotes: [] },
    actions: [ACTION.COPY],
    suggestion: null,
    source: 'safety',
    relatedMuscleGroup: null,
    relatedWorkout: null,
  }
}

function aiAnswer(ai, context) {
  const activePlan = activePlanOf(context)
  if (ai.proposta && activePlan) {
    const proposal = buildEditProposal(activePlan, ai.proposta, exercises)
    if (proposalHasChanges(proposal)) {
      return proposalResult(proposal, ai.resposta, { source: 'ia' })
    }
    const notes = proposal.skipped.map((s) => `• ${s.motivo}`).join('\n')
    return {
      answer: `${ai.resposta}${notes ? `\n\n**Não apliquei as mudanças sugeridas:**\n${notes}` : ''}`,
      blocks: null,
      actions: [ACTION.COPY],
      suggestion: null,
      source: 'ia',
    }
  }
  const noPlan = ai.proposta && !activePlan
    ? '\n\nVocê ainda não tem planilha ativa. Peça, por exemplo: "monte um treino para 4 dias".'
    : ''
  return {
    answer: `${ai.resposta}${noPlan}`,
    blocks: null,
    actions: [ACTION.COPY],
    suggestion: null,
    source: 'ia',
  }
}

/**
 * Entrada principal do Coach.
 * Ordem: dor/lesão (local) → montar planilha (motor) → agenda/hoje (local) → IA.
 */
export async function askCoach(question, context = {}) {
  const q = String(question || '').trim()
  const appIntent = parseAppVoiceCommand(q)
  const pain = detectPainMention(q)

  if (pain.triggered) return answerPain(context, pain, appIntent)
  if (appIntent.domain === 'build') return answerPlanBuild(context, appIntent.slots || {}, q)
  if (appIntent.domain === 'schedule') return answerScheduleVoice(context, appIntent)
  if (appIntent.domain === 'query' || appIntent.domain === 'train') return getTodaySuggestion(context)

  const intent = matchIntent(q)
  if (['body_guard', 'body', 'today'].includes(intent.type)) return localAnswer(intent, context, q)

  try {
    const ai = await requestCoachAI({
      question: q,
      mode: 'chat',
      context: buildCoachAIContext(context),
      catalog: buildCatalogDigest(exercises, { location: context.profile?.location }),
    })
    return aiAnswer(ai, context)
  } catch (err) {
    const failure = coachFailure(q, err?.code)
    const local = await localAnswer(intent, context, q)
    if (!local) return failure
    return {
      ...local,
      answer: `Não consegui falar com a IA agora; segue a resposta do motor local.\n\n${local.answer}`,
      failed: true,
      retryQuestion: q,
      errorCode: failure.errorCode,
      source: 'local',
    }
  }
}

/** Respostas locais concretas; null quando só a IA saberia responder. */
async function localAnswer(intent, context, question) {
  switch (intent.type) {
    case 'body_guard':
      return makeResult({
        title: 'Espelho Evolutivo',
        reason:
          'Eu não avalio aparência. Se quiser, pergunte como suas medidas evoluíram no Espelho Evolutivo — eu respondo só com os números registrados.',
        careNotes: ['Nenhuma frase daqui é diagnóstico ou recomendação para mudar o corpo.'],
      })
    case 'body':
      return answerBodyEvolution(context)
    case 'today':
      return getTodaySuggestion(context)
    case 'plan':
      if (/ajust|adapt|reduz|troc|substitu|remov|tir[ae]/i.test(question)) return null
      return answerPlanBuild(context, {}, question)
    case 'explain': {
      const pending = context.workouts?.find((w) => w.status === 'Pendente')
      const exId = pending?.exercises?.[0]?.exerciseId
      if (exId) return explainExercise(exId, context)
      return null
    }
    case 'home':
      return createHomeWorkoutSuggestion(context)
    case 'short':
      return createShortWorkoutSuggestion(context, 30)
    case 'recovery':
      return createRecoverySuggestion(context)
    case 'split':
      return {
        answer: withSafety(
          [
            '## Empurrar, Puxar e Pernas',
            '',
            'Divisão clássica e equilibrada:',
            '',
            '• **Empurrar:** peito, ombros, tríceps',
            '• **Puxar:** costas, bíceps',
            '• **Pernas:** quadríceps, posterior, glúteos',
            '',
            'Com 3 dias/semana, alterne Empurrar → Puxar → Pernas com pelo menos 1 dia de descanso entre sessões do mesmo grupo. Com mais dias, repita o ciclo sem acumular fadiga excessiva.',
            '',
            '**Cuidados:**',
            formatList([
              'Não treine o mesmo grupo em dias seguidos com alto volume.',
              'Priorize técnica antes de aumentar carga.',
              'Inclua mobilidade e sono adequado na rotina.',
            ]),
          ].join('\n'),
        ),
        blocks: buildBlocks({
          title: 'Empurrar, Puxar e Pernas',
          reason: 'Divisão clássica para equilibrar empurrar, puxar e pernas ao longo da semana.',
          careNotes: [
            'Não treine o mesmo grupo em dias seguidos com alto volume.',
            'Priorize técnica antes de aumentar carga.',
          ],
        }),
        actions: [ACTION.COPY],
        suggestion: null,
        relatedMuscleGroup: null,
        relatedWorkout: null,
      }
    default:
      return null
  }
}

export { planToWorkouts, ACTION as CoachAction }
