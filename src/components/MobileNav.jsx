import { useState } from 'react'
import { mobileNavItems, mobileNavMoreItems } from '../data/siteData'
import { scrollToSection } from '../utils/scrollToSection'

export default function MobileNav({ activeSection }) {
  const [moreOpen, setMoreOpen] = useState(false)

  const navigate = (id) => {
    setMoreOpen(false)
    scrollToSection(id)
  }

  const moreActive = mobileNavMoreItems.some((item) => item.id === activeSection)

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          className="mobile-nav__sheet-backdrop"
          aria-label="Fechar menu Mais"
          onClick={() => setMoreOpen(false)}
        />
      )}
      {moreOpen && (
        <div className="mobile-nav__sheet" role="dialog" aria-label="Mais seções">
          <p className="mobile-nav__sheet-title">Mais</p>
          <div className="mobile-nav__sheet-grid">
            {mobileNavMoreItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav__sheet-item${activeSection === item.id ? ' is-active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="mobile-nav" aria-label="Navegação rápida">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav__item ${activeSection === item.id ? 'mobile-nav__item--active' : ''} ${
              item.id === 'coach-ia' ? 'mobile-nav__item--coach' : ''
            }`}
            onClick={() => navigate(item.id)}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <span className="mobile-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-nav__label">{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`mobile-nav__item${moreOpen || moreActive ? ' mobile-nav__item--active' : ''}`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
        >
          <span className="mobile-nav__icon" aria-hidden="true">
            ⋯
          </span>
          <span className="mobile-nav__label">Mais</span>
        </button>
      </nav>
    </>
  )
}
