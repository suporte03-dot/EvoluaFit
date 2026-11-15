import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatLoad,
  formatSetHint,
  parseRepRange,
  stepLoad,
  suggestLoad,
  suggestSetTarget,
} from '../src/utils/liveWorkout/loadSuggestion.js'
import { parseVoiceAlternatives, parseVoiceSet } from '../src/utils/liveWorkout/voiceParser.js'
import {
  applySwap,
  buildSwapEntry,
  findSwapAlternatives,
  resolveAllowedEquipment,
  resolvePrescriptionContext,
} from '../src/utils/liveWorkout/swapExercise.js'
import { suggestNextLoad } from '../src/utils/prescription/index.js'

describe('sugestão de carga por série', () => {
  const range = parseRepRange('8-10')

  test('todas no topo da faixa com a mesma carga: superiores sobem 1–2 kg, inferiores 2,5 kg', () => {
    const sets = [{ weight: 40, reps: 10 }, { weight: 40, reps: 10 }, { weight: 40, reps: 10 }]
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, upperIncrementKg: 2 }).loadKg, 42)
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, lowerBody: true }).loadKg, 42.5)
  })

  test('composto de inferiores pesado sobe 5 kg; isolado de inferiores segue +2,5 kg', () => {
    const sets = [{ weight: 160, reps: 10 }, { weight: 160, reps: 10 }]
    const heavy = suggestLoad({ lastSets: sets, repRange: range, lowerBody: true, compound: true })
    assert.equal(heavy.kind, 'increase')
    assert.equal(heavy.loadKg, 165)
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, lowerBody: true }).loadKg, 162.5)
  })

  test('maioria das séries bem abaixo do mínimo: reduz 5–10%', () => {
    const mild = suggestLoad({
      lastSets: [{ weight: 60, reps: 6 }, { weight: 60, reps: 6 }, { weight: 60, reps: 9 }],
      repRange: range,
    })
    assert.equal(mild.kind, 'reduce')
    assert.equal(mild.loadKg, 57.5)
    const hard = suggestLoad({ lastSets: [{ weight: 50, reps: 4 }, { weight: 50, reps: 3 }], repRange: range })
    assert.equal(hard.kind, 'reduce')
    assert.equal(hard.loadKg, 45)
  })

  test('uma série só um pouco abaixo: mantém a carga', () => {
    const s = suggestLoad({ lastSets: [{ weight: 30, reps: 9 }, { weight: 30, reps: 7 }], repRange: range })
    assert.equal(s.kind, 'keep')
    assert.equal(s.loadKg, 30)
  })

  test('alvo por série: aumento usa a mesma série da última sessão + incremento', () => {
    const suggestion = { kind: 'increase', loadKg: 42.5, deltaKg: 2.5 }
    const target = suggestSetTarget(suggestion, { previous: { weight: 40, reps: 10 }, repRange: range })
    assert.deepEqual(target, { loadKg: 42.5, reps: 8, repsLabel: '8–10' })
    assert.equal(formatSetHint(target), 'Sugestão: 42,5 kg × 8–10')
  })

  test('alvo por série: dentro da faixa mantém a carga e pede +1 rep (até o topo)', () => {
    const suggestion = { kind: 'hold', loadKg: 30, deltaKg: 0 }
    assert.deepEqual(suggestSetTarget(suggestion, { previous: { weight: 30, reps: 8 }, repRange: range }), {
      loadKg: 30,
      reps: 9,
      repsLabel: '9',
    })
    assert.equal(suggestSetTarget(suggestion, { previous: { weight: 30, reps: 10 }, repRange: range }).reps, 10)
  })

  test('sem histórico: nenhuma sugestão por série', () => {
    assert.equal(suggestSetTarget({ kind: 'first', loadKg: null }, { repRange: range }), null)
    assert.equal(suggestSetTarget(null), null)
    assert.equal(formatSetHint(null), '')
  })

  test('peso corporal: sugestão só de repetições', () => {
    const target = suggestSetTarget({ kind: 'hold', loadKg: 0, deltaKg: 0 }, { previous: { weight: 0, reps: 8 }, repRange: range })
    assert.equal(formatSetHint(target), 'Sugestão: 9 reps')
  })

  test('suggestNextLoad do motor delega para a mesma regra', () => {
    const s = suggestNextLoad(
      { exerciseId: 'supino-reto', name: 'Supino reto', reps: '8-10' },
      { lastSets: [{ weight: 40, reps: 10 }, { weight: 40, reps: 10 }], upperIncrementKg: 2 },
    )
    assert.equal(s.kind, 'increase')
    assert.equal(s.loadKg, 42)
    assert.equal(suggestNextLoad({ exerciseId: 'supino-reto' }, { lastSets: [] }).kind, 'first')
  })
})

