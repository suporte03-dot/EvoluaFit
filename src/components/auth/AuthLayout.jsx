import EvoluaFitLogo from '../branding/EvoluaFitLogo'

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = 'card',
  hideHeading = false,
}) {
  if (variant === 'split') {
    return (
      <div className="auth-split">
        <div className="auth-split__shell">
          <aside className="auth-split__visual login-cover" aria-label="EvoluaFit" />

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
