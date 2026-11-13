import { formatDateShort } from '../../utils/dateFormat'
import { timelineCaption } from '../../utils/bodyEvolutionMetrics'

export default function BodyTimeline({ checkins = [], onOpen }) {
  if (!checkins.length) {
    return <p>Continue registrando sua evolução para visualizar comparações.</p>
  }

  return (
    <ol className="body-timeline">
      {checkins.map((checkin, index) => (
        <li key={checkin.id}>
          <button type="button" onClick={() => onOpen?.(checkin)}>
            <time dateTime={checkin.checkin_date}>{formatDateShort(checkin.checkin_date)}</time>
            <strong>{timelineCaption(checkin, index, checkins.length, checkins[index - 1])}</strong>
            {checkin.notes ? <span>{checkin.notes}</span> : null}
          </button>
        </li>
      ))}
    </ol>
  )
}
