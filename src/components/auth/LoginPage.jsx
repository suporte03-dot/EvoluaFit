import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para continuar treinos e evolução."
      footer={
        <>
          <p>
            Não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
          <p>
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
          </p>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="auth-form__message auth-form__message--error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary auth-form__submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
