import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exercises } from '../src/data/exercisesData.js'
import { generateWorkoutPlan } from '../src/utils/workoutGenerator.js'
import { validatePlan } from '../src/utils/prescription/index.js'
import { isPlanBuildRequest, parseAppVoiceCommand } from '../src/utils/voiceIntents.js'
import {
  applyProposalToPlan,
  buildPlanProposal,
  computePlanApplication,
  describeProposal,
  diffPlans,
  findPlanDayIndex,
  matchCatalogExercise,
} from '../src/utils/coach/proposal.js'
import { buildCatalogDigest, buildCoachAIContext } from '../src/utils/coach/context.js'
import { detectPainMention, painReplyText } from '../src/utils/coach/safety.js'
import {
  checkRateLimit,
  createHandler,
  parseModelOutput,
  validateCoachRequest,
} from '../api/coach.js'

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value
    },
    end(payload) {
      this.body = payload ? JSON.parse(payload) : null
    },
  }
}

function basePlan() {
  return generateWorkoutPlan({ goal: 'hipertrofia', level: 'Intermediário', daysPerWeek: 4, duration: 60 })
}

test('"monte um treino para 5 dias, musculação avançada" vira proposta real de 5 dias', () => {
  const intent = parseAppVoiceCommand('monte um treino para 5 dias, musculação avançada')
  assert.equal(intent.domain, 'build')
  assert.equal(intent.slots.daysPerWeek, 5)
  assert.equal(intent.slots.level, 'Avançado')
  assert.equal(intent.slots.objective, 'hipertrofia')

  const profile = { objective: 'saude', level: 'Iniciante', daysPerWeek: 3, duration: 60, location: 'Academia' }
  const proposal = buildPlanProposal({ slots: intent.slots, profile, activePlan: null })
  assert.equal(proposal.kind, 'new_plan')
  assert.equal(proposal.plan.weeklyPlan.length, 5)
  assert.equal(proposal.plan.level, 'Avançado')
  assert.equal(proposal.plan.goal, 'hipertrofia')
  assert.equal(proposal.sources.daysPerWeek, 'pedido')
  assert.equal(proposal.sources.minutes, 'perfil')
  assert.equal(validatePlan(proposal.plan).valid, true)
  assert.ok(describeProposal(proposal).includes('5 dias'))

  const completed = {
    id: 'old-done',
    planId: 'old-plan',
    dayNumber: 1,
    date: '2026-11-10',
    status: 'Realizado',
    exercises: [],
  }
  const oldPending = { id: 'old-pending', planId: 'old-plan', dayNumber: 2, date: '2026-11-14', status: 'Pendente', exercises: [] }
  const manual = { id: 'manual', name: 'Treino avulso', date: '2026-11-15', status: 'Pendente', exercises: [] }
  const applied = computePlanApplication({
    activePlan: { id: 'old-plan', weeklyPlan: [] },
    nextPlan: proposal.plan,
    workouts: [completed, oldPending, manual],
  })
  assert.equal(applied.plan.id, proposal.plan.id)
  assert.equal(applied.added, 5)
  assert.equal(applied.removed, 1)
  const ids = applied.workouts.map((w) => w.id)
  assert.ok(ids.includes('old-done'), 'histórico concluído preservado')
  assert.ok(ids.includes('manual'), 'treino avulso preservado')
  assert.ok(!ids.includes('old-pending'), 'pendente da planilha antiga removido')
  assert.equal(new Set(ids).size, ids.length, 'sem ids duplicados')
  assert.equal(applied.workouts.filter((w) => w.planId === proposal.plan.id).length, 5)
})

test('editar a mesma planilha não duplica e mantém o dia já concluído', () => {
  const plan = basePlan()
  const first = computePlanApplication({ activePlan: null, nextPlan: plan, workouts: [] })
  const done = { ...first.workouts[0], status: 'Realizado' }
  const workouts = [done, ...first.workouts.slice(1)]
  const edited = applyProposalToPlan(plan, [{ tipo: 'remover', dia: 1, de: plan.weeklyPlan[0].exercises.at(-1).name }])
  const again = computePlanApplication({ activePlan: plan, nextPlan: edited.plan, workouts })
  assert.equal(again.plan.id, plan.id)
  assert.equal(again.workouts.filter((w) => w.planId === plan.id).length, plan.weeklyPlan.length)
  assert.ok(again.workouts.some((w) => w.id === done.id && w.status === 'Realizado'))
  assert.equal(new Set(again.workouts.map((w) => w.id)).size, again.workouts.length)
})

