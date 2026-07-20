import { calculateSessionStats, getPerformanceSummary } from './performanceUtils'
import { formatDateShort } from './dateFormat'

/**
 * Dashboard metrics derived from FitnessContext data (localStorage via evoluafit-data).
 * Rule: never invent progress from empty / zero-division math.
 */

function getMonthlyPerformancePercent(history, referenceDate = new Date()) {
  const month = referenceDate.getMonth()
  const year = referenceDate.getFullYear()
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year

  const volumeForMonth = (m, y) =>
    history
      .filter((s) => {
        const d = new Date(s.completedAt)
        return d.getMonth() === m && d.getFullYear() === y
      })
      .reduce((sum, s) => sum + calculateSessionStats(s).volume, 0)

  const current = volumeForMonth(month, year)
  const previous = volumeForMonth(prevMonth, prevYear)

  // Need a real previous-month baseline — never invent "+100%" from division by zero
  if (previous <= 0 || current <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function countActiveGoals(goals) {
  if (!goals?.length) return null
  return goals.filter((g) => (g.current ?? 0) < (g.target ?? 1)).length
}

function hasTrainingData(workouts, history) {
  const completedWorkouts = workouts?.some((w) => w.status === 'Realizado')
  return Boolean(history?.length || completedWorkouts)
}

function hasScheduledWorkouts(workouts) {
  return Boolean(
    workouts?.some(
      (w) =>
        !w.isRest &&
        (w.status === 'Pendente' || w.status === 'Parcial' || w.status === 'planned' || w.status === 'pending'),
    ),
  )
}

/**
 * @param {{ profile?: object, workouts: object[], history: object[], goals: object[], performance?: object }} ctx
 */
export function getDashboardMetrics({ profile, workouts, history, goals, performance }) {
  const perf = performance || getPerformanceSummary(workouts, history)
  const hasData = hasTrainingData(workouts, history)
  const hasSchedule = hasScheduledWorkouts(workouts)
  const monthlyPerformancePct = getMonthlyPerformancePercent(history)
  const topMuscleGroup = perf.muscleVolume[0]?.group || null

  const weeklyGoal =
    goals?.find((g) => g.type === 'weekly_workouts')?.target ||
    profile?.daysPerWeek ||
    null

  return {
    hasData,
    hasSchedule,
    weeklyWorkouts: hasData ? perf.weeklyWorkouts : null,
    weeklyGoal: weeklyGoal || null,
    monthlyWorkouts: hasData ? perf.monthlyWorkouts : null,
    streak: hasData && perf.streak > 0 ? perf.streak : null,
    totalVolume: hasData && perf.totalVolume > 0 ? Math.round(perf.totalVolume) : null,
    avgDuration: hasData && perf.averageDuration > 0 ? perf.averageDuration : null,
    nextWorkout: hasSchedule ? perf.nextWorkout : null,
    topMuscleGroup: hasData ? topMuscleGroup : null,
    restDays: hasData ? perf.restDays : null,
    monthlyPerformancePct,
    activeGoals: countActiveGoals(goals),
    profileName: profile?.name || 'Atleta',
  }
}

/** Per-metric availability for empty states */
export function metricAvailability(key, metrics) {
  switch (key) {
    case 'nextWorkout':
      return Boolean(metrics.nextWorkout)
    case 'weeklyWorkouts':
      return metrics.hasData && metrics.weeklyWorkouts !== null
    case 'monthlyPerformancePct':
      return metrics.monthlyPerformancePct !== null
    case 'streak':
      return metrics.streak !== null && metrics.streak > 0
    case 'totalVolume':
      return metrics.totalVolume !== null
    case 'avgDuration':
      return metrics.avgDuration !== null
    case 'topMuscleGroup':
      return Boolean(metrics.topMuscleGroup)
    case 'restDays':
      return metrics.hasData && metrics.restDays !== null
    case 'activeGoals':
      return metrics.activeGoals !== null
    case 'monthlyWorkouts':
      return metrics.hasData && metrics.monthlyWorkouts !== null
    default:
      return false
  }
}

export function formatDashboardValue(key, metrics) {
  if (!metricAvailability(key, metrics)) return null

  switch (key) {
    case 'weeklyWorkouts': {
      if (metrics.weeklyGoal) return `${metrics.weeklyWorkouts}/${metrics.weeklyGoal}`
      return String(metrics.weeklyWorkouts)
    }
    case 'monthlyWorkouts':
      return String(metrics.monthlyWorkouts)
    case 'streak':
      return `${metrics.streak} ${metrics.streak === 1 ? 'dia' : 'dias'}`
    case 'totalVolume':
      return metrics.totalVolume.toLocaleString('pt-BR')
    case 'avgDuration':
      return `${metrics.avgDuration} min`
    case 'nextWorkout': {
      const name = metrics.nextWorkout?.name?.split('—')[0]?.trim()
      if (name) return name
      if (metrics.nextWorkout?.date) return formatDateShort(metrics.nextWorkout.date)
      return null
    }
    case 'topMuscleGroup':
      return metrics.topMuscleGroup
    case 'restDays':
      return String(metrics.restDays)
    case 'monthlyPerformancePct': {
      const pct = metrics.monthlyPerformancePct
      return `${pct > 0 ? '+' : ''}${pct}%`
    }
    case 'activeGoals':
      return String(metrics.activeGoals)
    default:
      return null
  }
}

export function metricHint(key, metrics) {
  switch (key) {
    case 'nextWorkout':
      return metrics.nextWorkout?.date
        ? formatDateShort(metrics.nextWorkout.date)
        : 'Nada agendado ainda'
    case 'weeklyWorkouts':
      return metrics.weeklyGoal
        ? `Meta semanal: ${metrics.weeklyGoal} treinos`
        : 'Treinos concluídos nesta semana'
    case 'monthlyPerformancePct':
      return 'Volume deste mês vs. mês anterior'
    case 'streak':
      return 'Dias consecutivos com treino'
    case 'totalVolume':
      return 'Carga × séries × reps (histórico)'
    case 'avgDuration':
      return 'Média das sessões registradas'
    case 'topMuscleGroup':
      return 'Maior volume no histórico'
    case 'restDays':
      return 'Dias sem treino nos últimos 7'
    case 'activeGoals':
      return 'Metas ainda em andamento'
    default:
      return ''
  }
}

export function metricEmptyCopy(key) {
  switch (key) {
    case 'nextWorkout':
      return { value: '—', hint: 'Agende no calendário ou gere uma planilha' }
    case 'weeklyWorkouts':
      return { value: '—', hint: 'Conclua um treino para começar' }
    case 'monthlyPerformancePct':
      return { value: '—', hint: 'Precisa de volume em dois meses' }
    case 'streak':
      return { value: '—', hint: 'Complete treinos em dias seguidos' }
    case 'totalVolume':
      return { value: '—', hint: 'Registre cargas nas sessões' }
    case 'avgDuration':
      return { value: '—', hint: 'Disponível após a 1ª sessão' }
    case 'topMuscleGroup':
      return { value: '—', hint: 'Aparece após treinos com volume' }
    case 'restDays':
      return { value: '—', hint: 'Com base nos últimos 7 dias' }
    case 'activeGoals':
      return { value: '—', hint: 'Defina metas em Perfil / Metas' }
    default:
      return { value: '—', hint: 'Sem dados suficientes' }
  }
}
