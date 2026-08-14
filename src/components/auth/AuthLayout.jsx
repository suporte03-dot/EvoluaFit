import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import { BRAND } from '../../data/siteData'
import loginSceneUrl from '../../assets/branding/login-characters.jpg'

function IconShield({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.2l1.8 1.8L15 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

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
        <aside className="auth-split__visual">
          <img
            className="auth-split__scene"
            src={loginSceneUrl}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
          <div className="auth-split__veil" aria-hidden="true" />

          <div className="auth-split__visual-inner">
            <EvoluaFitLogo size="large" showWordmark className="auth-split__logo" />

            <div className="auth-split__copy">
              <h2 className="auth-split__headline">Evolua além do treino</h2>
              <p className="auth-split__tagline">{BRAND.tagline}</p>
            </div>

            <p className="auth-split__secure">
              <span className="auth-split__secure-icon" aria-hidden="true">
                <IconShield />
              </span>
              Seus dados estão protegidos.
            </p>
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
