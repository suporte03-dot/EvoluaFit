import { formatMeasure, formatSignedDelta } from '../../utils/bodyEvolutionMetrics'

const ROWS = [
  { key: 'weight', label: 'Peso', unit: 'kg' },
  { key: 'waist', label: 'Cintura', unit: 'cm' },
  { key: 'chest', label: 'Peito', unit: 'cm' },
  { key: 'arm', label: 'Braço', unit: 'cm' },
  { key: 'hips', label: 'Quadril', unit: 'cm' },
  { key: 'thigh', label: 'Coxa', unit: 'cm' },
]

export default function BodyProgressSummary({ measures, diffs, dateLabel }) {
  return (
    <div className="body-summary">
      <p className="body-summary__date">{dateLabel}</p>
      <ul>
        {ROWS.map((row) => (
          <li key={row.key}>
            <span>{row.label}</span>
            <strong>{formatMeasure(measures?.[row.key], row.unit)}</strong>
            {diffs?.[row.key] != null ? (
              <em>{formatSignedDelta(diffs[row.key], row.unit)}</em>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
