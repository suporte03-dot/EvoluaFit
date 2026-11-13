import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODULE_HELP, MODULE_HELP_FAQ } from '../data/moduleHelp'
import { scrollToSection } from '../utils/scrollToSection'

function goToModule(item, navigate) {
  if (item.to) {
    navigate(item.to)
    return
  }
  if (item.hash) {
    const el = document.getElementById(item.hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
  if (item.sectionId) scrollToSection(item.sectionId)
}

export default function ModuleHelpGuide() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const [faqOpenId, setFaqOpenId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MODULE_HELP
    return MODULE_HELP.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.steps.some((s) => s.toLowerCase().includes(q)),
    )
  }, [query])

  const visible = showAll || query.trim() ? filtered : filtered.slice(0, 4)

  const toggleModule = (id) => {
    setOpenId((cur) => (cur === id ? null : id))
    setFaqOpenId(null)
  }

  const toggleFaq = (id) => {
    setFaqOpenId((cur) => (cur === id ? null : id))
    setOpenId(null)
  }

  return (
    <div className="module-help">
      <label className="module-help__search">
        <span className="sr-only">Pesquisar módulos</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowAll(true)
          }}
          placeholder="Buscar módulo..."
          autoComplete="off"
        />
      </label>

      <p className="module-help__lead">
        <span className="copy-desktop">Toque em um módulo para entender o que ele faz e como usar.</span>
        <span className="copy-mobile">Toque em um módulo para ver a explicação.</span>
      </p>

      <ul className="module-help__list" role="list">
        {visible.map((item) => {
          const isOpen = openId === item.id
          return (
            <li key={item.id} className={`module-help__item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="module-help__trigger"
                aria-expanded={isOpen}
                onClick={() => toggleModule(item.id)}
              >
                <span className="module-help__trigger-text">
                  <strong>{item.label}</strong>
                  <span>{item.summary}</span>
                </span>
                <span className="module-help__chevron" aria-hidden="true">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <div className="module-help__panel">
                  <ol className="module-help__steps">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => goToModule(item, navigate)}
                  >
                    Ir para {item.label}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {!query.trim() && filtered.length > 4 && (
        <button
          type="button"
          className="disclose-toggle module-help__more"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
        >
          <span>{showAll ? 'Ver menos módulos' : 'Ver todos os módulos'}</span>
          <span aria-hidden="true">{showAll ? '▲' : '▼'}</span>
        </button>
      )}

      {filtered.length === 0 && (
        <p className="module-help__empty">Nenhum módulo encontrado. Tente outro termo.</p>
      )}

      <div className="module-help__faq">
        <h3 className="module-help__faq-title">Perguntas frequentes</h3>
        <ul className="module-help__list" role="list">
          {MODULE_HELP_FAQ.map((faq) => {
            const isOpen = faqOpenId === faq.id
            return (
              <li key={faq.id} className={`module-help__item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="module-help__trigger"
                  aria-expanded={isOpen}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="module-help__trigger-text">
                    <strong>{faq.question}</strong>
                  </span>
                  <span className="module-help__chevron" aria-hidden="true">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isOpen && (
                  <div className="module-help__panel">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
