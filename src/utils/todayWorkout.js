import { isCompletedSession } from './completedSession'

function toDateKey(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10)
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function startOfWeek(ref = new Date()) {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function endOfWeek(ref = new Date()) {
  const start = startOfWeek(ref)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return end
}

function isPendingStatus(status) {
  const s = String(status || '').toLowerCase()
  return s === 'pendente' || s === 'parcial' || s === 'planejado' || s === 'planned' || s === 'pending' || s === 'partial'
}

function isDoneStatus(status) {
  const s = String(status || '').toLowerCase()
  return s === 'realizado' || s === 'completed' || s === 'done'
}

function isRestWorkout(w) {
  if (w?.isRest) return true
  const name = String(w?.name || w?.workoutType || '').toLowerCase()
  return /descanso|recuper/.test(name)
}

/**
 * Pick the best workout for "today" from scheduled workouts + history.
 */
export function resolveTodayWorkout({ workouts = [], history = [], plans = [] } = {}) {
  const today = toDateKey(new Date())
  const list = (workouts || []).filter((w) => w && !isRestWorkout(w))

  const scheduledToday = list.find(
    (w) => toDateKey(w.date) === today && isPendingStatus(w.status),
  )
  if (scheduledToday) {
    return { workout: scheduledToday, situation: 'ready' }
  }

  const doneToday =
    list.find((w) => toDateKey(w.completedAt || w.date) === today && isDoneStatus(w.status)) ||
    (history || []).find((h) => toDateKey(h.completedAt) === today)
  if (doneToday) {
    const asWorkout =
      doneToday.exercises && doneToday.name
        ? doneToday
        : list.find((w) => w.id === doneToday.workoutId) || doneToday
    return { workout: asWorkout, situation: 'completed' }
  }

  const partialToday = list.find(
    (w) => toDateKey(w.date) === today && String(w.status).toLowerCase() === 'parcial',
  )
  if (partialToday) {
    return { workout: partialToday, situation: 'partial' }
  }

  const nextPending = list
    .filter((w) => isPendingStatus(w.status))
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))[0]

  const lastHistory = (history || []).find((h) => isCompletedSession(h))
  const daysSinceLast = lastHistory?.completedAt
    ? Math.floor((Date.now() - new Date(lastHistory.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const hasPlan = Boolean(plans?.length) || list.length > 0

  if (!hasPlan) {
    return { workout: null, situation: 'no_plan' }
  }

  if (daysSinceLast != null && daysSinceLast >= 5) {
    return {
      workout: nextPending || null,
      situation: 'returning',
      daysSinceLast,
    }
  }

  if (!nextPending) {
    return { workout: null, situation: 'no_workout_today' }
  }

  // Has plan but nothing scheduled specifically for today
  if (toDateKey(nextPending.date) !== today) {
    return { workout: nextPending, situation: 'no_workout_today', nextWorkout: nextPending }
  }

  return { workout: nextPending, situation: 'ready' }
}

/**
 * Weekly progress from history + completed workouts.
 */
export function getWeeklyProgress({ workouts = [], history = [], profile = {}, goals = [] } = {}) {
  const start = startOfWeek()
  const end = endOfWeek()

  const completedFromHistory = (history || []).filter((h) => {
    if (!isCompletedSession(h)) return false
    const d = new Date(h.completedAt || h.date)
    return d >= start && d < end
  })

  const completedIds = new Set(completedFromHistory.map((h) => h.workoutId).filter(Boolean))
  const completedFromWorkouts = (workouts || []).filter((w) => {
    if (!isDoneStatus(w.status)) return false
    const d = new Date(w.completedAt || w.date)
    if (!(d >= start && d < end)) return false
    if (w.id && completedIds.has(w.id)) return false
    return true
  })

  const completedCount = completedFromHistory.length + completedFromWorkouts.length

  const goalFromGoals = goals?.find((g) => g.type === 'weekly_workouts')?.target
  const weeklyGoal = goalFromGoals || profile?.daysPerWeek || null

  const pendingThisWeek = (workouts || []).filter((w) => {
    if (isRestWorkout(w) || !isPendingStatus(w.status)) return false
    const d = new Date(w.date)
    return d >= start && d < end
  }).length

  const plannedTotal =
    weeklyGoal ||
    (pendingThisWeek + completedCount > 0 ? pendingThisWeek + completedCount : null)

  return {
    completedCount,
    weeklyGoal: plannedTotal,
    pendingThisWeek,
  }
}

export function weeklyProgressSentence(progress) {
  const { completedCount, weeklyGoal } = progress || {}
  if (weeklyGoal != null && weeklyGoal > 0) {
    return `Você concluiu ${completedCount} de ${weeklyGoal} treinos nesta semana.`
  }
  if (completedCount > 0) {
    return `Você concluiu ${completedCount} ${completedCount === 1 ? 'treino' : 'treinos'} nesta semana.`
  }
  return 'Sua semana ainda está em branco — o primeiro treino acende a trilha.'
}

export function weeklyGoalPathSentence(progress) {
  const { completedCount = 0, weeklyGoal } = progress || {}
  if (!(weeklyGoal > 0)) return null
  const remaining = Math.max(0, weeklyGoal - completedCount)
  if (remaining === 0 && completedCount > 0) {
    return 'Você atingiu a meta desta semana.'
  }
  if (remaining === 1) {
    return 'Falta 1 treino para completar sua meta semanal.'
  }
  if (completedCount > 0) {
    return 'Você está no caminho certo para atingir sua meta desta semana.'
  }
  return `Meta desta semana: ${weeklyGoal} ${weeklyGoal === 1 ? 'treino' : 'treinos'}.`
}

export function situationCopy(situation, { daysSinceLast, nextWorkout } = {}) {
  switch (situation) {
    case 'no_plan':
      return {
        label: 'Comece por aqui',
        title: 'Ainda sem planilha',
        description: 'Monte uma rotina e o treino de hoje aparece aqui.',
        primaryLabel: 'Criar planilha',
        primarySection: 'planilha',
        secondaryLabel: 'Falar com o Coach',
        secondarySection: 'coach-ia',
      }
    case 'no_workout_today':
      return {
        label: 'Hoje',
        title: nextWorkout ? 'Nada agendado para hoje' : 'Escolha o próximo passo',
        description: nextWorkout
          ? `Próximo na planilha: ${nextWorkout.name}.`
          : 'Abra a planilha e defina o próximo treino.',
        primaryLabel: nextWorkout ? 'Ver próximo treino' : 'Abrir calendário',
        primarySection: nextWorkout ? 'treinos' : 'calendario',
        secondaryLabel: 'Criar planilha',
        secondarySection: 'planilha',
      }
    case 'completed':
      return {
        label: 'Hoje',
        title: 'Treino de hoje concluído',
        description: 'Boa sessão. Priorize recuperação e volte quando estiver pronto.',
        primaryLabel: 'Ver evolução',
        primarySection: 'desempenho',
        secondaryLabel: 'Ver calendário',
        secondarySection: 'calendario',
      }
    case 'partial':
      return {
        label: 'Continuar',
        title: 'Sessão em andamento',
        description: 'Você deixou um treino parcial. Retome de onde parou.',
        primaryLabel: 'Continuar treino',
        primarySection: null,
        secondaryLabel: 'Ver detalhes',
        secondarySection: null,
      }
    case 'returning':
      return {
        label: 'Bem-vindo de volta',
        title: daysSinceLast >= 5 ? `Há ${daysSinceLast} dias sem treino` : 'Retomando a rotina',
        description: 'Sem pressão: recomece com volume confortável e foque na técnica.',
        primaryLabel: 'Retomar treino',
        primarySection: null,
        secondaryLabel: 'Ajustar planilha',
        secondarySection: 'planilha',
      }
    case 'ready':
    default:
      return {
        label: 'Treino de hoje',
        title: null,
        description: null,
        primaryLabel: 'Iniciar treino',
        primarySection: null,
        secondaryLabel: 'Ver detalhes',
        secondarySection: null,
      }
  }
}

export function workoutCardMeta(workout, profile = {}) {
  if (!workout) return null
  const exercises = workout.exercises || []
  const duration =
    workout.estimatedMinutes ||
    workout.durationMinutes ||
    Math.max(20, exercises.length * 8)
  return {
    name: workout.name,
    muscles: workout.muscleGroups || [],
    exerciseCount: exercises.length,
    duration,
    level: workout.intensity || profile?.level || '—',
    status: workout.status || 'Pendente',
  }
}
