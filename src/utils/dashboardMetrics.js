import { calculateSessionStats, getPerformanceSummary } from './performanceUtils'

/**
 * Dashboard metrics derived from FitnessContext data (localStorage via evoluafit-data).
 * Future: merge with Supabase-synced profile, history, and goals when auth is enabled.
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

  if (current === 0 && previous === 0) return null
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function countActiveGoals(goals) {
  if (!goals?.length) return 0
  return goals.filter((g) => (g.current ?? 0) < (g.target ?? 1)).length
}

function hasTrainingData(workouts, history) {
  const completedWorkouts = workouts?.some((w) => w.status === 'Realizado')
  return Boolean(history?.length || completedWorkouts)
}

/**
 * @param {{ profile?: object, workouts: object[], history: object[], goals: object[], performance?: object }} ctx
 */
export function getDashboardMetrics({ profile, workouts, history, goals, performance }) {
  const perf = performance || getPerformanceSummary(workouts, history)
  const hasData = hasTrainingData(workouts, history)
  const monthlyPerformancePct = getMonthlyPerformancePercent(history)
  const topMuscleGroup = perf.muscleVolume[0]?.group || null

  return {
    hasData,
    weeklyWorkouts: perf.weeklyWorkouts,
    monthlyWorkouts: perf.monthlyWorkouts,
    streak: perf.streak,
    totalVolume: Math.round(perf.totalVolume),
    avgDuration: perf.averageDuration,
    nextWorkout: perf.nextWorkout,
    topMuscleGroup,
    restDays: perf.restDays,
    monthlyPerformancePct,
    activeGoals: countActiveGoals(goals),
    profileName: profile?.name || 'Atleta',
  }
}

export function formatDashboardValue(key, metrics) {
  switch (key) {
    case 'weeklyWorkouts':
      return String(metrics.weeklyWorkouts)
    case 'monthlyWorkouts':
      return String(metrics.monthlyWorkouts)
    case 'streak':
      return metrics.streak > 0 ? `${metrics.streak} dias` : '—'
    case 'totalVolume':
      return metrics.totalVolume > 0 ? metrics.totalVolume.toLocaleString('pt-BR') : '—'
    case 'avgDuration':
      return metrics.avgDuration > 0 ? `${metrics.avgDuration} min` : '—'
    case 'nextWorkout': {
      const name = metrics.nextWorkout?.name?.split('—')[0]?.trim()
      if (name) return name
      if (!metrics.nextWorkout?.date) return '—'
      return new Date(metrics.nextWorkout.date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    }
    case 'topMuscleGroup':
      return metrics.topMuscleGroup || '—'
    case 'restDays':
      return String(metrics.restDays)
    case 'monthlyPerformancePct':
      if (metrics.monthlyPerformancePct === null) return '—'
      return `${metrics.monthlyPerformancePct > 0 ? '+' : ''}${metrics.monthlyPerformancePct}%`
    case 'activeGoals':
      return String(metrics.activeGoals)
    default:
      return '—'
  }
}
