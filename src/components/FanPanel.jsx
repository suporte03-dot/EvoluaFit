import { fanPanelCards } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function FanPanel() {
  return (
    <section id="painel" className="section fan-panel">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Ao vivo"
            title="Painel do Torcedor"
            subtitle="Resumo rápido do que importa agora no mundo esportivo"
            light
          />
        </SectionReveal>

        <div className="fan-panel__grid">
          {fanPanelCards.map((card, index) => (
            <SectionReveal key={card.id}>
              <article
                className={`fan-panel__card card fan-panel__card--${card.accent}`}
                style={{ '--delay': `${index * 0.07}s` }}
              >
                <div className="fan-panel__scoreboard">
                  <span className="fan-panel__icon" aria-hidden="true">{card.icon}</span>
                  <span className="fan-panel__value">{card.value}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.detail}</p>
                <div className="fan-panel__led" aria-hidden="true" />
              </article>
            </SectionReveal>
          ))}
        </div>

        <div className="fan-panel__links">
          <a href="#agenda" className="fan-panel__link">📅 Ver agenda completa</a>
          <a href="#destaques" className="fan-panel__link">📰 Ver todas as notícias</a>
          <a href="#em-alta" className="fan-panel__link">🔥 Modalidades em alta</a>
        </div>
      </div>
    </section>
  )
}

export default FanPanel
