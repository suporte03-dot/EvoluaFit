/**
 * Evolua Score — indicador interno de consistência/progresso.
 * Nunca inventa dados: retorna null se não houver base real.
 */

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

/**
 * @param {{
 *   streak?: number|null,
 *   weeklyWorkouts?: number|null,
 *   weeklyGoal?: number|null,
 *   monthlyWorkouts?: number|null,
 *   monthlyPerformancePct?: number|null,
 *   hasData?: boolean,
 * }} metrics
 */
export function computeEvoluaScore(metrics = {}) {
  if (!metrics?.hasData && !(metrics.weeklyWorkouts > 0) && !(metrics.streak > 0)) {
    return null
  }

  let score = 0
  let parts = 0

  if (metrics.streak != null && metrics.streak > 0) {
    score += clamp(metrics.streak * 8, 0, 32)
    parts += 1
  }

  if (metrics.weeklyGoal > 0 && metrics.weeklyWorkouts != null) {
    const weekRatio = clamp(metrics.weeklyWorkouts / metrics.weeklyGoal, 0, 1.25)
    score += clamp(weekRatio * 28, 0, 35)
    parts += 1
  } else if (metrics.weeklyWorkouts > 0) {
    score += clamp(metrics.weeklyWorkouts * 6, 0, 24)
    parts += 1
  }

  if (metrics.monthlyWorkouts != null && metrics.monthlyWorkouts > 0) {
    score += clamp(metrics.monthlyWorkouts * 2.5, 0, 25)
    parts += 1
  }

  if (metrics.monthlyPerformancePct != null) {
    const pct = Number(metrics.monthlyPerformancePct)
    if (!Number.isNaN(pct)) {
      score += clamp(12 + pct * 0.25, 0, 20)
      parts += 1
    }
  }

  if (parts === 0) return null

  const value = Math.round(clamp(score, 0, 100))
  return {
    value,
    label: `${value} / 100`,
    hint: 'Indicador interno de consistência e progresso — não é diagnóstico de saúde.',
  }
}
