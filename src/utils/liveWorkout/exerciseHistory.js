/** Consultas sobre o histórico de séries (linhas de progressStorage) para um exercício. */

export function entriesForExercise(entries = [], exercise = {}) {
  const id = exercise.exerciseId || exercise.id
  const name = exercise.name
  return (entries || []).filter(
    (e) => e?.completed !== false && ((id && e.exerciseId === id) || (name && e.exerciseName === name)),
  )
}

/** Séries da sessão mais recente, em ordem de série. */
export function lastSessionSets(entries = []) {
  if (!entries?.length) return []
  const latestDay = entries
    .map((e) => String(e.date || '').slice(0, 10))
    .filter(Boolean)
    .sort()
    .pop()
  if (!latestDay) return []
  return entries
    .filter((e) => String(e.date || '').startsWith(latestDay))
    .map((e) => ({ setNumber: Number(e.setNumber) || 0, weight: Number(e.weight) || 0, reps: Number(e.reps) || 0 }))
    .sort((a, b) => a.setNumber - b.setNumber)
}

/** Valor "ANTERIOR" da série N: mesma série da última sessão, senão a última série registrada. */
export function previousForSet(lastSets = [], setNumber) {
  if (!lastSets?.length) return null
  return lastSets.find((s) => s.setNumber === setNumber) || lastSets[lastSets.length - 1]
}
