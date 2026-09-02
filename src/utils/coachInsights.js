import { getMuscleGroupVolume } from './performanceUtils'
import { isCompletedSession } from './completedSession'
import { endOfWeek, startOfWeek } from './progressMetrics'

function completedInRange(history, start, end) {
  return (history || []).filter((h) => {
    if (!isCompletedSession(h)) return false
    const d = new Date(h.completedAt || h.date)
    return d >= start && d < end
  })
}

function weekSessionCount(summaries, history, start, end) {
  const fromCloud = (summaries || []).filter((s) => {
    if (String(s.status || '').toLowerCase() !== 'completed') return false
    const d = new Date(s.completed_at || s.started_at)
    return d >= start && d < end
  }).length
  if (fromCloud > 0) return fromCloud
  return completedInRange(history, start, end).length
}

/**
 * Rule-based insights with real numbers only. No invented deltas.
 */
export function generateCoachInsights({
  history = [],
  summaries = [],
  records = [],
  weekly = {},
  volumeDelta = null,
  referenceDate = new Date(),
} = {}) {
  const insights = []
  const thisStart = startOfWeek(referenceDate)
  const thisEnd = endOfWeek(referenceDate)
  const prevStart = new Date(thisStart)
  prevStart.setDate(prevStart.getDate() - 7)

  const thisCount = weekSessionCount(summaries, history, thisStart, thisEnd)
  const prevCount = weekSessionCount(summaries, history, prevStart, thisStart)

  if (prevCount > 0 && thisCount > 0 && thisCount < prevCount) {
    insights.push({
      id: 'frequency-drop',
      title: 'Frequência desta semana',
      evidence: `Você treinou ${thisCount} ${thisCount === 1 ? 'vez' : 'vezes'} nesta semana, contra ${prevCount} na anterior.`,
      ctaLabel: 'Ver treinos',
      ctaSection: 'treinos',
    })
  } else if (prevCount > 0 && thisCount > prevCount) {
    insights.push({
      id: 'frequency-up',
      title: 'Frequência em alta',
      evidence: `Você treinou ${thisCount} vezes nesta semana, contra ${prevCount} na anterior.`,
      ctaLabel: 'Ver evolução',
      ctaSection: 'desempenho',
    })
  }

  if (volumeDelta?.percent != null && volumeDelta.sentence) {
    insights.push({
      id: 'volume-wow',
      title: 'Volume semanal',
      evidence: volumeDelta.sentence,
      ctaLabel: 'Ver evolução',
      ctaSection: 'desempenho',
    })
  }

  const muscle = getMuscleGroupVolume(history)
  if (muscle[0]?.volume > 0) {
    const top = muscle[0]
    insights.push({
      id: 'top-muscle',
      title: 'Grupo com mais volume',
      evidence: `${top.group} lidera o histórico registrado neste aparelho.`,
      ctaLabel: 'Abrir Coach',
      ctaSection: 'coach-ia',
    })
  }

  const recentPr = (records || [])
    .filter((r) => r.last_performed_at)
    .sort((a, b) => new Date(b.last_performed_at) - new Date(a.last_performed_at))[0]
  if (recentPr?.record_weight > 0) {
    insights.push({
      id: 'recent-pr',
      title: 'Recorde recente',
      evidence: `${recentPr.exercise_name || 'Exercício'}: ${recentPr.record_weight} kg no melhor registro.`,
      ctaLabel: 'Ver evolução',
      ctaSection: 'desempenho',
    })
  }

  if (weekly.weeklyGoal > 0) {
    const left = Math.max(0, weekly.weeklyGoal - (weekly.completedCount || 0))
    if (left === 1) {
      insights.push({
        id: 'one-left',
        title: 'Meta semanal',
        evidence: `Falta 1 treino para completar ${weekly.weeklyGoal} nesta semana.`,
        ctaLabel: 'Iniciar treino',
        ctaSection: 'treinos',
      })
    } else if (left === 0 && weekly.completedCount > 0) {
      insights.push({
        id: 'goal-hit',
        title: 'Meta semanal',
        evidence: `Você concluiu ${weekly.completedCount} de ${weekly.weeklyGoal} treinos nesta semana.`,
        ctaLabel: 'Ver evolução',
        ctaSection: 'desempenho',
      })
    }
  }

  const unique = []
  const seen = new Set()
  for (const item of insights) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
    if (unique.length >= 2) break
  }

  return {
    items: unique,
    source: summaries?.length ? 'cloud' : 'local',
    fallbackNote: summaries?.length
      ? null
      : 'Com base nos treinos neste aparelho.',
  }
}
