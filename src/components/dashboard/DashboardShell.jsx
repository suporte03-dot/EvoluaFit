import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useProgress } from '../../context/ProgressContext'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import DashboardHero from './DashboardHero'
import EvolutionTrail, { emotionalProgressCopy } from './EvolutionTrail'
import TrainingOverviewCard from './TrainingOverviewCard'
import CalendarOverviewCard from './CalendarOverviewCard'
import ProgressOverviewCard from './ProgressOverviewCard'
import CoachOverviewCard from './CoachOverviewCard'
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
  } = useFitness()
  const { homeProgressMetrics, weeklyFrequency, loadingProgress } = useProgress()
  const [moreOpen, setMoreOpen] = useState(false)

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

  const insight = emotionalProgressCopy(metrics)

  return (
    <section id="inicio" className="dash-home dash-home--hoje" aria-label="Hoje no EvoluaFit">
      <div className="dash-home__inner">
        <DashboardHero
          profile={profile}
          metrics={metrics}
          history={history}
          workouts={workouts}
        />

        <div className="dash-hoje-panel">
          <p className="dash-hoje-panel__insight">{insight}</p>
          <EvolutionTrail history={history} workouts={workouts} />
        </div>

        <nav className="dash-hoje-links" aria-label="Atalhos">
          <button type="button" onClick={() => scrollToSection('treinos')}>
            Treinos
          </button>
          <button type="button" onClick={() => scrollToSection('desempenho')}>
            Evolução
          </button>
          <button type="button" onClick={() => scrollToSection('coach-ia')}>
            Coach
          </button>
        </nav>

        <button
          type="button"
          className={`disclose-toggle${moreOpen ? ' is-open' : ''}`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
        >
          <span>{moreOpen ? 'Ocultar módulos' : 'Ver planilha, agenda e indicadores'}</span>
          <span aria-hidden="true">{moreOpen ? '▲' : '▼'}</span>
        </button>

        {moreOpen && (
          <div className="dash-modules" aria-label="Módulos">
            <TrainingOverviewCard
              workouts={workouts}
              history={history}
              profile={profile}
              goals={goals}
            />
            <CalendarOverviewCard workouts={workouts} />
            <ProgressOverviewCard metrics={metrics} weeklyFrequency={weeklyFrequency} />
            <CoachOverviewCard
              workouts={workouts}
              history={history}
              plans={plans}
              generatedPlan={generatedPlan}
              profile={profile}
            />
          </div>
        )}
      </div>
    </section>
  )
}
