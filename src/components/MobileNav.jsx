import { mobileNavItems } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'

export default function MobileNav({ activeSection }) {
  const navigate = (id) => {
    scrollToSection(id)
  }

  return (
    <nav className="mobile-nav" aria-label="Navegação rápida">
      {mobileNavItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mobile-nav__item ${activeSection === item.id ? 'mobile-nav__item--active' : ''}`}
          onClick={() => navigate(item.id)}
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          <span className="mobile-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="mobile-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
