/**
 * Evolua Score — indicador interno de consistência/progresso.
 * Nunca inventa dados: retorna null se não houver base real.
 * Pesos versionados (Fase 2). Dimensões sem dado são redistribuídas — nunca preenchidas.
 */

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export const DEFAULT_SCORE_WEIGHTS = {
  version: 1,
  consistency: 0.28,
  goals: 0.22,
  frequency: 0.18,
  progression: 0.18,
  performance: 0.14,
}

export function evoluaScoreBand(value) {
  if (value >= 85) return 'Excelente evolução'
  if (value >= 70) return 'Boa evolução'
  if (value >= 50) return 'Evolução estável'
  if (value >= 30) return 'Construindo ritmo'
  return 'Começando a evoluir'
}

export const SCORE_DIMENSION_LABELS = {
  consistency: 'Consistência',
  goals: 'Metas',
  frequency: 'Frequência',
  progression: 'Progressão',
  performance: 'Desempenho',
}

function dimensionScore(key, metrics) {
  if (key === 'consistency') {
    if (metrics.streak == null || metrics.streak <= 0) return null
    return clamp(metrics.streak * 12, 8, 100)
  }
  if (key === 'goals') {
    if (!(metrics.weeklyGoal > 0) || metrics.weeklyWorkouts == null) return null
    return clamp((metrics.weeklyWorkouts / metrics.weeklyGoal) * 100, 0, 100)
  }
  if (key === 'frequency') {
    if (!(metrics.monthlyWorkouts > 0)) return null
    return clamp(metrics.monthlyWorkouts * 8, 8, 100)
  }
  if (key === 'progression') {
    if (metrics.monthlyPerformancePct == null) return null
    const pct = Number(metrics.monthlyPerformancePct)
    if (Number.isNaN(pct)) return null
    return clamp(50 + pct * 0.8, 0, 100)
  }
  if (key === 'performance') {
    if (!(metrics.totalVolume > 0) && !(metrics.weeklyWorkouts > 0)) return null
    if (metrics.totalVolume > 0) return clamp(Math.log10(metrics.totalVolume) * 22, 12, 100)
    return clamp(metrics.weeklyWorkouts * 18, 12, 80)
  }
  return null
}

/**
 * @param {object} metrics
 * @param {typeof DEFAULT_SCORE_WEIGHTS} [weights]
 */
export function computeEvoluaScore(metrics = {}, weights = DEFAULT_SCORE_WEIGHTS) {
  if (!metrics?.hasData && !(metrics.weeklyWorkouts > 0) && !(metrics.streak > 0)) {
    return null
  }

  const keys = ['consistency', 'goals', 'frequency', 'progression', 'performance']
  const dimensions = keys
    .map((key) => {
      const value = dimensionScore(key, metrics)
      if (value == null) return null
      return { key, value: Math.round(value), weight: weights[key] || 0 }
    })
    .filter(Boolean)

  if (!dimensions.length) return null

  const weightSum = dimensions.reduce((sum, d) => sum + d.weight, 0)
  if (weightSum <= 0) return null

  const value = Math.round(
    clamp(
      dimensions.reduce((sum, d) => sum + d.value * (d.weight / weightSum), 0),
      0,
      100,
    ),
  )

  return {
    value,
    label: `${value} / 100`,
    band: evoluaScoreBand(value),
    dimensions,
    weights: { ...weights },
    hint: 'Indicador interno de consistência e progresso — não é diagnóstico de saúde.',
  }
}
