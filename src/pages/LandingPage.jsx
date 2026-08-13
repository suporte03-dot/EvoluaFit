import { Link } from 'react-router-dom'
import EvoluaFitLogo from '../components/branding/EvoluaFitLogo'
import EvoluaFitMark from '../components/branding/EvoluaFitMark'
import { BRAND } from '../data/siteData'
import './landing.css'

const SECTIONS = [
  {
    kicker: 'Hoje',
    title: 'Tudo começa com o que você precisa fazer hoje.',
    body: 'Treino do dia, sequência e próximo passo — sem dashboard confuso.',
  },
  {
    kicker: 'Modo Foco',
    title: 'Treine sem distrações.',
    body: 'Durante a sessão, só exercício, série, carga, descanso e progresso.',
  },
  {
    kicker: 'Evolução',
    title: 'Veja sua evolução acontecer.',
    body: 'Timeline de marcos reais, indicadores e metas no mesmo lugar.',
  },
  {
    kicker: 'Coach',
    title: 'Um Coach que entende seu contexto.',
    body: 'Antes de responder, ele mostra o que já sabe sobre seu treino.',
  },
  {
    kicker: 'Privacidade',
    title: 'Seus dados. Seu controle.',
    body: 'Sua conta e seu histórico ficam sob sua gestão — sem métricas inventadas.',
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing__top">
        <Link to="/" className="landing__logo-link" aria-label="EvoluaFit">
          <EvoluaFitLogo size="small" />
        </Link>
        <div className="landing__top-actions">
          <Link to="/login" className="btn btn--ghost">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn btn--primary">
            Começar agora
          </Link>
        </div>
      </header>

      <section className="landing-hero" aria-label="Apresentação EvoluaFit">
        <div className="landing-hero__copy">
          <p className="landing-hero__brand">{BRAND.name}</p>
          <h1 className="landing-hero__title">{BRAND.slogan}</h1>
          <p className="landing-hero__sub">Planeje. Treine. Acompanhe. Evolua.</p>
          <p className="landing-hero__tag">{BRAND.tagline}</p>
          <div className="landing-hero__cta">
            <Link to="/cadastro" className="btn btn--primary">
              Começar agora
            </Link>
            <Link to="/login" className="btn btn--ghost">
              Já tenho conta
            </Link>
          </div>
        </div>
        <div className="landing-hero__visual" aria-hidden="true">
          <div className="landing-mock">
            <div className="landing-mock__bar">
              <EvoluaFitMark size={28} />
              <span>Hoje</span>
            </div>
            <p className="landing-mock__hello">Boa tarde.</p>
            <h2 className="landing-mock__headline">Seu treino de hoje está pronto.</h2>
            <p className="landing-mock__meta">Peito + Tríceps · 52 min</p>
            <span className="landing-mock__cta">Começar treino</span>
            <div className="landing-mock__row">
              <span>Sequência</span>
              <strong>8 dias</strong>
            </div>
          </div>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.kicker} className="landing-block">
          <p className="landing-block__kicker">{section.kicker}</p>
          <h2 className="landing-block__title">{section.title}</h2>
          <p className="landing-block__body">{section.body}</p>
        </section>
      ))}

      <section className="landing-final">
        <EvoluaFitMark size={56} />
        <h2 className="landing-final__title">
          Seu próximo treino pode ser o começo da sua melhor fase.
        </h2>
        <Link to="/cadastro" className="btn btn--primary">
          Começar agora
        </Link>
        <p className="landing-final__note">{BRAND.disclaimer}</p>
      </section>
    </div>
  )
}
