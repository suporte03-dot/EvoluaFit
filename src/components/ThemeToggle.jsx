import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={isLight ? 'Usar tema escuro' : 'Usar tema claro'}
      title={isLight ? 'Tema escuro' : 'Tema claro'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className={`theme-toggle__thumb${isLight ? ' is-light' : ''}`} />
      </span>
    </button>
  )
}
