import { useEffect, useState } from 'react'
import { navItems } from '../data/siteData'
import { scrollToSection, handleSectionClick } from '../utils/scrollToSection'
import { IconMenu } from './dashboard/icons'

const logoUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function Header({ activeSection, onOpenDashboardMenu }) {
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
        {onOpenDashboardMenu && (
          <button
            type="button"
            className="header__dash-menu"
            onClick={onOpenDashboardMenu}
            aria-label="Abrir menu do painel"
          >
            <IconMenu size={20} />
          </button>
        )}

        <a
          href="#inicio"
          className="brand-logo header__brand"
          onClick={(e) => handleSectionClick(e, 'inicio', closeMenu)}
          aria-label="EvoluaFit — Início"
        >
          <img
            src={logoUrl('evoluafit-icon.png')}
            alt=""
            className="brand-icon"
            width={72}
            height={72}
          />
          <div className="brand-copy">
            <strong className="brand-name">
              <span>Evolua</span>
              <em className="brand-name__fit">Fit</em>
            </strong>
            <small className="brand-slogan">Treinos inteligentes, evolução real.</small>
          </div>
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
              className={`header__link ${activeSection === item.id ? 'header__link--active' : ''} ${
                item.id === 'coach-ia' ? 'header__link--coach' : ''
              } ${item.id === 'coach-ia' && activeSection === item.id ? 'header__link--coach-active' : ''}`}
              onClick={(e) => handleSectionClick(e, item.id, closeMenu)}
            >
              {item.id === 'coach-ia' && (
                <span className="header__link-icon" aria-hidden="true">
                  ✦
                </span>
              )}
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
          <button type="button" className="btn btn--primary header__cta-desktop btn--start-workout" onClick={() => navigate('planilha')}>
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
    </header>
  )
}
