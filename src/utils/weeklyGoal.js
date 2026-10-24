/**
 * Fonte única da meta semanal: meta do usuário → dias/semana do plano → perfil.
 * O desafio de 4 semanas deriva dela (meta × 4) para nunca contradizer a tela Hoje.
 */

export const CHALLENGE_WEEKS = 4

export function resolveWeeklyGoal({ goals = [], generatedPlan = null, plans = [], profile = {} } = {}) {
  const fromGoal = Number((goals || []).find((g) => g?.type === 'weekly_workouts')?.target || 0)
  if (fromGoal > 0) return fromGoal
  const fromPlan = Number(generatedPlan?.daysPerWeek || plans?.[0]?.daysPerWeek || 0)
  if (fromPlan > 0) return fromPlan
  const fromProfile = Number(profile?.daysPerWeek || 0)
  return fromProfile > 0 ? fromProfile : null
}

export function challengeForWeeklyGoal(weeklyGoal) {
  const perWeek = Number(weeklyGoal) > 0 ? Number(weeklyGoal) : 3
  const target = perWeek * CHALLENGE_WEEKS
  return {
    id: `${target}-in-${CHALLENGE_WEEKS}`,
    title: `${target} treinos em ${CHALLENGE_WEEKS} semanas`,
    target,
    windowDays: CHALLENGE_WEEKS * 7,
  }
}

export const WEEK_DAY_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const WEEK_DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

function dayKey(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Faixa D S T Q Q S S da semana atual (domingo a sábado) marcando dias com treino. */
export function buildWeekStrip(trainedDates = [], referenceDate = new Date()) {
  const ref = new Date(referenceDate)
  ref.setHours(0, 0, 0, 0)
  const start = new Date(ref)
  start.setDate(ref.getDate() - ref.getDay())
  const trained = new Set((trainedDates || []).map(dayKey).filter(Boolean))
  const todayKey = dayKey(ref)
  return WEEK_DAY_LETTERS.map((letter, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = dayKey(d)
    return {
      key,
      letter,
      name: WEEK_DAY_NAMES[i],
      trained: trained.has(key),
      isToday: key === todayKey,
    }
  })
}
