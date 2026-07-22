import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import {
  getWeeklyProgress,
  resolveTodayWorkout,
  weeklyProgressSentence,
} from '../../utils/todayWorkout'
import { formatDateShort } from '../../utils/dateFormat'
import { IconChevron, IconShield } from './icons'

export default function WeeklySummaryBar({
  workouts,
  history,
  profile,
  goals,
  plans,
  generatedPlan,
  performance,
}) {
  const weekly = useMemo(
    () => getWeeklyProgress({ workouts, history, profile, goals }),
    [workouts, history, profile, goals],
  )

  const today = useMemo(
    () =>
      resolveTodayWorkout({
        workouts,
        history,
        plans: plans?.length ? plans : generatedPlan ? [generatedPlan] : [],
      }),
    [workouts, history, plans, generatedPlan],
  )

  const next = performance?.nextWorkout || today.nextWorkout || today.workout
  const nextName = next?.name?.split('—')[0]?.trim()
  const nextFocus = next?.name?.split('—')[1]?.trim()
  const nextWhen = next?.date ? formatDateShort(next.date) : null

  return (
    <section className="dash-weekbar" aria-label="Resumo semanal">
      <div className="dash-weekbar__main">
        <span className="dash-weekbar__icon" aria-hidden="true">
          <IconShield size={22} />
        </span>
        <div>
          <p className="dash-weekbar__sentence">{weeklyProgressSentence(weekly)}</p>
          <p className="dash-weekbar__next">
            {nextName
              ? `Próximo agendado: ${nextName}${nextFocus ? ` — ${nextFocus}` : ''}${
                  nextWhen ? ` · ${nextWhen}` : ''
                }.`
              : 'Nenhum treino agendado no momento.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="dash-module__btn dash-module__btn--outline dash-weekbar__cta"
        onClick={() => scrollToSection('calendario')}
      >
        Ver resumo semanal
        <IconChevron size={16} />
      </button>
    </section>
  )
}
