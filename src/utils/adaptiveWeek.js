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

function isPending(status) {
  const s = String(status || '').toLowerCase()
  return (
    s === 'pendente' ||
    s === 'parcial' ||
    s === 'planejado' ||
    s === 'planned' ||
    s === 'pending' ||
    s === 'partial'
  )
}

function isRest(w) {
  if (w?.isRest) return true
  return /descanso|recuper/.test(String(w?.name || w?.workoutType || '').toLowerCase())
}

function remainingTrainingDays(fromDate, weekEnd) {
  const days = []
  const cursor = new Date(fromDate)
  cursor.setHours(12, 0, 0, 0)
  if (cursor.getDay() === 0) cursor.setDate(cursor.getDate() + 1)
  while (cursor < weekEnd) {
    if (cursor.getDay() !== 0) {
      days.push(toDateKey(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function everCompleted(workouts = [], history = []) {
  if ((history || []).some((h) => h && (h.completedAt || String(h.status || '').toLowerCase() === 'completed'))) {
    return true
  }
  return (workouts || []).some((w) => {
    const s = String(w?.status || '').toLowerCase()
    return s === 'realizado' || s === 'completed' || s === 'done'
  })
}

export function detectMissedWorkouts(workouts = [], referenceDate = new Date(), options = {}) {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const todayKey = toDateKey(today)
  const history = options.history || []
  const isNewUser = !everCompleted(workouts, history)

  const missed = isNewUser
    ? []
    : (workouts || []).filter((w) => {
        if (!w || isRest(w) || !isPending(w.status)) return false
        const key = toDateKey(w.date)
        if (!key) return false
        const d = new Date(`${key}T12:00:00`)
        return d >= weekStart && d < today && key !== todayKey
      })

  if (!missed.length) {
    return {
      count: 0,
      items: [],
      sentence: isNewUser ? 'Sua semana começa hoje. O primeiro treino abre o histórico.' : null,
      moves: [],
      isNewUser,
    }
  }

  const remainingDays = remainingTrainingDays(today, weekEnd)
  const alreadyBooked = new Set(
    (workouts || [])
      .filter((w) => isPending(w.status) && !isRest(w))
      .map((w) => toDateKey(w.date))
      .filter((key) => key && key >= todayKey),
  )

  const openDays = remainingDays.filter((day) => !alreadyBooked.has(day))
  const moves = missed.map((w, index) => ({
    id: w.id,
    name: w.name,
    fromDate: toDateKey(w.date),
    toDate: openDays[index] || remainingDays[index] || todayKey,
  }))

  return {
    count: missed.length,
    items: missed,
    moves,
    isNewUser,
    sentence:
      missed.length === 1
        ? `1 treino agendado ficou para trás nesta semana. Dá para encaixar no que resta.`
        : `${missed.length} treinos agendados ficaram para trás nesta semana. Dá para redistribuir nos dias que restam.`,
  }
}

export function buildCatchUpWorkout(missedItems = [], referenceDate = new Date()) {
  const items = (missedItems || []).filter((w) => w && !isRest(w))
  if (items.length < 2) return null
  const [first, second] = items
  const pick = (workout, count) => (workout.exercises || []).slice(0, count)
  const exercises = [...pick(first, 4), ...pick(second, 3)]
  if (!exercises.length) return null
  return {
    id: `catchup-${toDateKey(referenceDate)}`,
    name: `Recuperação: ${first.name} + ${second.name}`,
    date: toDateKey(referenceDate),
    status: 'Pendente',
    estimatedMinutes: Math.min(45, 8 * exercises.length),
    muscleGroups: [...new Set(exercises.map((ex) => ex.muscleGroup).filter(Boolean))],
    exercises,
    isCatchUp: true,
  }
}

export function applyReorganizedWeek(workouts, proposal) {
  const byId = new Map((proposal?.moves || []).map((move) => [move.id, move.toDate]))
  return (workouts || []).map((w) => {
    const nextDate = byId.get(w.id)
    if (!nextDate) return w
    return { ...w, date: nextDate }
  })
}
