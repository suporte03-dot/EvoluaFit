import { useState } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import ElasticWeekPreview from './ElasticWeekPreview'

export default function AdaptiveWeekNudge({
  missed,
  elasticPlan,
  onReorganize,
  onApplyElasticWeek,
  compact = false,
  allowEmpty = false,
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [ignored, setIgnored] = useState(false)

  const hasMissed = Boolean(missed?.count)
  const canOffer =
    !ignored && (elasticPlan?.needed || elasticPlan?.dropped?.length > 0 || hasMissed)

  if (!hasMissed && !allowEmpty && !canOffer) return null

  const openPreview = () => {
    if (elasticPlan?.needed || elasticPlan?.dropped?.length) {
      setPreviewOpen(true)
      return
    }
    onReorganize?.()
  }

  return (
    <div className={`focus-widget-body hoje-adaptive${compact ? ' hoje-adaptive--compact' : ''}`}>
      <p className="hoje-card__kicker">Treino</p>
      <h3 className="hoje-card__title">
        {missed?.isNewUser
          ? 'Sua semana começa hoje'
          : hasMissed
            ? 'Treinos em aberto nesta semana'
            : 'Semana em dia'}
      </h3>
      <p className="hoje-card__body">
        {elasticPlan?.summary ||
          missed?.sentence ||
          'Nenhum treino atrasado nesta semana.'}
      </p>
      {canOffer && !previewOpen ? (
        <div className="hoje-adaptive__actions">
          <button type="button" className="dash-hero__cta" onClick={openPreview}>
            Reorganizar semana
          </button>
          <button type="button" className="dash-hero__more" onClick={() => scrollToSection('planilha')}>
            Abrir planilha
          </button>
        </div>
      ) : null}
      {previewOpen && elasticPlan ? (
        <ElasticWeekPreview
          plan={elasticPlan}
          onApply={() => {
            onApplyElasticWeek?.(elasticPlan)
            setPreviewOpen(false)
          }}
          onDismiss={() => {
            setPreviewOpen(false)
            setIgnored(true)
          }}
        />
      ) : null}
    </div>
  )
}
