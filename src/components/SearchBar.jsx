import { useEffect, useRef, useState } from 'react'
import { searchAllContent } from '../utils/searchContent'

const typeLabels = {
  news: 'Notícia',
  modality: 'Modalidade',
  event: 'Evento',
  curiosity: 'Curiosidade',
  story: 'História',
}

function SearchBar({ onSelectNews, onSelectEvent, onSelectStory, onSelectCuriosity, onSelectModality }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const results = query.trim() ? searchAllContent(query) : []

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result) => {
    setQuery('')
    setOpen(false)

    switch (result.type) {
      case 'news':
        onSelectNews?.(result.data)
        break
      case 'event':
        onSelectEvent?.(result.data)
        break
      case 'story':
        onSelectStory?.(result.data)
        break
      case 'curiosity':
        onSelectCuriosity?.(result.data)
        break
      case 'modality':
        onSelectModality?.(result.data)
        break
      default:
        break
    }
  }

  return (
    <div className={`search-bar ${open ? 'search-bar--open' : ''}`} ref={wrapperRef}>
      <label className="search-bar__label" htmlFor="site-search">
        <span className="search-bar__icon" aria-hidden="true">🔍</span>
        <input
          id="site-search"
          type="search"
          className="search-bar__input"
          placeholder="Buscar notícias, modalidades, eventos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
      </label>

      {open && query.trim() && (
        <div className="search-bar__panel" role="listbox" aria-label="Resultados da busca">
          {results.length === 0 ? (
            <p className="search-bar__empty empty-state">
              Nenhum resultado encontrado para sua busca.
            </p>
          ) : (
            <ul className="search-bar__results">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="search-bar__result"
                    onClick={() => handleSelect(result)}
                  >
                    <span className="search-bar__result-type">{typeLabels[result.type]}</span>
                    <strong>{result.title}</strong>
                    <span className="search-bar__result-sub">{result.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
