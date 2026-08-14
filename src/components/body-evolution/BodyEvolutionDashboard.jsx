import { useMemo, useState } from 'react'
import { formatDateShort } from '../../utils/dateFormat'
import { avatarFactorsFromMeasures, formatSignedDelta } from '../../utils/bodyEvolutionMetrics'
import BodyAvatar2D from './BodyAvatar2D'
import BodyComparisonSlider from './BodyComparisonSlider'
import BodyGoalPanel from './BodyGoalPanel'
import BodyProgressSummary from './BodyProgressSummary'
import BodyTimeline from './BodyTimeline'

const TABS = [
  { id: 'agora', label: 'Agora' },
  { id: 'antes', label: 'Antes' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'meta', label: 'Meta' },
]

function frontPhoto(checkin) {
  return (checkin?.photos || []).find((photo) => photo.photo_type === 'front') || checkin?.photos?.[0]
}

export default function BodyEvolutionDashboard({
  body,
  height,
  initialTab = 'agora',
  onNewCheckin,
  onOpenPhoto,
  onDeleteCheckin,
  onDeleteAll,
}) {
  const [tab, setTab] = useState(initialTab)
  const [confirmAll, setConfirmAll] = useState(false)
  const [story, setStory] = useState(0)

  const nowFactors = useMemo(
    () => avatarFactorsFromMeasures(body.latestMeasures || {}, height),
    [body.latestMeasures, height],
  )
  const beforeFactors = useMemo(
    () => avatarFactorsFromMeasures(body.firstMeasures || {}, height),
    [body.firstMeasures, height],
  )

  const latestPhoto = frontPhoto(body.latest)
  const firstPhoto = frontPhoto(body.first)
  const latestUrl = body.photoUrl(latestPhoto)
  const firstUrl = body.photoUrl(firstPhoto)
  const lastUpdate = body.latest?.checkin_date || body.latest?.created_at
  const reminder = body.summary.daysSince != null && body.summary.daysSince >= 30

  const storyItems = [
    { id: 'antes', label: 'Antes', factors: beforeFactors, photo: firstUrl },
    { id: 'agora', label: 'Agora', factors: nowFactors, photo: latestUrl },
  ]

  return (
    <section className="body-dash" aria-labelledby="body-dash-title">
      <header className="body-dash__head">
        <div>
          <p className="body-evo-kicker">Espelho Evolutivo</p>
          <h1 id="body-dash-title">Seu Espelho Evolutivo</h1>
          <p>Última atualização: {lastUpdate ? formatDateShort(lastUpdate) : '—'}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onNewCheckin}>
          Novo check-in
        </button>
      </header>

      {reminder ? (
        <p className="body-dash__reminder" role="status">
          Faz {body.summary.daysSince} dias desde seu último registro. Que tal atualizar seu Espelho
          Evolutivo?
        </p>
      ) : null}

      <div className="body-story" aria-label="Antes, agora">
        <div className="body-story__track" style={{ transform: `translateX(-${story * 50}%)` }}>
          {storyItems.map((item) => (
            <div key={item.id} className="body-story__item">
              {item.photo ? (
                <img src={item.photo} alt={`Foto ${item.label}`} />
              ) : (
                <BodyAvatar2D factors={item.factors} label={item.label} />
              )}
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
        <div className="body-story__dots">
          {storyItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={story === index ? 'is-active' : ''}
              aria-label={item.label}
              onClick={() => setStory(index)}
            />
          ))}
        </div>
      </div>

      <div className="body-dash__tabs" role="tablist" aria-label="Visões do espelho">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'agora' ? (
        <div className="body-dash__grid" role="tabpanel">
          <div className="body-dash__media">
            {latestUrl ? (
              <button type="button" className="body-dash__photo" onClick={() => onOpenPhoto(latestPhoto)}>
                <img src={latestUrl} alt="Foto atual" />
                <span>Foto · registro real</span>
              </button>
            ) : (
              <p>Ainda não há foto neste registro.</p>
            )}
            <BodyAvatar2D factors={nowFactors} label="Manequim" caption="Representação visual baseada nas medidas" />
          </div>
          <BodyProgressSummary
            measures={body.latestMeasures}
            diffs={body.summary.diffs}
            dateLabel={`Hoje · ${formatDateShort(lastUpdate)}`}
          />
          {body.summary.regions.length ? (
            <div className="body-regions">
              <h2>Onde você mais evoluiu?</h2>
              <ul>
                {body.summary.regions.map((row) => (
                  <li key={row.id}>
                    <span>{row.label}</span>
                    <strong>{formatSignedDelta(row.value, row.unit)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Continue registrando sua evolução para visualizar comparações.</p>
          )}
        </div>
      ) : null}

      {tab === 'antes' ? (
        <div className="body-dash__panel" role="tabpanel">
          {!body.canCompare ? (
            <p>Continue registrando sua evolução para visualizar comparações.</p>
          ) : (
            <>
              <div className="body-dash__media">
                <BodyAvatar2D factors={beforeFactors} label="Antes" />
                <BodyAvatar2D factors={nowFactors} label="Agora" />
              </div>
              <BodyComparisonSlider beforeUrl={firstUrl} afterUrl={latestUrl} />
            </>
          )}
        </div>
      ) : null}

      {tab === 'evolucao' ? (
        <div className="body-dash__panel" role="tabpanel">
          <h2>Linha do Tempo Corporal</h2>
          <BodyTimeline
            checkins={body.checkins}
            onOpen={(checkin) => {
              const photo = frontPhoto(checkin)
              if (photo) onOpenPhoto(photo)
            }}
          />
          {body.latest ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => onDeleteCheckin(body.latest)}
            >
              Excluir check-in atual
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === 'meta' ? (
        <div className="body-dash__panel" role="tabpanel">
          <BodyGoalPanel
            current={body.latestMeasures}
            height={height}
            goals={body.goals}
            saving={body.saving}
            onSave={body.saveGoals}
          />
        </div>
      ) : null}

      <footer className="body-dash__danger">
        {!confirmAll ? (
          <button type="button" className="btn btn--ghost" onClick={() => setConfirmAll(true)}>
            Excluir todo meu Espelho Evolutivo
          </button>
        ) : (
          <div className="body-dash__confirm">
            <p>Esta ação removerá permanentemente seus registros do Espelho Evolutivo.</p>
            <button type="button" className="btn btn--primary" onClick={onDeleteAll}>
              Excluir tudo
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmAll(false)}>
              Cancelar
            </button>
          </div>
        )}
      </footer>
    </section>
  )
}
