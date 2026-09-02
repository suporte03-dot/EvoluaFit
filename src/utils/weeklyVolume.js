import { calculateSessionStats } from './performanceUtils'
import { isCompletedSession } from './completedSession'
import { endOfWeek, startOfWeek } from './progressMetrics'

function inRange(dateValue, start, end) {
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return false
  return d >= start && d < end
}

function volumeFromSummaries(summaries, start, end) {
  return (summaries || [])
    .filter((s) => String(s.status || '').toLowerCase() === 'completed')
    .filter((s) => inRange(s.completed_at || s.started_at, start, end))
    .reduce((sum, s) => sum + (Number(s.total_volume) || 0), 0)
}

function volumeFromHistory(history, start, end) {
  return (history || [])
    .filter((h) => isCompletedSession(h))
    .filter((h) => inRange(h.completedAt || h.date, start, end))
    .reduce((sum, h) => sum + calculateSessionStats(h).volume, 0)
}

/**
 * Week-over-week training volume.
 * Never invents a percentage: needs a real previous-week baseline AND current volume.
 */
export function getWeeklyVolumeDelta({
  history = [],
  summaries = [],
  referenceDate = new Date(),
} = {}) {
  const thisStart = startOfWeek(referenceDate)
  const thisEnd = endOfWeek(referenceDate)
  const prevStart = new Date(thisStart)
  prevStart.setDate(prevStart.getDate() - 7)

  const summaryCurrent = volumeFromSummaries(summaries, thisStart, thisEnd)
  const summaryPrevious = volumeFromSummaries(summaries, prevStart, thisStart)
  const useSummaries = summaryCurrent > 0 || summaryPrevious > 0

  const current = useSummaries ? summaryCurrent : volumeFromHistory(history, thisStart, thisEnd)
  const previous = useSummaries ? summaryPrevious : volumeFromHistory(history, prevStart, thisStart)

  const source = useSummaries ? 'cloud' : 'local'
  const roundedCurrent = Math.round(current)
  const roundedPrevious = Math.round(previous)

  if (previous <= 0 || current <= 0) {
    return {
      current: roundedCurrent || null,
      previous: roundedPrevious || null,
      percent: null,
      source,
      sentence:
        current > 0
          ? 'Volume desta semana registrado. A comparação aparece após uma semana anterior com volume.'
          : previous > 0
            ? 'Ainda sem volume nesta semana para comparar com a anterior.'
            : null,
    }
  }

  const percent = Math.round(((current - previous) / previous) * 100)
  const sign = percent > 0 ? '+' : ''
  return {
    current: roundedCurrent,
    previous: roundedPrevious,
    percent,
    source,
    sentence: `Volume desta semana: ${sign}${percent}% em relação à semana anterior.`,
  }
}
