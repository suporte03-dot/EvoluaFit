import { useId } from 'react'
import EvoluaFitLogo from '../branding/EvoluaFitLogo'

function LoginHeroWaves() {
  const id = useId().replace(/:/g, '')
  const waves = [
    { d: 'M-90 286 C 50 248, 170 318, 330 278 S 540 208, 730 268 S 910 338, 1120 278', w: 1.1, o: 0.11 },
    { d: 'M-70 308 C 70 270, 190 340, 350 300 S 560 230, 750 290 S 930 360, 1100 300', w: 0.95, o: 0.09 },
    { d: 'M-100 264 C 40 226, 180 296, 340 256 S 550 186, 740 246 S 920 316, 1140 256', w: 0.85, o: 0.08 },
    { d: 'M-60 330 C 80 292, 210 362, 370 322 S 580 252, 770 312 S 950 382, 1120 322', w: 0.75, o: 0.07 },
    { d: 'M-80 246 C 30 210, 170 278, 340 240 S 550 172, 740 228 S 920 298, 1120 238', w: 0.7, o: 0.06 },
  ]

  return (
    <svg className="login-hero-waves" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#4da3ff" stopOpacity="0.55" />
          <stop offset="38%" stopColor="#6d4aff" stopOpacity="0.7" />
          <stop offset="72%" stopColor="#8a52f5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#5a2ab8" stopOpacity="0.05" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-12%" y="-30%" width="124%" height="160%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {waves.map((wave) => (
        <path
          key={wave.d}
          d={wave.d}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={wave.w}
          strokeLinecap="round"
          opacity={wave.o}
          filter={`url(#${id}-glow)`}
        />
      ))}
    </svg>
  )
}

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

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17.5 9.2 12l3.4 3.2L20 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 7.5H20V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EvolveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12h7M12.8 8.8 16.2 12l-3.4 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LoginHero() {
  return (
    <aside className="auth-split__visual" aria-label="EvoluaFit">
      <div className="auth-split__brand">
        <EvoluaFitLogo size="small" showWordmark className="auth-split__logo" />
        <div className="auth-split__hero">
          <h2>
            Evolua além do <span className="auth-gradient-text">treino.</span>
          </h2>
          <p>Treine com propósito, acompanhe sua evolução e saiba exatamente qual é o próximo passo.</p>
        </div>
        <div className="auth-split__support">
          <ul className="auth-split__features">
            <li>
              <span className="auth-split__feature-icon">
                <TargetIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Treine</strong>
                <span>com propósito</span>
              </span>
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <ChartIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Acompanhe</strong>
                <span>sua evolução</span>
              </span>
            </li>
            <li>
              <span className="auth-split__feature-icon">
                <EvolveIcon />
              </span>
              <span className="auth-split__feature-copy">
                <strong>Evolua</strong>
                <span>sem limites</span>
              </span>
            </li>
          </ul>
          <div className="auth-split__privacy">
            <span className="auth-split__privacy-icon">
              <ShieldIcon />
            </span>
            <div>
              <strong>Ambiente seguro</strong>
              <p>Seus dados estão protegidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-split__cast">
        <div className="login-hero-backdrop" aria-hidden="true">
          <LoginHeroWaves />
        </div>
        <div className="login-hero-frame">
          <img
            className="login-hero-art"
            src="/branding/evoluafit-login-athletes.png?v=behind-1"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <ol className="auth-split__steps" aria-hidden="true">
          <li>Treine</li>
          <li>Acompanhe</li>
          <li className="is-active">Evolua</li>
        </ol>
      </div>
    </aside>
  )
}
