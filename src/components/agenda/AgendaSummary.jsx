import { agendaSummary } from '../../data/agendaData'

function AgendaSummary() {
  return (
    <div className="agenda-summary">
      {agendaSummary.map((item) => (
        <article key={item.id} className="agenda-summary__card card">
          <span className="agenda-summary__icon" aria-hidden="true">{item.icon}</span>
          <div className="agenda-summary__body">
            <span className={`agenda-summary__value ${item.isText ? 'agenda-summary__value--text' : ''}`}>
              {item.value}
            </span>
            <span className="agenda-summary__label">{item.label}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AgendaSummary
