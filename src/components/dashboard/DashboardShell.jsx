import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../../context/FitnessContext'
import { useProgress } from '../../context/ProgressContext'
import { useBodyEvolution } from '../../hooks/useBodyEvolution'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import { computeEvoluaScore } from '../../utils/evoluaScore'
import {
  getWeeklyProgress,
  resolveTodayWorkout,
} from '../../utils/todayWorkout'
import { getWeeklyVolumeDelta } from '../../utils/weeklyVolume'
import { getNextAction } from '../../utils/nextAction'
import { generateCoachInsights } from '../../utils/coachInsights'
import { buildWeeklySummary, persistClosedWeeklySummary, weeklySummaryCopy } from '../../utils/weeklySummary'
import { deriveXpEvents } from '../../utils/xpEvents'
import { unlockAchievements } from '../../utils/achievements'
import { getChallengeProgress } from '../../utils/challenges'
import { detectMissedWorkouts } from '../../utils/adaptiveWeek'
import DashboardHero from './DashboardHero'
import EvolutionTrail, { emotionalProgressCopy } from './EvolutionTrail'
import JourneyTimeline from './JourneyTimeline'
import EvoluaScoreCard from '../ui/EvoluaScoreCard'
import CoachInsightCard from './CoachInsightCard'
import WeeklySummaryCard from './WeeklySummaryCard'
import EngagementStrip from './EngagementStrip'
import ChallengeCard from './ChallengeCard'
import EvolutionFeed from './EvolutionFeed'
import AdaptiveWeekNudge from './AdaptiveWeekNudge'
import { scrollToSection } from '../../utils/scrollToSection'

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

  const volumeDelta = useMemo(
    () => getWeeklyVolumeDelta({ history, summaries }),
    [history, summaries],
  )

  const missed = useMemo(() => detectMissedWorkouts(workouts), [workouts])

  const bodyCheckin = {
    onboarded: Boolean(body.profile?.onboarding_completed_at || body.hasCheckin),
    daysSince: body.summary?.daysSince,
  }

  const hasPlan = Boolean(plans?.length || generatedPlan || workouts?.length)
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

  const insight = emotionalProgressCopy(metrics)
  const score = useMemo(() => computeEvoluaScore(metrics), [metrics])
  const insights = useMemo(
    () =>
      generateCoachInsights({
        history,
        summaries,
        records,
        weekly,
        volumeDelta,
      }),
    [history, summaries, records, weekly, volumeDelta],
  )
  const weekSummary = useMemo(
    () => buildWeeklySummary({ history, summaries, records, weekly }),
    [history, summaries, records, weekly],
  )
  const weekCopy = weeklySummaryCopy(weekSummary)

  useEffect(() => {
    persistClosedWeeklySummary({ history, summaries, records, weekly })
  }, [history, summaries, records, weekly])
  const xp = useMemo(
    () => deriveXpEvents({ history, workouts, weekly, streak: metrics.streak }),
    [history, workouts, weekly, metrics.streak],
  )
  const achievements = useMemo(
    () => unlockAchievements({ history, workouts, goals, streak: metrics.streak }),
    [history, workouts, goals, metrics.streak],
  )
  const challenge = useMemo(
    () => getChallengeProgress({ history, workouts }),
    [history, workouts],
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

  return (
    <section id="inicio" className="dash-home dash-home--hoje" aria-label="Hoje no EvoluaFit">
      <div className="dash-home__inner">
        <DashboardHero
          profile={profile}
          metrics={metrics}
          history={history}
          workouts={workouts}
          today={today}
          weekly={weekly}
          volumeDelta={volumeDelta}
          nextAction={nextAction}
          onReorganize={handleReorganize}
        />

        {missed.count > 0 && nextAction?.kind !== 'reorganize' ? (
          <AdaptiveWeekNudge missed={missed} onReorganize={handleReorganize} />
        ) : null}

        <div className="dash-hoje-grid">
          <div className="dash-hoje-panel">
            <p className="dash-hoje-panel__insight">{insight}</p>
            <EvolutionTrail history={history} workouts={workouts} />
          </div>
          <EvoluaScoreCard score={score} />
        </div>

        <div className="dash-hoje-grid dash-hoje-grid--intel">
          <WeeklySummaryCard summary={weekSummary} copy={weekCopy} />
          <CoachInsightCard insights={insights} />
        </div>

        <div className="dash-hoje-grid dash-hoje-grid--intel">
          <EngagementStrip xp={xp} achievements={achievements} streak={metrics.streak} />
          <ChallengeCard challenge={challenge} />
        </div>

        <EvolutionFeed
          history={history}
          workouts={workouts}
          records={records}
          streak={metrics.streak}
        />

        <JourneyTimeline
          history={history}
          workouts={workouts}
          goals={goals}
          streak={metrics.streak}
        />

        <nav className="dash-hoje-links" aria-label="Áreas do app">
          <button type="button" onClick={() => scrollToSection('treinos')}>
            Treinar
          </button>
          <button type="button" onClick={() => scrollToSection('desempenho')}>
            Evolução
          </button>
          <button type="button" onClick={() => scrollToSection('coach-ia')}>
            Coach
          </button>
          <button type="button" onClick={() => navigate('/app/perfil')}>
            Perfil
          </button>
        </nav>
      </div>
    </section>
  )
}
