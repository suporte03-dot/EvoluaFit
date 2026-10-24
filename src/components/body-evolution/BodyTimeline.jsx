import { formatDateShort } from '../../utils/dateFormat'
import { timelineCaption } from '../../utils/bodyEvolutionMetrics'

export default function BodyTimeline({ checkins = [], onOpen, photoUrl }) {
  if (!checkins.length) {
    return <p>Continue registrando sua evolução para visualizar comparações.</p>
  }

  return (
    <ol className="body-timeline">
      {checkins.map((checkin, index) => {
        const photo = (checkin.photos || []).find((item) => item.photo_type === 'front') || checkin.photos?.[0]
        const thumb = photoUrl?.(photo)
        return (
          <li key={checkin.id}>
            <button type="button" onClick={() => onOpen?.(checkin)}>
              {thumb ? <img src={thumb} alt="" className="body-timeline__thumb" /> : null}
              <time dateTime={checkin.checkin_date}>{formatDateShort(checkin.checkin_date)}</time>
              <strong>{timelineCaption(checkin, index, checkins.length, checkins[index - 1])}</strong>
              {checkin.notes ? <span>{checkin.notes}</span> : null}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
