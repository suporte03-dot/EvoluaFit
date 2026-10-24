export default function ExerciseSegments({ exercises, currentIndex, onSelect }) {
  const done = exercises.filter((ex) => ex.setSlots?.every((s) => s.completed)).length
  return (
    <nav className="live-segments" aria-label={`Progresso: ${done} de ${exercises.length} exercícios concluídos`}>
      {exercises.map((ex, index) => {
        const total = ex.setSlots?.length || 0
        const completed = ex.setSlots?.filter((s) => s.completed).length || 0
        const state = completed >= total && total > 0 ? 'done' : index === currentIndex ? 'current' : completed > 0 ? 'partial' : 'pending'
        return (
          <button
            key={`${ex.exerciseId || ex.name}-${index}`}
            type="button"
            className={`live-segments__item live-segments__item--${state}`}
            onClick={() => onSelect(index)}
            aria-label={`Exercício ${index + 1}: ${ex.name}, ${completed} de ${total} séries`}
            aria-current={index === currentIndex ? 'step' : undefined}
          >
            <span className="live-segments__bar" style={{ '--fill': total ? `${(completed / total) * 100}%` : '0%' }} />
          </button>
        )
      })}
    </nav>
  )
}
