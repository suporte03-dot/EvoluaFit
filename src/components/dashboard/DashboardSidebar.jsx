import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  IconCalendar,
  IconChart,
  IconDumbbell,
  IconHome,
  IconLibrary,
  IconMirror,
  IconPanel,
  IconSettings,
  IconSpark,
  IconTrend,
} from './icons'
import EvoluaFitBrand from '../branding/EvoluaFitBrand'
import { deriveXpProgress, initialsFromName } from './dashboardUtils'
import { resolveDisplayName } from '../../utils/displayName'
import { scrollToSection, handleSectionClick } from '../../utils/scrollToSection'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'

const NAV_GROUPS = [
  {
    id: 'hoje',
    label: 'Hoje',
    items: [{ id: 'inicio', label: 'Agora', Icon: IconHome, tone: 'orange' }],
  },
  {
    id: 'treinar',
    label: 'Treinar',
    items: [
      { id: 'treinos', label: 'Meus treinos', Icon: IconDumbbell, tone: 'orange' },
      { id: 'planilha', label: 'Planilha', Icon: IconPanel, tone: 'orange' },
      { id: 'exercicios', label: 'Biblioteca', Icon: IconLibrary, tone: 'orange' },
    ],
  },
  {
    id: 'evolucao',
    label: 'Evolução',
    items: [
      { id: 'desempenho', label: 'Indicadores', Icon: IconTrend, tone: 'orange' },
      { id: 'metas', label: 'Metas', Icon: IconChart, tone: 'orange' },
      { id: 'espelho', label: 'Espelho Evolutivo', Icon: IconMirror, tone: 'orange', to: '/app/evolucao/espelho' },
    ],
  },
  {
    id: 'coach',
    label: 'Coach',
    items: [{ id: 'coach-ia', label: 'Coach', Icon: IconSpark, tone: 'orange' }],
  },
  {
    id: 'perfil',
    label: 'Perfil',
    items: [
      { id: 'calendario', label: 'Agenda', Icon: IconCalendar, tone: 'orange' },
      { id: 'perfil', label: 'Conta', Icon: IconSettings, tone: 'orange', to: '/app/perfil' },
      { id: 'ajuda', label: 'Ajuda', Icon: IconSpark, tone: 'orange' },
    ],
  },
]

function navTarget(item) {
  if (item.hash) {
    const el = document.getElementById(item.hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
  scrollToSection(item.id)
}

export default function DashboardSidebar({
  activeSection,
  history,
  workouts,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { signOut } = useAuth()
  const { profile, loadingProfile } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const [signingOut, setSigningOut] = useState(false)
  const xp = deriveXpProgress({ history, workouts })
  const name = resolveDisplayName({ cloudName: profile?.full_name })
  const accountLabel = name || 'Conta'
  const levelLabel = profile?.level ? `Nível ${profile.level}` : 'Nível —'
  const initials = loadingProfile ? '··' : initialsFromName(accountLabel)
  const xpCeiling = xp.xp - xp.intoLevel + xp.nextLevelAt
  const xpLabel = `${xp.xp.toLocaleString('pt-BR')} / ${xpCeiling.toLocaleString('pt-BR')} XP`
  const onDedicatedRoute =
    location.pathname.startsWith('/app/perfil') || location.pathname.startsWith('/app/evolucao')

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    onCloseMobile?.()
    const { error } = await signOut()
    setSigningOut(false)
    if (!error) {
      navigate('/login', { replace: true })
    }
  }

  const isActive = (item) => {
    if (item.to) return location.pathname.startsWith(item.to)
    if (onDedicatedRoute) return false
    if (item.label === 'Agora') return activeSection === 'inicio' && !item.hash
    if (item.hash) return false
    return activeSection === item.id
  }

  const go = (item) => {
    onCloseMobile?.()

    if (item.to) {
      navigate(item.to)
      return
    }

    if (onDedicatedRoute) {
      navigate('/app')
      window.setTimeout(() => navTarget(item), 80)
      return
    }

    navTarget(item)
  }

  const goHome = (e) => {
    onCloseMobile?.()
    if (onDedicatedRoute) {
      e?.preventDefault?.()
      navigate('/app')
      return
    }
    handleSectionClick(e, 'inicio', onCloseMobile)
  }

  const drawer = (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="dash-sidebar__backdrop"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="dash-sidebar-drawer"
        className={`dash-sidebar${collapsed ? ' dash-sidebar--collapsed' : ''}${
          mobileOpen ? ' dash-sidebar--open' : ''
        }`}
        aria-label="Navegação do painel"
      >
        <div className="dash-sidebar__top">
          <EvoluaFitBrand
            collapsed={collapsed}
            onNavigateHome={goHome}
            collapseControl={
              <button
                type="button"
                className="evoluafit-brand__collapse"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                aria-pressed={collapsed}
              >
                <IconPanel size={16} />
              </button>
            }
          />
        </div>

        <nav className="dash-sidebar__nav" aria-label="Navegação">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="dash-sidebar__group">
              <p className="dash-sidebar__group-label">{collapsed ? '·' : group.label}</p>
              <ul className="dash-sidebar__list">
                {group.items.map((item) => {
                  const Icon = item.Icon
                  const active = isActive(item)
                  return (
                    <li key={`${item.label}-${item.id}`}>
                      <button
                        type="button"
                        className={`dash-sidebar__link dash-sidebar__link--${item.tone || 'orange'}${
                          active ? ' is-active' : ''
                        }`}
                        onClick={() => go(item)}
                        aria-current={active ? 'page' : undefined}
                        title={item.label}
                      >
                        <Icon size={18} className="dash-sidebar__icon" />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="dash-sidebar__account">
          <button
            type="button"
            className="dash-sidebar__user dash-sidebar__user--button"
            title={loadingProfile ? 'Carregando perfil' : `${accountLabel} · ${levelLabel}`}
            onClick={() => {
              onCloseMobile?.()
              navigate('/app/perfil')
            }}
            aria-label="Abrir perfil"
          >
            <div
              className={`dash-sidebar__avatar${loadingProfile ? ' dash-sidebar__avatar--loading' : ''}`}
              aria-hidden="true"
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="dash-sidebar__user-meta">
                {loadingProfile ? (
                  <>
                    <strong className="dash-sidebar__placeholder">Carregando</strong>
                    <span className="dash-sidebar__placeholder">Nível —</span>
                  </>
                ) : (
                  <>
                    <strong>{accountLabel}</strong>
                    <span>{levelLabel}</span>
                  </>
                )}
                <div
                  className="dash-sidebar__xp"
                  role="progressbar"
                  aria-valuenow={xp.intoLevel}
                  aria-valuemin={0}
                  aria-valuemax={xp.nextLevelAt}
                  aria-label="Progresso de XP"
                >
                  <div className="dash-sidebar__xp-fill" style={{ width: `${xp.pct}%` }} />
                </div>
                <small className="dash-sidebar__xp-label">{xpLabel}</small>
              </div>
            )}
          </button>
          <button
            type="button"
            className={`btn btn--ghost btn--sm dash-sidebar__logout${collapsed ? ' dash-sidebar__logout--icon' : ''}`}
            onClick={handleLogout}
            disabled={signingOut}
            title="Sair"
            aria-label="Sair da conta"
          >
            {collapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : signingOut ? (
              'Saindo...'
            ) : (
              'Sair'
            )}
          </button>
        </div>
      </aside>
    </>
  )

  if (typeof document === 'undefined') return drawer
  return createPortal(drawer, document.body)
}