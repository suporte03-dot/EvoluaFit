import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setSubmitting(true)
    const { data, error: signUpError } = await signUp({ name, email, password })
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message || 'Não foi possível criar a conta.')
      return
    }

    if (data?.session) {
      navigate('/', { replace: true })
      return
    }

    setInfo('Conta criada. Verifique seu e-mail para confirmar o cadastro e depois faça login.')
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para organizar treinos e acompanhar sua evolução."
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
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        <label className="form-field">
          <span>Confirmar senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Repita a senha"
          />
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

        <button type="submit" className="btn btn--primary auth-form__submit" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  )
}
