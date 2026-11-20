import { summarizeDayVolume } from '../utils/workoutGenerator'

/**
 * Resumo visual de volume por grupo (séries do dia pelo grupo PRINCIPAL do exercício).
 * Ex.: Peito: 16 séries | Ombro: 10 séries | Tríceps: 9 séries
 * O aviso semanal usa séries efetivas (diretas + 0,5 secundárias) — por isso pode diferir.
 */
export default function DayVolumeSummary({ exercises = [], dayType = '', volumeSummary = '', className = '' }) {
  const text =
    volumeSummary ||
    summarizeDayVolume(exercises, dayType).text

  if (!text) return null

  return (
    <p className={`day-volume-summary ${className}`.trim()} role="status">
      <span className="day-volume-summary__label">Volume do dia</span>
      <span className="day-volume-summary__text">{text}</span>
      <span className="day-volume-summary__hint"> (grupo principal de cada exercício)</span>
    </p>
  )
}
