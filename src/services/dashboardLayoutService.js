import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { createDefaultLayout, normalizeLayout } from '../utils/dashboardLayout'

function cacheKey(userId) {
  return `evoluafit-dashboard-layout:${userId}`
}

export function readLayoutCache(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLayoutCache(userId, layout) {
  if (!userId || !layout) return
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(layout))
  } catch {
    /* quota */
  }
}

export async function fetchDashboardLayout(userId, registryIds) {
  const cached = normalizeLayout(readLayoutCache(userId) || createDefaultLayout(), registryIds)
  if (!userId || !isSupabaseConfigured) {
    return { data: cached, source: 'cache', error: null }
  }

  const { data, error } = await supabase
    .from('user_dashboard_layouts')
    .select('layout, layout_version, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(String(error.message || ''))
    return {
      data: cached,
      source: 'cache',
      error: missing ? null : error,
    }
  }

  if (!data?.layout) {
    return { data: cached, source: cached ? 'cache' : 'default', error: null }
  }

  const layout = normalizeLayout(data.layout, registryIds)
  writeLayoutCache(userId, layout)
  return { data: layout, source: 'cloud', error: null }
}

export async function saveDashboardLayout(userId, layout, registryIds) {
  const next = normalizeLayout(layout, registryIds)
  writeLayoutCache(userId, next)
  if (!userId || !isSupabaseConfigured) {
    return { data: next, error: null, source: 'cache' }
  }

  const { data, error } = await supabase
    .from('user_dashboard_layouts')
    .upsert(
      {
        user_id: userId,
        layout_version: next.version,
        layout: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('layout')
    .maybeSingle()

  if (error) {
    return { data: next, error, source: 'cache' }
  }

  const saved = normalizeLayout(data?.layout || next, registryIds)
  writeLayoutCache(userId, saved)
  return { data: saved, error: null, source: 'cloud' }
}
