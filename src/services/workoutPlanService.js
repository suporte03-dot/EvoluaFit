import { supabase } from '../lib/supabase'

const WORKOUT_PLAN_COLUMNS =
  'id, user_id, name, plan_data, is_active, created_at, updated_at'

function isValidPlanData(planData) {
  if (!planData || typeof planData !== 'object') return false
  const days = planData.weeklyPlan || planData.schedule
  return Array.isArray(days) && days.length > 0
}

export async function getActiveWorkoutPlan(userId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .select(WORKOUT_PLAN_COLUMNS)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return { data, error }
}

export async function saveActiveWorkoutPlan(userId, planData, name) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  if (!isValidPlanData(planData)) {
    return {
      data: null,
      error: { message: 'Planilha inválida ou vazia. Nada foi salvo.' },
    }
  }

  const planName =
    (typeof name === 'string' && name.trim()) ||
    planData.title ||
    planData.name ||
    'Planilha ativa'

  const { data: existing, error: readError } = await getActiveWorkoutPlan(userId)
  if (readError) {
    return { data: null, error: readError }
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('workout_plans')
      .update({
        name: planName,
        plan_data: planData,
        is_active: true,
      })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select(WORKOUT_PLAN_COLUMNS)
      .single()

    return { data, error }
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      name: planName,
      plan_data: planData,
      is_active: true,
    })
    .select(WORKOUT_PLAN_COLUMNS)
    .single()

  return { data, error }
}

export async function archiveActiveWorkoutPlan(userId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const { data: existing, error: readError } = await getActiveWorkoutPlan(userId)
  if (readError) {
    return { data: null, error: readError }
  }

  if (!existing?.id) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .update({ is_active: false })
    .eq('id', existing.id)
    .eq('user_id', userId)
    .select(WORKOUT_PLAN_COLUMNS)
    .single()

  return { data, error }
}

export async function deleteWorkoutPlan(userId, planId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  if (!planId) {
    return { data: null, error: { message: 'Planilha não informada.' } }
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', userId)
    .select(WORKOUT_PLAN_COLUMNS)
    .maybeSingle()

  return { data, error }
}

export { isValidPlanData }