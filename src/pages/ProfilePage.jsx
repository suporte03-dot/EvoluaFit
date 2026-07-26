import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import SectionTitle from '../components/SectionTitle'
import InstallPwaButton from '../components/pwa/InstallPwaButton'

const GOAL_OPTIONS = [
  'Saúde geral',
  'Ganho de força',
  'Hipertrofia',
  'Condicionamento',
  'Emagrecimento',
  'Mobilidade',
]

const LEVEL_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado']

const EMPTY_FORM = {
  full_name: '',
  goal: 'Saúde geral',
  level: 'Iniciante',
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { profile, loadingProfile, profileError, updateProfile } = useProfile()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!profile) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      full_name: profile.full_name || '',
      goal: GOAL_OPTIONS.includes(profile.goal) ? profile.goal : GOAL_OPTIONS[0],
      level: LEVEL_OPTIONS.includes(profile.level) ? profile.level : LEVEL_OPTIONS[0],
    })
  }, [profile])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return

    const fullName = form.full_name.trim()
    if (!fullName) {
      setError('Informe seu nome.')
      setSuccess('')
      return
    }

    if (fullName.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.')
      setSuccess('')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await updateProfile({
      full_name: fullName,
      goal: form.goal,
      level: form.level,
    })

    setSaving(false)

    if (updateError) {
      setError(updateError.message || 'Não foi possível salvar o perfil.')
      return
    }

    setSuccess('Perfil atualizado com sucesso.')
  }

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    const { error: signOutError } = await signOut()
    setSigningOut(false)
    if (!signOutError) navigate('/login', { replace: true })
  }

  return (
    <section id="perfil" className="section section--alt profile-page">
      <div className="container">
        <SectionTitle
          tag="Perfil"
          title="Seu perfil"
          subtitle="Gerencie nome, objetivo e nível da sua conta EvoluaFit."
        />

        <div className="profile-page__toolbar">
          <Link to="/app" className="btn btn--ghost btn--sm">
            Voltar ao painel
          </Link>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={handleLogout}
            disabled={signingOut}
          >
            {signingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>

        <div className="profile-summary glass-card">
          <div className="profile-summary__main">
            {loadingProfile ? (
              <>
                <strong className="profile-summary__name profile-placeholder">Carregando...</strong>
                <p className="profile-summary__meta profile-placeholder">Buscando dados do perfil</p>
              </>
            ) : (
              <>
                <strong className="profile-summary__name">
                  {profile?.full_name?.trim() || 'Atleta'}
                </strong>
                <p className="profile-summary__meta">
                  {profile?.goal || 'Objetivo não definido'} · {profile?.level || 'Nível não definido'}
                </p>
              </>
            )}
            {user?.email ? (
              <p className="profile-summary__meta profile-summary__email">{user.email}</p>
            ) : null}
          </div>
        </div>

        <div className="profile-pwa-card glass-card">
          <div className="profile-pwa-card__copy">
            <strong>Aplicativo</strong>
            <p>Instale o EvoluaFit na tela inicial para abrir como app.</p>
          </div>
          <InstallPwaButton className="profile-pwa-card__btn" />
        </div>

        {profileError ? (
          <p className="profile-page__message profile-page__message--error" role="alert">
            {profileError}
          </p>
        ) : null}

        <form className="profile-form glass-card" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label className="form-field">
              <span>Nome</span>
              <input
                type="text"
                autoComplete="name"
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                disabled={loadingProfile || saving}
                placeholder="Seu nome"
                required
              />
            </label>

            <label className="form-field">
              <span>Objetivo</span>
              <select
                value={form.goal}
                onChange={(e) => updateField('goal', e.target.value)}
                disabled={loadingProfile || saving}
              >
                {GOAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Nível</span>
              <select
                value={form.level}
                onChange={(e) => updateField('level', e.target.value)}
                disabled={loadingProfile || saving}
              >
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p className="profile-page__message profile-page__message--error" role="alert">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="profile-page__message profile-page__message--success" role="status">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loadingProfile || saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </section>
  )
}