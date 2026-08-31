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
    <AuthLayout variant="split" hideHeading>
      <header className="auth-card__heading auth-card__heading--login">
        <h1>Entrar na sua conta</h1>
      </header>

      <form className="auth-form auth-form--login" onSubmit={handleSubmit} noValidate>
        <label className="form-field form-field--sr-only-label">
          <span className="visually-hidden">E-mail</span>
          <div className="auth-input auth-input--trailing">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              placeholder="seu@email.com"
            />
            <span className="auth-input__icon auth-input__icon--trailing" aria-hidden="true">
              <IconMail />
            </span>
          </div>
        </label>

        <label className="form-field form-field--sr-only-label">
          <span className="visually-hidden">Senha</span>
          <div className="auth-input auth-input--trailing auth-input--password">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-required="true"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="auth-password-field__toggle auth-password-field__toggle--icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <IconEye off={!showPassword} />
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
            Esqueceu a senha?
          </Link>
        </div>

        {error ? (
          <p className="auth-form__message auth-form__message--error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className={`btn auth-form__submit auth-form__submit--gradient${submitting ? ' is-loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="auth-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <Link to="/cadastro" className="auth-btn-secondary">
        Criar nova conta
      </Link>
    </AuthLayout>
  )
}
