import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import loginArtUrl from '../../assets/branding/logonovaajustada.png'

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

/**
 * Login split: arte original logonovaajustada.png à esquerda.
 * Formulário real à direita. Sem recorte de arquivo e sem desfoque.
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
        <aside className="auth-split__visual">
          <img
            className="auth-split__art"
            src={loginArtUrl}
            alt="EvoluaFit — Evolua além do treino"
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