describe('botões ±2,5 kg', () => {
  test('nunca abaixo de 0 e sem resíduo de ponto flutuante', () => {
    assert.equal(stepLoad(40, 2.5), 42.5)
    assert.equal(stepLoad(1, -2.5), 0)
    assert.equal(stepLoad(0.1 + 0.2, 2.5), 2.8)
  })

  test('formata com vírgula', () => {
    assert.equal(formatLoad(42.5), '42,5')
    assert.equal(formatLoad(40), '40')
    assert.equal(formatLoad(21.25), '21,25')
  })
})

describe('registro de série por voz', () => {
  const cases = [
    ['10 repetições com 40 quilos', { reps: 10, load: 40 }],
    ['8 com 22,5', { reps: 8, load: 22.5 }],
    ['8 com 22.5', { reps: 8, load: 22.5 }],
    ['40 kg 10', { reps: 10, load: 40 }],
    ['40kg 10', { reps: 10, load: 40 }],
    ['fiz 12', { reps: 12, load: null }],
    ['12', { reps: 12, load: null }],
    ['doze repetições com vinte e dois e meio', { reps: 12, load: 22.5 }],
    ['oito com quarenta', { reps: 8, load: 40 }],
    ['dez com trinta e dois vírgula cinco', { reps: 10, load: 32.5 }],
    ['22 vírgula 5 quilos', { reps: null, load: 22.5 }],
    ['cento e vinte quilos oito repetições', { reps: 8, load: 120 }],
    ['fiz uma série de 10 com 40', { reps: 10, load: 40 }],
    ['Fiz 10 Repetições Com 40 KG', { reps: 10, load: 40 }],
    ['60 8', { reps: 8, load: 60 }],
    ['10 32,5', { reps: 10, load: 32.5 }],
    ['três vezes', { reps: 3, load: null }],
  ]
  for (const [phrase, expected] of cases) {
    test(`"${phrase}"`, () => {
      assert.deepEqual(parseVoiceSet(phrase), expected)
    })
  }

  test('frases sem números ou fora dos limites não viram série', () => {
    assert.equal(parseVoiceSet('próximo exercício'), null)
    assert.equal(parseVoiceSet(''), null)
    assert.equal(parseVoiceSet(undefined), null)
    assert.deepEqual(parseVoiceSet('900 quilos 10 repetições'), { reps: 10, load: null })
  })

  test('usa a primeira alternativa reconhecível', () => {
    const r = parseVoiceAlternatives(['oi tudo bem', '8 com 30'])
    assert.equal(r.reps, 8)
    assert.equal(r.load, 30)
    assert.equal(r.transcript, '8 com 30')
    assert.equal(parseVoiceAlternatives(['nada aqui']), null)
  })
})

