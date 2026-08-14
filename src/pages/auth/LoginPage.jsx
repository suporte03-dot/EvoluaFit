import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/auth/AuthLayout'

function IconMail({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4.5 7.5L12 13l7.5-5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLock({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 10V7.5a3.5 3.5 0 017 0V10" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconEye({ size = 18, off = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      {off ? <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /> : null}
    </svg>
  )
}

function IconBolt({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
    </svg>
  )
}

function IconArrow({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUserPlus({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 19c1.4-3 3.7-4.5 6.5-4.5s5.1 1.5 6.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLockMini({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 10V7.5a3.5 3.5 0 017 0V10" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconShieldMini({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCloudMini({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 18h9.2A4.3 4.3 0 0021 13.9a4.2 4.2 0 00-3.7-4.1A6 6 0 007.2 8.2 4.5 4.5 0 007.5 18z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: signInError } = await signIn({ email, password })
    setSubmitting(false)

    if (signInError) {
      setError(signInError.message || 'Não foi possível entrar. Verifique e-mail e senha.')
      return
    }

    if (remember) {
      try {
        localStorage.setItem('evoluafit-remember-email', email)
      } catch {
        /* ignore */
      }
    }

    navigate('/app', { replace: true })
  }

  return (
    <AuthLayout
      variant="split"
      hideHeading
      footer={
        <p className="auth-legal">
          Ao continuar, você concorda com os{' '}
          <a href="#termos">Termos de Uso</a> e a{' '}
          <a href="#privacidade">Política de Privacidade</a>.
        </p>
      }
      below={
        <ul className="auth-trust">
          <li>
            <span className="auth-trust__icon" aria-hidden="true">
              <IconShieldMini />
            </span>
            <div>
              <strong>Privacidade total</strong>
              <p>Seus dados nunca serão compartilhados.</p>
            </div>
          </li>
          <li>
            <span className="auth-trust__icon" aria-hidden="true">
              <IconLockMini size={18} />
            </span>
            <div>
              <strong>Segurança avançada</strong>
              <p>Criptografia e proteção de ponta a ponta.</p>
            </div>
          </li>
          <li>
            <span className="auth-trust__icon" aria-hidden="true">
              <IconCloudMini />
            </span>
            <div>
              <strong>Acesso em qualquer lugar</strong>
              <p>Web, Android e iOS totalmente sincronizados.</p>
            </div>
          </li>
        </ul>
      }
    >
      <p className="auth-pill" role="note">
        <IconBolt />
        <span>
          Seu melhor começa com <strong>consistência.</strong>
        </span>
      </p>

      <header className="auth-card__heading">
        <h1>
          Continue sua <span className="auth-gradient-text">evolução.</span>
        </h1>
        <p>Entre para acessar seus treinos, acompanhar seu progresso e continuar de onde parou.</p>
      </header>

      <form className="auth-form auth-form--login" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          <span>E-mail</span>
          <div className="auth-input">
            <span className="auth-input__icon" aria-hidden="true">
              <IconMail />
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              placeholder="seu@email.com"
            />
          </div>
        </label>

        <label className="form-field">
          <span>Senha</span>
          <div className="auth-input auth-input--password">
            <span className="auth-input__icon" aria-hidden="true">
              <IconLock />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-required="true"
              placeholder="Sua senha"
            />
            <button
              type="button"
              className="auth-password-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <IconEye off={showPassword} />
              <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
        </label>

        <div className="auth-form__row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Lembrar de mim</span>
          </label>
          <Link to="/esqueci-senha" className="auth-link auth-link--forgot">
            Esqueci minha senha
          </Link>
        </div>

        {error ? (
          <p className="auth-form__message auth-form__message--error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn auth-form__submit auth-form__submit--gradient"
          disabled={submitting}
        >
          <span>{submitting ? 'Entrando...' : 'Entrar'}</span>
          {!submitting ? <IconArrow /> : null}
        </button>
      </form>

      <div className="auth-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <Link to="/cadastro" className="auth-btn-secondary">
        <IconUserPlus />
        <span>Criar uma conta</span>
      </Link>

      <p className="auth-secure-note">
        <IconLockMini />
        Ambiente 100% seguro e protegido.
      </p>
    </AuthLayout>
  )
}
