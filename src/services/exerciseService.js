import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { exercises as localExercises, DEFAULT_SAFETY_TIPS } from '../data/exercisesData.js'
import { getFallbackKey, getFallbackMediaPath } from '../data/exerciseMediaMap.js'
import { setExerciseCache } from '../data/exerciseCache.js'

function normalizeArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      /* plain text */
    }
    return trimmed.split(/\n|;/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function normalizeMediaType(value) {
  const type = String(value || 'image').toLowerCase()
  if (type === 'gif' || type === 'video' || type === 'image') return type
  return 'image'
}

export function mapSupabaseExercise(row) {
  const category = row.muscle_group || row.muscleGroup || 'Outros'
  const type = row.type || 'Funcional'
  const fallbackKey = getFallbackKey(category, type)
  const fallbackImage = getFallbackMediaPath(fallbackKey)

  const mediaType = normalizeMediaType(row.media_type)
  const mediaUrl = row.media_url || null
  const thumbnailUrl = row.thumbnail_url || null

  const benefits = normalizeArray(row.benefits)
  const commonMistakes = normalizeArray(row.common_mistakes)
  const safetyTips = normalizeArray(row.safety_tips)
  const executionSteps = normalizeArray(row.execution_steps)
  const shortInstruction = row.short_instruction || executionSteps[0] || ''

  const resolvedVideo = mediaType === 'video' ? mediaUrl : null
  const resolvedGif = mediaType === 'gif' ? mediaUrl : null
  const resolvedImage = mediaType === 'image' ? mediaUrl : null

  return {
    id: String(row.id),
    slug: row.slug || null,
    name: row.name || 'Exercício',
    type,
    category,
    muscleGroup: category,
    secondaryMuscles: normalizeArray(row.secondary_muscles),
    equipment: row.equipment || '—',
    level: row.level || 'Iniciante',
    mediaType,
    mediaUrl: mediaUrl || thumbnailUrl || fallbackImage,
    image: resolvedImage || (mediaType !== 'gif' && mediaType !== 'video' ? mediaUrl : null) || thumbnailUrl,
    thumbnail: thumbnailUrl || mediaUrl || fallbackImage,
    gif: resolvedGif,
    video: resolvedVideo,
    fallbackImage,
    fallbackSvg: fallbackImage,
    shortInstruction,
    executionSteps: executionSteps.length ? executionSteps : shortInstruction ? [shortInstruction] : [],
    benefits,
    commonMistakes,
    safetyTips: safetyTips.length ? safetyTips : DEFAULT_SAFETY_TIPS,
    sets: row.sets ?? '—',
    reps: row.reps ?? '—',
    rest: row.rest ?? '—',
    muscles: [category, ...normalizeArray(row.secondary_muscles)],
    execution: executionSteps.length ? executionSteps : shortInstruction ? [shortInstruction] : [],
    source: 'supabase',
  }
}

export async function fetchExercisesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase não configurado') }
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (error) return { data: null, error }

  const mapped = (data || []).map(mapSupabaseExercise)
  return { data: mapped, error: null }
}

export async function loadExercises() {
  const { data, error } = await fetchExercisesFromSupabase()

  if (!error && data?.length) {
    setExerciseCache(data)
    return { exercises: data, source: 'supabase', error: null }
  }

  if (error) {
    console.warn('[EvoluaFit] Supabase indisponível, usando exercícios locais.', error.message || error)
  }

  setExerciseCache(localExercises)
  return { exercises: localExercises, source: 'local', error }
}
