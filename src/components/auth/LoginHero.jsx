import { useId } from 'react'
import EvoluaFitLogo from '../branding/EvoluaFitLogo'

function LoginHeroWaves() {
  const id = useId().replace(/:/g, '')
  const waves = [
    { d: 'M-80 268 C 40 232, 150 108, 292 142 S 520 262, 710 188 S 900 96, 1080 118', w: 2.4, o: 0.9 },
    { d: 'M-80 280 C 48 244, 158 122, 300 154 S 528 272, 718 198 S 908 108, 1080 128', w: 1.9, o: 0.62 },
    { d: 'M-80 256 C 36 220, 146 96, 286 132 S 512 250, 702 176 S 892 86, 1080 108', w: 1.7, o: 0.52 },
    { d: 'M-80 292 C 56 256, 166 136, 308 166 S 536 284, 726 210 S 916 120, 1080 140', w: 1.6, o: 0.46 },
    { d: 'M-80 244 C 28 208, 140 84, 278 122 S 504 240, 694 166 S 884 76, 1080 98', w: 1.4, o: 0.34 },
    { d: 'M-80 304 C 62 268, 174 148, 316 178 S 544 296, 734 222 S 924 132, 1080 152', w: 1.4, o: 0.32 },
    { d: 'M-80 232 C 22 198, 132 74, 270 114 S 496 230, 686 156 S 876 68, 1080 90', w: 1.2, o: 0.24 },
    { d: 'M-80 316 C 70 280, 182 160, 324 190 S 552 308, 742 234 S 932 144, 1080 164', w: 1.2, o: 0.22 },
    { d: 'M-80 220 C 16 188, 124 66, 262 106 S 488 222, 678 148 S 868 60, 1080 82', w: 1.1, o: 0.16 },
    { d: 'M-80 328 C 78 292, 190 172, 332 202 S 560 320, 750 246 S 940 156, 1080 176', w: 1.1, o: 0.14 },
  ]
  const sparks = [
    [86, 168, 1.1], [140, 214, 0.8], [210, 132, 0.7], [268, 198, 1],
    [340, 156, 0.6], [412, 236, 0.9], [488, 148, 0.7], [560, 208, 0.8],
    [638, 126, 0.6], [720, 184, 0.9], [802, 142, 0.7], [188, 258, 0.5],
  ]

  return (
    <svg className="login-hero-waves" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3d6bff" />
          <stop offset="28%" stopColor="#4da3ff" />
          <stop offset="55%" stopColor="#7657ff" />
          <stop offset="100%" stopColor="#8a52f5" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
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
      {sparks.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#d7e6ff" opacity="0.42" />
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
          <span className="login-hero-backdrop__halo" />
          <span className="login-hero-backdrop__mist" />
          <LoginHeroWaves />
        </div>
        <div className="login-hero-frame">
          <div className="login-hero-stage" aria-hidden="true">
            <span className="login-hero-stage__beam" />
            <span className="login-hero-stage__core" />
            <span className="login-hero-stage__floor" />
          </div>
          <img
            className="login-hero-art"
            src="/branding/evoluafit-login-athletes.png?v=studio-2"
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
