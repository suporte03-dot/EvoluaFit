import { useMemo, useState } from 'react'
import { buildActivityFeed, FEED_REACTION, getFeedReactions, toggleFeedReaction } from '../../utils/activityFeed'

export default function EvolutionFeed({ history, workouts, records, streak }) {
  const items = useMemo(
    () => buildActivityFeed({ history, workouts, records, streak }),
    [history, workouts, records, streak],
  )
  const [reactions, setReactions] = useState(() => getFeedReactions())

  if (!items.length) return null

  return (
    <section className="hoje-card" aria-label="Feed da evolução">
      <p className="hoje-card__kicker">Feed</p>
      <h3 className="hoje-card__title">O que avançou</h3>
      <ul className="hoje-feed">
        {items.map((item) => {
          const active = reactions[item.id] === FEED_REACTION
          return (
            <li key={item.id}>
              <div>
                <p className="hoje-feed__title">{item.title}</p>
                <p className="hoje-feed__meta">
                  {item.detail}
                  {item.dateLabel ? ` · ${item.dateLabel}` : ''}
                </p>
              </div>
              <button
                type="button"
                className={active ? 'is-on' : ''}
                aria-pressed={active}
                onClick={() => setReactions(toggleFeedReaction(item.id))}
              >
                Evoluiu
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
