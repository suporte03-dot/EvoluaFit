import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    const { error: resetError } = await resetPasswordForEmail(email)
    setSubmitting(false)

    if (resetError) {
      setError(resetError.message || 'Não foi possível enviar o e-mail de recuperação.')
      return
    }

    setInfo('Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.')
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <p>
          Lembrou a senha? <Link to="/login">Voltar ao login</Link>
        </p>
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
          {submitting ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
    </AuthLayout>
  )
}
