import {
  IconBell,
  IconCalendar,
  IconChart,
  IconDumbbell,
  IconHome,
  IconMessage,
  IconPanel,
  IconSettings,
  IconSpark,
  IconTrend,
} from './icons'
import { deriveXpProgress, initialsFromName } from './dashboardUtils'
import { scrollToSection, handleSectionClick } from '../../utils/scrollToSection'

const logoUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const MAIN_NAV = [
  { id: 'inicio', label: 'Dashboard', Icon: IconHome, tone: 'blue' },
  { id: 'inicio', label: 'Indicadores', Icon: IconChart, hash: 'dash-indicadores', tone: 'orange' },
  { id: 'treinos', label: 'Meus Treinos', Icon: IconDumbbell, tone: 'green' },
  { id: 'calendario', label: 'Calendário', Icon: IconCalendar, tone: 'blue' },
  { id: 'desempenho', label: 'Evolução', Icon: IconTrend, tone: 'purple' },
  { id: 'coach-ia', label: 'Coach IA', Icon: IconSpark, tone: 'cyan' },
]

const UTILITY_NAV = [
  { id: 'perfil', label: 'Notificações', Icon: IconBell, badge: 2 },
  { id: 'coach-ia', label: 'Mensagens', Icon: IconMessage },
  { id: 'perfil', label: 'Configurações', Icon: IconSettings },
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
  const xp = deriveXpProgress({ history, workouts })
  const name = profile?.name || 'Atleta'
  const levelLabel = profile?.level ? `Nível ${profile.level}` : `Nível ${xp.levelNumber}`
  const initials = initialsFromName(name)
  const xpLabel = `${xp.xp.toLocaleString('pt-BR')} / ${(xp.xp - xp.intoLevel + xp.nextLevelAt).toLocaleString('pt-BR')} XP`

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
          <a
            href="#inicio"
            className="dash-sidebar__brand"
            onClick={(e) => handleSectionClick(e, 'inicio', onCloseMobile)}
            aria-label="EvoluaFit — Dashboard"
          >
            <img
              src={logoUrl('evoluafit-icon.png')}
              alt=""
              className="dash-sidebar__logo"
              width={44}
              height={44}
            />
            {!collapsed && (
              <div className="dash-sidebar__brand-copy">
                <strong className="dash-sidebar__name">
                  <span>Evolua</span>
                  <em>Fit</em>
                </strong>
              </div>
            )}
          </a>

          <button
            type="button"
            className="dash-sidebar__collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-pressed={collapsed}
          >
            <IconPanel size={18} />
          </button>
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
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="dash-sidebar__group-label">{collapsed ? '···' : 'Conta'}</p>
          <ul className="dash-sidebar__list">
            {UTILITY_NAV.map((item) => {
              const Icon = item.Icon
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className="dash-sidebar__link"
                    onClick={() => go(item)}
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
      </aside>
    </>
  )
}
