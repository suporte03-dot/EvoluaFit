import { exercises, getExerciseById } from '../data/exercisesData'
import { objectiveLabels } from '../data/workoutTemplates'
import { generateWorkoutPlan as buildPlan, planToWorkouts } from '../utils/workoutGenerator'

// Futuro: importar supabase e chamar Edge Function
// import { supabase } from '../lib/supabaseClient'

const COACH_STORAGE_KEY = 'evoluafit-coach-messages'

/**
 * Tabela Supabase sugerida para futuro:
 * coach_messages (id uuid, user_id uuid, question text, answer text, created_at timestamptz)
 */

export const COACH_SAFETY_FOOTER = [
  'Este plano é informativo e não substitui orientação profissional.',
  'Respeite seus limites e pare em caso de dor.',
  'Em caso de lesão, dor persistente ou condição médica, procure um profissional de educação física ou saúde.',
  'Progresso saudável é gradual — evite treino excessivo ou comparações com terceiros.',
].join(' ')

const QUICK_PROMPTS = {
  montarTreino: 'Monte um treino personalizado para mim com base no meu perfil.',
  hoje: 'O que devo treinar hoje?',
  ajustar: 'Preciso ajustar minha planilha atual.',
  explicar: 'Quero entender melhor um exercício da minha rotina.',
}

const PUSH_MUSCLES = ['Peito', 'Ombros', 'Tríceps']
const PULL_MUSCLES = ['Costas', 'Bíceps']
const LEG_MUSCLES = ['Quadríceps', 'Posterior', 'Glúteos']

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatList(items) {
  return items.map((item) => `• ${item}`).join('\n')
}

function withSafety(body) {
  return `${body.trim()}\n\n---\n${COACH_SAFETY_FOOTER}`
}

function getLastSessionMuscles(history = []) {
  const last = history[0]
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
  return Math.floor((Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24))
}

function pickAlternatives(exercise, count = 3) {
  return exercises
    .filter(
      (ex) =>
        ex.id !== exercise.id &&
        ex.category === exercise.category &&
        ex.level === exercise.level,
    )
    .slice(0, count)
}

function buildShortWorkout(profile, focus, minutes = 30) {
  const maxExercises = minutes <= 25 ? 3 : 4
  const pool = exercises.filter(
    (ex) =>
      focus.includes(ex.category) &&
      (profile.location === 'Casa'
        ? ['Peso corporal', 'Halteres', 'Elástico'].includes(ex.equipment)
        : true),
  )

  const selected = pool.slice(0, maxExercises)
  const today = new Date().toISOString().split('T')[0]

  return {
    id: `coach-workout-${Date.now()}`,
    name: `Treino rápido — ${focus.slice(0, 2).join(' + ')}`,
    date: today,
    muscleGroups: focus,
    status: 'Pendente',
    estimatedMinutes: minutes,
    exercises: selected.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.category,
      sets: minutes <= 25 ? 3 : 4,
      reps: ex.reps,
      restSeconds: 60,
      load: '',
    })),
    createdAt: new Date().toISOString(),
  }
}