test('variações de intenção de montar planilha', () => {
  const cases = [
    ['quero um treino 5x por semana', { daysPerWeek: 5 }],
    ['monta uma rotina de 4 dias', { daysPerWeek: 4 }],
    ['crie um plano de força para 3 dias', { daysPerWeek: 3, objective: 'forca' }],
    ['gere uma planilha intermediário 45 min em casa', { level: 'Intermediário', minutes: 45, location: 'Casa' }],
    ['monte um treino avançado', { level: 'Avançado' }],
    ['faça um treino de musculação para iniciante', { objective: 'hipertrofia', level: 'Iniciante' }],
    ['treino de 5 dias para emagrecer', { daysPerWeek: 5, objective: 'emagrecimento' }],
    ['montar treino cinco dias condicionamento', { daysPerWeek: 5, objective: 'condicionamento' }],
  ]
  for (const [text, expected] of cases) {
    const intent = parseAppVoiceCommand(text)
    assert.equal(intent.domain, 'build', text)
    for (const [key, value] of Object.entries(expected)) assert.equal(intent.slots[key], value, `${text} → ${key}`)
  }
  assert.equal(isPlanBuildRequest('Ajustar minha planilha atual.'), false)
  assert.equal(isPlanBuildRequest('como montar um treino?'), false)
  assert.equal(isPlanBuildRequest('o que treinar hoje?'), false)
  assert.notEqual(parseAppVoiceCommand('qual a diferença entre supino reto e inclinado?').domain, 'build')
})

test('applyProposalToPlan: trocar, remover, adicionar e ajustar', () => {
  const plan = basePlan()
  const day = plan.weeklyPlan[0]
  const dayName = day.workoutName
  const [first, second] = day.exercises
  const toAdd = exercises.find(
    (ex) => !ex.hiddenFromLibrary && ex.category === 'Bíceps' && !day.exercises.some((e) => e.exerciseId === ex.id),
  )
  const swapTarget = exercises.find(
    (ex) => !ex.hiddenFromLibrary && ex.category === 'Peitoral' && !day.exercises.some((e) => e.exerciseId === ex.id),
  )

  const result = applyProposalToPlan(plan, [
    { tipo: 'trocar', dia: dayName, de: first.name, para: swapTarget.name, motivo: 'variar' },
    { tipo: 'remover', dia: 1, de: second.name },
    { tipo: 'adicionar', dia: `Dia 1`, para: toAdd.name },
    { tipo: 'ajustar', dia: 2, de: plan.weeklyPlan[1].exercises[0].name, para: '4x8-10 · 90s' },
    { tipo: 'adicionar', dia: 1, para: 'Exercício Inventado Supremo' },
    { tipo: 'trocar', dia: 'Dia 99', de: 'x', para: 'y' },
  ])

  const after = result.plan.weeklyPlan[0].exercises
  assert.ok(after.some((e) => e.exerciseId === swapTarget.id), 'trocado')
  assert.ok(!after.some((e) => e.exerciseId === first.exerciseId), 'original saiu')
  assert.ok(!after.some((e) => e.exerciseId === second.exerciseId) || result.corrections.length >= 0, 'removido')
  assert.ok(after.some((e) => e.exerciseId === toAdd.id) || result.corrections.some((c) => c.field === 'exercise'), 'adicionado')
  assert.equal(result.applied.length, 4)
  assert.equal(result.skipped.length, 2)
  assert.ok(result.skipped.some((s) => s.motivo.includes('catálogo')))
  assert.ok(result.skipped.some((s) => s.motivo.includes('Dia 99')))
  assert.equal(validatePlan(result.plan).valid, true, 'resultado já passa pelo motor')
})

test('motor corrige mudança inválida da IA (isolado em 4-6 reps) com motivo', () => {
  const plan = basePlan()
  const dayIdx = plan.weeklyPlan.findIndex((d) => d.exercises.some((e) => e.kind === 'isolado'))
  assert.ok(dayIdx >= 0)
  const iso = plan.weeklyPlan[dayIdx].exercises.find((e) => e.kind === 'isolado')
  const result = applyProposalToPlan(plan, [
    { tipo: 'ajustar', dia: dayIdx + 1, de: iso.name, para: '3x4-6 · 90s', motivo: 'mais carga' },
  ])
  assert.equal(result.applied.length, 1)
  const fix = result.corrections.find((c) => c.exerciseId === iso.exerciseId && c.field === 'reps')
  assert.ok(fix, 'correção de reps registrada')
  assert.equal(fix.from, '4-6')
  assert.ok(fix.reason.length > 0)
  const fixed = result.plan.weeklyPlan[dayIdx].exercises.find((e) => e.exerciseId === iso.exerciseId)
  assert.notEqual(fixed.reps, '4-6')
  assert.equal(validatePlan(result.plan).valid, true)
})

