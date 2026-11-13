import { getExerciseById, parseRestSeconds, parseSets } from '../data/exercisesData'

const REST_CANDIDATES = [45, 60, 90, 120]

export function enrichExerciseMedia(exercise) {
  const full = exercise?.exerciseId ? getExerciseById(exercise.exerciseId) : null
  if (!full) return exercise
  return {
    ...full,
    ...exercise,
    muscleGroup: exercise.muscleGroup || full.category,
    sets: exercise.sets ?? parseSets(full.sets),
    reps: exercise.reps ?? full.reps,
    restSeconds: exercise.restSeconds ?? parseRestSeconds(full.rest) ?? 60,
    equipment: exercise.equipment || full.equipment,
    execution: exercise.execution || full.execution,
    shortInstruction: exercise.shortInstruction || full.shortInstruction,
  }
}

/** Parse rest seconds from number or text like "60s", "90 segundos", preferring 45/60/90/120. */
export function parseRestFromExercise(exercise) {
  if (typeof exercise?.restSeconds === 'number' && exercise.restSeconds > 0) {
    return snapRestSeconds(exercise.restSeconds)
  }
  const raw = exercise?.rest ?? exercise?.restSeconds ?? ''
  const parsed = parseRestSeconds(raw)
  if (parsed > 0) return snapRestSeconds(parsed)
  return 60
}

function snapRestSeconds(seconds) {
  const n = Number(seconds) || 60
  let best = REST_CANDIDATES[0]
  let bestDiff = Math.abs(n - best)
  for (const c of REST_CANDIDATES) {
    const d = Math.abs(n - c)
    if (d < bestDiff) {
      best = c
      bestDiff = d
    }
  }
  // Keep exact value if reasonably close to a candidate, else use parsed
  if (bestDiff <= 20) return best
  return Math.max(15, Math.min(300, Math.round(n)))
}

export function getTargetSets(exercise) {
  const sets = exercise?.sets
  return typeof sets === 'number' ? sets : parseInt(String(sets), 10) || parseSets(sets) || 3
}

function createEmptySetSlots(exercise) {
  const target = getTargetSets(exercise)
  return Array.from({ length: target }, (_, i) => ({
    setNumber: i + 1,
    weight: '',
    reps: '',
    completed: false,
    completedAt: null,
  }))
}

export function createSessionExercises(workout) {
  return (workout?.exercises || []).map((ex) => {
    const enriched = enrichExerciseMedia(ex)
    const restSeconds = parseRestFromExercise(enriched)
    const targetSets = getTargetSets(enriched)
    const slots = createEmptySetSlots(enriched)
    return {
      ...enriched,
      exerciseId: enriched.exerciseId || enriched.id,
      restSeconds,
      targetSets,
      completedSets: 0,
      setsLog: [],
      setSlots: slots,
      status: 'pending',
      notes: '',
      expanded: false,
    }
  })
}

export function completeSetOnExercise(exercise, setNumber, { weight, reps }) {
  const target = getTargetSets(exercise)
  const slots = [...(exercise.setSlots || createEmptySetSlots(exercise))]
  const idx = Math.max(0, Math.min(target - 1, (setNumber || 1) - 1))
  const entry = {
    setNumber: idx + 1,
    weight: weight ?? '',
    load: weight ?? '',
    reps: reps ?? '',
    completed: true,
    done: true,
    completedAt: new Date().toISOString(),
  }
  slots[idx] = entry
  const setsLog = slots.filter((s) => s.completed)
  const completedSets = setsLog.length
  const status = completedSets >= target ? 'done' : completedSets > 0 ? 'partial' : 'pending'
  return {
    ...exercise,
    setSlots: slots,
    setsLog,
    completedSets,
    load: weight || exercise.load,
    status,
  }
}

export function isExerciseComplete(exercise) {
  const target = getTargetSets(exercise)
  const done = exercise.setSlots?.filter((s) => s.completed).length ?? exercise.setsLog?.length ?? 0
  return done >= target
}

export function isWorkoutComplete(sessionExercises) {
  if (!sessionExercises?.length) return false
  return sessionExercises.every(isExerciseComplete)
}

export function getSessionProgress(sessionExercises) {
  const exercises = sessionExercises || []
  let completedSets = 0
  let totalSets = 0
  let currentExerciseIndex = 0
  let foundCurrent = false

  exercises.forEach((ex, i) => {
    const target = getTargetSets(ex)
    const done = ex.setSlots?.filter((s) => s.completed).length ?? ex.setsLog?.length ?? 0
    totalSets += target
    completedSets += Math.min(done, target)
    if (!foundCurrent && done < target) {
      currentExerciseIndex = i
      foundCurrent = true
    }
  })

  if (!foundCurrent && exercises.length) currentExerciseIndex = exercises.length - 1

  const percent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return {
    percent,
    completedSets,
    totalSets,
    currentExerciseIndex,
    currentExerciseName: exercises[currentExerciseIndex]?.name || '',
    completedExercises: exercises.filter(isExerciseComplete).length,
    totalExercises: exercises.length,
  }
}

