import assert from 'node:assert/strict'
import { test } from 'node:test'
import { displayWorkoutName, formatRestLabel } from '../src/utils/workoutLabels.js'
import {
  estimateSessionMinutes,
  inferMovementRole,
  isStrengthCompound,
  buildSetsRepsRest,
  pickExercisesForDay,
} from '../src/utils/workoutGenerator.js'
import {
  isBrokenMediaUrl,
  shouldDropRemoteExercise,
  dedupeExerciseList,
} from '../src/utils/exerciseRemoteFilter.js'
import { costasExerciseDefs } from '../src/data/costasExercises.js'
import { pernasExerciseDefs } from '../src/data/pernasExercises.js'
import { PERNAS_LOCAL_MEDIA } from '../src/data/pernasLocalMedia.js'
import { LOCAL_EXERCISE_GIFS } from '../src/data/exerciseLocalGifs.js'
import { canonicalGifId } from '../src/data/exerciseGifAliases.js'

test('formatRestLabel uses minutes and seconds', () => {
  assert.equal(formatRestLabel(145), '2 min 25 s')
  assert.equal(formatRestLabel(60), '1 min')
  assert.equal(formatRestLabel(45), '45 s')
  assert.equal(formatRestLabel('75 a 120 segundos'), '75 a 120 segundos')
})

test('displayWorkoutName translates split names', () => {
  assert.equal(displayWorkoutName('Legs A'), 'Pernas A')
  assert.equal(displayWorkoutName('Push B'), 'Empurrar B')
  assert.equal(displayWorkoutName('Pull A'), 'Puxar A')
})

test('machine chest press stays a compound, not isolation', () => {
  const role = inferMovementRole({
    category: 'Peitoral',
    name: 'Supino na máquina',
    equipment: 'Máquina',
  })
  assert.equal(role, 'chest_flat')
  assert.equal(
    inferMovementRole({ category: 'Peitoral', name: 'Crucifixo no cabo', equipment: 'Cabo' }),
    'chest_isolation',
  )
})

test('strength goal keeps isolation out of 4-6 reps', () => {
  assert.equal(isStrengthCompound({ category: 'Peitoral', name: 'Supino reto' }), true)
  assert.equal(isStrengthCompound({ category: 'Peitoral', name: 'Crucifixo com halteres' }), false)
  assert.equal(isStrengthCompound({ category: 'Ombros', name: 'Elevação lateral' }), false)

  const compound = buildSetsRepsRest({ name: 'Supino reto', category: 'Peitoral', sets: '4', rest: '90' }, 'Intermediário', 'forca', 'Push')
  const isolation = buildSetsRepsRest(
    { name: 'Crucifixo com halteres', category: 'Peitoral', sets: '3', rest: '60' },
    'Intermediário',
    'forca',
    'Push',
  )
  assert.equal(compound.reps, '4-6')
  assert.equal(isolation.reps, '8-12')
})

test('session minutes follow sets and rest, not the profile cap', () => {
  const minutes = estimateSessionMinutes(
    [
      { sets: 5, restSeconds: 145, name: 'Agachamento' },
      { sets: 4, restSeconds: 120, name: 'Leg press' },
      { sets: 3, restSeconds: 90, name: 'Panturrilha' },
    ],
    { fallback: 30 },
  )
  assert.equal(minutes, 27)
  assert.notEqual(minutes, 30)
})

test('costas pulldown is vertical and row is horizontal', () => {
  assert.equal(inferMovementRole({ category: 'Costas', name: 'Puxada frontal' }), 'back_vertical')
  assert.equal(inferMovementRole({ category: 'Costas', name: 'Remada curvada com barra' }), 'back_horizontal')
  assert.equal(inferMovementRole({ category: 'Costas', name: 'Barra fixa' }), 'back_vertical')
  assert.equal(inferMovementRole({ category: 'Costas', name: 'Serrote / remada unilateral' }), 'back_unilateral')
})

test('most costas exercises keep their own gif instead of sharing triangle pulldown', () => {
  assert.equal(canonicalGifId('barra-fixa'), 'barra-fixa')
  assert.equal(canonicalGifId('remada-unilateral'), 'remada-unilateral')
  assert.notEqual(LOCAL_EXERCISE_GIFS['barra-fixa'], LOCAL_EXERCISE_GIFS['puxada-triangulo'])
  assert.notEqual(LOCAL_EXERCISE_GIFS['remada-curvada'], LOCAL_EXERCISE_GIFS['remada-baixa-cabo'])
  const withOwnGif = costasExerciseDefs.filter((ex) => LOCAL_EXERCISE_GIFS[ex.id])
  assert.ok(withOwnGif.length >= 50, `expected >= 50 unique costas GIFs, got ${withOwnGif.length}`)
})

