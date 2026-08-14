import { supabase } from '../lib/supabase'
import { BODY_CONSENT_VERSION } from '../data/bodyEvolution'
import { compressBodyPhoto } from '../utils/compressBodyPhoto'
import { flattenCheckin, toNumber } from '../utils/bodyEvolutionMetrics'

const BUCKET = 'body-progress'
const SIGNED_TTL = 45 * 60

function toPtError(error, fallback) {
  if (!error) return null
  const msg = String(error.message || '')
  const code = String(error.code || '')
  if (code === 'PGRST116' || /no rows/i.test(msg)) {
    return { message: 'Nenhum registro encontrado.', code: 'empty' }
  }
  if (/JWT|not authenticated|permission|RLS|row-level/i.test(msg) || code === '42501') {
    return { message: 'Sem permissão para acessar estes dados.', code: 'rls' }
  }
  if (/Failed to fetch|NetworkError|fetch/i.test(msg)) {
    return { message: 'Falha de conexão. Verifique sua internet e tente novamente.', code: 'network' }
  }
  if (/bucket|not found|does not exist|schema cache|relation/i.test(msg)) {
    return {
      message: 'O Espelho Evolutivo ainda não está disponível neste ambiente.',
      code: 'missing_schema',
    }
  }
  return { message: fallback || msg || 'Não foi possível concluir esta ação.', code: code || 'unknown' }
}

function hasAnyMeasure(measurements = {}) {
  return Object.values(measurements).some((value) => toNumber(value) != null)
}

function sortCheckins(rows) {
  return [...rows].sort((a, b) => {
    const da = `${a.checkin_date || ''}T${a.created_at || ''}`
    const db = `${b.checkin_date || ''}T${b.created_at || ''}`
    return da.localeCompare(db)
  })
}

async function signPaths(paths) {
  const unique = [...new Set(paths.filter(Boolean))]
  const map = {}
  if (!unique.length) return map

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(unique, SIGNED_TTL)
  if (error) return map

  ;(data || []).forEach((item, index) => {
    const path = unique[index]
    if (item?.signedUrl && path) map[path] = item.signedUrl
  })
  return map
}

function assembleCheckins(checkinRows, measurementRows, photoRows) {
  const byCheckinMeasure = new Map()
  ;(measurementRows || []).forEach((row) => {
    byCheckinMeasure.set(row.checkin_id, row)
  })
  const byCheckinPhotos = new Map()
  ;(photoRows || []).forEach((row) => {
    const list = byCheckinPhotos.get(row.checkin_id) || []
    list.push(row)
    byCheckinPhotos.set(row.checkin_id, list)
  })

  return sortCheckins(checkinRows || []).map((row) => ({
    ...row,
    measurements: byCheckinMeasure.get(row.id) || null,
    photos: byCheckinPhotos.get(row.id) || [],
  }))
}

export async function getSnapshot(userId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const [profileRes, consentRes, checkinRes, measureRes, photoRes, goalRes] = await Promise.all([
    supabase.from('body_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('body_photo_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('consent_version', BODY_CONSENT_VERSION)
      .is('revoked_at', null)
      .maybeSingle(),
    supabase
      .from('body_checkins')
      .select('id, user_id, checkin_date, weight, body_fat_percentage, notes, created_at')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: true }),
    supabase.from('body_measurements').select('*').eq('user_id', userId),
    supabase.from('body_photos').select('id, user_id, checkin_id, photo_type, storage_path, created_at').eq('user_id', userId),
    supabase.from('body_goals').select('*').eq('user_id', userId).maybeSingle(),
  ])

  const firstError =
    profileRes.error ||
    consentRes.error ||
    checkinRes.error ||
    measureRes.error ||
    photoRes.error ||
    goalRes.error

  if (firstError) {
    return { data: null, error: toPtError(firstError, 'Não foi possível carregar o Espelho Evolutivo.') }
  }

  const checkins = assembleCheckins(checkinRes.data, measureRes.data, photoRes.data)
  const previewPaths = []
  const first = checkins[0]
  const latest = checkins[checkins.length - 1]
  ;[first, latest].filter(Boolean).forEach((entry) => {
    entry.photos.forEach((photo) => {
      if (photo.photo_type === 'front' || previewPaths.length < 6) previewPaths.push(photo.storage_path)
    })
  })

  const signedUrls = await signPaths(previewPaths)

  return {
    data: {
      profile: profileRes.data || null,
      consent: consentRes.data || null,
      checkins,
      goals: goalRes.data || null,
      signedUrls,
    },
    error: null,
  }
}

