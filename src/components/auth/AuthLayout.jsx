import athletesMark from '../../assets/branding/evoluafit-athletes-mark.png'
import ThemeToggle from '../ThemeToggle'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen">
      <div className="auth-screen__glow" aria-hidden="true" />
      <div className="auth-screen__grid" aria-hidden="true" />

      <div className="auth-screen__theme">
        <ThemeToggle />
      </div>

      <div className="auth-card glass-card">
        <header className="auth-card__brand">
          <img
            src={athletesMark}
            alt=""
            aria-hidden="true"
            className="auth-card__mark"
            draggable={false}
            decoding="async"
          />
          <div className="auth-card__brand-text">
            <p className="auth-card__name">
              <span className="auth-card__name-main">Evolua</span>
              <span className="auth-card__name-accent">Fit</span>
            </p>
            <p className="auth-card__tagline">Treine com foco. Evolua com constância.</p>
          </div>
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
