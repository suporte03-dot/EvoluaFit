import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import EvoluaFitMark from '../branding/EvoluaFitMark'
import { BRAND } from '../../data/siteData'

function IconDumbbell({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5v7M17.5 8.5v7M4 10.5v3M20 10.5v3M6.5 12h11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconChart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19V11M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconFlag({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 21V4M6 4h9l-1.5 3.5L15 11H6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShield({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const JOURNEY = [
  { id: 'treine', label: 'Treine', Icon: IconDumbbell, tone: 'muted' },
  { id: 'acompanhe', label: 'Acompanhe', Icon: IconChart, tone: 'muted' },
  { id: 'evolua', label: 'Evolua', Icon: IconFlag, tone: 'progress' },
]

/**
 * Auth shell.
 * variant="split" — capa visual + formulário (login)
 * variant="card" — card central (cadastro / recovery)
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
    const titleParts = String(visualTitle).split(/treino/i)
    const hasTreino = /treino/i.test(visualTitle)

    return (
      <div className="auth-split">
        <aside className="auth-split__visual" aria-label="Identidade EvoluaFit">
          <div className="auth-split__glow" aria-hidden="true" />
          <div className="auth-split__visual-inner">
            <div className="auth-split__brand">
              <EvoluaFitMark size={44} />
              <span className="auth-split__brand-name">
                Evolua<span>Fit</span>
              </span>
            </div>

            <h2 className="auth-split__headline">
              {hasTreino ? (
                <>
                  {titleParts[0]}
                  <span className="auth-split__headline-accent">treino</span>
                  {titleParts[1] || '.'}
                </>
              ) : (
                visualTitle
              )}
            </h2>
            <p className="auth-split__tagline">{visualSubtitle}</p>

            <ol className="auth-journey" aria-label="Jornada EvoluaFit">
              {JOURNEY.map((step, index) => (
                <li
                  key={step.id}
                  className={`auth-journey__item auth-journey__item--${step.tone}`}
                >
                  {index > 0 ? <span className="auth-journey__line" aria-hidden="true" /> : null}
                  <span className="auth-journey__node" aria-hidden="true">
                    <step.Icon size={16} />
                  </span>
                  <span className="auth-journey__label">{step.label}</span>
                </li>
              ))}
            </ol>

            <div className="auth-security" role="note">
              <span className="auth-security__icon" aria-hidden="true">
                <IconShield size={18} />
              </span>
              <p>
                Seus dados estão protegidos. Privacidade e segurança em primeiro lugar.
              </p>
            </div>
          </div>
        </aside>

        <div className="auth-split__panel">
          <div className="auth-split__panel-inner auth-login-card">
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
