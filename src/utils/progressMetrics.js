/** Pure metrics helpers for Evolução — no invented percentages. */

export function toLocalDateKey(value, reference = new Date()) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

export function startOfLocalDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function startOfWeek(date = new Date()) {
  const d = startOfLocalDay(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

export function endOfWeek(date = new Date()) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 7)
  return d
}

export function formatDurationSeconds(totalSeconds) {
  const sec = Math.max(0, Math.round(Number(totalSeconds) || 0))
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  if (hours > 0) {
    return hours + 'h ' + String(minutes).padStart(2, '0') + 'min'
  }
  if (minutes > 0) return minutes + ' min'
  return sec > 0 ? sec + 's' : '—'
}

export function formatVolume(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Math.round(Number(value)).toLocaleString('pt-BR')
}

export function formatDatePt(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null
  const n = Math.round(Number(value))
  return (n > 0 ? '+' : '') + n + '%'
}

export function uniqueCompletedDays(summaries) {
  const keys = (summaries || [])
    .filter((s) => s.status === 'completed')
    .map((s) => toLocalDateKey(s.completed_at || s.started_at))
    .filter(Boolean)
  return [...new Set(keys)].sort()
}

/** Current streak: consecutive local days ending today or yesterday. */
export function calculateCurrentStreak(summaries, referenceDate = new Date()) {
  const unique = uniqueCompletedDays(summaries)
  if (!unique.length) return 0

  const daySet = new Set(unique)
  const today = startOfLocalDay(referenceDate)
  const todayKey = toLocalDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toLocalDateKey(yesterday)

  let cursor = daySet.has(todayKey) ? today : daySet.has(yesterdayKey) ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  while (cursor) {
    const key = toLocalDateKey(cursor)
    if (!daySet.has(key)) break
    streak += 1
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function calculateLongestStreak(summaries) {
  const unique = uniqueCompletedDays(summaries)
  if (!unique.length) return 0

  let longest = 1
  let current = 1
  for (let i = 1; i < unique.length; i += 1) {
    const prev = startOfLocalDay(new Date(unique[i - 1] + 'T12:00:00'))
    const cur = startOfLocalDay(new Date(unique[i] + 'T12:00:00'))
    const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

export function filterSummariesInRange(summaries, start, end) {
  return (summaries || []).filter((s) => {
    if (s.status !== 'completed') return false
    const d = new Date(s.completed_at || s.started_at)
    return d >= start && d < end
  })
}

export function sumField(rows, field) {
  return (rows || []).reduce((acc, row) => acc + (Number(row[field]) || 0), 0)
}

export function averageField(rows, field) {
  const values = (rows || [])
    .map((row) => Number(row[field]))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!values.length) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function buildWeeklyFrequency(summaries, weeks = 8, referenceDate = new Date()) {
  const end = endOfWeek(referenceDate)
  const points = []
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekEnd = new Date(end)
    weekEnd.setDate(weekEnd.getDate() - i * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)
    const rows = filterSummariesInRange(summaries, weekStart, weekEnd)
    const label =
      String(weekStart.getDate()).padStart(2, '0') +
      '/' +
      String(weekStart.getMonth() + 1).padStart(2, '0')
    points.push({
      label,
      value: rows.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    })
  }
  return points
}

export function buildMonthlyVolume(summaries, months = 6, referenceDate = new Date()) {
  const points = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const rows = filterSummariesInRange(summaries, start, end)
    const label = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    points.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: sumField(rows, 'total_volume'),
      year: start.getFullYear(),
      month: start.getMonth(),
      sessions: rows.length,
    })
  }
  return points
}

export function computePeriodStats(summaries, referenceDate = new Date()) {
  const weekStart = startOfWeek(referenceDate)
  const weekEnd = endOfWeek(referenceDate)
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
  const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
  const prevMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1)
  const prevMonthEnd = monthStart

  const weekRows = filterSummariesInRange(summaries, weekStart, weekEnd)
  const monthRows = filterSummariesInRange(summaries, monthStart, monthEnd)
  const prevMonthRows = filterSummariesInRange(summaries, prevMonthStart, prevMonthEnd)
  const allCompleted = (summaries || []).filter((s) => s.status === 'completed')

  const monthVolume = sumField(monthRows, 'total_volume')
  const prevMonthVolume = sumField(prevMonthRows, 'total_volume')

  let monthlyComparisonPct = null
  let monthlyComparisonLabel = null
  if (prevMonthVolume > 0 && monthVolume > 0) {
    monthlyComparisonPct = Math.round(((monthVolume - prevMonthVolume) / prevMonthVolume) * 100)
    monthlyComparisonLabel = formatPercent(monthlyComparisonPct)
  } else {
    monthlyComparisonLabel =
      'Ainda não há dados suficientes para comparar este período.'
  }

  const avgDurationSec = averageField(allCompleted, 'duration_seconds')
  const avgEffort = averageField(allCompleted, 'perceived_effort')

  return {
    hasData: allCompleted.length > 0,
    weekSessions: weekRows.length,
    monthSessions: monthRows.length,
    monthDurationSeconds: sumField(monthRows, 'duration_seconds'),
    monthVolume,
    monthSets: sumField(monthRows, 'completed_sets'),
    monthReps: sumField(monthRows, 'total_repetitions'),
    currentStreak: calculateCurrentStreak(summaries, referenceDate),
    longestStreak: calculateLongestStreak(summaries),
    averageDurationSeconds: avgDurationSec,
    averagePerceivedEffort: avgEffort != null ? Math.round(avgEffort * 10) / 10 : null,
    monthlyComparisonPct,
    monthlyComparisonLabel,
    totalCompleted: allCompleted.length,
  }
}

export function buildDashboardMetricsFromProgress(stats, weeklyGoal) {
  return {
    hasData: Boolean(stats?.hasData),
    weeklyWorkouts: stats?.hasData ? stats.weekSessions : null,
    weeklyGoal: weeklyGoal || null,
    streak: stats?.hasData && stats.currentStreak > 0 ? stats.currentStreak : null,
    monthlyPerformancePct: stats?.monthlyComparisonPct ?? null,
    monthlyComparisonLabel: stats?.monthlyComparisonLabel || null,
  }
}