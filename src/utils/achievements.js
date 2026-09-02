import { isCompletedSession } from './completedSession'

export const ACHIEVEMENT_CATALOG = [
  {
    id: 'start',
    title: 'Primeiro treino',
    detail: 'A jornada começou com uma sessão registrada.',
  },
  {
    id: 'five',
    title: '5 treinos',
    detail: 'Consistência começando a aparecer.',
  },
  {
    id: 'ten',
    title: '10 treinos',
    detail: 'Rotina consolidando.',
  },
  {
    id: 'goal',
    title: 'Primeira meta',
    detail: 'Uma meta saiu do papel.',
  },
  {
    id: 'streak3',
    title: '3 dias evoluindo',
    detail: 'Sequência curta, sem punição — só presença.',
  },
  {
    id: 'streak7',
    title: '7 dias evoluindo',
    detail: 'Uma semana de consistência saudável.',
  },
]

function completedCount(history = [], workouts = []) {
  const fromHistory = (history || []).filter((h) => isCompletedSession(h)).length
  const fromWorkouts = (workouts || []).filter((w) => {
    const s = String(w.status || '').toLowerCase()
    return s === 'realizado' || s === 'completed' || s === 'done'
  }).length
  return Math.max(fromHistory, fromWorkouts)
}

export function unlockAchievements({
  history = [],
  workouts = [],
  goals = [],
  streak = null,
} = {}) {
  const sessions = completedCount(history, workouts)
  const hasGoal = (goals || []).some(
    (g) => g.target && (g.current ?? 0) >= g.target,
  )
  const unlocked = new Set()
  if (sessions >= 1) unlocked.add('start')
  if (sessions >= 5) unlocked.add('five')
  if (sessions >= 10) unlocked.add('ten')
  if (hasGoal) unlocked.add('goal')
  if (streak >= 3) unlocked.add('streak3')
  if (streak >= 7) unlocked.add('streak7')

  return ACHIEVEMENT_CATALOG.map((item) => ({
    ...item,
    unlocked: unlocked.has(item.id),
  }))
}
