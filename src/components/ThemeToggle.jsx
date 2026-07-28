import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={isLight ? 'Usar tema noite' : 'Usar tema dia'}
      title={isLight ? 'Tema noite' : 'Tema dia'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className={`theme-toggle__thumb${isLight ? ' is-light' : ''}`} />
      </span>
    </button>
  )
}
