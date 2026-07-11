import { getExerciseById } from '../data/exercisesData'

const parseReps = (reps) => {
  if (!reps) return 10
  const match = String(reps).match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 10
}

const parseLoad = (load) => {
  if (!load) return 0
  const num = parseFloat(String(load).replace(/[^\d.]/g, ''))
  return Number.isNaN(num) ? 0 : num
}

export function calculateWorkoutVolume(workout) {
  if (!workout?.exercises) return 0
  return workout.exercises.reduce((total, ex) => {
    const sets = ex.sets || ex.completedSets || 3
    const reps = parseReps(ex.reps)
    const load = parseLoad(ex.load)
    return total + sets * reps * (load || 1)
  }, 0)
}

export function calculateSessionStats(session) {
  const exercises = session?.exercises || []
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.completedSets || ex.sets || 0), 0)
  const totalReps = exercises.reduce(
    (sum, ex) => sum + (ex.completedSets || ex.sets || 0) * parseReps(ex.reps),
    0,
  )
  const volume = exercises.reduce((sum, ex) => {
    const sets = ex.completedSets || ex.sets || 0
    const reps = parseReps(ex.reps)
    const load = parseLoad(ex.load)
    return sum + sets * reps * (load || 1)
  }, 0)

  return {
    totalSets,
    totalReps,
    volume,
    duration: session?.durationMinutes || 0,
    exerciseCount: exercises.length,
  }
}

export function getWeeklyWorkoutCount(workouts, referenceDate = new Date()) {
  const start = new Date(referenceDate)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return workouts.filter((w) => {
    if (w.status !== 'Realizado') return false
    const d = new Date(w.completedAt || w.date)
    return d >= start && d < end
  }).length
}

export function getMonthlyWorkoutCount(workouts, referenceDate = new Date()) {
  const month = referenceDate.getMonth()
  const year = referenceDate.getFullYear()

  return workouts.filter((w) => {
    if (w.status !== 'Realizado') return false
    const d = new Date(w.completedAt || w.date)
    return d.getMonth() === month && d.getFullYear() === year
  }).length
}

export function calculateStreak(workouts) {
  const completed = workouts
    .filter((w) => w.status === 'Realizado' && w.completedAt)
    .map((w) => w.completedAt.split('T')[0])
    .sort()
    .reverse()

  if (!completed.length) return 0

  const uniqueDays = [...new Set(completed)]
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDays.length; i++) {
    const day = new Date(uniqueDays[i])
    day.setHours(0, 0, 0, 0)
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)

    const diff = Math.abs(day - expected) / (1000 * 60 * 60 * 24)
    if (diff <= 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getMuscleGroupVolume(history) {
  const volume = {}

  history.forEach((session) => {
    session.exercises?.forEach((ex) => {
      const exercise = getExerciseById(ex.exerciseId)
      const group = exercise?.muscleGroup || ex.muscleGroup || 'Outros'
      const sets = ex.completedSets || ex.sets || 0
      const reps = parseReps(ex.reps)
      const load = parseLoad(ex.load)
      volume[group] = (volume[group] || 0) + sets * reps * (load || 1)
    })
  })

  return Object.entries(volume)
    .map(([group, vol]) => ({ group, volume: vol }))
    .sort((a, b) => b.volume - a.volume)
}

export function getLoadEvolution(history) {
  const byWeek = {}

  history.forEach((session) => {
    const d = new Date(session.completedAt || session.date)
    const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}-${d.getMonth()}`
    if (!byWeek[weekKey]) byWeek[weekKey] = { week: weekKey, totalLoad: 0, sessions: 0 }
    byWeek[weekKey].sessions++
    session.exercises?.forEach((ex) => {
      byWeek[weekKey].totalLoad += parseLoad(ex.load) * (ex.completedSets || ex.sets || 1)
    })
  })

  return Object.values(byWeek).slice(-8)
}

export function getAverageDuration(history) {
  if (!history.length) return 0
  const total = history.reduce((sum, s) => sum + (s.durationMinutes || 45), 0)
  return Math.round(total / history.length)
}

export function getRestDays(workouts, days = 7) {
  const trained = new Set(
    workouts
      .filter((w) => w.status === 'Realizado')
      .map((w) => (w.completedAt || w.date).split('T')[0]),
  )

  const restDays = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (!trained.has(key)) restDays.push(key)
  }

  return restDays.length
}

export function getNextWorkout(workouts) {
  const pending = workouts
    .filter((w) => w.status === 'Pendente' || w.status === 'Parcial')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  return pending[0] || null
}

export function getPerformanceSummary(workouts, history) {
  const now = new Date()
  return {
    weeklyWorkouts: getWeeklyWorkoutCount(workouts, now),
    monthlyWorkouts: getMonthlyWorkoutCount(workouts, now),
    streak: calculateStreak(workouts),
    averageDuration: getAverageDuration(history),
    muscleVolume: getMuscleGroupVolume(history),
    loadEvolution: getLoadEvolution(history),
    restDays: getRestDays(workouts),
    nextWorkout: getNextWorkout(workouts),
    totalVolume: history.reduce((sum, s) => sum + calculateSessionStats(s).volume, 0),
  }
}
