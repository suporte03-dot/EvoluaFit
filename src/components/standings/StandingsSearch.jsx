function StandingsSearch({ value, onChange, onClear }) {
  return (
    <div className="standings-search">
      <label className="standings-search__label" htmlFor="standings-search-input">
        Buscar campeonato ou time
      </label>
      <div className="standings-search__wrap">
        <span className="standings-search__icon" aria-hidden="true">🔍</span>
        <input
          id="standings-search-input"
          type="search"
          className="standings-search__input"
          placeholder="Buscar campeonato, clube ou seleção..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="standings-search__clear"
            onClick={onClear}
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default StandingsSearch
