import EvoluaFitLogo from '../branding/EvoluaFitLogo'

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2 5.5 6v5.2c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V6L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 12.1 11 14l3.8-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17.5 9.2 12l3.4 3.2L20 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 7.5H20V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EvolveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12h7M12.8 8.8 16.2 12l-3.4 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LoginHero() {
  return (
    <aside className="auth-split__visual" aria-label="EvoluaFit">
      <div className="auth-split__stage">
        <div className="auth-split__cast">
          <img
            className="login-hero-art"
            src="/branding/evoluafit-login-hero-approved.jpg?v=mockup-login-1"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="auth-split__scrim" />

        <div className="auth-split__top">
          <EvoluaFitLogo size="small" showWordmark className="auth-split__logo" />
          <div className="auth-split__hero">
            <h2>
              Evolua além <span className="auth-gradient-text">do treino.</span>
            </h2>
            <p>Treine com propósito, acompanhe sua evolução e saiba exatamente qual é o próximo passo.</p>
          </div>
          <ul className="auth-split__features">
            <li>
              <span className="auth-split__feature-icon">
                <TargetIcon />
              </span>
              Treine com propósito
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <ChartIcon />
              </span>
              Acompanhe sua evolução
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <EvolveIcon />
              </span>
              Evolua sem limites
            </li>
          </ul>
        </div>

        <div className="auth-split__bottom">
          <div className="auth-split__privacy">
            <span className="auth-split__privacy-icon">
              <ShieldIcon />
            </span>
            <div>
              <strong>Ambiente seguro</strong>
              <p>
                Seus dados estão <em>protegidos</em>
              </p>
            </div>
          </div>

          <ol className="auth-split__steps" aria-hidden="true">
            <li>Treine</li>
            <li>Acompanhe</li>
            <li className="is-active">Evolua</li>
          </ol>
        </div>
      </div>
    </aside>
  )
}
