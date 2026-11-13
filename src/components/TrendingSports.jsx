import { trendingSports } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function TrendingSports({ onSportHighlight }) {
  const handleSportClick = (sport) => {
    onSportHighlight?.(sport.filter)
    scrollToSection('modalidades')
  }

  const handleSportKeyDown = (event, sport) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSportClick(sport)
    }
  }

  return (
    <section id="em-alta" className="section trending">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Tendências"
            title="Em alta no esporte"
            subtitle="As modalidades que mais movimentam torcedores e leitores nesta semana"
          />
        </SectionReveal>

        <div className="trending__list">
          {trendingSports.map((sport, index) => (
            <SectionReveal key={sport.rank}>
              <article
                className="trending__item card card--clickable"
                style={{ '--color': sport.color, '--delay': `${index * 0.06}s` }}
                role="button"
                tabIndex={0}
                onClick={() => handleSportClick(sport)}
                onKeyDown={(event) => handleSportKeyDown(event, sport)}
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
