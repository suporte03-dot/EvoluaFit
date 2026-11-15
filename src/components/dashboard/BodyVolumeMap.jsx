import { useMemo } from 'react'
import { buildBodyVolumeMap, bodyVolumeSummary } from '../../utils/bodyVolumeMap'

const REGION_PATHS = {
  Peitoral: 'M78 78 C90 70,110 70,122 78 C128 98,128 118,122 132 C110 140,90 140,78 132 C72 118,72 98,78 78 Z',
  Ombros: 'M52 70 C64 58,78 62,82 78 C70 86,58 90,50 86 Z M148 70 C136 58,122 62,118 78 C130 86,142 90,150 86 Z',
  Bíceps: 'M48 88 C56 86,60 100,58 130 C52 132,44 120,46 96 Z M152 88 C144 86,140 100,142 130 C148 132,156 120,154 96 Z',
  Tríceps: 'M44 96 C48 94,50 118,48 136 C42 134,40 112,44 96 Z M156 96 C152 94,150 118,152 136 C158 134,160 112,156 96 Z',
  Costas: 'M84 150 C96 146,104 146,116 150 C120 168,118 188,112 198 C100 204,100 204,88 198 C82 188,80 168,84 150 Z',
  Glúteos: 'M86 200 C100 196,114 196,114 210 C114 222,100 228,86 222 C78 214,78 206,86 200 Z',
  Pernas:
    'M78 224 C90 222,94 260,92 300 C86 302,78 280,76 248 Z M122 224 C110 222,106 260,108 300 C114 302,122 280,124 248 Z',
}

const STATUS_FILL = {
  idle: 'rgba(148, 163, 184, 0.18)',
  below: 'rgba(251, 191, 36, 0.55)',
  ok: 'rgba(52, 211, 153, 0.55)',
  above: 'rgba(248, 113, 113, 0.55)',
}

export default function BodyVolumeMap({ history, plan, level, referenceDate }) {
  const map = useMemo(
    () => buildBodyVolumeMap({ history, plan, level, referenceDate }),
    [history, plan, level, referenceDate],
  )
  const summary = bodyVolumeSummary(map)

  return (
    <div className="body-volume-map">
      <div className="body-volume-map__head">
        <p className="hoje-card__kicker">Volume por músculo</p>
        <h3 className="hoje-card__title">Mapa do corpo</h3>
        <p className="body-volume-map__summary">{summary}</p>
        <p className="body-volume-map__range">
          Faixa {map.level}: {map.range[0]}–{map.range[1]} séries/semana
        </p>
      </div>

      <div className="body-volume-map__stage">
        <svg viewBox="0 0 200 340" role="img" aria-label="Mapa de volume muscular da semana">
          <ellipse cx="100" cy="36" rx="20" ry="22" fill="rgba(148,163,184,0.22)" />
          <rect x="92" y="56" width="16" height="14" rx="6" fill="rgba(148,163,184,0.22)" />
          {map.rows.map((row) => (
            <path
              key={row.group}
              d={REGION_PATHS[row.group]}
              fill={STATUS_FILL[row.status]}
              stroke="rgba(238,242,249,0.35)"
              strokeWidth="1"
            >
              <title>
                {row.group}: {row.sets} séries ({row.status === 'idle' ? 'sem treino' : row.status})
              </title>
            </path>
          ))}
        </svg>

        <ul className="body-volume-map__legend">
          {map.rows.map((row) => (
            <li key={row.group} data-status={row.status}>
              <span>{row.group}</span>
              <strong>
                {row.sets}
                <small>
                  /{row.min}–{row.max}
                </small>
              </strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="body-volume-map__keys" aria-label="Legenda de cores">
        <span data-status="below">Abaixo</span>
        <span data-status="ok">Na faixa</span>
        <span data-status="above">Acima</span>
        <span data-status="idle">Sem treino</span>
      </div>
    </div>
  )
}
