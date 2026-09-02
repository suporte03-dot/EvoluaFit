import { scrollToSection } from '../../utils/scrollToSection'

export default function AdaptiveWeekNudge({ missed, onReorganize, compact = false, allowEmpty = false }) {
  if (!missed?.count && !allowEmpty) return null

  return (
    <div className={`focus-widget-body hoje-adaptive${compact ? ' hoje-adaptive--compact' : ''}`}>
      <p className="hoje-card__kicker">Treino</p>
      <h3 className="hoje-card__title">{missed?.count ? 'Treino em atraso' : 'Semana em dia'}</h3>
      <p className="hoje-card__body">
        {missed?.sentence || 'Nenhum treino atrasado nesta semana.'}
      </p>
      {missed?.count ? (
        <div className="hoje-adaptive__actions">
          <button type="button" className="dash-hero__cta" onClick={onReorganize}>
            Reorganizar semana
          </button>
          <button type="button" className="dash-hero__more" onClick={() => scrollToSection('planilha')}>
            Abrir planilha
          </button>
        </div>
      ) : null}
    </div>
  )
}
