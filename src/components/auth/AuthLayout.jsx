import EvoluaFitLogo from '../branding/EvoluaFitLogo'

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
                <picture>
                  <source
                    media="(max-width: 1023px)"
                    srcSet="/branding/evoluafit-login-hero-tablet.png?v=faixa-4"
                  />
                  <source
                    media="(min-width: 1440px)"
                    srcSet="/branding/evoluafit-login-hero-desktop.png?v=faixa-4"
                  />
                  <img
                    className="login-hero-art"
                    src="/branding/evoluafit-login-hero-approved.png?v=faixa-4"
                    alt=""
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
                <div className="auth-split__scrim" />
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

              {/* Labels TREINE/ACOMPANHE/EVOLUA já legíveis na arte — sem duplicar */}

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
