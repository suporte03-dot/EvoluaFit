import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconCalendar,
  IconChart,
  IconDumbbell,
  IconHome,
  IconLibrary,
  IconPanel,
  IconSettings,
  IconSpark,
  IconTrend,
} from './icons'
import EvoluaFitBrand from '../branding/EvoluaFitBrand'
import { deriveXpProgress, initialsFromName } from './dashboardUtils'
import { scrollToSection, handleSectionClick } from '../../utils/scrollToSection'
import { useAuth } from '../../context/AuthContext'

const MAIN_NAV = [
  { id: 'inicio', label: 'Dashboard', Icon: IconHome, tone: 'blue' },
  { id: 'inicio', label: 'Indicadores', Icon: IconChart, hash: 'dash-indicadores', tone: 'orange' },
  { id: 'treinos', label: 'Meus Treinos', Icon: IconDumbbell, tone: 'green' },
  { id: 'planilha', label: 'Planilha', Icon: IconPanel, tone: 'green' },
  { id: 'exercicios', label: 'Biblioteca', Icon: IconLibrary, tone: 'cyan' },
  { id: 'calendario', label: 'Calendário', Icon: IconCalendar, tone: 'blue' },
  { id: 'desempenho', label: 'Evolução', Icon: IconTrend, tone: 'purple' },
  { id: 'coach-ia', label: 'Coach IA', Icon: IconSpark, tone: 'cyan' },
  { id: 'metas', label: 'Metas', Icon: IconChart, tone: 'orange' },
  { id: 'perfil', label: 'Perfil', Icon: IconSettings, tone: 'blue' },
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
  profile,
  history,
  workouts,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const xp = deriveXpProgress({ history, workouts })
  const authName = user?.user_metadata?.full_name || user?.user_metadata?.name
  const name = authName || profile?.name || 'Atleta'
  const levelLabel = profile?.level ? `Nível ${profile.level}` : `Nível ${xp.levelNumber}`
  const initials = initialsFromName(name)
  const xpCeiling = xp.xp - xp.intoLevel + xp.nextLevelAt
  const xpLabel = `${xp.xp.toLocaleString('pt-BR')} / ${xpCeiling.toLocaleString('pt-BR')} XP`

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
    if (item.label === 'Dashboard') return activeSection === 'inicio' && !item.hash
    if (item.hash) return false
    return activeSection === item.id
  }

  const go = (item) => {
    onCloseMobile?.()
    navTarget(item)
  }

  return (
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
        className={`dash-sidebar${collapsed ? ' dash-sidebar--collapsed' : ''}${
          mobileOpen ? ' dash-sidebar--open' : ''
        }`}
        aria-label="Navegação do painel"
      >
        <div className="dash-sidebar__top">
          <EvoluaFitBrand
            collapsed={collapsed}
            onNavigateHome={(e) => handleSectionClick(e, 'inicio', onCloseMobile)}
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

        <nav className="dash-sidebar__nav" aria-label="Módulos">
          <p className="dash-sidebar__group-label">{collapsed ? '···' : 'Módulos'}</p>
          <ul className="dash-sidebar__list">
            {MAIN_NAV.map((item) => {
              const Icon = item.Icon
              const active = isActive(item)
              return (
                <li key={`${item.label}-${item.id}-${item.hash || ''}`}>
                  <button
                    type="button"
                    className={`dash-sidebar__link dash-sidebar__link--${item.tone || 'blue'}${
                      active ? ' is-active' : ''
                    }`}
                    onClick={() => go(item)}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon size={18} className="dash-sidebar__icon" />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge ? (
                      <span className="dash-sidebar__badge">{item.badge}</span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="dash-sidebar__account">
          <div className="dash-sidebar__user" title={`${name} · ${levelLabel}`}>
            <div className="dash-sidebar__avatar" aria-hidden="true">
              {initials}
            </div>
            {!collapsed && (
              <div className="dash-sidebar__user-meta">
                <strong>{name}</strong>
                <span>{levelLabel}</span>
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
          </div>
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
}
