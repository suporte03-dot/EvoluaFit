import { weekAgenda } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

const statusClass = {
  Hoje: 'calendar__status--today',
  Amanhã: 'calendar__status--tomorrow',
  'Em breve': 'calendar__status--soon',
}

function Calendar() {
  return (
    <section id="agenda" className="section calendar">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Programação"
            title="Agenda da Semana"
            subtitle="Calendário esportivo com os principais eventos confirmados"
            light
          />
        </SectionReveal>

        <div className="calendar__board">
          <div className="calendar__header">
            <span>Data</span>
            <span>Horário</span>
            <span>Modalidade</span>
            <span>Evento</span>
            <span>Status</span>
          </div>

          {weekAgenda.map((event, index) => (
            <SectionReveal key={event.id}>
              <article
                className={`calendar__row card ${event.status === 'Hoje' ? 'calendar__row--today' : ''}`}
                style={{ '--delay': `${index * 0.05}s` }}
              >
                <div className="calendar__date">
                  <strong>{event.date}</strong>
                  <span>{event.day}</span>
                </div>
                <div className="calendar__time">
                  <span className="calendar__clock">{event.time}</span>
                </div>
                <div className="calendar__sport">{event.sport}</div>
                <div className="calendar__event">
                  <strong>{event.event}</strong>
                  <span>{event.description}</span>
                  <em>{event.location}</em>
                </div>
                <div className={`calendar__status ${statusClass[event.status]}`}>
                  {event.status}
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Calendar
