import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import EvoluaFitMark from '../branding/EvoluaFitMark'
import { BRAND } from '../../data/siteData'

/**
 * Auth shell.
 * variant="split" — desktop visual + form (login priority)
 * variant="card" — centered card (cadastro / recovery)
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = 'card',
  visualTitle = BRAND.slogan,
  visualSubtitle = BRAND.tagline,
}) {
  if (variant === 'split') {
    return (
      <div className="auth-split">
        <aside className="auth-split__visual" aria-label="Identidade EvoluaFit">
          <div className="auth-split__visual-inner">
            <EvoluaFitLogo size="large" showWordmark />
            <h2 className="auth-split__headline">{visualTitle}</h2>
            <p className="auth-split__tagline">{visualSubtitle}</p>
            <div className="auth-split__art" aria-hidden="true">
              <EvoluaFitMark size={120} withBackground={false} />
              <svg className="auth-split__trajectory" viewBox="0 0 320 160" fill="none">
                <path
                  d="M8 132C72 120 96 88 140 64C184 40 220 28 312 18"
                  stroke="url(#auth-traj)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M8 148C88 138 120 110 168 86C216 62 248 52 312 44"
                  stroke="url(#auth-traj)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <circle cx="312" cy="18" r="4" fill="#7657FF" />
                <defs>
                  <linearGradient id="auth-traj" x1="8" y1="140" x2="312" y2="18">
                    <stop stopColor="#3578FF" />
                    <stop offset="1" stopColor="#7657FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </aside>

        <div className="auth-split__panel">
          <div className="auth-split__panel-inner">
            <div className="auth-split__mobile-brand">
              <EvoluaFitLogo size="medium" showWordmark />
            </div>
            <header className="auth-card__heading">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </header>
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
