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
  mergeLocalAndRemoteExercises,
  collapseSharedLibraryMedia,
} from '../src/utils/exerciseRemoteFilter.js'
import { costasExerciseDefs } from '../src/data/costasExercises.js'
import { ombrosExerciseDefs } from '../src/data/ombrosExercises.js'
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

test('ombros variants keep their own gif instead of sharing the overhead press', () => {
  assert.equal(canonicalGifId('desenvolvimento-militar-barra'), 'desenvolvimento-militar-barra')
  assert.equal(canonicalGifId('elevacao-lateral-maquina'), 'elevacao-lateral-maquina')
  assert.equal(canonicalGifId('desenvolvimento-arnold-metade'), 'desenvolvimento-arnold-metade')
  assert.notEqual(LOCAL_EXERCISE_GIFS['desenvolvimento'], LOCAL_EXERCISE_GIFS['desenvolvimento-arnold'])
  assert.notEqual(LOCAL_EXERCISE_GIFS['desenvolvimento'], LOCAL_EXERCISE_GIFS['elevacao-lateral'])
  assert.notEqual(LOCAL_EXERCISE_GIFS['elevacao-lateral'], LOCAL_EXERCISE_GIFS['elevacao-frontal-halteres'])
  const visible = ombrosExerciseDefs.filter((ex) => !ex.hiddenFromLibrary)
  const withOwnGif = visible.filter((ex) => LOCAL_EXERCISE_GIFS[ex.id])
  assert.ok(withOwnGif.length >= 50, `expected >= 50 unique ombros GIFs, got ${withOwnGif.length}`)
  const gifPaths = withOwnGif.map((ex) => LOCAL_EXERCISE_GIFS[ex.id])
  assert.equal(new Set(gifPaths).size, gifPaths.length)
  assert.match(ombrosExerciseDefs.find((ex) => ex.id === 'desenvolvimento').name, /banco/i)
  assert.match(ombrosExerciseDefs.find((ex) => ex.id === 'elevacao-lateral').name, /lateral de braços/i)
  assert.equal(ombrosExerciseDefs.find((ex) => ex.id === 'desenvolvimento-banco-halteres').hiddenFromLibrary, true)
  assert.equal(ombrosExerciseDefs.find((ex) => ex.id === 'desenvolvimento-arnold-completo').hiddenFromLibrary, true)
})

test('ombros roles stay distinct so a push/shoulders day does not stack presses', () => {
  assert.equal(inferMovementRole({ category: 'Ombros', name: 'Desenvolvimento militar com barra' }), 'shoulder_press')
  assert.equal(inferMovementRole({ category: 'Ombros', name: 'Elevação lateral de braços com halteres' }), 'shoulder_lateral')
  assert.equal(
    inferMovementRole({ category: 'Ombros', name: 'Elevação frontal com halteres' }),
    'shoulder_front',
  )
  assert.equal(
    inferMovementRole({ category: 'Ombros', name: 'Crucifixo inverso unilateral com cabo' }),
    'shoulder_rear',
  )

  const { selected } = pickExercisesForDay(
    { name: 'Empurrar A', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    {
      level: 'Intermediário',
      equipment: ['Academia completa'],
      restrictions: [],
      maxExercises: 7,
      location: 'Academia',
      minutesPerWorkout: 55,
    },
  )
  const ombrosRoles = selected
    .filter((ex) => (ex.category || ex.muscleGroup) === 'Ombros')
    .map((ex) => inferMovementRole(ex))
  assert.ok(ombrosRoles.length >= 1, 'push day should include at least one shoulder move')
  assert.equal(new Set(ombrosRoles).size, ombrosRoles.length)
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

test('library merge drops supabase extras in groups the local catalog already covers', () => {
  const local = [
    {
      id: 'desenvolvimento',
      name: 'Desenvolvimento de ombro no banco com halteres',
      category: 'Ombros',
      gif: '/media/exercises/gifs/desenvolvimento.gif',
      hasVerifiedMedia: true,
    },
    {
      id: 'elevacao-lateral',
      name: 'Elevação lateral de braços com halteres',
      category: 'Ombros',
      gif: '/media/exercises/gifs/elevacao-lateral.gif',
      hasVerifiedMedia: true,
    },
  ]
  const remote = [
    {
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      name: 'Desenvolvimento com halteres',
      category: 'Ombros',
      gif: 'https://static.exercisedb.dev/media/znQUdHY.gif',
      mediaUrl: 'https://static.exercisedb.dev/media/znQUdHY.gif',
    },
    {
      id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
      name: 'Shoulder press machine',
      category: 'Ombros',
      gif: 'https://static.exercisedb.dev/media/znQUdHY.gif',
      mediaUrl: 'https://static.exercisedb.dev/media/znQUdHY.gif',
    },
  ]
  const merged = mergeLocalAndRemoteExercises(local, remote)
  assert.equal(merged.length, 2)
  assert.deepEqual(
    merged.map((ex) => ex.id).sort(),
    ['desenvolvimento', 'elevacao-lateral'],
  )
})

test('library keeps the visible card when a hidden duplicate shares the name', () => {
  const kept = dedupeExerciseList([
    { id: 'afundo', name: 'Afundo com halteres', hiddenFromLibrary: true, gif: '/x.png' },
    { id: 'afundo-halteres', name: 'Afundo com halteres', hiddenFromLibrary: false, gif: '/y.png' },
  ])
  assert.equal(kept.map((ex) => ex.id).sort().join(','), 'afundo,afundo-halteres')
})

test('library hides a second card that reuses the same gif', () => {
  const list = collapseSharedLibraryMedia([
    { id: 'a', name: 'Press A', gif: '/media/exercises/gifs/desenvolvimento.gif' },
    { id: 'b', name: 'Press B', gif: '/media/exercises/gifs/desenvolvimento.gif' },
    { id: 'c', name: 'Lateral', gif: '/media/exercises/gifs/elevacao-lateral.gif' },
  ])
  assert.equal(list.map((ex) => ex.id).join(','), 'a,c')
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
