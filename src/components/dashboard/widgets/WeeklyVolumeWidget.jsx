export default function WeeklyVolumeWidget({ volumeDelta }) {
  return (
    <div className="focus-widget-body">
      <p className="hoje-card__kicker">Evolução</p>
      <h3 className="hoje-card__title">Volume semanal</h3>
      <p className="hoje-card__body">
        {volumeDelta?.sentence ||
          'A comparação com a semana anterior aparece quando houver volume real nos dois períodos.'}
      </p>
    </div>
  )
}
