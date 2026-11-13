import { normalizeMuscleGroup } from '../data/exerciseValidationMap.js'

const BROKEN_MEDIA_HOSTS = ['fsoctybvimpcgimwuxaj']
const STALE_REMOTE_NAMES = new Set(['agachamento livre', 'crucifixo', 'supino inclinado', 'remada baixa'])

export function foldExerciseName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isUuidLike(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''))
}

export function isBrokenMediaUrl(url) {
  const hay = String(url || '').toLowerCase()
  return BROKEN_MEDIA_HOSTS.some((host) => hay.includes(host))
}

export function shouldDropRemoteExercise(row, localIndex) {
  if (!row) return true
  if (isBrokenMediaUrl(row.media_url || row.mediaUrl)) return true
  const folded = foldExerciseName(row.name)
  const slug = row.slug ? String(row.slug) : ''
  const localHit =
    (slug && localIndex?.get(slug)) ||
    localIndex?.get(String(row.id || '')) ||
    (folded && localIndex?.get(folded))
  if (localHit) return true
  if (STALE_REMOTE_NAMES.has(folded) && isUuidLike(row.id)) return true
  return false
}

function mediaScore(ex = {}) {
  const url = String(ex.gif || ex.mediaUrl || ex.image || '')
  let score = 0
  if (/\/media\/exercises\/gifs\//i.test(url)) score += 4
  if (ex.hasVerifiedMedia) score += 2
  if (!isUuidLike(ex.id)) score += 1
  if (url.toLowerCase().endsWith('.gif') || url.toLowerCase().endsWith('.webp')) score += 1
  return score
}

export function dedupeExerciseList(list = []) {
  const kept = []
  const seen = new Set()
  for (const ex of list) {
    if (isBrokenMediaUrl(ex.mediaUrl || ex.image || ex.gif)) continue
    const key = String(ex.id || foldExerciseName(ex.name))
    if (seen.has(key)) continue
    const rival = kept.find(
      (item) =>
        foldExerciseName(item.name) === foldExerciseName(ex.name) &&
        Boolean(item.hiddenFromLibrary) === Boolean(ex.hiddenFromLibrary),
    )
    if (rival) {
      if (mediaScore(ex) > mediaScore(rival)) {
        kept[kept.indexOf(rival)] = ex
        seen.add(key)
      }
      continue
    }
    seen.add(key)
    kept.push(ex)
  }
  return kept
}

function mediaKey(ex = {}) {
  const image = String(ex.image || '').split('?')[0]
  const gif = String(ex.gif || ex.mediaUrl || '').split('?')[0]
  if (image && !/\/fallbacks\//i.test(image) && image !== gif) return image
  return gif || image
}

/**
 * Junta catálogo local + linhas remotas sem repetir o mesmo exercício/grupo.
 * Se o grupo já existe no catálogo local, o extra do Supabase não entra na biblioteca.
 */
export function mergeLocalAndRemoteExercises(localExercises = [], remoteExercises = []) {
  const local = dedupeExerciseList(localExercises.filter(Boolean))
  const localIds = new Set(local.map((ex) => String(ex.id)))
  const localNames = new Set(local.map((ex) => foldExerciseName(ex.name)))
  const localGroups = new Set(local.map((ex) => normalizeMuscleGroup(ex.category || ex.muscleGroup)))
  const extras = remoteExercises.filter((ex) => {
    if (!ex) return false
    if (localIds.has(String(ex.id))) return false
    if (localNames.has(foldExerciseName(ex.name))) return false
    const group = normalizeMuscleGroup(ex.category || ex.muscleGroup)
    if (group && localGroups.has(group)) return false
    return true
  })
  return dedupeExerciseList([...local, ...extras])
}

/** Na biblioteca, dois cards não podem mostrar o mesmo GIF/imagem. */
export function collapseSharedLibraryMedia(list = []) {
  const seen = new Set()
  return list.filter((ex) => {
    if (ex?.hiddenFromLibrary) return true
    const key = mediaKey(ex)
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
