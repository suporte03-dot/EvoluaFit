import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { exercises as localExercises, DEFAULT_SAFETY_TIPS } from '../data/exercisesData.js'
import { resolveExerciseMedia } from '../data/exerciseMediaMap.js'
import { normalizeMuscleGroup, logMediaIssuesOnce, resolveSafeMediaUrl } from '../utils/exerciseValidation.js'
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

function indexLocalExercises() {
  const byId = new Map()
  for (const ex of localExercises) {
    byId.set(String(ex.id), ex)
    if (ex.slug) byId.set(String(ex.slug), ex)
  }
  return byId
}

/**
 * Mapeia linha do Supabase + mídia local verificada (prioridade):
 * 1) resolveExerciseMedia (local PNG / GIF validado)
 * 2) media_url remota só se coerente
 * 3) fallback do grupo
 */
export function mapSupabaseExercise(row, localIndex = indexLocalExercises()) {
  const slug = row.slug ? String(row.slug) : null
  const local =
    (slug && localIndex.get(slug)) ||
    localIndex.get(String(row.id)) ||
    null

  const rawCategory = row.muscle_group || row.muscleGroup || local?.category || 'Outros'
  const category = normalizeMuscleGroup(rawCategory)
  const type = row.type || local?.type || 'Funcional'
  const mediaKey = slug || local?.id || String(row.id)

  const media = resolveExerciseMedia(mediaKey, category, type)
  const remoteCandidate = row.media_url || null
  const safeRemote = resolveSafeMediaUrl(mediaKey, remoteCandidate, category)

  let mediaPending = media.mediaPending
  let mediaType = media.mediaType
  let mediaUrl = media.mediaUrl
  let image = media.image
  let gif = media.gif
  let thumbnail = media.thumbnail
  let hasVerifiedMedia = media.hasVerifiedMedia

  // Só usa URL remota do Supabase se local não tiver mídia verificada
  if (!hasVerifiedMedia && safeRemote) {
    mediaPending = false
    hasVerifiedMedia = true
    mediaType = normalizeMediaType(row.media_type)
    mediaUrl = safeRemote
    image = mediaType === 'image' ? safeRemote : null
    gif = mediaType === 'gif' ? safeRemote : null
    thumbnail = row.thumbnail_url || safeRemote
  } else if (!hasVerifiedMedia) {
    mediaPending = true
    mediaUrl = media.fallbackImage
    thumbnail = media.fallbackImage
  }

  const benefits = normalizeArray(row.benefits).length
    ? normalizeArray(row.benefits)
    : local?.benefits || []
  const commonMistakes = normalizeArray(row.common_mistakes).length
    ? normalizeArray(row.common_mistakes)
    : local?.commonMistakes || []
  const safetyTips = normalizeArray(row.safety_tips).length
    ? normalizeArray(row.safety_tips)
    : local?.safetyTips || DEFAULT_SAFETY_TIPS
  const executionSteps = normalizeArray(row.execution_steps).length
    ? normalizeArray(row.execution_steps)
    : local?.executionSteps || local?.execution || []
  const shortInstruction =
    row.short_instruction || executionSteps[0] || local?.shortInstruction || ''

  return {
    id: slug || String(row.id),
    slug: slug || null,
    name: row.name || local?.name || 'Exercício',
    type,
    category,
    muscleGroup: category,
    secondaryMuscles: normalizeArray(row.secondary_muscles).length
      ? normalizeArray(row.secondary_muscles)
      : local?.secondaryMuscles || [],
    equipment: row.equipment || local?.equipment || '—',
    level: row.level || local?.level || 'Iniciante',
    mediaType: mediaPending ? 'image' : mediaType,
    mediaUrl,
    image: mediaPending ? null : image,
    thumbnail: thumbnail || media.fallbackImage,
    gif: mediaPending ? null : gif,
    video: !mediaPending && mediaType === 'video' ? mediaUrl : null,
    fallbackImage: media.fallbackImage,
    fallbackSvg: media.fallbackSvg,
    mediaPending,
    hasVerifiedMedia: hasVerifiedMedia && !mediaPending,
    shortInstruction,
    executionSteps: executionSteps.length ? executionSteps : shortInstruction ? [shortInstruction] : [],
    benefits,
    commonMistakes,
    safetyTips: safetyTips.length ? safetyTips : DEFAULT_SAFETY_TIPS,
    sets: row.sets ?? local?.sets ?? '—',
    reps: row.reps ?? local?.reps ?? '—',
    rest: row.rest ?? local?.rest ?? '—',
    muscles: [category, ...(normalizeArray(row.secondary_muscles) || local?.secondaryMuscles || [])],
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

  const localIndex = indexLocalExercises()
  const mapped = (data || []).map((row) => mapSupabaseExercise(row, localIndex))
  return { data: mapped, error: null, localIndex }
}

/**
 * Ordem segura:
 * 1. Supabase enriquecido com mídia local validada
 * 2. Exercícios locais que não vieram no Supabase
 * 3. Só local se Supabase falhar
 */
export async function loadExercises() {
  logMediaIssuesOnce()
  const localIndex = indexLocalExercises()
  const { data, error } = await fetchExercisesFromSupabase()

  if (!error && data?.length) {
    const seen = new Set(data.map((ex) => String(ex.id)))
    const extras = localExercises.filter((ex) => {
      const key = String(ex.id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const merged = [...data, ...extras]
    setExerciseCache(merged)
    return { exercises: merged, source: 'supabase+local', error: null }
  }

  if (error) {
    console.warn('[EvoluaFit] Supabase indisponível, usando exercícios locais.', error.message || error)
  }

  setExerciseCache(localExercises)
  return { exercises: localExercises, source: 'local', error }
}