test('pernas variants keep their own image instead of sharing the squat gif', () => {
  const uniqueIds = [
    'agachamento-no-smith',
    'agachamento-sissy',
    'agachamento-zercher',
    'agachamento-maquina-hack',
    'agachamento-hack-barra',
    'agachamento-goblet-haltere',
    'afundo-lateral-barra',
  ]
  for (const id of uniqueIds) {
    assert.equal(canonicalGifId(id), id)
  }
  const paths = uniqueIds.map((id) => PERNAS_LOCAL_MEDIA[id])
  assert.equal(new Set(paths).size, paths.length)
  const missing = pernasExerciseDefs.filter((ex) => !PERNAS_LOCAL_MEDIA[ex.id])
  assert.equal(missing.length, 0, `missing local media: ${missing.map((ex) => ex.id).join(', ')}`)
  assert.match(pernasExerciseDefs.find((ex) => ex.id === 'passada-lateral').name, /lateral com barra/i)
  assert.match(pernasExerciseDefs.find((ex) => ex.id === 'afundo-banco-halteres').name, /banco/i)
  assert.match(
    pernasExerciseDefs.find((ex) => ex.id === 'agachamento-pliometrico-halteres').name,
    /pli[eé]/i,
  )
  assert.equal(PERNAS_LOCAL_MEDIA['step-up'], PERNAS_LOCAL_MEDIA['afundo-banco-halteres'])
  assert.equal(pernasExerciseDefs.find((ex) => ex.id === 'agachamento-barra').hiddenFromLibrary, true)
  assert.equal(pernasExerciseDefs.find((ex) => ex.id === 'agachamento-goblet-haltere').hiddenFromLibrary, true)
})

test('pernas roles stay distinct so a legs day does not stack squats', () => {
  assert.equal(inferMovementRole({ category: 'Pernas', name: 'Agachamento no Smith' }), 'leg_squat')
  assert.equal(inferMovementRole({ category: 'Pernas', name: 'Stiff com halteres' }), 'leg_hinge')
  assert.equal(inferMovementRole({ category: 'Pernas', name: 'Afundo com barra' }), 'leg_unilateral')
  assert.equal(inferMovementRole({ category: 'Pernas', name: 'Cadeira extensora' }), 'leg_quad_iso')
  assert.equal(inferMovementRole({ category: 'Pernas', name: 'Mesa flexora' }), 'leg_ham_iso')
  assert.equal(inferMovementRole({ category: 'Glúteos', name: 'Hip thrust' }), 'glute_thrust')

  const { selected } = pickExercisesForDay(
    { name: 'Pernas A', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
    {
      level: 'Intermediário',
      equipment: ['Academia completa'],
      restrictions: [],
      maxExercises: 6,
      location: 'Academia',
      minutesPerWorkout: 55,
    },
  )
  const ids = selected.map((ex) => ex.id)
  assert.equal(new Set(ids).size, ids.length)
  const pernasRoles = selected
    .filter((ex) => (ex.category || ex.muscleGroup) === 'Pernas')
    .map((ex) => inferMovementRole(ex))
  assert.equal(new Set(pernasRoles).size, pernasRoles.length)
})

test('broken supabase media host is dropped', () => {
  assert.equal(
    isBrokenMediaUrl('https://fsoctybvimpcgimwuxaj.supabase.co/storage/v1/object/public/exercise-media/x.gif'),
    true,
  )
  const localIndex = new Map()
  assert.equal(
    shouldDropRemoteExercise(
      { id: '11111111-1111-1111-1111-111111111111', name: 'Crucifixo', media_url: '' },
      localIndex,
    ),
    true,
  )
  const kept = dedupeExerciseList([
    { id: 'crucifixo', name: 'Crucifixo com halteres', hasVerifiedMedia: true },
    { id: 'uuid-1', name: 'Crucifixo com halteres', hasVerifiedMedia: false },
  ])
  assert.equal(kept.length, 1)
  assert.equal(kept[0].id, 'crucifixo')
})

test('local costas gif wins over a supabase row with the same name', () => {
  const kept = dedupeExerciseList([
    {
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      name: 'Remada curvada com barra',
      hasVerifiedMedia: true,
      gif: 'https://static.exercisedb.dev/media/7vG5o25.gif',
      mediaUrl: 'https://static.exercisedb.dev/media/7vG5o25.gif',
    },
    {
      id: 'remada-curvada',
      name: 'Remada curvada com barra',
      hasVerifiedMedia: true,
      gif: '/media/exercises/gifs/remada-curvada.gif',
      mediaUrl: '/media/exercises/gifs/remada-curvada.gif',
    },
  ])
  assert.equal(kept.length, 1)
  assert.equal(kept[0].id, 'remada-curvada')
  assert.match(kept[0].gif, /remada-curvada\.gif$/)
})
