import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import loginCoverLeftUrl from '../../assets/branding/login-cover-left.png'

/**
 * Auth shell.
 * variant="split" — capa do arquivo + formulário interativo
 * variant="card" — card central (cadastro / recovery)
 */
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
        <aside className="auth-split__visual" aria-label="EvoluaFit">
          <img
            className="auth-split__cover"
            src={loginCoverLeftUrl}
            alt="Evolua além do treino — EvoluaFit"
            decoding="async"
            fetchPriority="high"
          />
        </aside>

        <div className="auth-split__panel">
          <div className="auth-split__panel-inner auth-login-card">
            <div className="auth-split__mobile-brand">
              <EvoluaFitLogo size="medium" showWordmark />
            </div>
            {!hideHeading ? (
              <header className="auth-card__heading auth-card__heading--center">
                <h1>{title}</h1>
                {subtitle ? <p>{subtitle}</p> : null}
              </header>
            ) : null}
            {children}
            {footer ? <footer className="auth-card__footer">{footer}</footer> : null}
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