describe('aparelho ocupado', () => {
  test('equipamento do perfil: academia completa sem filtro; casa só equipamentos de casa', () => {
    assert.deepEqual(resolveAllowedEquipment(['Academia completa'], 'Academia'), [])
    assert.deepEqual(resolveAllowedEquipment([], 'Academia'), [])
    assert.ok(resolveAllowedEquipment([], 'Casa').includes('Halteres'))
    assert.ok(!resolveAllowedEquipment(['Academia completa'], 'Casa').includes('Máquina'))
    const free = resolveAllowedEquipment(['Halteres'], 'Academia')
    assert.ok(free.includes('Halteres') && free.includes('Peso livre') && free.includes('Peso corporal'))
  })

  test('alternativas respeitam grupo, equipamento e não repetem exercícios do treino', () => {
    const current = { exerciseId: 'supino-reto', name: 'Supino reto', category: 'Peitoral' }
    const all = findSwapAlternatives(current, { equipment: ['Academia completa'], sessionExercises: [current] })
    assert.ok(all.length > 0)
    assert.ok(all.every((ex) => ex.category === 'Peitoral' && ex.id !== 'supino-reto'))
    const dumbbells = findSwapAlternatives(current, {
      equipment: ['Halteres'],
      sessionExercises: [current, { exerciseId: 'supino-com-halteres' }],
    })
    assert.ok(dumbbells.every((ex) => ['Halteres', 'Peso livre', 'Peso corporal'].includes(ex.equipment)))
    assert.ok(!dumbbells.some((ex) => ex.id === 'supino-com-halteres'))
  })

  test('contexto de prescrição vem da planilha do treino ou do perfil', () => {
    const plans = [{ id: 'p1', goal: 'Hipertrofia', level: 'Avançado' }]
    assert.deepEqual(resolvePrescriptionContext({ workout: { planId: 'p1' }, plans }), {
      goal: 'Hipertrofia',
      level: 'Avançado',
    })
    assert.deepEqual(resolvePrescriptionContext({ workout: {}, profile: { level: 'Iniciante' } }), {
      goal: null,
      level: 'Iniciante',
    })
    assert.equal(resolvePrescriptionContext({ workout: {} }), null)
  })

  const slot = (n, completed = false) => ({ setNumber: n, weight: completed ? '40' : '', reps: completed ? '10' : '', completed })
  const alt = { id: 'supino-com-halteres', name: 'Supino com halteres', category: 'Peitoral', equipment: 'Halteres' }

  test('sem séries feitas: usa séries/reps/descanso do motor e registra o original', () => {
    const current = { exerciseId: 'supino-reto', name: 'Supino reto', reps: '8-12', liveRestSeconds: 90, setSlots: [slot(1), slot(2), slot(3)] }
    const entry = buildSwapEntry(current, alt, { sets: 4, reps: '6-10', restSeconds: 120 })
    assert.equal(entry.exerciseId, 'supino-com-halteres')
    assert.equal(entry.sets, 4)
    assert.equal(entry.reps, '6-10')
    assert.equal(entry.restSeconds, 120)
    assert.deepEqual(entry.swappedFrom, { exerciseId: 'supino-reto', name: 'Supino reto' })
    const kept = buildSwapEntry(current, alt, null)
    assert.equal(kept.sets, 3)
    assert.equal(kept.reps, '8-12')
    assert.equal(kept.restSeconds, 90)
  })

  test('troca em cadeia mantém o exercício original da planilha', () => {
    const swapped = { exerciseId: 'x', name: 'X', swappedFrom: { exerciseId: 'supino-reto', name: 'Supino reto' }, setSlots: [slot(1)] }
    assert.deepEqual(buildSwapEntry(swapped, alt).swappedFrom, { exerciseId: 'supino-reto', name: 'Supino reto' })
  })

  test('com séries feitas: só as restantes, original fica com as concluídas e o substituto vai ao fim', () => {
    const current = { exerciseId: 'supino-reto', name: 'Supino reto', setSlots: [slot(1, true), slot(2), slot(3)] }
    const other = { exerciseId: 'crucifixo', name: 'Crucifixo', setSlots: [slot(1)] }
    const entry = buildSwapEntry(current, alt, { sets: 4, reps: '6-10', restSeconds: 120 })
    assert.equal(entry.sets, 2)
    const replacement = { ...entry, setSlots: [slot(1), slot(2)] }
    const { exercises, index } = applySwap([current, other], 0, replacement)
    assert.equal(index, 2)
    assert.equal(exercises.length, 3)
    assert.equal(exercises[0].setSlots.length, 1)
    assert.equal(exercises[0].sets, 1)
    assert.equal(exercises[0].swappedTo, 'Supino com halteres')
    assert.equal(exercises[1], other)
    assert.equal(exercises[2], replacement)
  })

  test('sem séries feitas: substitui no lugar', () => {
    const current = { exerciseId: 'supino-reto', setSlots: [slot(1), slot(2)] }
    const replacement = { exerciseId: 'supino-com-halteres', setSlots: [slot(1)] }
    const { exercises, index } = applySwap([current], 0, replacement)
    assert.equal(index, 0)
    assert.deepEqual(exercises, [replacement])
  })
})
