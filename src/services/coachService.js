/**
 * Coach IA — motor local/simulado (sem API keys no frontend).
 *
 * Futuro (Supabase Edge Function / API segura):
 * - Mover geração de respostas para uma Edge Function (ex.: `coach-ai`)
 * - O React deve apenas enviar { question, contextSummary } e receber { answer, blocks, actions }
 * - NUNCA colocar chaves de OpenAI/Anthropic/etc. no bundle React
 * - Persistir histórico em tabela `coach_messages` com user_id quando auth existir
 *
 * Exemplo futuro:
 *   const { data, error } = await supabase.functions.invoke('coach-ai', {
 *     body: { question, context: summarizeContext(context) },
 *   })
 */

import { exercises, getExerciseById } from '../data/exercisesData'
import { objectiveLabels } from '../data/workoutTemplates'
import { generateWorkoutPlan as buildPlan, planToWorkouts } from '../utils/workoutGenerator'

// Futuro: import { supabase } from '../lib/supabaseClient'

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

function delay(ms = 420) {
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
  return history[0] || null
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

function persistMessages(messages) {
  const capped = messages.slice(0, 80)
  localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(capped))
  return capped
}

/**
 * Persiste par pergunta/resposta no formato role-based.
 * Shape: { id, role, content, createdAt, actions, relatedWorkout }
 */
export function saveCoachExchange(question, result) {
  const now = new Date().toISOString()
  const userMsg = {
    id: uid('user'),
    role: 'user',
    content: question,
    createdAt: now,
    actions: null,
    relatedWorkout: null,
  }
  const coachMsg = {
    id: uid('coach'),
    role: 'coach',
    content: result.answer,
    createdAt: now,
    actions: result.actions || [ACTION.COPY],
    relatedWorkout: result.relatedWorkout || result.suggestion?.data || null,
    blocks: result.blocks || null,
    suggestion: result.suggestion || null,
    relatedMuscleGroup: result.relatedMuscleGroup || null,
  }

  const messages = loadCoachMessages()
  const next = [coachMsg, userMsg, ...messages]
  persistMessages(next)
  return { userMsg, coachMsg }
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
 * Resumo inteligente para os cards da UI (sem chamar “IA”).
 */
export function getCoachSummary(context = {}) {
  const { profile, workouts = [], history = [], performance } = context
  const last = getLastSession(history)
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const days = daysSince(last?.completedAt || last?.date)
  const pending = workouts.filter((w) => w.status === 'Pendente')
  const hasData = Boolean(profile?.objective || workouts.length || history.length)

  let nextSuggestion = 'Treino equilibrado e moderado'
  let recommendedGroup = 'Corpo inteiro'
  let attention =
    'Respeite limites, aqueça bem e pare se sentir dor. Progresso consistente vale mais que intensidade excessiva.'

  if (!hasData) {
    nextSuggestion = 'Comece com um treino completo leve'
    recommendedGroup = 'Corpo inteiro'
    attention = 'Sem histórico ainda — comece com volume moderado e foque na técnica.'
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
          name: last.name || 'Treino anterior',
          date: last.completedAt || last.date || null,
          muscles: lastMuscles,
        }
      : null,
    recommendedGroup,
    attention,
    hasData,
  }
}

