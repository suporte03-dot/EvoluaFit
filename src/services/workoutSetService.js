import { supabase } from '../lib/supabase'

const SET_COLUMNS =
  'id, session_id, exercise_key, exercise_name, exercise_order, set_number, set_type, planned_reps, repetitions, weight, duration_seconds, distance_meters, rpe, completed, notes, created_at, updated_at'

export async function listSessionSets(sessionId) {
  if (!sessionId) {
    return { data: [], error: { message: 'Sessão não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .select(SET_COLUMNS)
    .eq('session_id', sessionId)
    .order('exercise_order', { ascending: true })
    .order('set_number', { ascending: true })

  return { data: data || [], error }
}

export async function saveWorkoutSet(sessionId, setData) {
  if (!sessionId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const payload = {
    session_id: sessionId,
    exercise_key: setData.exercise_key || setData.exerciseKey || '',
    exercise_name: setData.exercise_name || setData.exerciseName || '',
    exercise_order: Number(setData.exercise_order ?? setData.exerciseOrder ?? 0),
    set_number: Number(setData.set_number ?? setData.setNumber ?? 1),
    set_type: setData.set_type || setData.setType || 'working',
    planned_reps: setData.planned_reps ?? setData.plannedReps ?? null,
    repetitions: setData.repetitions ?? setData.reps ?? null,
    weight: setData.weight ?? null,
    duration_seconds: setData.duration_seconds ?? null,
    distance_meters: setData.distance_meters ?? null,
    rpe: setData.rpe ?? null,
    completed: setData.completed !== false,
    notes: setData.notes ?? null,
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .upsert(payload, {
      onConflict: 'session_id,exercise_order,set_number',
    })
    .select(SET_COLUMNS)
    .single()

  return { data, error }
}

export async function updateWorkoutSet(sessionId, setId, changes) {
  if (!sessionId || !setId) {
    return { data: null, error: { message: 'Série não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .update(changes)
    .eq('id', setId)
    .eq('session_id', sessionId)
    .select(SET_COLUMNS)
    .single()

  return { data, error }
}

export async function deleteWorkoutSet(sessionId, setId) {
  if (!sessionId || !setId) {
    return { data: null, error: { message: 'Série não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', setId)
    .eq('session_id', sessionId)
    .select(SET_COLUMNS)
    .maybeSingle()

  return { data, error }
}