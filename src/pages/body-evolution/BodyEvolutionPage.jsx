import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFitness } from '../../context/FitnessContext'
import { useBodyEvolution } from '../../hooks/useBodyEvolution'
import { toNumber } from '../../utils/bodyEvolutionMetrics'
import BodyOnboarding from '../../components/body-evolution/BodyOnboarding'
import BodyPhotoConsent from '../../components/body-evolution/BodyPhotoConsent'
import BodyCheckInForm from '../../components/body-evolution/BodyCheckInForm'
import BodyEmptyState from '../../components/body-evolution/BodyEmptyState'
import BodyEvolutionDashboard from '../../components/body-evolution/BodyEvolutionDashboard'
import BodyPhotoViewer from '../../components/body-evolution/BodyPhotoViewer'
import BodyComparisonSlider from '../../components/body-evolution/BodyComparisonSlider'
import BodyGoalPanel from '../../components/body-evolution/BodyGoalPanel'
import '../../styles/body-evolution.css'

function pathView(pathname) {
  if (pathname.endsWith('/novo')) return 'novo'
  if (pathname.endsWith('/comparar')) return 'comparar'
  if (pathname.endsWith('/meta')) return 'meta'
  return 'home'
}

export default function BodyEvolutionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const view = pathView(location.pathname)
  const { profile } = useFitness()
  const body = useBodyEvolution()
  const [phase, setPhase] = useState('intro')
  const [consentChecked, setConsentChecked] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const [viewer, setViewer] = useState(null)

  const height = toNumber(body.profile?.height) || toNumber(profile?.height)

  useEffect(() => {
    if (body.consent) setPhase((current) => (current === 'consent' ? 'form' : current))
  }, [body.consent])

  const openHome = () => navigate('/app/evolucao/espelho')
  const openNew = () => navigate('/app/evolucao/espelho/novo')

  const handleCreate = async (payload) => {
    setPhotoError('')
    const result = await body.addCheckin(payload)
    if (result.error?.code === 'photo_upload') {
      setPhotoError(result.error.message)
      return
    }
    if (result.error) {
      setPhotoError(result.error.message)
      return
    }
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2800)
    openHome()
  }

  const openPhoto = async (photo) => {
    const url = await body.resolvePhotoUrl(photo)
    setViewer({ title: 'Foto do registro', url })
  }

  if (body.loading) {
    return (
      <div className="body-evo">
        <div className="body-evo-skel" aria-busy="true" aria-live="polite">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  if (body.error?.code === 'missing_schema') {
    return (
      <div className="body-evo">
        <section className="body-evo-card">
          <h1>Espelho Evolutivo</h1>
          <p>{body.error.message}</p>
          <p>Execute a migration `supabase/migrations/20260814_body_evolution.sql` no Supabase e recarregue.</p>
          <Link to="/app" className="btn btn--ghost">
            Voltar
          </Link>
        </section>
      </div>
    )
  }

  if (body.error && !body.hasCheckin) {
    return (
      <div className="body-evo">
        <section className="body-evo-card">
          <h1>Espelho Evolutivo</h1>
          <p>{body.error.message}</p>
          <button type="button" className="btn btn--primary" onClick={() => body.refresh()}>
            Tentar novamente
          </button>
        </section>
      </div>
    )
  }

  const needsConsent = !body.consent
  const showForm = view === 'novo' || phase === 'form'

  return (
    <div className="body-evo">
      <nav className="body-evo-nav" aria-label="Espelho Evolutivo">
        <Link to="/app">Evolução</Link>
        <span aria-hidden="true">/</span>
        <span>Espelho</span>
      </nav>

      {savedFlash ? (
        <p className="body-evo-toast" role="status">
          Registro atualizado. Mais um capítulo da sua evolução foi salvo.
        </p>
      ) : null}

      {view === 'comparar' ? (
        <section className="body-evo-card">
          <h1>Comparar</h1>
          <BodyComparisonSlider
            beforeUrl={body.photoUrl((body.first?.photos || []).find((p) => p.photo_type === 'front'))}
            afterUrl={body.photoUrl((body.latest?.photos || []).find((p) => p.photo_type === 'front'))}
          />
          <button type="button" className="btn btn--ghost" onClick={openHome}>
            Voltar
          </button>
        </section>
      ) : null}

      {view === 'meta' && body.hasCheckin ? (
        <section className="body-evo-card">
          <BodyGoalPanel
            current={body.latestMeasures}
            height={height}
            goals={body.goals}
            saving={body.saving}
            onSave={body.saveGoals}
          />
          <button type="button" className="btn btn--ghost" onClick={openHome}>
            Voltar
          </button>
        </section>
      ) : null}

      {view === 'home' && !body.hasCheckin && phase === 'intro' ? (
        <BodyOnboarding
          onStart={() => {
            if (needsConsent) setPhase('consent')
            else openNew()
          }}
        />
      ) : null}

      {view === 'home' && !body.hasCheckin && phase === 'consent' ? (
        <BodyPhotoConsent
          checked={consentChecked}
          onChange={setConsentChecked}
          saving={body.saving}
          onContinue={async () => {
            const result = await body.acceptConsent()
            if (!result.error) openNew()
          }}
        />
      ) : null}

      {view === 'home' && !body.hasCheckin && phase === 'form' ? (
        <BodyEmptyState onCreate={openNew} />
      ) : null}

      {view === 'home' && body.hasCheckin ? (
        <BodyEvolutionDashboard
          body={body}
          height={height}
          initialTab="agora"
          onNewCheckin={async () => {
            if (needsConsent) {
              setPhase('consent')
              return
            }
            openNew()
          }}
          onOpenPhoto={openPhoto}
          onDeleteCheckin={async (checkin) => {
            if (window.confirm('Esta ação removerá permanentemente seus registros do Espelho Evolutivo.')) {
              await body.removeCheckin(checkin)
            }
          }}
          onDeleteAll={async () => {
            await body.removeAll()
            setPhase('intro')
          }}
        />
      ) : null}

      {showForm && view === 'novo' ? (
        needsConsent ? (
          <BodyPhotoConsent
            checked={consentChecked}
            onChange={setConsentChecked}
            saving={body.saving}
            onContinue={async () => {
              const result = await body.acceptConsent()
              if (result.error) setPhotoError(result.error.message)
            }}
          />
        ) : (
          <BodyCheckInForm
            prefill={{ height: height || profile?.height || '', weight: profile?.weight || '', goal_type: body.profile?.goal_type }}
            saving={body.saving}
            photoError={photoError}
            showGoalType={!body.hasCheckin}
            onCancel={openHome}
            onSubmit={handleCreate}
          />
        )
      ) : null}

      <BodyPhotoViewer open={Boolean(viewer)} title={viewer?.title} url={viewer?.url} onClose={() => setViewer(null)} />
    </div>
  )
}