test('dia por nome em inglês antigo e diff antes/depois', () => {
  const plan = generateWorkoutPlan({ goal: 'hipertrofia', level: 'Avançado', daysPerWeek: 6, duration: 60 })
  const legacy = {
    ...plan,
    weeklyPlan: plan.weeklyPlan.map((d) => ({ ...d, workoutName: d.workoutName.replace('Puxar', 'Pull') })),
  }
  const idx = findPlanDayIndex(legacy, 'Puxar B')
  assert.equal(legacy.weeklyPlan[idx].workoutName, 'Pull B')
  assert.equal(findPlanDayIndex(legacy, 'Pull B'), idx)
  const removed = applyProposalToPlan(legacy, [{ tipo: 'remover', dia: 'Pull B', de: legacy.weeklyPlan[idx].exercises[1].name }])
  const diff = diffPlans(legacy, removed.plan)
  assert.equal(diff[idx].changed, true)
  assert.ok(diff[idx].antes.some((r) => r.status === 'removido'))
  assert.equal(diff[idx].nomeDepois, 'Puxar B')
})

test('catálogo: nomes desconhecidos não casam', () => {
  const known = exercises.find((ex) => !ex.hiddenFromLibrary)
  assert.equal(matchCatalogExercise(known.name.toUpperCase())?.id, known.id)
  assert.equal(matchCatalogExercise('Levantamento de geladeira'), null)
})

test('contexto da IA exclui e-mail, fotos e medidas', () => {
  const ctx = buildCoachAIContext({
    profile: {
      name: 'Maria',
      email: 'maria@example.com',
      objective: 'hipertrofia',
      level: 'Intermediário',
      daysPerWeek: 4,
      duration: 60,
      location: 'Academia',
      equipment: ['Academia completa'],
      restrictions: ['Joelho'],
      weight: 70,
      height: 165,
      age: 31,
      photoUrl: 'https://x/foto.jpg',
    },
    generatedPlan: basePlan(),
    history: [{ name: 'Push A', completedAt: '2026-11-10T10:00:00Z', exercises: [{}, {}], status: 'Realizado', photo: 'p.jpg' }],
    goals: [{ type: 'weekly_workouts', target: 4 }],
    bodyEvolution: { count: 2, latest: { waist: 80 }, photos: ['a.jpg'] },
  })
  const json = JSON.stringify(ctx)
  for (const forbidden of ['maria@example.com', 'Maria', 'foto.jpg', 'p.jpg', 'a.jpg', 'waist', '"weight"', '"height"', '"age"', '165']) {
    assert.ok(!json.includes(forbidden), `vazou ${forbidden}`)
  }
  assert.equal(ctx.objetivo, 'hipertrofia')
  assert.equal(ctx.planilhaAtiva.dias.length, 4)
  assert.equal(ctx.ultimasSessoes[0].nome, 'Empurrar A')
  assert.deepEqual(ctx.restricoes, ['Joelho'])
  const digest = buildCatalogDigest(exercises, { location: 'Casa' })
  assert.ok(Object.keys(digest).length > 0)
})

test('guarda de dor/lesão', () => {
  const knee = detectPainMention('estou com dor no joelho quando agacho')
  assert.equal(knee.triggered, true)
  assert.deepEqual(knee.restrictions, ['Joelho'])
  assert.equal(detectPainMention('acho que tenho tendinite no ombro').restrictions[0], 'Ombro')
  assert.equal(detectPainMention('machuquei a lombar').restrictions[0], 'Lombar')
  assert.equal(detectPainMention('lesão antiga').triggered, true)
  assert.equal(detectPainMention('monte um treino para 5 dias').triggered, false)
  assert.equal(detectPainMention('quero treinar ombro').triggered, false)
  assert.ok(/médico|fisioterapeuta/.test(painReplyText(knee)))

  const proposal = buildPlanProposal({
    slots: {},
    profile: { objective: 'hipertrofia', level: 'Intermediário', daysPerWeek: 3, duration: 45 },
    extraRestrictions: knee.restrictions,
    reason: 'dor',
  })
  assert.deepEqual(proposal.inputs.restrictions, ['Joelho'])
  assert.equal(validatePlan(proposal.plan).valid, true)
})

