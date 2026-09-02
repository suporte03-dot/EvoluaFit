import { scrollToSection } from '../../utils/scrollToSection'

export default function AdaptiveWeekNudge({ missed, onReorganize, compact = false }) {
  if (!missed?.count) return null

  return (
    <section className={`hoje-card hoje-adaptive${compact ? ' hoje-adaptive--compact' : ''}`} aria-label="Reorganizar semana">
      <p className="hoje-card__kicker">Semana</p>
      <h3 className="hoje-card__title">Treino em atraso</h3>
      <p className="hoje-card__body">{missed.sentence}</p>
      <div className="hoje-adaptive__actions">
        <button type="button" className="dash-hero__cta" onClick={onReorganize}>
          Reorganizar semana
        </button>
        <button type="button" className="dash-hero__more" onClick={() => scrollToSection('planilha')}>
          Abrir planilha
        </button>
      </div>
    </section>
  )
}
