import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const { generateWorkoutPlan, summarizeDayVolume } = await server.ssrLoadModule('/src/utils/workoutGenerator.js')

  function mix(day) {
    const cats = {}
    for (const ex of day.exercises || []) {
      cats[ex.muscleGroup] = (cats[ex.muscleGroup] || 0) + 1
    }
    return cats
  }

  function setTotals(day) {
    const totals = {}
    for (const ex of day.exercises || []) {
      totals[ex.muscleGroup] = (totals[ex.muscleGroup] || 0) + (Number(ex.sets) || 0)
    }
    return totals
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg)
  }

  const plan = generateWorkoutPlan({
    level: 'Avançado',
    goal: 'hipertrofia',
    daysPerWeek: 6,
    minutesPerWorkout: 90,
    location: 'Academia',
    equipment: ['Academia completa'],
    restrictions: [],
  })

  console.log('=== Scenario 3: Advanced + Hipertrofia + 90min + 6 days ===')
  console.log('usedFallback:', plan.usedFallback)

  const hardDays = plan.weeklyPlan.filter(
    (d) => !/mobil|recuper|leve|core \+/i.test(d.workoutName),
  )

  for (const day of plan.weeklyPlan) {
    const m = mix(day)
    console.log(
      `D${day.day} ${day.workoutName} | n=${day.exercises.length} | ${day.intensity} | ${JSON.stringify(m)} | vol=${day.volumeSummary || summarizeDayVolume(day.exercises, day.workoutType).text}`,
    )
    assert(day.exercises.length > 0, `Dia vazio: ${day.workoutName}`)
    const ids = day.exercises.map((e) => e.exerciseId)
    assert(new Set(ids).size === ids.length, `Duplicatas em ${day.workoutName}`)
  }

  for (const day of hardDays) {
    assert(
      day.exercises.length >= 7 && day.exercises.length <= 10,
      `${day.workoutName} esperava 7–10, got ${day.exercises.length}`,
    )
    const cats = day.exercises.map((e) => e.muscleGroup)
    const counts = mix(day)
    if (/push/i.test(day.workoutName)) {
      assert(cats.includes('Peitoral'), `${day.workoutName} sem Peitoral`)
      assert(cats.includes('Ombros'), `${day.workoutName} sem Ombros`)
      assert(cats.includes('Tríceps'), `${day.workoutName} sem Tríceps`)
      assert(!cats.includes('Costas'), `${day.workoutName} tem Costas`)
      assert((counts.Peitoral || 0) >= 4, `${day.workoutName} peito < 4 (${counts.Peitoral})`)
      assert((counts.Ombros || 0) >= 3, `${day.workoutName} ombros < 3 (${counts.Ombros})`)
      assert((counts.Tríceps || 0) >= 2, `${day.workoutName} tríceps < 2 (${counts.Tríceps})`)
      const sets = setTotals(day)
      assert(sets.Peitoral >= 14 && sets.Peitoral <= 16, `${day.workoutName} séries peito ${sets.Peitoral}`)
      assert(sets.Ombros >= 10 && sets.Ombros <= 12, `${day.workoutName} séries ombro ${sets.Ombros}`)
      assert(sets.Tríceps >= 9 && sets.Tríceps <= 10, `${day.workoutName} séries tríceps ${sets.Tríceps}`)
      const roles = new Set(
        day.exercises.filter((e) => e.muscleGroup === 'Peitoral').map((e) => e.movementType),
      )
      assert(roles.size >= 3, `${day.workoutName} peito pouco diverso (${[...roles].join(',')})`)
    }
    if (/pull/i.test(day.workoutName)) {
      assert(cats.includes('Costas'), `${day.workoutName} sem Costas`)
      assert(!cats.includes('Peitoral'), `${day.workoutName} tem Peitoral`)
    }
    if (/legs/i.test(day.workoutName)) {
      const strength = cats.filter((c) => ['Pernas', 'Glúteos', 'Panturrilha'].includes(c)).length
      assert(strength >= 3, `${day.workoutName} fraco em pernas (${strength})`)
    }
  }

  const pushA = plan.weeklyPlan.find((d) => d.workoutName === 'Push A')
  const pushB = plan.weeklyPlan.find((d) => d.workoutName === 'Push B')
  const idsA = new Set(pushA.exercises.map((e) => e.exerciseId))
  const overlap = pushB.exercises.filter((e) => idsA.has(e.exerciseId)).length
  assert(overlap < pushB.exercises.length, 'Push A/B idênticos')
  console.log(`Push A/B overlap: ${overlap}/${pushB.exercises.length}`)

  assert(
    plan.weeklyPlan.some((d) => d.intensity === 'Alta controlada'),
    'Esperava intensidade Alta controlada',
  )

  const table = [
    ['Iniciante', 30, 3],
    ['Iniciante', 90, 6],
    ['Intermediário', 60, 7],
    ['Avançado', 60, 9],
    ['Avançado', 90, 10],
  ]
  for (const [level, mins, expect] of table) {
    const p = generateWorkoutPlan({
      level,
      goal: 'hipertrofia',
      daysPerWeek: 3,
      minutesPerWorkout: mins,
      equipment: ['Academia completa'],
    })
    const push = p.weeklyPlan.find((d) => /push/i.test(d.workoutName)) || p.weeklyPlan[0]
    assert(
      push.exercises.length === expect,
      `${level} ${mins}min: esperava ${expect}, got ${push.exercises.length}`,
    )
    console.log(`OK ${level} ${mins}min → ${push.exercises.length}`)
  }

  console.log('\nALL CHECKS PASSED')
} finally {
  await server.close()
}
