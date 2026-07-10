import { trendingSports } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function TrendingSports() {
  return (
    <section id="em-alta" className="section trending">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Ranking"
            title="Em alta no esporte"
            subtitle="As modalidades mais acessadas pelos leitores esta semana"
          />
        </SectionReveal>

        <div className="trending__list">
          {trendingSports.map((sport, index) => (
            <SectionReveal key={sport.rank}>
              <article
                className="trending__item card"
                style={{ '--delay': `${index * 0.06}s`, '--color': sport.color }}
              >
                <span className="trending__rank">{sport.rank}</span>
                <span className="trending__icon" aria-hidden="true">{sport.icon}</span>
                <div className="trending__info">
                  <strong>{sport.name}</strong>
                  <div className="trending__bar-wrap">
                    <div
                      className="trending__bar"
                      style={{ width: `${sport.percent}%` }}
                    />
                  </div>
                </div>
                <span className="trending__percent">{sport.percent}%</span>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingSports
