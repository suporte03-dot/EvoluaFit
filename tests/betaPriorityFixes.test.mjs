import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  appendLibraryExercise,
  buildLibraryExerciseEntry,
  findActiveWorkoutForPlanDay,
  listEligibleAddTargets,
  removeLibraryAppend,
  syncPlanDayExercises,
  targetLabel,
} from '../src/utils/libraryAdd.js'
import { adjustForTime } from '../src/utils/dayAdjust.js'
import { displayWorkoutName } from '../src/utils/workoutLabels.js'
import { workoutDisplayMinutes } from '../src/utils/workoutDuration.js'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../src/utils/progressStorage.js'

function installMemoryLocalStorage() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
  return store
}

const pushA = {
  id: 'w-push',
  name: 'Push A',
  status: 'Pendente',
  planId: 'plan-1',
  dayNumber: 1,
  date: new Date().toISOString().slice(0, 10),
  exercises: [
    { exerciseId: 'ex-1', name: 'Supino', sets: 3, reps: '8-10', restSeconds: 90 },
    { exerciseId: 'ex-2', name: 'Desenvolvimento', sets: 3, reps: '8-10', restSeconds: 90 },
  ],
}

const extra = {
  id: 'w-extra',
  name: 'Extra peito',
  status: 'Pendente',
  date: '2099-01-01',
  exercises: [{ exerciseId: 'ex-x', name: 'Crucifixo', sets: 3, reps: '12', restSeconds: 60 }],
}

describe('library add destination and undo', () => {
  test('lista prioriza treino de hoje da rotina ativa, não o primeiro Pendente solto', () => {
    const targets = listEligibleAddTargets([extra, pushA], {
      generatedPlan: { id: 'plan-1' },
      plans: [{ id: 'plan-1' }],
    })
    assert.equal(targets[0].id, 'w-push')
    assert.equal(targetLabel(targets[0]), 'Empurrar A')
  })

  test('toast/UI usam o mesmo nome exibido', () => {
    assert.equal(displayWorkoutName('Push A'), 'Empurrar A')
    assert.equal(targetLabel(pushA), 'Empurrar A')
  })

  test('desfazer remove só a inclusão com libraryAppendId', () => {
    const entry = buildLibraryExerciseEntry(
      { id: 'supino', name: 'Supino reto com barra', category: 'Peito', sets: '3', reps: '8-10', rest: '90' },
      { appendId: 'lib-add-test-1' },
    )
    const withDupName = appendLibraryExercise(pushA, {
      exerciseId: 'supino',
      name: 'Supino reto com barra',
      muscleGroup: 'Peito',
      sets: 3,
      reps: '8-10',
      restSeconds: 90,
    })
    const withAppend = appendLibraryExercise(withDupName, entry)
    assert.equal(withAppend.exercises.length, 4)

    const undone = removeLibraryAppend(withAppend, 'lib-add-test-1')
    assert.equal(undone.removed, true)
    assert.equal(undone.workout.exercises.length, 3)
    assert.ok(undone.workout.exercises.some((ex) => ex.name === 'Supino reto com barra'))
    assert.ok(!undone.workout.exercises.some((ex) => ex.libraryAppendId === 'lib-add-test-1'))
  })

  test('sincroniza plano gerado com a rotina ativa após inclusão', () => {
    const entry = buildLibraryExerciseEntry(
      { id: 'supino', name: 'Supino reto com barra', category: 'Peito', sets: '3', reps: '10', rest: '60' },
      { appendId: 'lib-add-sync' },
    )
    const updated = appendLibraryExercise(pushA, entry)
    const plans = syncPlanDayExercises(
      [
        {
          id: 'plan-1',
          weeklyPlan: [
            {
              day: 1,
              workoutName: 'Push A',
              exercises: pushA.exercises,
            },
          ],
        },
      ],
      updated,
    )
    assert.equal(plans[0].weeklyPlan[0].exercises.length, 3)
    assert.equal(plans[0].weeklyPlan[0].exercises.at(-1).libraryAppendId, 'lib-add-sync')
  })
})

describe('Meus treinos vs Monte seu treino source', () => {
  test('findActiveWorkoutForPlanDay devolve a cópia salva da rotina', () => {
    const day = { day: 1, workoutName: 'Push A', exercises: [{ name: 'Só no plano' }] }
    const found = findActiveWorkoutForPlanDay([pushA], { id: 'plan-1' }, day)
    assert.equal(found.id, 'w-push')
    assert.equal(found.exercises.length, 2)
    assert.equal(workoutDisplayMinutes(found), workoutDisplayMinutes(pushA))
  })
})

describe('tempo disponível', () => {
  test('prévia expõe minutos e fits sem alterar estimatedMinutes do plano', () => {
    const long = {
      ...pushA,
      estimatedMinutes: 64,
      exercises: [
        ...pushA.exercises,
        { name: 'Tríceps', sets: 3, reps: '10-12', restSeconds: 60, kind: 'isolado' },
        { name: 'Elevação', sets: 3, reps: '12-15', restSeconds: 45, kind: 'isolado' },
        { name: 'Panturrilha', sets: 3, reps: '12-15', restSeconds: 45, kind: 'panturrilha' },
      ],
    }
    const fit = adjustForTime(long, 30)
    assert.equal(fit.target, 30)
    assert.ok(fit.minutes > 0)
    assert.equal(fit.workout.estimatedMinutes, 64)
    assert.equal(fit.workout.sessionTimeTarget, 30)
    assert.equal(fit.workout.sessionMinutes, fit.minutes)
    assert.equal(typeof fit.fits, 'boolean')
    assert.match(fit.summary, /min/)
  })

  test('tempo normal restaura exercícios originais da sessão', () => {
    const base = {
      ...pushA,
      sessionOriginalExercises: pushA.exercises,
      exercises: [pushA.exercises[0]],
      sessionTimeTarget: 20,
    }
    const normal = adjustForTime(base, null)
    assert.equal(normal.target, null)
    assert.equal(normal.workout.exercises.length, 2)
    assert.equal(normal.fits, true)
  })
})

describe('retomada de sessão', () => {
  test('save/load ActiveSession preserva séries sem duplicar no reload', () => {
    installMemoryLocalStorage()
    clearActiveSession()
    const draft = {
      workoutId: 'w-push',
      workoutName: 'Push A',
      currentExerciseIndex: 1,
      sessionExercises: [
        {
          exerciseId: 'ex-1',
          name: 'Supino',
          completedSets: 2,
          setsLog: [
            { setNumber: 1, reps: 10, weight: 40, completed: true },
            { setNumber: 2, reps: 8, weight: 40, completed: true },
          ],
        },
      ],
      savedAt: new Date().toISOString(),
    }
    saveActiveSession(draft)
    const loaded = loadActiveSession()
    assert.equal(loaded.workoutId, 'w-push')
    assert.equal(loaded.sessionExercises[0].completedSets, 2)
    assert.equal(loaded.sessionExercises[0].setsLog.length, 2)
    saveActiveSession({ ...loaded, currentExerciseIndex: 1 })
    const again = loadActiveSession()
    assert.equal(again.sessionExercises[0].setsLog.length, 2)
    clearActiveSession()
    assert.equal(loadActiveSession(), null)
  })
})
