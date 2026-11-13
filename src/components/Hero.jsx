import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { BRAND } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'
import {
  getWeeklyProgress,
  resolveTodayWorkout,
  situationCopy,
  weeklyProgressSentence,
  workoutCardMeta,
} from '../utils/todayWorkout'
import WorkoutDetailModal from './WorkoutDetailModal'

export default function Hero() {
  const { profile, workouts, history, plans, goals, startWorkout, generatedPlan } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)

  const today = useMemo(
    () =>
      resolveTodayWorkout({
        workouts,
        history,
        plans: plans?.length ? plans : generatedPlan ? [generatedPlan] : [],
      }),
    [workouts, history, plans, generatedPlan],
  )

  const weekly = useMemo(
    () => getWeeklyProgress({ workouts, history, profile, goals }),
    [workouts, history, profile, goals],
  )

  const copy = situationCopy(today.situation, {
    daysSinceLast: today.daysSinceLast,
    nextWorkout: today.nextWorkout || today.workout,
  })

  const meta = workoutCardMeta(today.workout, profile)
  const progressPct =
    weekly.weeklyGoal > 0
      ? Math.min(100, Math.round((weekly.completedCount / weekly.weeklyGoal) * 100))
      : 0

  const handleStart = () => {
    if (today.workout?.exercises?.length) {
      startWorkout(today.workout)
      return
    }
    if (copy.primarySection) scrollToSection(copy.primarySection)
  }

  const handleSecondary = () => {
    if (today.workout && (today.situation === 'ready' || today.situation === 'partial' || today.situation === 'returning')) {
      setDetailWorkout(today.workout)
      return
    }
    if (copy.secondarySection) scrollToSection(copy.secondarySection)
  }

  return (
    <section id="inicio" className="hero hero--action">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__glow hero__glow--secondary" aria-hidden="true" />
      <div className="container hero__inner hero__inner--action">
        <div className="hero__content hero__content--compact">
          <span className="hero__badge">{BRAND.slogan}</span>
          <h1 className="hero__title">
            <span className="hero__brand">
              <span className="hero__title-evolua">Evolua</span>
              <span className="hero__title-fit">Fit</span>
            </span>
          </h1>
          <p className="hero__subtitle">Olá, {profile?.name || 'Atleta'} — foque no treino de hoje.</p>
        </div>

        <article className={`home-today glass-card home-today--${today.situation}`}>
          <header className="home-today__header">
            <span className="home-today__label">{copy.label}</span>
            <p className="home-today__week" aria-live="polite">
              {weeklyProgressSentence(weekly)}
            </p>
            {weekly.weeklyGoal > 0 && (
              <div
                className="home-today__week-bar"
                role="progressbar"
                aria-valuenow={weekly.completedCount}
                aria-valuemin={0}
                aria-valuemax={weekly.weeklyGoal}
                aria-label="Progresso semanal de treinos"
              >
                <div className="home-today__week-fill" style={{ width: `${progressPct}%` }} />
              </div>
            )}
          </header>

          {meta && (today.situation === 'ready' || today.situation === 'partial' || today.situation === 'returning' || today.situation === 'completed') ? (
            <div className="home-today__body">
              <h2 className="home-today__name">{copy.title && today.situation !== 'ready' ? copy.title : meta.name}</h2>
              {today.situation === 'ready' || today.situation === 'partial' || today.situation === 'returning' ? (
                <>
                  {copy.description && today.situation !== 'ready' && (
                    <p className="home-today__desc">{copy.description}</p>
                  )}
                  <ul className="home-today__meta">
                    <li>
                      <span>Músculos</span>
                      <strong>{meta.muscles.length ? meta.muscles.join(', ') : 'Variado'}</strong>
                    </li>
                    <li>
                      <span>Exercícios</span>
                      <strong>{meta.exerciseCount}</strong>
                    </li>
                    <li>
                      <span>Duração</span>
                      <strong>~{meta.duration} min</strong>
                    </li>
                    <li>
                      <span>Nível</span>
                      <strong>{meta.level}</strong>
                    </li>
                  </ul>
                  {today.situation === 'partial' && (
                    <p className="home-today__progress-note">Progresso parcial salvo — continue de onde parou.</p>
                  )}
                </>
              ) : (
                <p className="home-today__desc">{copy.description}</p>
              )}
            </div>
          ) : (
            <div className="home-today__body">
              <h2 className="home-today__name">{copy.title}</h2>
              <p className="home-today__desc">{copy.description}</p>
            </div>
          )}

          <div className="home-today__actions">
            <button
              type="button"
              className="btn btn--primary btn--lg btn--start-workout"
              onClick={handleStart}
            >
              {today.situation === 'ready' || today.situation === 'partial' || today.situation === 'returning'
                ? today.situation === 'partial'
                  ? 'Continuar treino'
                  : copy.primaryLabel || 'Iniciar treino'
                : copy.primaryLabel}
            </button>
            <button type="button" className="btn btn--outline btn--lg" onClick={handleSecondary}>
              {today.situation === 'ready' || today.situation === 'partial' || today.situation === 'returning'
                ? 'Ver detalhes'
                : copy.secondaryLabel}
            </button>
          </div>
        </article>
      </div>

      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
