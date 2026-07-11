import { useEffect, useState } from 'react'
import { menuItems } from '../data/siteData'
import { useTheme } from '../context/ThemeContext'
import { handleSectionClick } from '../utils/scrollToSection'
import Logo from './Logo'

function Header({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const closeMenu = () => setMenuOpen(false)

  const navigateTo = (event, sectionId) => {
    handleSectionClick(event, sectionId, closeMenu)
  }

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
        <a
          href="#inicio"
          className="header__logo"
          onClick={(event) => navigateTo(event, 'inicio')}
        >
          <Logo showTagline />
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
                  onClick={(event) => navigateTo(event, item.sectionId)}
                  aria-current={activeSection === item.sectionId ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="header__mobile-actions">
            <a
              href="#noticias"
              className="btn btn--primary"
              onClick={(event) => navigateTo(event, 'noticias')}
            >
              Ver notícias
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

          <a
            href="#brasileirao"
            className="header__cta btn btn--primary btn--sm"
            onClick={(event) => navigateTo(event, 'brasileirao')}
          >
            Brasileirão
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