export async function getSignedPhotoUrl(storagePath) {
  if (!storagePath) return { data: null, error: { message: 'Foto não encontrada.' } }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_TTL)
  if (error) return { data: null, error: toPtError(error, 'Não foi possível abrir esta foto.') }
  return { data: data?.signedUrl || null, error: null }
}

export async function saveConsent(userId) {
  if (!userId) return { data: null, error: { message: 'Usuário não autenticado.' } }

  const { data: existing } = await supabase
    .from('body_photo_consents')
    .select('id, revoked_at')
    .eq('user_id', userId)
    .eq('consent_version', BODY_CONSENT_VERSION)
    .maybeSingle()

  if (existing?.id) {
    const { data, error } = await supabase
      .from('body_photo_consents')
      .update({ accepted_at: new Date().toISOString(), revoked_at: null })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select('*')
      .single()
    return { data, error: toPtError(error, 'Não foi possível registrar o consentimento.') }
  }

  const { data, error } = await supabase
    .from('body_photo_consents')
    .insert({
      user_id: userId,
      consent_version: BODY_CONSENT_VERSION,
      accepted_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  return { data, error: toPtError(error, 'Não foi possível registrar o consentimento.') }
}

export async function upsertProfile(userId, patch) {
  if (!userId) return { data: null, error: { message: 'Usuário não autenticado.' } }
  const payload = {
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...patch,
  }
  const { data, error } = await supabase
    .from('body_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()
  return { data, error: toPtError(error, 'Não foi possível salvar o perfil corporal.') }
}

async function uploadPhotoFile(userId, checkinId, type, file) {
  const compressed = await compressBodyPhoto(file)
  const ext = compressed.type.includes('webp') ? 'webp' : 'jpg'
  const path = `${userId}/${checkinId}/${type}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    upsert: true,
    contentType: compressed.type,
    cacheControl: '3600',
  })
  if (error) throw error

  const { error: rowError } = await supabase.from('body_photos').upsert(
    {
      user_id: userId,
      checkin_id: checkinId,
      photo_type: type,
      storage_path: path,
    },
    { onConflict: 'checkin_id,photo_type' },
  )
  if (rowError) throw rowError
  return path
}

export async function createCheckin(userId, payload) {
  if (!userId) return { data: null, error: { message: 'Usuário não autenticado.' } }

  const { data: checkin, error: checkinError } = await supabase
    .from('body_checkins')
    .insert({
      user_id: userId,
      checkin_date: payload.checkin_date,
      weight: toNumber(payload.weight),
      body_fat_percentage: toNumber(payload.body_fat_percentage),
      notes: payload.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (checkinError) {
    return { data: null, error: toPtError(checkinError, 'Não foi possível salvar o check-in.') }
  }

  if (hasAnyMeasure(payload.measurements)) {
    const m = payload.measurements || {}
    const { error: measureError } = await supabase.from('body_measurements').insert({
      checkin_id: checkin.id,
      user_id: userId,
      chest: toNumber(m.chest),
      waist: toNumber(m.waist),
      hips: toNumber(m.hips),
      right_arm: toNumber(m.right_arm),
      left_arm: toNumber(m.left_arm),
      right_thigh: toNumber(m.right_thigh),
      left_thigh: toNumber(m.left_thigh),
      right_calf: toNumber(m.right_calf),
      left_calf: toNumber(m.left_calf),
    })
    if (measureError) {
      await supabase.from('body_checkins').delete().eq('id', checkin.id).eq('user_id', userId)
      return { data: null, error: toPtError(measureError, 'Não foi possível salvar as medidas.') }
    }
  }

  const photoErrors = []
  const files = payload.photos || {}
  for (const type of ['front', 'side', 'back']) {
    if (!files[type]) continue
    try {
      await uploadPhotoFile(userId, checkin.id, type, files[type])
    } catch (error) {
      photoErrors.push(type)
    }
  }

  if (payload.height != null && payload.height !== '') {
    await upsertProfile(userId, {
      height: toNumber(payload.height),
      goal_type: payload.goal_type || undefined,
      onboarding_completed_at: new Date().toISOString(),
    })
  } else if (payload.goal_type || payload.completeOnboarding) {
    await upsertProfile(userId, {
      goal_type: payload.goal_type || undefined,
      onboarding_completed_at: new Date().toISOString(),
    })
  }

  return {
    data: { ...checkin, photoErrors },
    error: photoErrors.length
      ? {
          message: 'Não conseguimos enviar essa foto. Sua imagem não foi perdida. Tente novamente.',
          code: 'photo_upload',
          photoErrors,
          checkinId: checkin.id,
        }
      : null,
  }
}

export async function retryPhotoUpload(userId, checkinId, type, file) {
  try {
    await uploadPhotoFile(userId, checkinId, type, file)
    return { data: true, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: 'Não conseguimos enviar essa foto. Sua imagem não foi perdida. Tente novamente.',
        code: 'photo_upload',
      },
    }
  }
}

export async function upsertGoals(userId, goals) {
  if (!userId) return { data: null, error: { message: 'Usuário não autenticado.' } }
  const payload = {
    user_id: userId,
    target_weight: toNumber(goals.target_weight),
    target_waist: toNumber(goals.target_waist),
    target_chest: toNumber(goals.target_chest),
    target_arm: toNumber(goals.target_arm),
    target_hips: toNumber(goals.target_hips),
    target_thigh: toNumber(goals.target_thigh),
    goal_type: goals.goal_type || null,
    target_date: goals.target_date || null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('body_goals')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()
  return { data, error: toPtError(error, 'Não foi possível salvar suas metas.') }
}

export async function deletePhoto(userId, photo) {
  if (!userId || !photo?.id) return { error: { message: 'Foto não encontrada.' } }
  if (photo.storage_path) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path])
  }
  const { error } = await supabase.from('body_photos').delete().eq('id', photo.id).eq('user_id', userId)
  return { error: toPtError(error, 'Não foi possível excluir a foto.') }
}

export async function deleteCheckin(userId, checkin) {
  if (!userId || !checkin?.id) return { error: { message: 'Registro não encontrado.' } }
  const paths = (checkin.photos || []).map((photo) => photo.storage_path).filter(Boolean)
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  const { error } = await supabase.from('body_checkins').delete().eq('id', checkin.id).eq('user_id', userId)
  return { error: toPtError(error, 'Não foi possível excluir o check-in.') }
}

export async function deleteAllBodyEvolution(userId) {
  if (!userId) return { error: { message: 'Usuário não autenticado.' } }

  const { data: photos } = await supabase.from('body_photos').select('storage_path').eq('user_id', userId)
  const paths = (photos || []).map((row) => row.storage_path).filter(Boolean)
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)

  const deletes = await Promise.all([
    supabase.from('body_photos').delete().eq('user_id', userId),
    supabase.from('body_measurements').delete().eq('user_id', userId),
    supabase.from('body_checkins').delete().eq('user_id', userId),
    supabase.from('body_goals').delete().eq('user_id', userId),
    supabase.from('body_photo_consents').delete().eq('user_id', userId),
    supabase.from('body_profiles').delete().eq('user_id', userId),
  ])

  const failed = deletes.find((result) => result.error)
  return { error: toPtError(failed?.error, 'Não foi possível excluir o Espelho Evolutivo.') }
}

export async function getBodyCoachSummary(userId) {
  if (!userId) return { data: null, error: null }

  const [checkinRes, measureRes] = await Promise.all([
    supabase
      .from('body_checkins')
      .select('id, checkin_date, weight, body_fat_percentage, created_at')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: true }),
    supabase.from('body_measurements').select('*').eq('user_id', userId),
  ])

  if (checkinRes.error) {
    if (/relation|does not exist|schema cache/i.test(String(checkinRes.error.message || ''))) {
      return { data: null, error: null }
    }
    return { data: { checkins: [] }, error: null }
  }

  const checkins = assembleCheckins(checkinRes.data, measureRes.data || [], [])
  if (!checkins.length) return { data: { checkins: [] }, error: null }

  const first = flattenCheckin(checkins[0])
  const latest = flattenCheckin(checkins[checkins.length - 1])
  return {
    data: {
      count: checkins.length,
      firstDate: checkins[0].checkin_date,
      latestDate: checkins[checkins.length - 1].checkin_date,
      first,
      latest,
    },
    error: null,
  }
}
