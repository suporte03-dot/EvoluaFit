/**
 * Builds milestone journey events from real history/workouts/goals only.
 */
function toDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatPt(d) {
  try {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return '—'
  }
}

export function buildJourneyMilestones({ history = [], workouts = [], goals = [], streak = null } = {}) {
  const completed = []

  history.forEach((h) => {
    const d = toDate(h.completedAt || h.date)
    if (d) completed.push({ date: d, name: h.name || 'Treino', source: 'history' })
  })

  workouts.forEach((w) => {
    const status = String(w.status || '').toLowerCase()
    if (status === 'realizado' || status === 'completed' || status === 'done') {
      const d = toDate(w.completedAt || w.date)
      if (d) completed.push({ date: d, name: w.name || 'Treino', source: 'workout' })
    }
  })

  completed.sort((a, b) => a.date - b.date)

  const events = []

  if (completed[0]) {
    events.push({
      id: 'start',
      date: completed[0].date,
      title: 'Começou sua jornada',
      detail: completed[0].name,
      tone: 'neutral',
    })
  }

  if (completed.length >= 5) {
    events.push({
      id: 'five',
      date: completed[4].date,
      title: '5 treinos concluídos',
      detail: 'Consistência começando a aparecer',
      tone: 'progress',
    })
  }

  if (completed.length >= 10) {
    events.push({
      id: 'ten',
      date: completed[9].date,
      title: '10 treinos na conta',
      detail: 'Rotina consolidando',
      tone: 'progress',
    })
  }

  const doneGoals = (goals || []).filter((g) => (g.current ?? 0) >= (g.target ?? Infinity) && g.target)
  if (doneGoals[0]) {
    const g = doneGoals[0]
    const d = toDate(g.completedAt || g.updatedAt) || completed[completed.length - 1]?.date || new Date()
    events.push({
      id: 'goal',
      date: d,
      title: 'Primeira meta concluída',
      detail: g.title || g.name || 'Meta atingida',
      tone: 'progress',
    })
  }

  if (streak > 0) {
    events.push({
      id: 'streak',
      date: new Date(),
      title: `${streak} ${streak === 1 ? 'dia' : 'dias'} de consistência`,
      detail: 'Hoje',
      tone: 'action',
      isToday: true,
    })
  }

  return events
    .sort((a, b) => a.date - b.date)
    .map((e) => ({
      ...e,
      dateLabel: e.isToday ? 'Hoje' : formatPt(e.date),
    }))
}
