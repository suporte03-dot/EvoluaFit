import { useMemo, useState } from 'react'
import { classifyWorkoutDay } from '../../../utils/trainingIdentity'
import { buildWeekPlanDays, weekSummaryLine } from '../../../utils/weekPlan'
import { planElasticWeek } from '../../../utils/elasticWeek.js'
import ElasticWeekPreview from '../ElasticWeekPreview'

export default function WeekPlanWidget({
  generatedPlan,
  workouts = [],
  history = [],
  today,
  onReorganize,
  onApplyElasticWeek,
  elasticPlan: elasticFromCtx,
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [ignored, setIgnored] = useState(false)

  const days = buildWeekPlanDays({ generatedPlan, workouts, history, today }).map((day) => ({
    ...day,
    type: day.name ? classifyWorkoutDay(day.item || { name: day.name }) : { label: 'Folga', tone: 'rest' },
  }))
  const summary = weekSummaryLine(days)

  const elastic = useMemo(
    () =>
      elasticFromCtx ||
      planElasticWeek({
        workouts,
        planStart: generatedPlan?.startDate,
      }),
    [elasticFromCtx, workouts, generatedPlan?.startDate],
  )

  const hasMissed = days.some((d) => d.missed)
  const canOffer = !ignored && hasMissed && (elastic.needed || elastic.dropped?.length > 0)

  const openPreview = () => {
    if (onReorganize) {
      onReorganize({ preview: true, plan: elastic })
    }
    setPreviewOpen(true)
  }

  const apply = () => {
    onApplyElasticWeek?.(elastic)
    setPreviewOpen(false)
  }

  return (
    <div className="week-plan">
      <p className="week-plan__kicker">Sua semana</p>
      <p className="week-plan__summary">
        {summary.text} Hoje: <strong>{summary.today}</strong>
      </p>
      <ol className="week-plan__days" aria-label="Calendário da rotina">
        {days.map((day) => (
          <li
            key={day.key}
            className={`week-plan__day${day.done ? ' is-done' : ''}${day.isToday ? ' is-today' : ''}${
              day.isNext ? ' is-next' : ''
            }${day.missed ? ' is-missed' : ''}${day.rest ? ' is-rest' : ''}`}
          >
            <span className="week-plan__wd">{day.label}</span>
            <strong>{day.type.label}</strong>
            <span className="week-plan__state">{day.state}</span>
          </li>
        ))}
      </ol>

      {canOffer ? (
        <div className="week-plan__reorg">
          {!previewOpen ? (
            <button type="button" className="week-plan__reorg-btn" onClick={openPreview}>
              Reorganizar semana
            </button>
          ) : (
            <ElasticWeekPreview
              plan={elastic}
              onApply={apply}
              onDismiss={() => {
                setPreviewOpen(false)
                setIgnored(true)
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}
