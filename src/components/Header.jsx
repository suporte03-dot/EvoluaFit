import { useEffect, useState } from 'react'
import Logo from './Logo'
import { navItems, BRAND } from '../data/siteData'
import { scrollToSection, handleSectionClick } from '../utils/scrollToSection'

export default function Header({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigate = (id) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <a
          href="#inicio"
          className="header__brand"
          onClick={(e) => handleSectionClick(e, 'inicio', () => setMenuOpen(false))}
        >
          <Logo size={32} />
          <span className="header__brand-text">
            <strong>{BRAND.name}</strong>
            <small>{BRAND.slogan}</small>
          </span>
        </a>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`header__link ${activeSection === item.id ? 'header__link--active' : ''}`}
              onClick={(e) => handleSectionClick(e, item.id, () => setMenuOpen(false))}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('planilha')}>
            Criar meu treino
          </button>
          <button
            type="button"
            className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <p className="header__disclaimer container">{BRAND.disclaimer}</p>
    </header>
  )
}
