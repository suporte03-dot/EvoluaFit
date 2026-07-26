import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../context/FitnessContext'
import { useAuth } from '../context/AuthContext'
import SectionTitle from './SectionTitle'
import BackupSettings from './BackupSettings'

const objectives = [
  { value: 'saude', label: 'Saúde geral' },
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'forca', label: 'Força' },
]

const objectiveLabel = (value) => objectives.find((o) => o.value === value)?.label || value

export default function UserProfile() {
  const { profile, updateProfile } = useFitness()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...profile })
  const [open, setOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile(form)
  }

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    const { error } = await signOut()
    setSigningOut(false)
    if (!error) navigate('/login', { replace: true })
  }

  return (
    <section id="perfil" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Perfil"
          title="Seu perfil"
          subtitle="Dados que alimentam o gerador de planilhas."
        />

        <div className="profile-summary glass-card">
          <div className="profile-summary__main">
            <strong className="profile-summary__name">{form.name || 'Atleta'}</strong>
            <p className="profile-summary__meta">
              {objectiveLabel(form.objective)} · {form.level} · {form.daysPerWeek}x/semana ·{' '}
              {form.duration} min
            </p>
            {user?.email ? (
              <p className="profile-summary__meta profile-summary__email">{user.email}</p>
            ) : null}
          </div>
          <div className="profile-summary__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              {open ? 'Ocultar detalhes' : 'Editar perfil'}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={handleLogout}
              disabled={signingOut}
            >
              {signingOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>

        {open && (
          <form className="profile-form glass-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Nome</span>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Idade</span>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  placeholder="ex: 28"
                />
              </label>
              <label className="form-field">
                <span>Peso (kg)</span>
                <input
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  placeholder="ex: 75"
                />
              </label>
              <label className="form-field">
                <span>Altura (cm)</span>
                <input
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  placeholder="ex: 175"
                />
              </label>
              <label className="form-field">
                <span>Objetivo principal</span>
                <select value={form.objective} onChange={(e) => update('objective', e.target.value)}>
                  {objectives.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Nível</span>
                <select value={form.level} onChange={(e) => update('level', e.target.value)}>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </label>
              <label className="form-field">
                <span>Dias por semana</span>
                <input
                  type="number"
                  min="2"
                  max="7"
                  value={form.daysPerWeek}
                  onChange={(e) => update('daysPerWeek', Number(e.target.value))}
                />
              </label>
              <label className="form-field">
                <span>Duração (min)</span>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={form.duration}
                  onChange={(e) => update('duration', Number(e.target.value))}
                />
              </label>
            </div>
            <button type="submit" className="btn btn--primary">
              Salvar perfil
            </button>
          </form>
        )}

        <div className="profile-backup-wrap">
          <button
            type="button"
            className={`disclose-toggle${backupOpen ? ' is-open' : ''}`}
            onClick={() => setBackupOpen((o) => !o)}
            aria-expanded={backupOpen}
          >
            <span>{backupOpen ? 'Ocultar backup' : 'Backup e dados'}</span>
            <span aria-hidden="true">{backupOpen ? '▲' : '▼'}</span>
          </button>
          {backupOpen && <BackupSettings />}
        </div>
      </div>
    </section>
  )
}
