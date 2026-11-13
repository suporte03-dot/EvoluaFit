/**
 * Set-level progress + active session persistence.
 * Primary writes go to dedicated keys; storageService folds them into evoluafit-data on save.
 */

export const PROGRESS_HISTORY_KEY = 'workout_progress_history'
export const ACTIVE_SESSION_KEY = 'active_workout_session'

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function loadProgressHistory() {
  return safeParse(localStorage.getItem(PROGRESS_HISTORY_KEY), [])
}

export function saveProgressHistory(entries) {
  const list = Array.isArray(entries) ? entries : []
  localStorage.setItem(PROGRESS_HISTORY_KEY, JSON.stringify(list.slice(0, 2000)))
  return list
}

export function appendProgressEntries(newEntries) {
  if (!newEntries?.length) return loadProgressHistory()
  const prev = loadProgressHistory()
  return saveProgressHistory([...newEntries, ...prev])
}

/**
 * Flatten completed sets from a finished session into progress history rows.
 */
export function buildProgressEntriesFromSession(workout, sessionExercises, sessionMeta = {}) {
  const date = sessionMeta.date || new Date().toISOString()
  const workoutId = workout?.id || sessionMeta.workoutId || ''
  const workoutName = workout?.name || sessionMeta.workoutName || ''
  const entries = []

  ;(sessionExercises || []).forEach((ex) => {
    ;(ex.setsLog || []).forEach((set, idx) => {
      if (!set?.completed && !set?.done) return
      entries.push({
        id: `prog-${Date.now()}-${ex.exerciseId || ex.name}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        workoutId,
        workoutName,
        exerciseId: ex.exerciseId || ex.id || '',
        exerciseName: ex.name,
        date: set.completedAt || date,
        setNumber: set.setNumber ?? idx + 1,
        weight: parseFloat(String(set.weight ?? set.load ?? '').replace(/[^\d.]/g, '')) || 0,
        weightLabel: set.weight ?? set.load ?? '',
        reps: Number(set.reps) || parseInt(String(set.reps || '').match(/\d+/)?.[0] || '0', 10) || 0,
        completed: true,
        muscleGroup: ex.muscleGroup || ex.category || '',
      })
    })
  })

  return entries
}

export function getExerciseProgressStats(exerciseId, exerciseName) {
  const history = loadProgressHistory().filter(
    (e) =>
      e.completed &&
      ((exerciseId && e.exerciseId === exerciseId) ||
        (exerciseName && e.exerciseName === exerciseName)),
  )

  if (!history.length) {
    return {
      lastWeight: null,
      lastWeightLabel: null,
      bestWeight: null,
      lastReps: null,
      avgReps: null,
      points: [],
    }
  }

  const weights = history.map((e) => e.weight).filter((w) => w > 0)
  const reps = history.map((e) => e.reps).filter((r) => r > 0)
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))

  const byDate = {}
  sorted.forEach((e) => {
    const day = String(e.date).split('T')[0]
    if (!byDate[day] || e.weight >= (byDate[day].weight || 0)) {
      byDate[day] = { date: day, weight: e.weight, reps: e.reps }
    }
  })

  const newest = history[0]

  return {
    lastWeight: weights.length ? weights[0] : null,
    lastWeightLabel: newest?.weightLabel || (weights[0] != null ? String(weights[0]) : null),
    bestWeight: weights.length ? Math.max(...weights) : null,
    lastReps: reps.length ? reps[0] : null,
    avgReps: reps.length ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : null,
    points: Object.values(byDate).slice(-12),
  }
}

export function loadActiveSession() {
  return safeParse(localStorage.getItem(ACTIVE_SESSION_KEY), null)
}

export function saveActiveSession(session) {
  if (!session) {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
    return null
  }
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session))
  return session
}

export function clearActiveSession() {
  localStorage.removeItem(ACTIVE_SESSION_KEY)
}
