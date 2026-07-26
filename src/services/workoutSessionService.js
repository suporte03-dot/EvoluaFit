import { supabase } from '../lib/supabase'

const SESSION_COLUMNS =
  'id, user_id, workout_plan_id, plan_day_key, workout_name, status, started_at, completed_at, duration_seconds, perceived_effort, notes, workout_snapshot, created_at, updated_at'

export async function getActiveSession(userId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_COLUMNS)
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data, error }
}

export async function startWorkoutSession(userId, sessionData) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const payload = {
    user_id: userId,
    workout_plan_id: sessionData.workout_plan_id || null,
    plan_day_key: sessionData.plan_day_key || null,
    workout_name: sessionData.workout_name || 'Treino',
    status: 'in_progress',
    started_at: sessionData.started_at || new Date().toISOString(),
    completed_at: null,
    duration_seconds: null,
    perceived_effort: null,
    notes: sessionData.notes || null,
    workout_snapshot: sessionData.workout_snapshot || null,
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(payload)
    .select(SESSION_COLUMNS)
    .single()

  return { data, error }
}

export async function updateWorkoutSession(userId, sessionId, changes) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }
  if (!sessionId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .update(changes)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select(SESSION_COLUMNS)
    .single()

  return { data, error }
}

export async function completeWorkoutSession(userId, sessionId, completionData = {}) {
  return updateWorkoutSession(userId, sessionId, {
    status: 'completed',
    completed_at: completionData.completed_at || new Date().toISOString(),
    duration_seconds: completionData.duration_seconds ?? null,
    perceived_effort: completionData.perceived_effort ?? null,
    notes: completionData.notes ?? null,
  })
}

export async function cancelWorkoutSession(userId, sessionId) {
  return updateWorkoutSession(userId, sessionId, {
    status: 'cancelled',
    completed_at: new Date().toISOString(),
  })
}

export async function listWorkoutSessions(userId, options = {}) {
  if (!userId) {
    return { data: [], error: { message: 'Usuário não autenticado.' } }
  }

  const limit = options.limit || 50
  let query = supabase
    .from('workout_sessions')
    .select(SESSION_COLUMNS)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.statuses?.length) {
    query = query.in('status', options.statuses)
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export async function getWorkoutSession(userId, sessionId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }
  if (!sessionId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_COLUMNS)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}