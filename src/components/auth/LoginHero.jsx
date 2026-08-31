import EvoluaFitLogo from '../branding/EvoluaFitLogo'
import { BRAND } from '../../data/siteData'

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2 5.5 6v5.2c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V6L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 12.1 11 14l3.8-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function EvolutionPath() {
  return (
    <div className="auth-split__evolution" aria-hidden="true">
      <svg className="auth-split__evolution-svg" viewBox="0 0 960 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ef-evo-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#6bb0ff" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="#6b68ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8a52f5" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="ef-evo-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b68ff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#6b68ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 312 L0 248 C120 242 190 220 280 176 S470 88 620 64 S820 40 960 22 L960 312 Z"
          fill="url(#ef-evo-fill)"
        />
        <path
          d="M0 248 C120 242 190 220 280 176 S470 88 620 64 S820 40 960 22"
          fill="none"
          stroke="url(#ef-evo-stroke)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="280" cy="176" r="4.5" fill="#8ec4ff" />
        <circle cx="620" cy="64" r="4.5" fill="#9aa6ff" />
        <circle cx="930" cy="24" r="5" fill="#c4b5ff" />
      </svg>
      <ol className="auth-split__evolution-legend">
        <li>Treine</li>
        <li>Acompanhe</li>
        <li>Evolua</li>
      </ol>
    </div>
  )
}

export default function LoginHero() {
  return (
    <aside className="auth-split__visual" aria-label="EvoluaFit">
      <div className="auth-split__stage">
        <div className="auth-split__cast">
          <img
            className="login-hero-art"
            src="/branding/evoluafit-login-cast.jpg?v=cast-frame-8"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <EvolutionPath />
        <div className="auth-split__scrim" />

        <div className="auth-split__top">
          <EvoluaFitLogo size="small" showWordmark className="auth-split__logo" />
          <div className="auth-split__hero">
            <h2>
              Evolua além do <span className="auth-gradient-text">treino.</span>
            </h2>
            <p>{BRAND.tagline}</p>
          </div>
        </div>

        <div className="auth-split__privacy">
          <span className="auth-split__privacy-icon">
            <ShieldIcon />
          </span>
          <div>
            <strong>Seus dados estão protegidos</strong>
            <p>Privacidade e segurança em primeiro lugar.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
