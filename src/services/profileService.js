import { supabase } from '../lib/supabase'

const PROFILE_COLUMNS = 'id, full_name, avatar_url, goal, level, created_at, updated_at'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single()

  return { data, error }
}

export async function updateProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  return { data, error }
}