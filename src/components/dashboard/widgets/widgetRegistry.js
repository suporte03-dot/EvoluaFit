import EvoluaScoreCard from '../../ui/EvoluaScoreCard'
import CoachInsightCard from '../CoachInsightCard'
import ChallengeCard from '../ChallengeCard'
import AdaptiveWeekNudge from '../AdaptiveWeekNudge'
import TodayWorkoutWidget from './TodayWorkoutWidget'
import WeeklyGoalWidget from './WeeklyGoalWidget'
import StreakWidget from './StreakWidget'
import WeeklyVolumeWidget from './WeeklyVolumeWidget'
import AchievementsWidget from './AchievementsWidget'

export const WIDGET_CATEGORIES = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'treino', label: 'Treino' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'coach', label: 'Coach' },
  { id: 'metas', label: 'Metas' },
  { id: 'comunidade', label: 'Comunidade' },
]

export const WIDGET_REGISTRY = [
  {
    id: 'today-workout',
    title: 'Treino de hoje',
    category: 'hoje',
    defaultSize: 'large',
    supportedSizes: ['medium', 'large'],
    locked: true,
    Component: TodayWorkoutWidget,
  },
  {
    id: 'weekly-goal',
    title: 'Meta semanal',
    category: 'hoje',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    Component: WeeklyGoalWidget,
  },
  {
    id: 'streak',
    title: 'Sequência',
    category: 'hoje',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    Component: StreakWidget,
  },
  {
    id: 'evolua-score',
    title: 'Evolua Score',
    category: 'evolucao',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    Component: EvoluaScoreCard,
    mapProps: (ctx) => ({ score: ctx.score }),
  },
  {
    id: 'weekly-volume',
    title: 'Volume semanal',
    category: 'evolucao',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    Component: WeeklyVolumeWidget,
  },
  {
    id: 'coach-insight',
    title: 'Insight do Coach',
    category: 'coach',
    defaultSize: 'medium',
    supportedSizes: ['medium', 'large'],
    Component: CoachInsightCard,
    mapProps: (ctx) => ({ insights: ctx.insights }),
  },
  {
    id: 'adaptive-week',
    title: 'Reorganizar semana',
    category: 'treino',
    defaultSize: 'medium',
    supportedSizes: ['medium', 'large'],
    Component: AdaptiveWeekNudge,
    mapProps: (ctx) => ({ missed: ctx.missed, onReorganize: ctx.onReorganize, allowEmpty: true }),
  },
  {
    id: 'challenge',
    title: 'Desafios',
    category: 'metas',
    defaultSize: 'medium',
    supportedSizes: ['small', 'medium'],
    Component: ChallengeCard,
    mapProps: (ctx) => ({ challenge: ctx.challenge }),
  },
  {
    id: 'achievements',
    title: 'Conquistas',
    category: 'metas',
    defaultSize: 'medium',
    supportedSizes: ['small', 'medium'],
    Component: AchievementsWidget,
  },
]

export const WIDGET_IDS = WIDGET_REGISTRY.map((item) => item.id)

export function getWidget(id) {
  return WIDGET_REGISTRY.find((item) => item.id === id) || null
}

export function widgetsByCategory(ids) {
  return WIDGET_CATEGORIES.map((category) => ({
    ...category,
    items: WIDGET_REGISTRY.filter((item) => item.category === category.id && ids.includes(item.id)),
  })).filter((category) => category.items.length)
}
