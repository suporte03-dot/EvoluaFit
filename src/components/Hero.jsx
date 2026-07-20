import { scrollToSection } from '../utils/scrollToSection'
import { BRAND } from '../data/siteData'

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__glow hero__glow--secondary" aria-hidden="true" />
      <div className="container hero__inner hero__inner--lean">
        <div className="hero__content">
          <span className="hero__badge">{BRAND.slogan}</span>
          <h1 className="hero__title">
            <span className="hero__brand">
              <span className="hero__title-evolua">Evolua</span>
              <span className="hero__title-fit">Fit</span>
            </span>
            <span className="hero__title-rest">Seu treino, com clareza</span>
          </h1>
          <p className="hero__subtitle">
            Monte planilhas, acompanhe a rotina e evolua com consistência.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => scrollToSection('planilha')}>
              Criar minha planilha
            </button>
            <button type="button" className="btn btn--ghost btn--lg" onClick={() => scrollToSection('desempenho')}>
              Ver desempenho
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
