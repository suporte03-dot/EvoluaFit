import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import { greetingParts, weeklyActivitySeries } from './dashboardUtils'
import { greetingLine, resolveDisplayName } from '../../utils/displayName'
import { IconChevron, IconFlame } from './icons'
import { scrollToSection } from '../../utils/scrollToSection'
import { metricAvailability } from '../../utils/dashboardMetrics'
import {
  getWeeklyProgress,
  resolveTodayWorkout,
  situationCopy,
  weeklyProgressSentence,
  workoutCardMeta,
} from '../../utils/todayWorkout'
import WorkoutDetailModal from '../WorkoutDetailModal'
import { formatDateShort } from '../../utils/dateFormat'

function Sparkline({ series }) {
  const w = 148
  const h = 36
  const max = Math.max(1, ...series)
  const step = series.length > 1 ? w / (series.length - 1) : w
  const pts = series.map((v, i) => {
    const x = i * step
    const y = h - (v / max) * (h - 8) - 4
    return [x, y]
  })
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `M ${pts[0][0]},${h} ${pts.map(([x, y]) => `L ${x},${y}`).join(' ')} L ${pts[pts.length - 1][0]},${h} Z`
  const hasActivity = series.some((v) => v > 0)

  return (
    <svg
      className="dash-hero__spark"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7657ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7657ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {hasActivity && <path d={area} fill="url(#sparkFill)" />}
      <polyline
        fill="none"
        stroke="#7657ff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
        opacity={hasActivity ? 1 : 0.35}
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={series[i] > 0 ? 2.5 : 1.4}
          fill="#7657ff"
          opacity={series[i] > 0 ? 1 : 0.35}
        />
      ))}
    </svg>
  )
}

export default function DashboardHero({ profile, metrics, history, workouts }) {
  const { plans, generatedPlan, startWorkout, pendingSession, resumePendingSession } = useFitness()
  const { user } = useAuth()
  const { profile: cloudProfile } = useProfile()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const { hello } = greetingParts()
  const name = resolveDisplayName({
    cloudName: cloudProfile?.full_name,
    localName: profile?.name || metrics?.profileName,
    metaName: user?.user_metadata?.full_name,
  })
  const streakReady = metricAvailability('streak', metrics)
  const streakDays = streakReady ? metrics.streak : null
  const series = weeklyActivitySeries(history, workouts, 7)

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
    () => getWeeklyProgress({ workouts, history, profile }),
    [workouts, history, profile],
  )

  const hasPendingSession = Boolean(pendingSession?.workoutId)
  const copy = situationCopy(today.situation, {
    daysSinceLast: today.daysSinceLast,
    nextWorkout: today.nextWorkout || today.workout,
  })

  const meta = workoutCardMeta(today.workout, profile)
  const weekPct =
    weekly.weeklyGoal > 0
      ? Math.min(100, Math.round((weekly.completedCount / weekly.weeklyGoal) * 100))
      : 0

  const canStart = Boolean(today.workout?.exercises?.length) &&
    ['ready', 'partial', 'returning'].includes(today.situation)

  const handlePrimary = () => {
    if (hasPendingSession) {
      resumePendingSession()
      return
    }
    if (canStart) {
      startWorkout(today.workout)
      return
    }
    if (copy.primarySection) scrollToSection(copy.primarySection)
  }

  const handleSecondary = () => {
    if (
      today.workout &&
      (today.situation === 'ready' ||
        today.situation === 'partial' ||
        today.situation === 'returning' ||
        today.situation === 'completed')
    ) {
      setDetailWorkout(today.workout)
      return
    }
    if (copy.secondarySection) scrollToSection(copy.secondarySection)
  }

  const title =
    copy.title ||
    meta?.name ||
    (today.situation === 'no_workout_today' ? 'Dia de descanso' : 'Treino de hoje')

  return (
    <>
      <header className="dash-hero dash-hero--today">
        <div className="dash-hero__media" aria-hidden="true">
          <div className="dash-hero__fade" />
        </div>

        <div className="dash-hero__copy">
          <p className="dash-hero__greeting">{greetingLine(hello, name)}</p>
          <p className="dash-hero__eyebrow">{copy.label}</p>
          <h1 className="dash-hero__title">{title}</h1>

          {meta ? (
            <ul className="dash-hero__meta" aria-label="Resumo do treino">
              {meta.muscles?.length > 0 && (
                <li>{meta.muscles.slice(0, 3).join(' · ')}</li>
              )}
              <li>{meta.exerciseCount} exercícios</li>
              <li>~{meta.duration} min</li>
            </ul>
          ) : (
            <p className="dash-hero__subtitle">
              {copy.description ||
                'Organize a rotina com equilíbrio — o próximo passo aparece aqui.'}
            </p>
          )}

          {copy.description && meta && (
            <p className="dash-hero__subtitle dash-hero__subtitle--tight">{copy.description}</p>
          )}

          <div className="dash-hero__week">
            <div className="dash-hero__week-row">
              <span>{weeklyProgressSentence(weekly)}</span>
              {weekly.weeklyGoal > 0 && <strong>{weekPct}%</strong>}
            </div>
            <div
              className="dash-hero__week-bar"
              role="progressbar"
              aria-valuenow={weekPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso semanal"
            >
              <span style={{ width: `${weekPct}%` }} />
            </div>
          </div>

          <div className="dash-hero__actions">
            <button type="button" className="dash-hero__cta" onClick={handlePrimary}>
              {hasPendingSession ? 'Continuar sessão' : copy.primaryLabel}
            </button>
            <button type="button" className="dash-hero__more" onClick={handleSecondary}>
              {copy.secondaryLabel || 'Ver detalhes'}
              <IconChevron size={16} />
            </button>
          </div>
        </div>

        <article
          className={`dash-hero__streak${streakReady ? '' : ' is-empty'}`}
          aria-label="Sequência e consistência"
        >
          <div className="dash-hero__streak-top">
            <span className="dash-hero__streak-icon" aria-hidden="true">
              <IconFlame size={20} />
            </span>
            <div>
              <p className="dash-hero__streak-value">
                {streakReady
                  ? `${streakDays} ${streakDays === 1 ? 'DIA' : 'DIAS'} EM SEQUÊNCIA`
                  : 'COMECE SUA SEQUÊNCIA'}
              </p>
              <p className="dash-hero__streak-hint">
                {streakReady ? 'Dias seguidos com treino concluído.' : 'Complete um treino hoje para registrar o primeiro dia.'}
              </p>
            </div>
          </div>
          <Sparkline series={series} />
          {today.nextWorkout && today.situation === 'no_workout_today' && (
            <p className="dash-hero__next-hint">
              Próximo: {today.nextWorkout.name}
              {today.nextWorkout.date ? ` · ${formatDateShort(today.nextWorkout.date)}` : ''}
            </p>
          )}
        </article>
      </header>

      {detailWorkout && (
        <WorkoutDetailModal
          workout={detailWorkout}
          isOpen
          onClose={() => setDetailWorkout(null)}
        />
      )}
    </>
  )
}
