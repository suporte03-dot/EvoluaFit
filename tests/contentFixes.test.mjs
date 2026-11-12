import assert from 'node:assert/strict'
import { test } from 'node:test'
import { displayWorkoutName, formatRestLabel } from '../src/utils/workoutLabels.js'
import {
  estimateSessionMinutes,
  inferMovementRole,
  isStrengthCompound,
  buildSetsRepsRest,
} from '../src/utils/workoutGenerator.js'
import {
  isBrokenMediaUrl,
  shouldDropRemoteExercise,
  dedupeExerciseList,
} from '../src/utils/exerciseRemoteFilter.js'
import { costasExerciseDefs } from '../src/data/costasExercises.js'
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
