function AgendaHeader({ onWeekClick, onFilterFocus }) {
  return (
    <header className="agenda-header">
      <div className="agenda-header__text">
        <span className="agenda-header__badge">Atualizada hoje</span>
        <h2 className="agenda-header__title">Agenda Esportiva</h2>
        <p className="agenda-header__subtitle">
          Os principais eventos, jogos e competições para acompanhar nos próximos dias.
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
