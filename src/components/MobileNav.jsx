import { useNavigate as useRouterNavigate } from 'react-router-dom'
import { mobileNavItems } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'
import {
  IconDumbbell,
  IconHome,
  IconSpark,
  IconTrend,
} from './dashboard/icons'

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

const ICONS = {
  inicio: IconHome,
  treinos: IconDumbbell,
  desempenho: IconTrend,
  'coach-ia': IconSpark,
  perfil: ProfileIcon,
}

const AREA_SECTIONS = {
  inicio: ['inicio'],
  treinos: ['treinos', 'planilha', 'exercicios'],
  desempenho: ['desempenho', 'metas'],
  'coach-ia': ['coach-ia'],
  perfil: ['perfil', 'calendario', 'ajuda'],
}

function isAreaActive(navId, activeSection) {
  return (AREA_SECTIONS[navId] || [navId]).includes(activeSection)
}

export default function MobileNav({ activeSection }) {
  const routerNavigate = useRouterNavigate()

  const navigate = (id) => {
    if (id === 'perfil') {
      routerNavigate('/app/perfil')
      return
    }
    if (window.location.pathname.startsWith('/app/perfil') || window.location.pathname.startsWith('/app/evolucao')) {
      routerNavigate('/app')
      window.setTimeout(() => {
        scrollToSection(id)
        if (id === 'coach-ia') document.getElementById('coach-question')?.focus?.()
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

  return (
    <nav className="mobile-nav mobile-nav--five" aria-label="Navegação principal">
      {mobileNavItems.map((item) => {
        const Icon = ICONS[item.id] || IconHome
        const active = isAreaActive(item.id, activeSection)
        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav__item${active ? ' mobile-nav__item--active' : ''}`}
            onClick={() => navigate(item.id)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="mobile-nav__icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className="mobile-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