export async function getTodaySuggestion(context = {}) {
  await delay()

  const { profile = {}, workouts = [], history = [], performance } = context
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const daysSinceLast = daysSince(history[0]?.completedAt || history[0]?.date)
  const objective = objectiveLabels[profile?.objective] || 'Saúde geral'
  const pending = workouts.filter((w) => w.status === 'Pendente')
  const hasData = Boolean(profile?.objective || workouts.length || history.length)

  let title = 'Treino equilibrado'
  let focus = ['Peitoral', 'Costas', 'Pernas']
  let reason = hasData
    ? `Com base no seu objetivo (${objective}) e nível ${profile?.level || 'Iniciante'}, sugiro uma sessão equilibrada e moderada.`
    : 'Ainda não há histórico suficiente. Sugestão genérica segura: treino completo leve, com foco em técnica e recuperação.'

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
    title = 'Dia de puxar (Pull)'
    focus = ['Costas', 'Bíceps']
    reason = 'Como o último treino foi de empurrar (peito, ombros, tríceps), hoje faz sentido trabalhar costas e bíceps.'
  } else if (lastSplit === 'pull') {
    title = 'Dia de pernas'
    focus = ['Pernas', 'Glúteos']
    reason = 'Após puxar, o próximo passo natural no split é pernas — quadríceps, posterior e glúteos.'
  } else if (lastSplit === 'legs') {
    title = 'Dia de empurrar (Push)'
    focus = ['Peitoral', 'Ombros', 'Tríceps']
    reason = 'Depois de pernas, retome o ciclo com empurrar para manter equilíbrio entre grupos.'
  } else if (pending.length) {
    const next = performance?.nextWorkout || pending[0]
    return makeResult({
      title: `Seguir planilha: ${next.name}`,
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

export async function generateWorkoutPlan(context = {}, options = {}) {
  await delay()

  const { profile = {} } = context
  const home = options.home || profile.location === 'Casa'

  const plan = buildPlan({
    objective: profile?.objective || 'saude',
    level: profile?.level || 'Iniciante',
    daysPerWeek: profile?.daysPerWeek || 3,
    duration: options.minutes || profile?.duration || 45,
    location: home ? 'Casa' : profile?.location || 'Academia',
    equipment: home ? HOME_EQUIPMENT : profile?.equipment || ['Academia completa'],
    restrictions: profile?.restrictions || [],
  })

  const summary = plan.schedule
    .map((day) => `• **${day.name}**: ${day.exercises.map((e) => e.name).join(', ')}`)
    .join('\n')

  const firstDay = plan.schedule[0]
  const sampleWorkout = firstDay
    ? {
        id: `coach-day-${Date.now()}`,
        name: firstDay.name,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: firstDay.focus || [],
        status: 'Pendente',
        estimatedMinutes: plan.duration,
        source: 'coach-ia',
        exercises: (firstDay.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId || ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup || ex.category,
          sets: ex.sets || 3,
          reps: ex.reps || '10-12',
          restSeconds: ex.restSeconds || 75,
          load: '',
        })),
        createdAt: new Date().toISOString(),
      }
    : null

  const title = `Planilha de ${plan.daysPerWeek} dias`
  const reason = `Montei uma divisão para ${plan.objectiveLabel}, nível ${plan.level}, com sessões de ~${plan.duration} min${
    home ? ' adaptada para casa' : ''
  }. Você pode salvar a planilha inteira ou iniciar o primeiro dia.`

  const answer = withSafety(
    [
      `## ${title}`,
      '',
      reason,
      '',
      '**Divisão sugerida:**',
      summary,
      '',
      sampleWorkout ? formatWorkoutBlock(sampleWorkout) : '',
      '',
      '**Cuidados:**',
      formatList([
        'Comece com cargas confortáveis e evolua aos poucos.',
        'Inclua pelo menos 1 dia de descanso na semana.',
        plan.disclaimer || 'Este plano é informativo e não substitui orientação profissional.',
      ]),
    ]
      .filter(Boolean)
      .join('\n'),
  )

  return {
    answer,
    blocks: buildBlocks({
      title,
      reason,
      workout: sampleWorkout,
      careNotes: [
        'Comece com cargas confortáveis e evolua aos poucos.',
        'Inclua pelo menos 1 dia de descanso na semana.',
        'Pare se sentir dor e priorize a técnica.',
      ],
    }),
    actions: [ACTION.SAVE, ACTION.START, ACTION.RELATED, ACTION.VARIATION, ACTION.COPY],
    suggestion: { type: 'plan', data: plan, sampleWorkout },
    relatedMuscleGroup: sampleWorkout?.muscleGroups?.[0] || null,
    relatedWorkout: sampleWorkout,
  }
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
        'Não encontrei esse exercício na biblioteca. Escolha um da lista ou digite o nome com mais detalhes.',
      workout: null,
      careNotes: ['Use o seletor de exercícios ou a biblioteca para escolher um movimento.'],
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
      answer: withSafety(
        'Você não tem treinos pendentes na planilha. Criei uma sugestão de planilha completa para começar.\n\n' +
          planResult.answer.split('---')[0].trim(),
      ),
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

  return null
}

function matchIntent(question) {
  const q = question.toLowerCase()

  if (/descans|mobilidade|recupera|cansad|fadig|sem energia/.test(q)) return { type: 'recovery' }
  if (/30\s*min|pouco tempo|treino curto|r[aá]pid/.test(q)) return { type: 'short' }
  if (/casa|halter|home|el[aá]stico/.test(q)) return { type: 'home' }
  if (/trocar|substituir|alterar exerc/.test(q)) return { type: 'swap' }
  if (/push|pull|legs|ppl|divis[aã]o|organizar/.test(q)) return { type: 'split' }
  if (/qual grupo|treinar hoje|o que treinar|hoje\??$/.test(q)) return { type: 'today' }
  if (/montar|criar|gerar|planilha|treino personalizado/.test(q)) return { type: 'plan' }
  if (/explic|como faz|para que serve/.test(q)) return { type: 'explain' }
  if (/ajust|adapt|reduz|volume|academia/.test(q)) return { type: 'adjust' }

  return { type: 'general' }
}

/**
 * Entrada principal do Coach (local/simulado).
 * Futuro: substituir o corpo por chamada à Edge Function segura — sem API key no React.
 */
export async function askCoach(question, context = {}) {
  await delay()

  // Futuro (Supabase Edge Function):
  // const { data, error } = await supabase.functions.invoke('coach-ai', {
  //   body: { question, context: summarizeContext(context) },
  // })
  // if (!error && data?.answer) return data

  const intent = matchIntent(question)

  switch (intent.type) {
    case 'today':
      return getTodaySuggestion(context)
    case 'plan':
      return generateWorkoutSuggestion(context)
    case 'explain': {
      const pending = context.workouts?.find((w) => w.status === 'Pendente')
      const exId = pending?.exercises?.[0]?.exerciseId
      if (exId) return explainExercise(exId, context)
      return explainExercise(exercises[0]?.id, context)
    }
    case 'adjust':
      return adjustWorkoutPlan(context, 'trocar')
    case 'swap':
      return adjustWorkoutPlan(context, 'trocar')
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
            '## Push, Pull e Legs (PPL)',
            '',
            'Divisão clássica e equilibrada:',
            '',
            '• **Push:** peito, ombros, tríceps',
            '• **Pull:** costas, bíceps',
            '• **Legs:** quadríceps, posterior, glúteos',
            '',
            'Com 3 dias/semana, alterne Push → Pull → Legs com pelo menos 1 dia de descanso entre sessões do mesmo grupo. Com mais dias, repita o ciclo sem acumular fadiga excessiva.',
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
          title: 'Push, Pull e Legs (PPL)',
          reason: 'Divisão clássica para equilibrar empurrar, puxar e pernas ao longo da semana.',
          careNotes: [
            'Não treine o mesmo grupo em dias seguidos com alto volume.',
            'Priorize técnica antes de aumentar carga.',
          ],
        }),
        actions: [ACTION.SAVE, ACTION.COPY],
        suggestion: null,
        relatedMuscleGroup: null,
        relatedWorkout: null,
      }
    default: {
      const hasData = Boolean(context.profile?.objective || context.workouts?.length || context.history?.length)
      const objective = objectiveLabels[context.profile?.objective] || 'saúde geral'
      return makeResult({
        title: 'Orientação geral',
        reason: hasData
          ? `Entendi sua dúvida sobre "${question}". Com seu perfil (${objective}, nível ${context.profile?.level || 'Iniciante'}, ${context.profile?.daysPerWeek || 3}x/semana), recomendo manter consistência, variar grupos musculares e ajustar carga gradualmente. Use os atalhos para montar treino, ver sugestão de hoje ou ajustar a planilha.`
          : `Entendi sua dúvida sobre "${question}". Ainda há poucos dados locais — use os atalhos para montar um treino seguro e genérico, ou preencha o perfil para sugestões mais alinhadas à sua rotina.`,
        workout: null,
        careNotes: [
          'Evite promessas de resultados rápidos — evolução é gradual.',
          'Não treine através da dor.',
          'Consistência moderada supera volume excessivo.',
        ],
        extraActions: [ACTION.COPY],
      })
    }
  }
}

export { planToWorkouts, ACTION as CoachAction }
