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
      <path d="M6 19v-4M10 19v-7M14 19v-5M18 19V6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function EvolveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.4 2.8 5.6 13.4h5.6l-1 7.8 8.2-11h-5.8l.8-7.4Z" fill="currentColor" />
    </svg>
  )
}

export default function LoginHero() {
  return (
    <aside className="auth-split__visual" aria-label="EvoluaFit">
      <div className="auth-split__brand">
        <EvoluaFitLogo size="small" showWordmark className="auth-split__logo" />
        <p className="auth-split__discipline">Disciplina hoje<br />Resultados sempre</p>
        <div className="auth-split__hero">
          <h2>
            Evolua além do <span className="auth-gradient-text">treino.</span>
          </h2>
          <p>Treine com propósito, acompanhe sua evolução e saiba exatamente qual é o próximo passo.</p>
        </div>
        <div className="auth-split__support">
          <ul className="auth-split__features">
            <li>
              <span className="auth-split__feature-icon">
                <TargetIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Treine</strong>
                <span>com propósito</span>
              </span>
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <ChartIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Acompanhe</strong>
                <span>sua evolução</span>
              </span>
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <EvolveIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Evolua</strong>
                <span>sem limites</span>
              </span>
            </li>
          </ul>
          <div className="auth-split__privacy">
            <span className="auth-split__privacy-icon">
              <ShieldIcon />
            </span>
            <div>
              <strong>Ambiente seguro</strong>
              <p>Seus dados estão protegidos</p>
            </div>
            <span className="auth-split__privacy-arrow" aria-hidden="true">›</span>
          </div>
        </div>
        <p className="auth-split__values" aria-hidden="true">Saúde · Foco · Evolução · Sem limites</p>
      </div>

      <div className="auth-split__cast">
        <div className="auth-split__edition" aria-hidden="true">
          <span>Uma versão</span>
          <strong>mais forte de você</strong>
        </div>
        <div className="login-hero-frame">
          <img
            className="login-hero-art"
            src="/branding/evoluafit-login-athletes.png?v=loginnovo-3"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <ol className="auth-split__steps" aria-hidden="true">
          <li>Treine</li>
          <li>Acompanhe</li>
          <li className="is-active">Evolua</li>
        </ol>
      </div>
    </aside>
  )
}
