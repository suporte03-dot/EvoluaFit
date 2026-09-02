/**
 * Single next-action engine for Evolua Daily.
 * Priority: resume → start → one workout to weekly goal → log weight → build plan.
 */

export function getNextAction({
  today = {},
  weekly = {},
  pendingSession = null,
  hasPlan = false,
  bodyCheckin = null,
  missed = null,
} = {}) {
  const situation = today.situation || 'no_plan'
  const workout = today.workout || today.nextWorkout || null
  const remaining =
    weekly.weeklyGoal > 0 ? Math.max(0, weekly.weeklyGoal - (weekly.completedCount || 0)) : null

  if (pendingSession?.workoutId) {
    return {
      id: 'resume',
      kind: 'resume',
      title: 'Retomar sessão',
      description: 'Você tem um treino em andamento. Continue de onde parou.',
      primaryLabel: 'Continuar sessão',
      secondaryLabel: 'Ver detalhes',
      section: null,
    }
  }

  if (situation === 'partial' && workout) {
    return {
      id: 'continue',
      kind: 'start',
      title: 'Continuar treino',
      description: 'Há uma sessão parcial de hoje. Retome com calma.',
      primaryLabel: 'Continuar treino',
      secondaryLabel: 'Ver detalhes',
      workout,
      section: null,
    }
  }

  const canStart = Boolean(workout?.exercises?.length) &&
    ['ready', 'returning', 'partial'].includes(situation)

  if (remaining === 1 && (canStart || situation === 'ready' || situation === 'returning')) {
    return {
      id: 'one-to-goal',
      kind: canStart ? 'start' : 'navigate',
      title: 'Falta 1 treino para a meta',
      description: 'Um treino hoje completa a meta semanal.',
      primaryLabel: canStart ? 'Iniciar treino' : 'Abrir treinos',
      secondaryLabel: 'Ver detalhes',
      workout: canStart ? workout : null,
      section: canStart ? null : 'treinos',
    }
  }

  if (canStart) {
    return {
      id: 'start',
      kind: 'start',
      title: situation === 'returning' ? 'Retomar a rotina' : 'Treino de hoje',
      description:
        situation === 'returning'
          ? 'Recomece com volume confortável. Consistência vale mais que intensidade.'
          : 'Comece a sessão quando estiver pronto.',
      primaryLabel: situation === 'returning' ? 'Retomar treino' : 'Iniciar treino',
      secondaryLabel: 'Ver detalhes',
      workout,
      section: null,
    }
  }

  if (situation === 'completed') {
    return {
      id: 'review',
      kind: 'navigate',
      title: 'Treino de hoje concluído',
      description: 'Sessão registrada. Veja o que avançou e prepare o próximo passo.',
      primaryLabel: 'Ver evolução',
      secondaryLabel: 'Ver calendário',
      section: 'desempenho',
      secondarySection: 'calendario',
    }
  }

  if (missed?.count > 0 && hasPlan) {
    return {
      id: 'reorganize',
      kind: 'reorganize',
      title: 'Reorganizar a semana',
      description: missed.sentence,
      primaryLabel: 'Reorganizar semana',
      secondaryLabel: 'Abrir planilha',
      section: 'planilha',
      secondarySection: 'planilha',
    }
  }

  const daysSinceCheckin = bodyCheckin?.daysSince
  const hasMirror = Boolean(bodyCheckin?.onboarded)
  if (hasMirror && (daysSinceCheckin == null || daysSinceCheckin >= 7) && situation !== 'ready') {
    return {
      id: 'weight',
      kind: 'navigate',
      title: 'Registrar peso',
      description:
        daysSinceCheckin == null
          ? 'O Espelho Evolutivo está pronto. Um check-in ajuda a acompanhar a jornada.'
          : `Último registro há ${daysSinceCheckin} dias.`,
      primaryLabel: 'Abrir Espelho',
      secondaryLabel: 'Ver treinos',
      href: '/app/evolucao/espelho/novo',
      section: 'desempenho',
    }
  }

  if (situation === 'no_plan' || !hasPlan) {
    return {
      id: 'plan',
      kind: 'navigate',
      title: 'Montar planilha',
      description: 'Sem planilha ainda. Monte a rotina para o treino de hoje aparecer aqui.',
      primaryLabel: 'Criar planilha',
      secondaryLabel: 'Falar com o Coach',
      section: 'planilha',
      secondarySection: 'coach-ia',
    }
  }

  if (situation === 'no_workout_today') {
    return {
      id: 'rest-or-next',
      kind: 'navigate',
      title: workout ? 'Nada agendado para hoje' : 'Escolha o próximo passo',
      description: workout
        ? `Próximo na planilha: ${workout.name}.`
        : 'Abra a agenda ou ajuste a planilha.',
      primaryLabel: workout ? 'Ver próximo treino' : 'Abrir calendário',
      secondaryLabel: 'Ajustar planilha',
      workout,
      section: workout ? 'treinos' : 'calendario',
      secondarySection: 'planilha',
    }
  }

  return {
    id: 'idle',
    kind: 'navigate',
    title: 'Continuar a jornada',
    description: 'Abra treinos, evolução ou o Coach quando quiser o próximo passo.',
    primaryLabel: 'Ver treinos',
    secondaryLabel: 'Coach',
    section: 'treinos',
    secondarySection: 'coach-ia',
  }
}
