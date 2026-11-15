import BodyVolumeMap from '../BodyVolumeMap'

export default function WeeklyVolumeWidget({ volumeDelta, history, generatedPlan, profile }) {
  const level = profile?.level || profile?.experienceLevel || 'Intermediário'
  return (
    <div className="focus-widget-body weekly-volume-widget">
      <BodyVolumeMap history={history} plan={generatedPlan} level={level} />
      {volumeDelta?.sentence ? (
        <p className="hoje-card__body weekly-volume-widget__delta">{volumeDelta.sentence}</p>
      ) : null}
    </div>
  )
}
