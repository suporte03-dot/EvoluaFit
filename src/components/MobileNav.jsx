import { useEffect, useState } from 'react'
import { useNavigate as useRouterNavigate } from 'react-router-dom'
import { mobileNavItems, mobileNavMoreItems } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'
import { useAuth } from '../context/AuthContext'
import {
  IconCalendar,
  IconDumbbell,
  IconHome,
  IconSpark,
  IconTrend,
} from './dashboard/icons'

const ICONS = {
  inicio: IconHome,
  treinos: IconDumbbell,
  calendario: IconCalendar,
  desempenho: IconTrend,
  
}

function ProfileIcon(props) {
  return (
    <svg
      width={props.size || 20}
      height={props.size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 18.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5" />
    </svg>
  )
}

function MoreIcon(props) {
  return (
    <svg
      width={props.size || 20}
      height={props.size || 20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  )
}

function PlanIcon(props) {
  return (
    <svg
      width={props.size || 20}
      height={props.size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 4h9a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" />
      <path d="M10 9h6M10 13h6" />
    </svg>
  )
}

function GoalsIcon(props) {
  return (
    <svg
      width={props.size || 20}
      height={props.size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

ICONS.perfil = ProfileIcon
ICONS.mais = MoreIcon
ICONS.planilha = PlanIcon
ICONS.exercicios = IconDumbbell
ICONS.metas = GoalsIcon
ICONS['coach-ia'] = IconSpark

export default function MobileNav({ activeSection }) {
  const { signOut } = useAuth()
  const routerNavigate = useRouterNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const coachActive = activeSection === 'coach-ia'
  const moreActive =
    moreOpen || mobileNavMoreItems.some((item) => item.id === activeSection)

  useEffect(() => {
    if (!moreOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

  const navigate = (id) => {
    setMoreOpen(false)
    if (id === 'perfil') {
      routerNavigate('/app/perfil')
      return
    }
    if (window.location.pathname.startsWith('/app/perfil')) {
      routerNavigate('/app')
      window.setTimeout(() => {
        scrollToSection(id)
        if (id === 'coach-ia') {
          document.getElementById('coach-question')?.focus?.()
        }
      }, 80)
      return
    }
    scrollToSection(id)
    if (id === 'coach-ia') {
      window.setTimeout(() => {
        document.getElementById('coach-question')?.focus?.()
      }, 350)
    }
  }

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    setMoreOpen(false)
    const { error } = await signOut()
    setSigningOut(false)
    if (!error) routerNavigate('/login', { replace: true })
  }

  return (
    <>
      <button
        type="button"
        className={`coach-fab${coachActive ? ' is-active' : ''}`}
        onClick={() => navigate('coach-ia')}
        aria-label="Abrir Coach IA"
        aria-current={coachActive ? 'page' : undefined}
      >
        <span className="coach-fab__icon" aria-hidden="true">
          <IconSpark size={18} />
        </span>
        <span className="coach-fab__label">Coach</span>
      </button>

      {moreOpen && (
        <button
          type="button"
          className="mobile-nav__backdrop"
          aria-label="Fechar menu Mais"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div
          id="mobile-nav-more-sheet"
          className="mobile-nav__sheet"
          role="dialog"
          aria-label="Mais seções"
          aria-modal="true"
        >
          <div className="mobile-nav__sheet-handle" aria-hidden="true" />
          <p className="mobile-nav__sheet-title">Mais</p>
          <div className="mobile-nav__sheet-grid">
            {mobileNavMoreItems.map((item) => {
              const Icon = ICONS[item.id] || IconHome
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mobile-nav__sheet-item${
                    activeSection === item.id ? ' is-active' : ''
                  }`}
                  onClick={() => navigate(item.id)}
                >
                  <span className="mobile-nav__sheet-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="btn btn--danger btn--sm mobile-nav__logout"
            onClick={handleLogout}
            disabled={signingOut}
          >
            {signingOut ? 'Saindo...' : 'Sair da conta'}
          </button>
        </div>
      )}

      <nav className="mobile-nav mobile-nav--five" aria-label="Navegação rápida">
        {mobileNavItems.map((item) => {
          if (item.id === 'mais') {
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav__item${moreActive ? ' mobile-nav__item--active' : ''}`}
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-controls="mobile-nav-more-sheet"
                aria-current={moreActive && !moreOpen ? 'page' : undefined}
              >
                <span className="mobile-nav__icon" aria-hidden="true">
                  <MoreIcon size={20} />
                </span>
                <span className="mobile-nav__label">{item.label}</span>
              </button>
            )
          }

          const Icon = ICONS[item.id] || IconHome
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav__item${activeSection === item.id ? ' mobile-nav__item--active' : ''}`}
              onClick={() => navigate(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <span className="mobile-nav__icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className="mobile-nav__label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}