export function loadCoachMessages() {
  try {
    const raw = localStorage.getItem(COACH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCoachMessage(question, answer) {
  const messages = loadCoachMessages()
  const entry = {
    id: `msg-${Date.now()}`,
    question,
    answer,
    createdAt: new Date().toISOString(),
  }
  const next = [entry, ...messages].slice(0, 50)
  localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(next))
  return entry
}

export function clearCoachMessages() {
  localStorage.removeItem(COACH_STORAGE_KEY)
}

// Futuro: persistir no Supabase quando auth estiver ativo
// async function persistCoachMessage(userId, question, answer) {
//   await supabase.from('coach_messages').insert({ user_id: userId, question, answer })
// }

export async function getTodaySuggestion(context) {
  await delay()

  const { profile, workouts, history, performance } = context
  const lastMuscles = getLastSessionMuscles(history)
  const lastSplit = detectSplit(lastMuscles)
  const streak = performance?.streak ?? 0
  const daysSinceLast = daysSince(history[0]?.completedAt)
  const objective = objectiveLabels[profile?.objective] || 'Saúde geral'
  const pending = workouts.filter((w) => w.status === 'Pendente')

  let title = 'Treino equilibrado'
  let focus = ['Peito', 'Costas', 'Quadríceps']
  let rationale = `Com base no seu objetivo (${objective}) e nível ${profile?.level || 'Iniciante'}, sugiro um treino completo e moderado.`

  if (streak >= 4 || daysSinceLast < 1) {
    title = 'Descanso ativo ou mobilidade'
    focus = ['Mobilidade', 'Cardio']
    rationale =
      'Você treinou vários dias seguidos ou fez sessão recente. Priorize recuperação: caminhada leve, alongamento ou mobilidade de 20–30 min.'
  } else if (lastSplit === 'push') {
    title = 'Dia de Pull'
    focus = ['Costas', 'Bíceps']
    rationale = 'Como o último treino foi de Push (peito, ombros, tríceps), hoje faz sentido trabalhar costas e bíceps.'
  } else if (lastSplit === 'pull') {
    title = 'Dia de Pernas'
    focus = ['Quadríceps', 'Posterior', 'Glúteos']
    rationale = 'Após Pull, o próximo passo natural no split é pernas — quadríceps, posterior e glúteos.'
  } else if (lastSplit === 'legs') {
    title = 'Dia de Push'
    focus = ['Peito', 'Ombros', 'Tríceps']
    rationale = 'Depois de pernas, retome o ciclo com Push para manter equilíbrio entre grupos musculares.'
  } else if (pending.length) {
    const next = performance?.nextWorkout || pending[0]
    return {
      answer: withSafety(
        `Hoje sugiro seguir sua planilha: **${next.name}**.\n\nGrupos: ${(next.muscleGroups || []).join(', ') || 'variados'}.\nDuração estimada: ${next.estimatedMinutes || profile?.duration || 45} min.\n\nAqueça 5–10 min antes e mantenha técnica controlada.`,
      ),
      suggestion: { type: 'workout', data: next },
    }
  }

  const workout = buildShortWorkout(profile || {}, focus, profile?.duration || 45)

  return {
    answer: withSafety(`${rationale}\n\n**Sugestão:** ${title}\n\nGrupos: ${focus.join(', ')}\n\nExercícios sugeridos:\n${formatList(workout.exercises.map((e) => e.name))}`),
    suggestion: { type: 'workout', data: workout },
  }
}

export async function generateWorkoutPlan(context) {
  await delay()

  const { profile } = context
  const plan = buildPlan({
    objective: profile?.objective || 'saude',
    level: profile?.level || 'Iniciante',
    daysPerWeek: profile?.daysPerWeek || 3,
    duration: profile?.duration || 45,
    location: profile?.location || 'Academia',
    equipment: profile?.equipment || ['Academia completa'],
    restrictions: profile?.restrictions || [],
  })

  const summary = plan.schedule
    .map((day) => `• ${day.name}: ${day.exercises.map((e) => e.name).join(', ')}`)
    .join('\n')

  return {
    answer: withSafety(
      `Montei uma planilha de **${plan.daysPerWeek} dias** para ${plan.objectiveLabel}, nível ${plan.level}, com sessões de ~${plan.duration} min.\n\n**Divisão:**\n${summary}\n\n${plan.disclaimer}`,
    ),
    suggestion: { type: 'plan', data: plan },
  }
}

export async function explainExercise(exerciseId) {
  await delay()

  const exercise = getExerciseById(exerciseId)
  if (!exercise) {
    return {
      answer: withSafety('Não encontrei esse exercício. Escolha um da biblioteca ou digite o nome com mais detalhes.'),
    }
  }

  const alternatives = pickAlternatives(exercise)
  const steps = exercise.executionSteps || exercise.execution || []
  const benefits = exercise.benefits || []
  const mistakes = exercise.commonMistakes || []
  const safety = exercise.safetyTips || []

  const body = [
    `## ${exercise.name}`,
    '',
    `**Para que serve:** ${exercise.shortInstruction || steps[0] || 'Fortalecimento e condicionamento muscular.'}`,
    '',
    `**Músculos trabalhados:** ${(exercise.muscles || [exercise.category]).join(', ')}`,
    '',
    '**Como executar:**',
    formatList(steps.length ? steps : ['Posicione-se com postura neutra.', 'Execute o movimento de forma controlada.', 'Respire de forma ritmada.']),
    '',
    benefits.length ? `**Benefícios:**\n${formatList(benefits)}` : '',
    mistakes.length ? `**Erros comuns:**\n${formatList(mistakes)}` : '',
    safety.length ? `**Cuidados:**\n${formatList(safety)}` : '',
    alternatives.length
      ? `**Alternativas:** ${alternatives.map((a) => a.name).join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    answer: withSafety(body),
    exerciseId: exercise.id,
    suggestion: alternatives.length
      ? { type: 'exercise', data: alternatives[0] }
      : undefined,
  }
}

export async function adjustWorkoutPlan(context, adjustment = 'geral') {
  await delay()

  const { profile, workouts } = context
  const pending = workouts.find((w) => w.status === 'Pendente')

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

  let answer = ''
  let suggestion

  switch (adjustment) {
    case 'casa':
      answer = `Adaptei **${pending.name}** para treino em casa com halteres, elástico e peso corporal. Volume reduzido em 1 série por exercício.`
      suggestion = {
        type: 'workout',
        data: {
          ...pending,
          id: `coach-adj-${Date.now()}`,
          name: `${pending.name} (Casa)`,
          estimatedMinutes: Math.max(25, (pending.estimatedMinutes || 45) - 10),
          exercises: pending.exercises
            .map((ex) => {
              const full = getExerciseById(ex.exerciseId)
              const alt = exercises.find(
                (e) =>
                  e.category === (full?.category || ex.muscleGroup) &&
                  ['Peso corporal', 'Halteres', 'Elástico'].includes(e.equipment),
              )
              if (!alt) return { ...ex, sets: Math.max(2, ex.sets - 1) }
              return {
                exerciseId: alt.id,
                name: alt.name,
                muscleGroup: alt.category,
                sets: Math.max(2, ex.sets - 1),
                reps: alt.reps,
                restSeconds: ex.restSeconds,
                load: '',
              }
            })
            .slice(0, 5),
        },
      }
      break

    case 'academia':
      answer = `Versão para academia de **${pending.name}** com equipamentos completos e volume padrão.`
      suggestion = { type: 'workout', data: { ...pending, id: `coach-adj-${Date.now()}` } }
      break

    case 'volume':
      answer = `Reduzi o volume de **${pending.name}** em 1 série por exercício para facilitar a recuperação.`
      suggestion = {
        type: 'workout',
        data: {
          ...pending,
          id: `coach-adj-${Date.now()}`,
          exercises: pending.exercises.map((ex) => ({
            ...ex,
            sets: Math.max(2, ex.sets - 1),
          })),
        },
      }
      break

    case 'duracao':
      answer = `Treino enxuto de ~30 min baseado em **${pending.name}**, com 3 exercícios principais.`
      suggestion = {
        type: 'workout',
        data: buildShortWorkout(
          { ...profile, duration: 30 },
          pending.muscleGroups || ['Peito', 'Costas'],
          30,
        ),
      }
      break

    case 'trocar':
    default: {
      const first = pending.exercises[0]
      const full = getExerciseById(first?.exerciseId)
      const alts = full ? pickAlternatives(full, 1) : []
      if (alts.length) {
        answer = `Sugiro trocar **${first.name}** por **${alts[0].name}** no treino ${pending.name} — mesmo grupo muscular (${alts[0].category}).`
        suggestion = {
          type: 'workout',
          data: {
            ...pending,
            id: `coach-adj-${Date.now()}`,
            exercises: pending.exercises.map((ex, i) =>
              i === 0
                ? {
                    exerciseId: alts[0].id,
                    name: alts[0].name,
                    muscleGroup: alts[0].category,
                    sets: ex.sets,
                    reps: alts[0].reps,
                    restSeconds: ex.restSeconds,
                    load: '',
                  }
                : ex,
            ),
          },
        }
      } else {
        answer = `Não encontrei alternativa direta para ${first?.name || 'o exercício'}. Considere reduzir carga ou amplitude.`
      }
    }
  }

  return { answer: withSafety(answer), suggestion }
}

function matchIntent(question) {
  const q = question.toLowerCase()

  if (/30\s*min|pouco tempo|treino curto|rápid/.test(q)) return { type: 'short' }
  if (/casa|halter|home/.test(q)) return { type: 'home' }
  if (/cansad|fadig|sem energia|descans/.test(q)) return { type: 'tired' }
  if (/trocar|substituir|alterar exerc/.test(q)) return { type: 'swap' }
  if (/push|pull|legs|ppl|divisão|organizar/.test(q)) return { type: 'split' }
  if (/qual grupo|treinar hoje|o que treinar/.test(q)) return { type: 'today' }
  if (/montar|criar|gerar|planilha|treino/.test(q)) return { type: 'plan' }
  if (/explic|como faz|para que serve/.test(q)) return { type: 'explain' }
  if (/ajust|adapt|reduz|volume|academia/.test(q)) return { type: 'adjust' }

  return { type: 'general' }
}

export async function askCoach(question, context) {
  await delay()

  // Futuro: chamar Supabase Edge Function
  // const { data } = await supabase.functions.invoke('coach-ai', { body: { question, context } })
  // if (data?.answer) return data

  const intent = matchIntent(question)

  switch (intent.type) {
    case 'today':
      return getTodaySuggestion(context)
    case 'plan':
      return generateWorkoutPlan(context)
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
      return adjustWorkoutPlan(context, 'casa')
    case 'short': {
      const { profile } = context
      const workout = buildShortWorkout(
        profile || {},
        ['Peito', 'Costas', 'Abdômen'],
        30,
      )
      return {
        answer: withSafety(
          `Com apenas 30 minutos, sugiro um circuito curto e eficiente:\n\n${formatList(workout.exercises.map((e) => `${e.name} — ${e.sets}x${e.reps}`))}\n\nMantenha descansos curtos (45–60s) e aquecimento de 5 min.`,
        ),
        suggestion: { type: 'workout', data: workout },
      }
    }
    case 'tired':
      return {
        answer: withSafety(
          'Quando está cansado, priorize recuperação:\n\n• Caminhada leve 20–30 min\n• Alongamento ou mobilidade (gato-vaca, rotação torácica)\n• Sono e hidratação adequados\n\nSe treinar, use cargas leves e evite falha muscular. Descanso também é parte do progresso.',
        ),
      }
    case 'split':
      return {
        answer: withSafety(
          '**Push, Pull e Legs (PPL)** é uma divisão clássica:\n\n• **Push:** peito, ombros, tríceps\n• **Pull:** costas, bíceps\n• **Legs:** quadríceps, posterior, glúteos\n\nCom 3 dias/semana, alterne Push → Pull → Legs com pelo menos 1 dia de descanso entre sessões do mesmo grupo. Com mais dias, repita o ciclo.',
        ),
      }
    default: {
      const objective = objectiveLabels[context.profile?.objective] || 'saúde geral'
      return {
        answer: withSafety(
          `Entendi sua dúvida sobre "${question}".\n\nCom seu perfil (${objective}, nível ${context.profile?.level || 'Iniciante'}, ${context.profile?.daysPerWeek || 3}x/semana), recomendo manter consistência, variar grupos musculares e ajustar carga gradualmente.\n\nUse os botões rápidos para montar treino, ver sugestão de hoje ou ajustar a planilha.`,
        ),
      }
    }
  }
}

export { QUICK_PROMPTS, planToWorkouts }