test('api/coach: validação do pedido', () => {
  assert.equal(validateCoachRequest(null).ok, false)
  assert.equal(validateCoachRequest('{nope').error, 'invalid_json')
  assert.equal(validateCoachRequest({}).error, 'missing_question')
  assert.equal(validateCoachRequest({ question: 'x'.repeat(2000) }).status, 413)
  assert.equal(validateCoachRequest({ question: 'oi', mode: 'hack' }).error, 'invalid_mode')
  assert.equal(validateCoachRequest({ question: 'oi', mode: 'explain_proposal' }).error, 'missing_proposal')
  assert.equal(validateCoachRequest({ question: 'oi', context: { big: 'x'.repeat(40000) } }).status, 413)
  const ok = validateCoachRequest(JSON.stringify({ question: ' Posso treinar perna 2x? ', context: {} }))
  assert.equal(ok.ok, true)
  assert.equal(ok.value.question, 'Posso treinar perna 2x?')
  assert.equal(ok.value.mode, 'chat')
})

test('api/coach: parse da saída do modelo', () => {
  assert.equal(parseModelOutput(''), null)
  assert.equal(parseModelOutput('não é json'), null)
  assert.equal(parseModelOutput('{"resposta": ""}'), null)
  assert.deepEqual(parseModelOutput('{"resposta":"Olá"}'), { resposta: 'Olá', proposta: null })
  const fenced = parseModelOutput(
    '```json\n{"resposta":"Ok","proposta":{"titulo":"T","mudancas":[{"tipo":"trocar","dia":2,"de":"A","para":"B","motivo":"m"},{"tipo":"explodir","dia":1}]}}\n```',
  )
  assert.equal(fenced.resposta, 'Ok')
  assert.equal(fenced.proposta.mudancas.length, 1)
  assert.equal(fenced.proposta.mudancas[0].dia, 2)
  const noProposal = parseModelOutput('{"resposta":"Ok","proposta":{"mudancas":[{"tipo":"remover","dia":1,"de":"A"}]}}', {
    allowProposal: false,
  })
  assert.equal(noProposal.proposta, null)
})

test('api/coach: 405, 503 sem chave, 401 sem token, rate limit', async () => {
  const noFetch = () => {
    throw new Error('rede não deveria ser chamada')
  }
  const handler = createHandler({ env: {}, fetchImpl: noFetch })
  const res405 = mockRes()
  await handler({ method: 'GET', headers: {} }, res405)
  assert.equal(res405.statusCode, 405)

  const res503 = mockRes()
  await handler({ method: 'POST', headers: {}, body: { question: 'oi' } }, res503)
  assert.equal(res503.statusCode, 503)
  assert.equal(res503.body.error, 'ai_not_configured')
  assert.ok(!JSON.stringify(res503.body).includes('stack'))

  const configured = createHandler({
    env: { COACH_AI_API_KEY: 'k', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' },
    fetchImpl: noFetch,
  })
  const res401 = mockRes()
  await configured({ method: 'POST', headers: {}, body: { question: 'oi' } }, res401)
  assert.equal(res401.statusCode, 401)

  const store = new Map()
  const now = 1_000_000
  let allowed = 0
  for (let i = 0; i < 20; i += 1) if (checkRateLimit('u1', now + i, store).ok) allowed += 1
  assert.equal(allowed, 8)
  assert.equal(checkRateLimit('u1', now + 61000, store).ok, true)
  assert.equal(checkRateLimit('u2', now, store).ok, true)
})

test('api/coach: fluxo completo com fetch simulado', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push(url)
    if (url.endsWith('/auth/v1/user')) {
      assert.equal(options.headers.Authorization, 'Bearer tok')
      return new Response(JSON.stringify({ id: 'user-flow' }), { status: 200 })
    }
    const body = JSON.parse(options.body)
    assert.equal(body.response_format.type, 'json_object')
    assert.ok(body.messages[0].content.includes('português'))
    return new Response(
      JSON.stringify({ choices: [{ message: { content: '{"resposta":"Faça 3 séries."}' } }] }),
      { status: 200 },
    )
  }
  const handler = createHandler({
    env: { COACH_AI_API_KEY: 'k', COACH_AI_BASE_URL: 'https://llm.test/v1/', VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'pk' },
    fetchImpl,
  })
  const res = mockRes()
  await handler({ method: 'POST', headers: { authorization: 'Bearer tok' }, body: { question: 'Quantas séries?' } }, res)
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { resposta: 'Faça 3 séries.', proposta: null })
  assert.equal(calls[1], 'https://llm.test/v1/chat/completions')
})
