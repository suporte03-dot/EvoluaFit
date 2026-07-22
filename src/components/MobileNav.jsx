import { mobileNavItems } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'
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
  perfil: IconHome,
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

ICONS.perfil = ProfileIcon

export default function MobileNav({ activeSection }) {
  const navigate = (id) => scrollToSection(id)
  const coachActive = activeSection === 'coach-ia'

  return (
    <>
      <button
        type="button"
        className={`coach-fab${coachActive ? ' is-active' : ''}`}
        onClick={() => navigate('coach-ia')}
        aria-label="Abrir Coach IA"
      >
        <span className="coach-fab__icon" aria-hidden="true">
          <IconSpark size={18} />
        </span>
        <span className="coach-fab__label">Coach</span>
      </button>

      <nav className="mobile-nav mobile-nav--five" aria-label="Navegação rápida">
        {mobileNavItems.map((item) => {
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
