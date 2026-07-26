import { supabase } from '../lib/supabase'

const SUMMARY_COLUMNS =
  'id, workout_name, status, started_at, completed_at, duration_seconds, perceived_effort, notes, completed_sets, exercises_completed, total_repetitions, total_volume'

const EXERCISE_PROGRESS_COLUMNS =
  'session_id, workout_name, started_at, completed_at, exercise_key, exercise_name, completed_sets, max_weight, max_repetitions, best_set_volume, session_volume, session_repetitions'

const PR_COLUMNS =
  'exercise_key, exercise_name, record_weight, record_repetitions, record_set_volume, sessions_count, last_performed_at'

function toPtError(error, fallback) {
  if (!error) return null
  const msg = String(error.message || '')
  const code = String(error.code || '')
  if (code === 'PGRST116' || /no rows/i.test(msg)) {
    return { message: 'Nenhum registro encontrado.' }
  }
  if (/JWT|not authenticated|permission|RLS|row-level/i.test(msg) || code === '42501') {
    return { message: 'Sem permissão para acessar estes dados.' }
  }
  if (/Failed to fetch|NetworkError|fetch/i.test(msg)) {
    return { message: 'Falha de conexão. Verifique sua internet e tente novamente.' }
  }
  if (/relation|does not exist|schema cache/i.test(msg)) {
    return { message: 'Dados de evolução indisponíveis no momento.' }
  }
  return { message: fallback || msg || 'Não foi possível carregar a evolução.' }
}

export async function getSessionSummaries(userId, options = {}) {
  if (!userId) {
    return { data: [], error: { message: 'Usuário não autenticado.' } }
  }

  let query = supabase
    .from('workout_session_summaries')
    .select(SUMMARY_COLUMNS)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.statuses?.length) {
    query = query.in('status', options.statuses)
  }

  if (options.from) {
    query = query.gte('started_at', options.from)
  }

  if (options.to) {
    query = query.lte('started_at', options.to)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  return { data: data || [], error: toPtError(error, 'Não foi possível carregar as sessões.') }
}

export async function getExerciseProgress(userId, exerciseKey, options = {}) {
  if (!userId) {
    return { data: [], error: { message: 'Usuário não autenticado.' } }
  }
  if (!exerciseKey) {
    return { data: [], error: { message: 'Exercício não informado.' } }
  }

  let query = supabase
    .from('exercise_session_progress')
    .select(EXERCISE_PROGRESS_COLUMNS)
    .eq('user_id', userId)
    .eq('exercise_key', exerciseKey)
    .order('started_at', { ascending: true })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  return {
    data: data || [],
    error: toPtError(error, 'Não foi possível carregar o progresso do exercício.'),
  }
}

export async function getPersonalRecords(userId) {
  if (!userId) {
    return { data: [], error: { message: 'Usuário não autenticado.' } }
  }

  const { data, error } = await supabase
    .from('exercise_personal_records')
    .select(PR_COLUMNS)
    .eq('user_id', userId)
    .order('record_weight', { ascending: false })

  return {
    data: data || [],
    error: toPtError(error, 'Não foi possível carregar os recordes pessoais.'),
  }
}

export async function getDashboardProgress(userId) {
  if (!userId) {
    return {
      data: null,
      error: { message: 'Usuário não autenticado.' },
    }
  }

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [summariesResult, recordsResult] = await Promise.all([
    getSessionSummaries(userId, {
      status: 'completed',
      from: sixMonthsAgo.toISOString(),
      limit: 200,
    }),
    getPersonalRecords(userId),
  ])

  if (summariesResult.error) {
    return { data: null, error: summariesResult.error }
  }

  return {
    data: {
      summaries: summariesResult.data,
      records: recordsResult.error ? [] : recordsResult.data,
      recordsError: recordsResult.error || null,
    },
    error: null,
  }
}

export async function listExercisesWithProgress(userId) {
  if (!userId) {
    return { data: [], error: { message: 'Usuário não autenticado.' } }
  }

  const { data, error } = await supabase
    .from('exercise_session_progress')
    .select('exercise_key, exercise_name')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(120)

  if (error) {
    return {
      data: [],
      error: toPtError(error, 'Não foi possível listar os exercícios.'),
    }
  }

  const map = new Map()
  ;(data || []).forEach((row) => {
    if (row.exercise_key && !map.has(row.exercise_key)) {
      map.set(row.exercise_key, row.exercise_name || row.exercise_key)
    }
  })

  return {
    data: [...map.entries()].map(([key, name]) => ({ key, name })),
    error: null,
  }
}