export function getExerciseProgressLabel(exerciseIndex, totalExercises) {
  return `Exercício ${exerciseIndex + 1} de ${totalExercises}`
}

export function getSetProgressLabel(completedSets, targetSets) {
  return `Série ${Math.min(completedSets + 1, targetSets)} de ${targetSets}`
}

function parseLoadNum(load) {
  if (!load) return 0
  const num = parseFloat(String(load).replace(/[^\d.]/g, ''))
  return Number.isNaN(num) ? 0 : num
}

function parseRepsNum(reps) {
  if (!reps) return 0
  const match = String(reps).match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function estimateSessionVolume(sessionExercises) {
  return (sessionExercises || []).reduce((sum, ex) => {
    const logs = ex.setsLog?.length ? ex.setsLog : ex.setSlots?.filter((s) => s.completed) || []
    return (
      sum +
      logs.reduce((s, set) => {
        const w = parseLoadNum(set.weight ?? set.load)
        const r = parseRepsNum(set.reps) || 1
        return s + w * r
      }, 0)
    )
  }, 0)
}

export function collectMuscleGroups(sessionExercises, fallback = []) {
  const set = new Set(fallback || [])
  ;(sessionExercises || []).forEach((ex) => {
    if (ex.muscleGroup) set.add(ex.muscleGroup)
    else if (ex.category) set.add(ex.category)
  })
  return [...set]
}

export function buildCompletionPayload(workout, sessionExercises, startTime, sessionNotes, pausedMs = 0) {
  const durationMinutes = Math.max(Math.round((Date.now() - startTime - pausedMs) / 60000), 1)
  const progress = getSessionProgress(sessionExercises)
  const volume = estimateSessionVolume(sessionExercises)
  const muscleGroups = collectMuscleGroups(sessionExercises, workout.muscleGroups)
  const partial = !isWorkoutComplete(sessionExercises) && progress.completedSets > 0
  const planned = progress.completedSets === 0

  return {
    name: workout.name,
    durationMinutes,
    notes: sessionNotes,
    volume,
    muscleGroups,
    partial,
    planned,
    completedAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    progress,
    exercises: sessionExercises.map((ex) => {
      const logs = ex.setsLog?.length ? ex.setsLog : ex.setSlots?.filter((s) => s.completed) || []
      return {
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        completedSets: logs.length,
        reps: logs.length ? logs[logs.length - 1].reps : ex.reps,
        load: logs.length ? logs[logs.length - 1].weight || logs[logs.length - 1].load : ex.load || '',
        setsLog: logs,
        notes: ex.notes,
      }
    }),
  }
}

export function inferWorkoutType(workout) {
  const groups = (workout?.muscleGroups || []).map((g) =>
    String(g)
      .replace(/^Peito$/, 'Peitoral')
      .replace(/^Quadríceps$|^Posterior$/, 'Pernas'),
  )
  if (groups.some((g) => ['Peitoral', 'Ombros', 'Tríceps'].includes(g))) return 'Push'
  if (groups.some((g) => ['Costas', 'Bíceps', 'Trapézio', 'Lombar'].includes(g))) return 'Pull'
  if (groups.some((g) => ['Pernas', 'Glúteos', 'Panturrilha'].includes(g))) return 'Legs'
  if (groups.some((g) => ['Abdômen', 'Cardio', 'Mobilidade'].includes(g))) return 'Core / Condicionamento'
  return workout?.type || 'Treino'
}

export function restoreSessionExercises(savedExercises) {
  return (savedExercises || []).map((ex) => {
    const enriched = enrichExerciseMedia(ex)
    const target = getTargetSets(enriched)
    const setSlots =
      ex.setSlots?.length === target
        ? ex.setSlots
        : createEmptySetSlots(enriched).map((slot, i) => {
            const logged = ex.setsLog?.[i]
            if (!logged) return slot
            return {
              ...slot,
              ...logged,
              setNumber: i + 1,
              completed: Boolean(logged.completed || logged.done),
            }
          })
    const setsLog = setSlots.filter((s) => s.completed)
    return {
      ...enriched,
      ...ex,
      setSlots,
      setsLog,
      completedSets: setsLog.length,
      restSeconds: parseRestFromExercise(enriched),
      status: setsLog.length >= target ? 'done' : setsLog.length > 0 ? 'partial' : 'pending',
    }
  })
}
