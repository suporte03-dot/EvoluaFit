import { idbDelete, idbGet, idbGetAllByIndex, idbPut } from '../lib/offlineDb'
import {
  cancelWorkoutSession,
  completeWorkoutSession,
  deleteWorkoutSessionByClientId,
  getWorkoutSessionByClientId,
  upsertWorkoutSession,
} from './workoutSessionService'
import {
  deleteWorkoutSetByClientId,
  getWorkoutSetByClientId,
  upsertWorkoutSet,
} from './workoutSetService'

const QUEUE_STORE = 'sync_queue'
const DRAFT_STORE = 'workout_drafts'
const MAX_ATTEMPTS = 4

let syncLock = false

export const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000]

export function notifyQueueChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('evoluafit-queue-changed'))
  }
}

function newId() {
  return crypto.randomUUID()
}

function nowIso() {
  return new Date().toISOString()
}

function draftRecordId(userId, sessionClientId) {
  return `${userId}:${sessionClientId}`
}

function syncRank(op) {
  if (op.entity === 'workout_session' && op.action === 'insert') return 1
  if (op.entity === 'workout_session' && op.action === 'update') return 2
  if (op.entity === 'workout_set' && (op.action === 'insert' || op.action === 'update')) return 3
  if (op.entity === 'workout_session' && (op.action === 'complete' || op.action === 'cancel')) {
    return 4
  }
  if (op.action === 'delete') return 5
  return 9
}

function isNetworkLikeError(error) {
  if (!error) return false
  const msg = String(error.message || error)
  return /Failed to fetch|NetworkError|network|offline|fetch|timeout|ECONN|ERR_/i.test(msg)
}

