import { useMemo } from 'react'
import { useFitness } from '../../context/FitnessContext'
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

  const metrics = useMemo(
    () => getDashboardMetrics({ profile, workouts, history, goals, performance }),
    [profile, workouts, history, goals, performance],
  )

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
          <ProgressOverviewCard metrics={metrics} history={history} workouts={workouts} />
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
