import EvoluaFitLogo from '../branding/EvoluaFitLogo'

function IconDumbbell({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12M8 8h2v8H8V8zm6 0h2v8h-2V8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTrend({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 16l5.5-5.5 3.5 3.5L20 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 7h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconStar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.8 7.2 18.4l.9-5.4L4.2 9.2l5.4-.8L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShieldCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  below,
  variant = 'card',
  hideHeading = false,
}) {
  if (variant === 'split') {
    return (
      <div className="auth-split">
        <div className="auth-split__main">
          <aside className="auth-split__visual" aria-label="EvoluaFit">
            <div className="auth-split__stage">
              <div className="auth-split__cast" aria-hidden="true">
                <img
                  className="auth-split__cover"
                  src="/branding/login-characters.jpg"
                  alt=""
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="auth-split__scrim" />
                <div className="auth-split__vignette" />
              </div>

              <div className="auth-split__top">
                <div className="auth-split__brand">
                  <EvoluaFitLogo size="medium" showWordmark className="auth-split__logo" />
                </div>
                <div className="auth-split__hero">
                  <h2>
                    Evolua além do <span className="auth-gradient-text">treino.</span>
                  </h2>
                  <p>
                    Treine com propósito, acompanhe seu progresso e saiba sempre qual é o
                    próximo passo.
                  </p>
                </div>
              </div>

              <ul className="auth-split__journey" aria-label="Jornada EvoluaFit">
                <li>
                  <span className="auth-split__journey-icon" aria-hidden="true">
                    <IconDumbbell />
                  </span>
                  <div>
                    <strong>TREINE</strong>
                    <span>Planos inteligentes e personalizados</span>
                  </div>
                </li>
                <li className="auth-split__journey-sep" aria-hidden="true" />
                <li>
                  <span className="auth-split__journey-icon" aria-hidden="true">
                    <IconTrend />
                  </span>
                  <div>
                    <strong>ACOMPANHE</strong>
                    <span>Monitore sua evolução em tempo real</span>
                  </div>
                </li>
                <li className="auth-split__journey-sep" aria-hidden="true" />
                <li>
                  <span className="auth-split__journey-icon" aria-hidden="true">
                    <IconStar />
                  </span>
                  <div>
                    <strong>EVOLUA</strong>
                    <span>Supere limites todos os dias</span>
                  </div>
                </li>
              </ul>

              <div className="auth-split__privacy">
                <span className="auth-split__privacy-icon" aria-hidden="true">
                  <IconShieldCheck />
                </span>
                <div>
                  <strong>Seus dados estão protegidos</strong>
                  <p>Privacidade e segurança em primeiro lugar.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="auth-split__panel">
            <div className="auth-split__panel-inner auth-login-card">
              <div className="auth-split__mobile-brand">
                <EvoluaFitLogo size="medium" showWordmark />
              </div>
              {!hideHeading ? (
                <header className="auth-card__heading">
                  <h1>{title}</h1>
                  {subtitle ? <p>{subtitle}</p> : null}
                </header>
              ) : null}
              {children}
              {footer ? <footer className="auth-card__footer">{footer}</footer> : null}
            </div>
          </div>
        </div>
        {below || null}
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__glow" aria-hidden="true" />
      <div className="auth-screen__grid" aria-hidden="true" />

      <div className="auth-card glass-card">
        <header className="auth-card__brand">
          <EvoluaFitLogo size="medium" showWordmark />
        </header>

        <div className="auth-card__heading">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {children}

        {footer ? <footer className="auth-card__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
