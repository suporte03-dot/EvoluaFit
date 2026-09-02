import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../../context/FitnessContext'
import { useProgress } from '../../context/ProgressContext'
import { useBodyEvolution } from '../../hooks/useBodyEvolution'
import { useDashboardLayout } from '../../hooks/useDashboardLayout'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import { computeEvoluaScore } from '../../utils/evoluaScore'
import { getWeeklyProgress, resolveTodayWorkout } from '../../utils/todayWorkout'
import { getWeeklyVolumeDelta } from '../../utils/weeklyVolume'
import { getNextAction } from '../../utils/nextAction'
import { generateCoachInsights } from '../../utils/coachInsights'
import { deriveXpEvents } from '../../utils/xpEvents'
import { unlockAchievements } from '../../utils/achievements'
import { getChallengeProgress } from '../../utils/challenges'
import { detectMissedWorkouts } from '../../utils/adaptiveWeek'
import { scrollToSection } from '../../utils/scrollToSection'
import FocusWorkspace from './focus/FocusWorkspace'

export default function DashboardShell() {
  const {
    profile,
    workouts,
    history,
    goals,
    performance,
    plans,
    generatedPlan,
    pendingSession,
    updateWorkout,
    showToast,
  } = useFitness()
  const { homeProgressMetrics, loadingProgress, summaries, records } = useProgress()
  const body = useBodyEvolution()
  const navigate = useNavigate()
  const layoutApi = useDashboardLayout()
  const pinned = useMemo(
    () => new Set(layoutApi.layout.pinned.map((item) => item.id)),
    [layoutApi.layout.pinned],
  )

  const metrics = useMemo(() => {
    const base = getDashboardMetrics({ profile, workouts, history, goals, performance })
    const progressReady = !loadingProgress
    const progressHasData = Boolean(progressReady && homeProgressMetrics?.hasData)

    return {
      ...base,
      progressHasData,
      progressLoading: loadingProgress,
      weeklyGoal: homeProgressMetrics?.weeklyGoal ?? base.weeklyGoal,
      weeklyWorkouts: progressReady
        ? progressHasData
          ? homeProgressMetrics.weeklyWorkouts
          : null
        : null,
      streak: progressReady
        ? progressHasData
          ? homeProgressMetrics.streak
          : null
        : null,
      monthlyWorkouts: progressReady
        ? progressHasData
          ? homeProgressMetrics.monthlyWorkouts ?? base.monthlyWorkouts
          : null
        : null,
      monthlyPerformancePct: progressReady
        ? homeProgressMetrics?.monthlyPerformancePct ?? null
        : null,
      monthlyComparisonLabel: progressReady
        ? homeProgressMetrics?.monthlyComparisonLabel || null
        : null,
      hasData: progressHasData || base.hasData,
    }
  }, [profile, workouts, history, goals, performance, homeProgressMetrics, loadingProgress])

  const today = useMemo(
    () =>
      resolveTodayWorkout({
        workouts,
        history,
        plans: plans?.length ? plans : generatedPlan ? [generatedPlan] : [],
      }),
    [workouts, history, plans, generatedPlan],
  )

  const weekly = useMemo(() => {
    const local = getWeeklyProgress({ workouts, history, profile, goals })
    if (metrics.weeklyWorkouts != null) {
      return {
        ...local,
        completedCount: metrics.weeklyWorkouts,
        weeklyGoal: metrics.weeklyGoal ?? local.weeklyGoal,
      }
    }
    return {
      ...local,
      weeklyGoal: metrics.weeklyGoal ?? local.weeklyGoal,
    }
  }, [workouts, history, profile, goals, metrics.weeklyWorkouts, metrics.weeklyGoal])

  const missed = useMemo(() => detectMissedWorkouts(workouts), [workouts])
  const hasPlan = Boolean(plans?.length || generatedPlan || workouts?.length)
  const bodyCheckin = {
    onboarded: Boolean(body.profile?.onboarding_completed_at || body.hasCheckin),
    daysSince: body.summary?.daysSince,
  }

  const nextAction = useMemo(
    () =>
      getNextAction({
        today,
        weekly,
        pendingSession,
        hasPlan,
        bodyCheckin,
        missed,
      }),
    [today, weekly, pendingSession, hasPlan, bodyCheckin.onboarded, bodyCheckin.daysSince, missed],
  )

  const volumeDelta = useMemo(
    () => getWeeklyVolumeDelta({ history, summaries }),
    [history, summaries],
  )
  const score = useMemo(
    () => (pinned.has('evolua-score') ? computeEvoluaScore(metrics) : null),
    [pinned, metrics],
  )
  const insights = useMemo(
    () =>
      pinned.has('coach-insight')
        ? generateCoachInsights({ history, summaries, records, weekly, volumeDelta })
        : { items: [] },
    [pinned, history, summaries, records, weekly, volumeDelta],
  )
  const xp = useMemo(
    () =>
      pinned.has('achievements')
        ? deriveXpEvents({ history, workouts, weekly, streak: metrics.streak })
        : null,
    [pinned, history, workouts, weekly, metrics.streak],
  )
  const achievements = useMemo(
    () =>
      pinned.has('achievements')
        ? unlockAchievements({ history, workouts, goals, streak: metrics.streak })
        : [],
    [pinned, history, workouts, goals, metrics.streak],
  )
  const challenge = useMemo(
    () => (pinned.has('challenge') ? getChallengeProgress({ history, workouts }) : null),
    [pinned, history, workouts],
  )

  const handleReorganize = () => {
    if (!missed.moves?.length) {
      scrollToSection('planilha')
      return
    }
    missed.moves.forEach((move) => {
      if (move.id && move.toDate) updateWorkout(move.id, { date: move.toDate })
    })
    showToast('Semana reorganizada para os dias que restam.')
    scrollToSection('planilha')
  }

  const widgetCtx = {
    profile,
    metrics,
    history,
    workouts,
    today,
    weekly,
    volumeDelta,
    nextAction,
    onReorganize: handleReorganize,
    score,
    insights,
    missed,
    challenge,
    achievements,
    xp,
    go: scrollToSection,
    goPerfil: () => navigate('/app/perfil'),
  }

  return (
    <FocusWorkspace
      profile={profile}
      metrics={metrics}
      widgetCtx={widgetCtx}
      layoutApi={layoutApi}
    />
  )
}