export async function enqueueOperation(operation) {
  if (!operation?.userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const clientId = operation.clientId || newId()
  const existing = await listPendingOperations(operation.userId)
  const match = existing.find(
    (op) =>
      op.entity === operation.entity &&
      op.clientId === clientId &&
      op.action === operation.action &&
      (op.status === 'pending' || op.status === 'failed' || op.status === 'syncing'),
  )

  if (match) {
    const updated = {
      ...match,
      payload: { ...match.payload, ...operation.payload },
      parentClientId: operation.parentClientId ?? match.parentClientId ?? null,
      updatedAt: nowIso(),
      status: match.status === 'syncing' ? 'syncing' : 'pending',
      lastError: null,
    }
    await idbPut(QUEUE_STORE, updated)
    notifyQueueChanged()
    return { data: updated, error: null }
  }

  const row = {
    id: operation.id || newId(),
    userId: operation.userId,
    entity: operation.entity,
    action: operation.action,
    clientId,
    parentClientId: operation.parentClientId || null,
    payload: operation.payload || {},
    createdAt: operation.createdAt || nowIso(),
    updatedAt: nowIso(),
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
    status: 'pending',
  }

  await idbPut(QUEUE_STORE, row)
  notifyQueueChanged()
  return { data: row, error: null }
}

export async function listPendingOperations(userId) {
  if (!userId) return []
  const rows = await idbGetAllByIndex(QUEUE_STORE, 'userId', userId)
  return (rows || []).filter((op) => op.status === 'pending' || op.status === 'failed' || op.status === 'syncing')
}

export async function listQueueOperations(userId) {
  if (!userId) return []
  return (await idbGetAllByIndex(QUEUE_STORE, 'userId', userId)) || []
}

export async function markOperationSyncing(operationId) {
  const row = await idbGet(QUEUE_STORE, operationId)
  if (!row) return { data: null, error: { message: 'Operação não encontrada.' } }
  const updated = {
    ...row,
    status: 'syncing',
    lastAttemptAt: nowIso(),
    updatedAt: nowIso(),
  }
  await idbPut(QUEUE_STORE, updated)
  notifyQueueChanged()
  return { data: updated, error: null }
}

export async function markOperationFailed(operationId, error) {
  const row = await idbGet(QUEUE_STORE, operationId)
  if (!row) return { data: null, error: { message: 'Operação não encontrada.' } }
  const attempts = (row.attempts || 0) + 1
  const updated = {
    ...row,
    attempts,
    lastAttemptAt: nowIso(),
    updatedAt: nowIso(),
    lastError: error?.message || String(error || 'Falha ao sincronizar.'),
    status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
  }
  await idbPut(QUEUE_STORE, updated)
  notifyQueueChanged()
  return { data: updated, error: null }
}

export async function removeOperation(operationId) {
  await idbDelete(QUEUE_STORE, operationId)
  notifyQueueChanged()
  return { data: true, error: null }
}

export async function getPendingCount(userId) {
  if (!userId) return 0
  const rows = await listPendingOperations(userId)
  return rows.filter((op) => op.status === 'pending' || op.status === 'failed').length
}

export async function resetFailedForRetry(userId) {
  if (!userId) return
  const rows = await listPendingOperations(userId)
  for (const row of rows) {
    if (row.status === 'failed' || row.status === 'syncing') {
      await idbPut(QUEUE_STORE, {
        ...row,
        status: 'pending',
        updatedAt: nowIso(),
        lastError: null,
      })
    }
  }
  notifyQueueChanged()
}

export async function saveWorkoutDraft(userId, sessionClientId, data) {
  if (!userId || !sessionClientId) {
    return { data: null, error: { message: 'Rascunho inválido.' } }
  }
  const row = {
    id: draftRecordId(userId, sessionClientId),
    userId,
    sessionClientId,
    data: data || {},
    updatedAt: nowIso(),
  }
  await idbPut(DRAFT_STORE, row)
  return { data: row, error: null }
}

export async function getWorkoutDraft(userId, sessionClientId) {
  if (!userId || !sessionClientId) return { data: null, error: null }
  const row = await idbGet(DRAFT_STORE, draftRecordId(userId, sessionClientId))
  return { data: row || null, error: null }
}

export async function listWorkoutDrafts(userId) {
  if (!userId) return []
  return (await idbGetAllByIndex(DRAFT_STORE, 'userId', userId)) || []
}

export async function deleteWorkoutDraft(userId, sessionClientId) {
  if (!userId || !sessionClientId) return { data: true, error: null }
  await idbDelete(DRAFT_STORE, draftRecordId(userId, sessionClientId))
  return { data: true, error: null }
}

async function resolveSessionRemoteId(userId, op, sessionMap) {
  if (op.payload?.session_id) return op.payload.session_id
  if (op.parentClientId && sessionMap.has(op.parentClientId)) {
    return sessionMap.get(op.parentClientId)
  }
  const parent = op.parentClientId || op.payload?.session_client_id
  if (!parent) return null
  const { data } = await getWorkoutSessionByClientId(userId, parent)
  if (data?.id) {
    sessionMap.set(parent, data.id)
    return data.id
  }
  return null
}

async function applySessionConflictGuard(userId, clientId, localUpdatedAt) {
  if (!localUpdatedAt) return { allow: true, conflict: false }
  const { data: remote } = await getWorkoutSessionByClientId(userId, clientId)
  if (!remote?.updated_at) return { allow: true, conflict: false, remote }
  if (new Date(remote.updated_at).getTime() > new Date(localUpdatedAt).getTime()) {
    return { allow: false, conflict: true, remote }
  }
  return { allow: true, conflict: false, remote }
}

async function applySetConflictGuard(sessionId, clientId, localUpdatedAt) {
  if (!localUpdatedAt || !sessionId) return { allow: true, conflict: false }
  const { data: remote } = await getWorkoutSetByClientId(sessionId, clientId)
  if (!remote?.updated_at) return { allow: true, conflict: false, remote }
  if (new Date(remote.updated_at).getTime() > new Date(localUpdatedAt).getTime()) {
    return { allow: false, conflict: true, remote }
  }
  return { allow: true, conflict: false, remote }
}

async function processOperation(userId, op, sessionMap, warnings) {
  if (op.entity === 'workout_session' && op.action === 'insert') {
    const guard = await applySessionConflictGuard(userId, op.clientId, op.payload?.updated_at)
    if (!guard.allow) {
      warnings.push('Conflito: a sessão remota é mais recente. Rascunho local preservado.')
      sessionMap.set(op.clientId, guard.remote.id)
      await removeOperation(op.id)
      return { ok: true, conflict: true }
    }
    const { data, error } = await upsertWorkoutSession(userId, {
      ...op.payload,
      client_id: op.clientId,
      status: op.payload?.status || 'in_progress',
    })
    if (error) return { ok: false, error }
    sessionMap.set(op.clientId, data.id)
    await patchDependentSessionIds(userId, op.clientId, data.id)
    await removeOperation(op.id)
    return { ok: true, data }
  }

  if (op.entity === 'workout_session' && op.action === 'update') {
    const guard = await applySessionConflictGuard(userId, op.clientId, op.payload?.updated_at)
    if (!guard.allow) {
      warnings.push('Conflito: atualização remota mais recente. Rascunho local preservado.')
      if (guard.remote?.id) sessionMap.set(op.clientId, guard.remote.id)
      await removeOperation(op.id)
      return { ok: true, conflict: true }
    }
    const { data, error } = await upsertWorkoutSession(userId, {
      ...op.payload,
      client_id: op.clientId,
    })
    if (error) return { ok: false, error }
    sessionMap.set(op.clientId, data.id)
    await patchDependentSessionIds(userId, op.clientId, data.id)
    await removeOperation(op.id)
    return { ok: true, data }
  }

  if (op.entity === 'workout_session' && (op.action === 'complete' || op.action === 'cancel')) {
    let remoteId = sessionMap.get(op.clientId) || op.payload?.id || null
    if (!remoteId) {
      const { data: existing } = await getWorkoutSessionByClientId(userId, op.clientId)
      remoteId = existing?.id || null
    }
    if (!remoteId) {
      const { data, error } = await upsertWorkoutSession(userId, {
        ...op.payload,
        client_id: op.clientId,
        status: op.action === 'complete' ? 'completed' : 'cancelled',
      })
      if (error) return { ok: false, error }
      sessionMap.set(op.clientId, data.id)
      await removeOperation(op.id)
      return { ok: true, data }
    }

    const result =
      op.action === 'complete'
        ? await completeWorkoutSession(userId, remoteId, op.payload || {})
        : await cancelWorkoutSession(userId, remoteId)

    if (result.error) return { ok: false, error: result.error }
    sessionMap.set(op.clientId, remoteId)
    await removeOperation(op.id)
    if (op.action === 'complete' || op.action === 'cancel') {
      await deleteWorkoutDraft(userId, op.clientId)
    }
    return { ok: true, data: result.data }
  }

  if (op.entity === 'workout_set' && (op.action === 'insert' || op.action === 'update')) {
    const sessionId = await resolveSessionRemoteId(userId, op, sessionMap)
    if (!sessionId) {
      return {
        ok: false,
        error: { message: 'Aguardando sincronização da sessão antes das séries.' },
        defer: true,
      }
    }

    const guard = await applySetConflictGuard(sessionId, op.clientId, op.payload?.updated_at)
    if (!guard.allow) {
      warnings.push('Conflito: série remota mais recente. Rascunho local preservado.')
      await removeOperation(op.id)
      return { ok: true, conflict: true }
    }

    const { data, error } = await upsertWorkoutSet(sessionId, {
      ...op.payload,
      client_id: op.clientId,
      session_id: sessionId,
    })
    if (error) return { ok: false, error }
    await removeOperation(op.id)
    return { ok: true, data }
  }

  if (op.entity === 'workout_set' && op.action === 'delete') {
    const sessionId = await resolveSessionRemoteId(userId, op, sessionMap)
    if (!sessionId) {
      return {
        ok: false,
        error: { message: 'Aguardando sincronização da sessão antes das séries.' },
        defer: true,
      }
    }
    const { error } = await deleteWorkoutSetByClientId(sessionId, op.clientId)
    if (error) return { ok: false, error }
    await removeOperation(op.id)
    return { ok: true }
  }

  if (op.entity === 'workout_session' && op.action === 'delete') {
    const { error } = await deleteWorkoutSessionByClientId(userId, op.clientId)
    if (error) return { ok: false, error }
    await removeOperation(op.id)
    await deleteWorkoutDraft(userId, op.clientId)
    return { ok: true }
  }

  return { ok: false, error: { message: 'Operação de sincronização desconhecida.' } }
}

async function patchDependentSessionIds(userId, sessionClientId, remoteSessionId) {
  const pending = await listPendingOperations(userId)
  for (const op of pending) {
    if (op.entity !== 'workout_set') continue
    if (op.parentClientId !== sessionClientId && op.payload?.session_client_id !== sessionClientId) {
      continue
    }
    await idbPut(QUEUE_STORE, {
      ...op,
      payload: {
        ...op.payload,
        session_id: remoteSessionId,
        session_client_id: sessionClientId,
      },
      parentClientId: sessionClientId,
      updatedAt: nowIso(),
    })
  }

  const { data: draft } = await getWorkoutDraft(userId, sessionClientId)
  if (draft?.data) {
    await saveWorkoutDraft(userId, sessionClientId, {
      ...draft.data,
      session: {
        ...(draft.data.session || {}),
        id: remoteSessionId,
        client_id: sessionClientId,
      },
    })
  }
}

export async function syncPendingOperations(userId) {
  if (!userId) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }
  if (syncLock) {
    return { data: { skipped: true }, error: null }
  }

  syncLock = true
  const warnings = []
  const sessionMap = new Map()

  try {
    const drafts = await listWorkoutDrafts(userId)
    drafts.forEach((draft) => {
      const remoteId = draft?.data?.session?.id
      if (draft.sessionClientId && remoteId) {
        sessionMap.set(draft.sessionClientId, remoteId)
      }
    })

    let ops = (await listPendingOperations(userId))
      .filter((op) => op.userId === userId && op.status !== 'syncing')
      .sort((a, b) => syncRank(a) - syncRank(b) || String(a.createdAt).localeCompare(String(b.createdAt)))

    // Reset stuck syncing from crashed tab
    const stuck = (await listPendingOperations(userId)).filter((op) => op.status === 'syncing')
    for (const row of stuck) {
      await idbPut(QUEUE_STORE, { ...row, status: 'pending', updatedAt: nowIso() })
    }
    if (stuck.length) {
      ops = (await listPendingOperations(userId))
        .filter((op) => op.userId === userId)
        .sort((a, b) => syncRank(a) - syncRank(b) || String(a.createdAt).localeCompare(String(b.createdAt)))
    }

    let synced = 0
    let failed = 0
    let deferred = 0

    for (const op of ops) {
      if (op.userId !== userId) continue
      await markOperationSyncing(op.id)
      const result = await processOperation(userId, op, sessionMap, warnings)
      if (result.ok) {
        synced += 1
        continue
      }
      if (result.defer) {
        deferred += 1
        await idbPut(QUEUE_STORE, {
          ...(await idbGet(QUEUE_STORE, op.id)),
          status: 'pending',
          updatedAt: nowIso(),
          lastError: result.error?.message || null,
        })
        continue
      }
      failed += 1
      await markOperationFailed(op.id, result.error)
      if (!isNetworkLikeError(result.error) && (result.error?.code === '42501' || /permiss/i.test(result.error?.message || ''))) {
        // permanent-ish; keep failed after attempts
      }
    }

    notifyQueueChanged()
    return {
      data: {
        synced,
        failed,
        deferred,
        pending: await getPendingCount(userId),
        warnings,
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error?.message || 'Não foi possível sincronizar as alterações.' },
    }
  } finally {
    syncLock = false
  }
}

export function isSyncInFlight() {
  return syncLock
}

export { MAX_ATTEMPTS, isNetworkLikeError }
