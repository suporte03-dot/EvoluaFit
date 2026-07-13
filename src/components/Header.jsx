import { useEffect, useState } from 'react'
import { navItems, BRAND } from '../data/siteData'
import { scrollToSection, handleSectionClick } from '../utils/scrollToSection'

const logoUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function Header({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const navigate = (id) => {
    closeMenu()
    scrollToSection(id)
  }

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <a
          href="#inicio"
          className="brand header__brand logo-header"
          onClick={(e) => handleSectionClick(e, 'inicio', closeMenu)}
        >
          <img
            src={logoUrl('evoluafit-logo.png')}
            alt="EvoluaFit"
            className="brand-logo brand-logo--full"
          />
          <img
            src={logoUrl('evoluafit-icon.png')}
            alt=""
            aria-hidden="true"
            className="brand-logo brand-logo--compact"
          />
          <span className="brand-text">
            Evolua<span className="brand-text__accent">Fit</span>
          </span>
        </a>

        <nav
          id="mobile-nav"
          className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
          aria-label="Navegação principal"
        >
          <div className="header__nav-header">
            <span className="header__nav-title">Menu</span>
            <button
              type="button"
              className="header__nav-close"
              onClick={closeMenu}
              aria-label="Fechar menu"
            >
              ✕
            </button>
          </div>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`header__link ${activeSection === item.id ? 'header__link--active' : ''}`}
              onClick={(e) => handleSectionClick(e, item.id, closeMenu)}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            className="btn btn--primary header__nav-cta"
            onClick={() => navigate('planilha')}
          >
            Criar meu treino
          </button>
        </nav>

        <div className="header__actions">
          <button type="button" className="btn btn--primary btn--sm header__cta-desktop" onClick={() => navigate('planilha')}>
            Criar meu treino
          </button>
          <button
            type="button"
            className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="header__overlay header__overlay--visible"
          onClick={closeMenu}
          aria-label="Fechar menu"
        />
      )}

      <p className="header__disclaimer container">{BRAND.disclaimer}</p>
    </header>
  )
}
