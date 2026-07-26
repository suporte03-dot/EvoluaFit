import { supabase } from '../lib/supabase'

const SET_COLUMNS =
  'id, session_id, client_id, exercise_key, exercise_name, exercise_order, set_number, set_type, planned_reps, repetitions, weight, duration_seconds, distance_meters, rpe, completed, notes, created_at, updated_at'

function toPtError(error, fallback) {
  if (!error) return null
  const msg = String(error.message || '')
  if (/Failed to fetch|NetworkError|fetch|offline/i.test(msg)) {
    return { message: 'Falha de conexão. A série ficou salva para sincronizar depois.', code: 'NETWORK' }
  }
  return { message: fallback || msg || 'Erro ao salvar a série.', code: error.code }
}

function buildSetPayload(sessionId, setData) {
  return {
    session_id: sessionId,
    client_id: setData.client_id || setData.clientId,
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
}

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

  return { data: data || [], error: toPtError(error, 'Não foi possível carregar as séries.') }
}

export async function getWorkoutSetByClientId(sessionId, clientId) {
  if (!sessionId || !clientId) {
    return { data: null, error: { message: 'Série não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .select(SET_COLUMNS)
    .eq('session_id', sessionId)
    .eq('client_id', clientId)
    .maybeSingle()

  return { data, error: toPtError(error, 'Não foi possível localizar a série.') }
}

export async function upsertWorkoutSet(sessionId, setData) {
  if (!sessionId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const payload = buildSetPayload(sessionId, setData)
  if (!payload.client_id) {
    return { data: null, error: { message: 'client_id da série é obrigatório.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .upsert(payload, { onConflict: 'session_id,client_id' })
    .select(SET_COLUMNS)
    .single()

  return { data, error: toPtError(error, 'Não foi possível salvar a série.') }
}

/** @deprecated Prefer upsertWorkoutSet with client_id — kept for migration paths */
export async function saveWorkoutSet(sessionId, setData) {
  if (setData?.client_id || setData?.clientId) {
    return upsertWorkoutSet(sessionId, setData)
  }

  // Legacy path: conflict on exercise_order/set_number (may fail if unique index differs)
  const payload = buildSetPayload(sessionId, { ...setData, client_id: crypto.randomUUID() })
  const { data, error } = await supabase
    .from('workout_sets')
    .upsert(payload, { onConflict: 'session_id,client_id' })
    .select(SET_COLUMNS)
    .single()

  return { data, error: toPtError(error, 'Não foi possível salvar a série.') }
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

  return { data, error: toPtError(error, 'Não foi possível atualizar a série.') }
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

  return { data, error: toPtError(error, 'Não foi possível excluir a série.') }
}

export async function deleteWorkoutSetByClientId(sessionId, clientId) {
  if (!sessionId || !clientId) {
    return { data: null, error: { message: 'Série não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('session_id', sessionId)
    .eq('client_id', clientId)
    .select(SET_COLUMNS)
    .maybeSingle()

  return { data, error: toPtError(error, 'Não foi possível excluir a série.') }
}
