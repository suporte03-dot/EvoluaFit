function AgendaHeader({ onWeekClick, onFilterFocus }) {
  return (
    <header className="agenda-header">
      <div className="agenda-header__text">
        <span className="agenda-header__badge">Dados demonstrativos</span>
        <h2 className="agenda-header__title">Agenda Esportiva</h2>
        <p className="agenda-header__subtitle">
          Eventos ilustrativos para demonstração do portal — não representam calendário oficial.
        </p>
      </div>
      <div className="agenda-header__actions">
        <button type="button" className="btn btn--primary" onClick={onWeekClick}>
          Ver eventos da semana
        </button>
        <button type="button" className="btn btn--outline agenda-header__secondary" onClick={onFilterFocus}>
          Filtrar modalidade
        </button>
      </div>
    </header>
  )
}

export default AgendaHeader
