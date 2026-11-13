import { useMemo } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useProgress } from '../../context/ProgressContext'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import { computeEvoluaScore } from '../../utils/evoluaScore'
import DashboardHero from './DashboardHero'
import EvolutionTrail, { emotionalProgressCopy } from './EvolutionTrail'
import JourneyTimeline from './JourneyTimeline'
import EvoluaScoreCard from '../ui/EvoluaScoreCard'
import { scrollToSection } from '../../utils/scrollToSection'

export default function DashboardShell() {
  const {
    profile,
    workouts,
    history,
    goals,
    performance,
  } = useFitness()
  const { homeProgressMetrics, loadingProgress } = useProgress()

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
      hasData: progressHasData || base.hasData,
    }
  }, [profile, workouts, history, goals, performance, homeProgressMetrics, loadingProgress])

  const insight = emotionalProgressCopy(metrics)
  const score = useMemo(() => computeEvoluaScore(metrics), [metrics])

  return (
    <section id="inicio" className="dash-home dash-home--hoje" aria-label="Hoje no EvoluaFit">
      <div className="dash-home__inner">
        <DashboardHero
          profile={profile}
          metrics={metrics}
          history={history}
          workouts={workouts}
        />

        <div className="dash-hoje-grid">
          <div className="dash-hoje-panel">
            <p className="dash-hoje-panel__insight">{insight}</p>
            <EvolutionTrail history={history} workouts={workouts} />
          </div>
          <EvoluaScoreCard score={score} />
        </div>

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
          <button type="button" onClick={() => scrollToSection('perfil')}>
            Perfil
          </button>
        </nav>
      </div>
    </section>
  )
}
