import { summarizeDayVolume } from '../utils/workoutGenerator'

/**
 * Resumo visual de volume por grupo (séries totais).
 * Ex.: Peito: 16 séries | Ombro: 10 séries | Tríceps: 9 séries
 */
export default function DayVolumeSummary({ exercises = [], dayType = '', volumeSummary = '', className = '' }) {
  const text =
    volumeSummary ||
    summarizeDayVolume(exercises, dayType).text

  if (!text) return null

  return (
    <p className={`day-volume-summary ${className}`.trim()} role="status">
      <span className="day-volume-summary__label">Volume</span>
      <span className="day-volume-summary__text">{text}</span>
    </p>
  )
}
