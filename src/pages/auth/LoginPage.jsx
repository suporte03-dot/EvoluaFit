import { useEffect, useState } from 'react'
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
      <rect x="5" y="11" width="14" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 11V8.4a4 4 0 0 1 8 0V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function IconGoogle({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  )
}

const REMEMBER_EMAIL_KEY = 'evoluafit-remember-email'

function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const rememberedEmail = readRememberedEmail()
  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail)
  }, [rememberedEmail])

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
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      } catch {
        /* ignore */
      }
    }

    navigate('/app', { replace: true })
  }

  const handleGoogle = async () => {
    setError('')
    const { error: googleError } = await signInWithGoogle()
    if (googleError) {
      setError(googleError.message || 'Não foi possível entrar com o Google.')
    }
  }

  return (
    <AuthLayout variant="split" hideHeading>
      <header className="auth-card__heading auth-card__heading--login">
        <h1>Entrar na sua conta</h1>
        <p>Bem-vindo de volta!</p>
      </header>

      <form className="auth-form auth-form--login" onSubmit={handleSubmit} noValidate>
        <label className="form-field form-field--sr-only-label">
          <span className="visually-hidden">E-mail</span>
          <div className="auth-input auth-input--leading">
            <span className="auth-input__icon auth-input__icon--leading" aria-hidden="true">
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

        <label className="form-field form-field--sr-only-label">
          <span className="visually-hidden">Senha</span>
          <div className="auth-input auth-input--leading auth-input--password">
            <span className="auth-input__icon auth-input__icon--leading" aria-hidden="true">
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
              onChange={(e) => {
                const next = e.target.checked
                setRemember(next)
                if (!next) {
                  try {
                    localStorage.removeItem(REMEMBER_EMAIL_KEY)
                  } catch {
                    /* ignore */
                  }
                }
              }}
              aria-checked={remember}
              aria-readonly="false"
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
          <span>{submitting ? 'Entrando...' : 'Entrar'}</span>
          {!submitting ? <span className="auth-form__submit-arrow" aria-hidden="true">→</span> : null}
        </button>
      </form>

      <div className="auth-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <button type="button" className="auth-btn-secondary auth-btn-google" onClick={handleGoogle}>
        <IconGoogle />
        Entrar com Google
      </button>

      <Link to="/cadastro" className="auth-btn-secondary">
        Criar nova conta
      </Link>

      <p className="auth-card__crypto">
        <IconLock size={13} />
        Seus dados protegidos com criptografia
      </p>
    </AuthLayout>
  )
}
