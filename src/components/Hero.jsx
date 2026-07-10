import SportImage from './SportImage'
import { heroQuickCards, sportImages } from '../data/siteData'

function Hero() {
  return (
    <section id="inicio" className="hero">
      <SportImage src={sportImages.hero} className="hero__bg-img" loading="eager" />
      <div className="hero__overlay" />
      <div className="hero__grid-lines" aria-hidden="true" />
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="container hero__layout">
        <div className="hero__content">
          <span className="hero__badge">
            <span className="hero__badge-dot" />
            Portal esportivo premium
          </span>

          <h1 className="hero__title">O esporte em todos os ângulos</h1>

          <p className="hero__subtitle">
            Notícias, histórias, agenda e curiosidades para quem vive o esporte.
          </p>

          <div className="hero__actions">
            <a href="#destaques" className="btn btn--primary">
              Ver destaques
            </a>
            <a href="#agenda" className="btn btn--outline">
              Conferir agenda
            </a>
          </div>
        </div>

        <div className="hero__cards">
          {heroQuickCards.map((card) => (
            <a key={card.label} href={card.href} className="hero__card card">
              <span className="hero__card-icon" aria-hidden="true">{card.icon}</span>
              <div className="hero__card-body">
                <span className="hero__card-value">{card.value}</span>
                <strong>{card.label}</strong>
                <span>{card.detail}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
