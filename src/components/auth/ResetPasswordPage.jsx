import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import AuthLoading from './AuthLoading'

export default function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return <AuthLoading label="Validando link" />
  }

  if (!user) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="Abra o link do e-mail de recuperação ou solicite um novo."
        footer={
          <p>
            <Link to="/recuperar-senha">Solicitar novo link</Link>
            {' · '}
            <Link to="/login">Ir para login</Link>
          </p>
        }
      >
        <p className="auth-form__message auth-form__message--error" role="alert">
          Sessão de recuperação não encontrada.
        </p>
      </AuthLayout>
    )
  }

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
    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) {
      setError(updateError.message || 'Não foi possível atualizar a senha.')
      return
    }

    setInfo('Senha atualizada com sucesso.')
    window.setTimeout(() => navigate('/', { replace: true }), 900)
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Defina uma nova senha para sua conta EvoluaFit."
      footer={
        <p>
          <Link to="/login">Voltar ao login</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          <span>Nova senha</span>
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
          <span>Confirmar nova senha</span>
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
          {submitting ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </AuthLayout>
  )
}
