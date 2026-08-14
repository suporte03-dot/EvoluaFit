import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import { BRAND } from '../../data/siteData'
import heroAthleteUrl from '../../assets/dashboard/hero-athlete-back.webp'

function IconChart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V11M12 19V7M19 19V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTarget({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconDumbbell({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 8.5v7M17.5 8.5v7M4 10.5v3M20 10.5v3M6.5 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconShield({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 12.2l1.8 1.8L15 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const FOOTER_ITEMS = [
  { title: 'Evolução constante', text: 'Acompanhe cada passo da sua jornada.', Icon: IconChart },
  { title: 'Foco no objetivo', text: 'Saiba sempre o que fazer agora.', Icon: IconTarget },
  { title: 'Performance e disciplina', text: 'Treine com clareza e consistência.', Icon: IconDumbbell },
  { title: 'Confiança e segurança', text: 'Seus dados protegidos neste aparelho.', Icon: IconShield },
]

function RiseGraphic() {
  return (
    <svg className="auth-split__rise" viewBox="0 0 640 320" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="auth-rise-stroke" x1="40" y1="280" x2="600" y2="40">
          <stop stopColor="#3578FF" />
          <stop offset="1" stopColor="#7657FF" />
        </linearGradient>
        <linearGradient id="auth-rise-bar" x1="0" y1="1" x2="0" y2="0">
          <stop stopColor="#3578FF" stopOpacity="0.15" />
          <stop offset="1" stopColor="#7657FF" stopOpacity="0.85" />
        </linearGradient>
        <filter id="auth-rise-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity="0.55">
        <rect x="368" y="236" width="28" height="52" rx="4" fill="url(#auth-rise-bar)" />
        <rect x="408" y="204" width="28" height="84" rx="4" fill="url(#auth-rise-bar)" />
        <rect x="448" y="168" width="28" height="120" rx="4" fill="url(#auth-rise-bar)" />
        <rect x="488" y="124" width="28" height="164" rx="4" fill="url(#auth-rise-bar)" />
        <rect x="528" y="72" width="28" height="216" rx="4" fill="url(#auth-rise-bar)" />
      </g>
      <path
        d="M36 268C120 252 188 210 268 156C348 102 430 68 596 44"
        stroke="url(#auth-rise-stroke)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#auth-rise-glow)"
      />
      <path d="M574 22l28 18-32 8 4-26z" fill="#7657FF" filter="url(#auth-rise-glow)" />
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
            className="auth-split__photo"
            src={heroAthleteUrl}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
          <div className="auth-split__veil" aria-hidden="true" />
          <RiseGraphic />

          <div className="auth-split__visual-inner">
            <div className="auth-split__copy">
              <EvoluaFitLogo size="medium" showWordmark />
              <h2 className="auth-split__headline">
                Evolua além do <span>treino.</span>
              </h2>
              <p className="auth-split__tagline">{BRAND.tagline}</p>
            </div>

            <div className="auth-security" role="note">
              <span className="auth-security__icon" aria-hidden="true">
                <IconShield size={18} />
              </span>
              <p>
                <strong>Seus dados estão protegidos.</strong>
                Privacidade e segurança em primeiro lugar.
              </p>
            </div>
          </div>
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

        <ul className="auth-values" aria-label="Valores EvoluaFit">
          {FOOTER_ITEMS.map((item) => (
            <li key={item.title} className="auth-values__item">
              <span className="auth-values__icon" aria-hidden="true">
                <item.Icon />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
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
