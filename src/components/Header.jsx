import { useEffect, useState } from 'react'
import { menuItems } from '../data/siteData'
import { useTheme } from '../context/ThemeContext'

function Header({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__bar" />
      <div className="container header__inner">
        <a href="#inicio" className="header__logo" onClick={closeMenu}>
          <span className="header__logo-mark" aria-hidden="true">
            <span className="header__logo-ball">⚽</span>
            <span className="header__logo-ring" />
          </span>
          <span className="header__logo-text">
            <span className="header__logo-line">Mundo do</span>
            <strong>Esporte</strong>
          </span>
        </a>

        <nav
          className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
          aria-label="Menu principal"
        >
          <ul className="header__menu">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={activeSection === item.sectionId ? 'header__link--active' : ''}
                  onClick={closeMenu}
                  aria-current={activeSection === item.sectionId ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="header__mobile-actions">
            <a href="#destaques" className="btn btn--primary" onClick={closeMenu}>
              Ver destaques
            </a>
          </div>
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <a href="#destaques" className="header__cta btn btn--primary btn--sm">
            Ver destaques
          </a>

          <button
            type="button"
            className={`header__toggle ${menuOpen ? 'header__toggle--open' : ''}`}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
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
          className="header__backdrop"
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
      )}
    </header>
  )
}

export default Header
