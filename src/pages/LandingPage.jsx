import { Link } from 'react-router-dom'
import EvoluaFitLogo from '../components/branding/EvoluaFitLogo'
import EvoluaFitMark from '../components/branding/EvoluaFitMark'
import { BRAND } from '../data/siteData'
import './landing.css'

const HOW_IT_WORKS_ID = 'como-funciona'

const MOCK_EXERCISES = [
  { name: 'Supino reto com barra', detail: '4 × 8 · 60 kg', done: true },
  { name: 'Supino inclinado com halteres', detail: '3 × 10 · 22 kg' },
  { name: 'Crucifixo na máquina', detail: '3 × 12 · 35 kg' },
  { name: 'Tríceps na polia', detail: '3 × 12 · 25 kg' },
]

const SECTIONS = [
  {
    id: HOW_IT_WORKS_ID,
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
    title: 'Um assistente da sua planilha.',
    body: 'Antes de responder, ele mostra o que já sabe: plano, último treino e objetivo.',
  },
  {
    kicker: 'Privacidade',
    title: 'Seus dados. Seu controle.',
    body: 'Sua conta e seu histórico ficam sob sua gestão — sem métricas inventadas.',
  },
]

function scrollToHowItWorks() {
  document.getElementById(HOW_IT_WORKS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function TodayWorkoutMockup() {
  return (
    <div className="landing-phone">
      <div className="landing-phone__screen">
        <span className="landing-phone__notch" />
        <p className="landing-phone__kicker">Treino de hoje</p>
        <p className="landing-phone__title">Treino A — Peito e Tríceps</p>
        <p className="landing-phone__meta">4 exercícios</p>

        <div className="landing-phone__progress">
          <span className="landing-phone__progress-label">Progresso da sessão</span>
          <span className="landing-phone__progress-track">
            <span className="landing-phone__progress-fill" />
          </span>
        </div>

        <ul className="landing-phone__list">
          {MOCK_EXERCISES.map((exercise) => (
            <li
              key={exercise.name}
              className={`landing-phone__item${exercise.done ? ' landing-phone__item--done' : ''}`}
            >
              <span className="landing-phone__check" />
              <span className="landing-phone__item-text">
                <span className="landing-phone__item-name">{exercise.name}</span>
                <span className="landing-phone__item-detail">{exercise.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <span className="landing-phone__cta">Iniciar treino</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing__top">
        <Link to="/" className="landing__logo-link" aria-label="EvoluaFit">
          <EvoluaFitLogo size="small" alt="EvoluaFit" />
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
          <h1 className="landing-hero__title">{BRAND.slogan}</h1>
          <p className="landing-hero__sub">Planeje. Treine. Acompanhe.</p>
          <p className="landing-hero__tag">
            O app que organiza sua planilha de treino, guia cada sessão e mostra sua evolução, com o
            próximo passo sempre claro.
          </p>
          <div className="landing-hero__cta">
            <Link to="/cadastro" className="btn btn--primary">
              Começar agora
            </Link>
            <button type="button" className="btn btn--ghost" onClick={scrollToHowItWorks}>
              Ver como funciona
            </button>
          </div>
          <p className="landing-hero__note">Grátis para começar</p>
        </div>
        <div className="landing-hero__visual" aria-hidden="true">
          <TodayWorkoutMockup />
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.kicker} id={section.id} className="landing-block">
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
