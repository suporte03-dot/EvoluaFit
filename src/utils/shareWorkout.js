function openWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function sharePlainText(text, title = 'EvoluaFit') {
  if (!text) return false
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text })
      return true
    } catch (error) {
      if (error?.name === 'AbortError') return false
    }
  }
  openWhatsApp(text)
  return true
}

export function todayWorkoutShareMessage(workout) {
  const name = workout?.name || 'Treino de hoje'
  const names = (workout?.exercises || [])
    .map((ex) => ex.name)
    .filter(Boolean)
    .slice(0, 5)
  const list = names.length ? ` Exercícios: ${names.join(', ')}.` : ''
  return `Vou treinar ${name} no EvoluaFit.${list} evoluafit.tec.br`
}

export function completedWorkoutShareMessage({ name, durationMinutes, exerciseCount, muscleGroups } = {}) {
  const muscles = (muscleGroups || []).slice(0, 3).join(', ')
  const parts = [
    `Concluí ${name || 'meu treino'} no EvoluaFit.`,
    durationMinutes ? `${durationMinutes} min` : null,
    exerciseCount ? `${exerciseCount} exercícios` : null,
    muscles ? muscles : null,
  ].filter(Boolean)
  return `${parts.join(' · ')}. evoluafit.tec.br`
}
