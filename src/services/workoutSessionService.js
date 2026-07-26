import { supabase } from '../lib/supabase'

const SESSION_COLUMNS =
  'id, user_id, client_id, workout_plan_id, plan_day_key, workout_name, status, started_at, completed_at, duration_seconds, perceived_effort, notes, workout_snapshot, created_at, updated_at'

function toPtError(error, fallback) {
  if (!error) return null
  const msg = String(error.message || '')
  if (/Failed to fetch|NetworkError|fetch|offline/i.test(msg)) {
    return { message: 'Falha de conexão. Os dados ficaram salvos para sincronizar depois.', code: 'NETWORK' }
  }
  return { message: fallback || msg || 'Erro ao salvar a sessão.', code: error.code }
}

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

  return { data, error: toPtError(error, 'Não foi possível carregar a sessão ativa.') }
}

export async function getWorkoutSessionByClientId(userId, clientId) {
  if (!userId || !clientId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_COLUMNS)
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .maybeSingle()

  return { data, error: toPtError(error, 'Não foi possível localizar a sessão.') }
}

export async function upsertWorkoutSession(userId, sessionData) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }
  if (!sessionData?.client_id) {
    return { data: null, error: { message: 'client_id da sessão é obrigatório.' } }
  }

  const payload = {
    user_id: userId,
    client_id: sessionData.client_id,
    workout_plan_id: sessionData.workout_plan_id || null,
    plan_day_key: sessionData.plan_day_key || null,
    workout_name: sessionData.workout_name || 'Treino',
    status: sessionData.status || 'in_progress',
    started_at: sessionData.started_at || new Date().toISOString(),
    completed_at: sessionData.completed_at ?? null,
    duration_seconds: sessionData.duration_seconds ?? null,
    perceived_effort: sessionData.perceived_effort ?? null,
    notes: sessionData.notes ?? null,
    workout_snapshot: sessionData.workout_snapshot || null,
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert(payload, { onConflict: 'user_id,client_id' })
    .select(SESSION_COLUMNS)
    .single()

  return { data, error: toPtError(error, 'Não foi possível salvar a sessão.') }
}

export async function startWorkoutSession(userId, sessionData) {
  return upsertWorkoutSession(userId, {
    ...sessionData,
    client_id: sessionData.client_id,
    status: 'in_progress',
    completed_at: null,
    duration_seconds: null,
    perceived_effort: null,
  })
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

  return { data, error: toPtError(error, 'Não foi possível atualizar a sessão.') }
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

export async function deleteWorkoutSessionByClientId(userId, clientId) {
  if (!userId || !clientId) {
    return { data: null, error: { message: 'Sessão não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .select(SESSION_COLUMNS)
    .maybeSingle()

  return { data, error: toPtError(error, 'Não foi possível excluir a sessão.') }
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
  return { data: data || [], error: toPtError(error, 'Não foi possível listar as sessões.') }
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

  return { data, error: toPtError(error, 'Não foi possível carregar a sessão.') }
}
