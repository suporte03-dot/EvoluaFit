let exerciseCache = []

export function getExerciseCache() {
  return exerciseCache
}

export function setExerciseCache(list) {
  exerciseCache = Array.isArray(list) ? list : []
}

export function getExerciseFromCache(id) {
  if (!id) return null
  return exerciseCache.find((ex) => ex.id === id || ex.slug === id) ?? null
}
