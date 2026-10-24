import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/auth/AuthLayout'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export default function RegisterPage() {
  useDocumentTitle('Criar conta')
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError('Informe seu nome.')
      return
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um e-mail válido.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (!acceptedTerms) {
      setError('Para criar a conta, aceite os Termos de uso e a Política de Privacidade.')
      return
    }

    setSubmitting(true)
    const { data, error: signUpError } = await signUp({
      name: trimmedName,
      email: trimmedEmail,
      password,
    })
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message || 'Não foi possível criar a conta.')
      return
    }

    if (data?.session) {
      navigate('/app', { replace: true })
      return
    }

    setInfo('Cadastro realizado. Verifique seu e-mail para confirmar a conta.')
  }

  const handleGoogle = async () => {
    setError('')
    if (!acceptedTerms) {
      setError('Para continuar com o Google, aceite os Termos de uso e a Política de Privacidade.')
      return
    }
    const { error: googleError } = await signInWithGoogle()
    if (googleError) {
      setError(googleError.message || 'Não foi possível entrar com o Google.')
    }
  }

  return (
    <AuthLayout
      variant="split"
      title="Criar conta"
      subtitle="Crie sua conta em 30 segundos e comece a treinar com propósito."
      footer={
        <p>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          <span>Nome</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Seu nome"
          />
        </label>

        <label className="form-field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />
        </label>

        <label className="form-field">
          <span>Senha</span>
          <div className="auth-input auth-input--password">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
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

        <label className="form-field">
          <span>Confirmar senha</span>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Repita a senha"
          />
        </label>

        <label className="auth-check auth-check--terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>
            Li e aceito os <Link to="/termos">Termos de uso</Link> e a{' '}
            <Link to="/privacidade">Política de Privacidade</Link>.
          </span>
        </label>

        {error ? (
          <p className="auth-form__message auth-form__message--error" role="alert">
            {error}
          </p>
        ) : null}

        {info ? (
          <p className="auth-form__message auth-form__message--success" role="status">
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          className={`btn auth-form__submit auth-form__submit--gradient${submitting ? ' is-loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <div className="auth-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <button type="button" className="auth-btn-secondary auth-btn-google" onClick={handleGoogle}>
        <IconGoogle />
        Entrar com Google
      </button>
    </AuthLayout>
  )
}
