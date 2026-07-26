import { useMemo } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useProgress } from '../../context/ProgressContext'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import DashboardHero from './DashboardHero'
import IndicatorsSection from './IndicatorsSection'
import TrainingOverviewCard from './TrainingOverviewCard'
import CalendarOverviewCard from './CalendarOverviewCard'
import ProgressOverviewCard from './ProgressOverviewCard'
import CoachOverviewCard from './CoachOverviewCard'
import WeeklySummaryBar from './WeeklySummaryBar'

/**
 * Início / Dashboard overview — links into existing sections via scroll navigation.
 * Full feature UIs (treinos, calendário, coach, etc.) remain as separate sections.
 */
export default function DashboardShell() {
  const {
    profile,
    workouts,
    history,
    goals,
    performance,
    plans,
    generatedPlan,
  } = useFitness()
  const { homeProgressMetrics, weeklyFrequency, loadingProgress } = useProgress()

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
      monthlyPerformancePct: progressReady
        ? homeProgressMetrics?.monthlyPerformancePct ?? null
        : null,
      monthlyComparisonLabel: progressReady
        ? homeProgressMetrics?.monthlyComparisonLabel || null
        : null,
    }
  }, [profile, workouts, history, goals, performance, homeProgressMetrics, loadingProgress])

  return (
    <section id="inicio" className="dash-home" aria-label="Dashboard EvoluaFit">
      <div className="dash-home__inner">
        <DashboardHero
          profile={profile}
          metrics={metrics}
          history={history}
          workouts={workouts}
        />

        <IndicatorsSection metrics={metrics} />

        <div className="dash-modules" aria-label="Módulos">
          <TrainingOverviewCard
            workouts={workouts}
            history={history}
            profile={profile}
            goals={goals}
          />
          <CalendarOverviewCard workouts={workouts} />
          <ProgressOverviewCard
            metrics={metrics}
            weeklyFrequency={weeklyFrequency}
          />
          <CoachOverviewCard
            workouts={workouts}
            history={history}
            plans={plans}
            generatedPlan={generatedPlan}
            profile={profile}
          />
        </div>

        <WeeklySummaryBar
          workouts={workouts}
          history={history}
          profile={profile}
          goals={goals}
          plans={plans}
          generatedPlan={generatedPlan}
          performance={performance}
        />
      </div>
    </section>
  )
}
