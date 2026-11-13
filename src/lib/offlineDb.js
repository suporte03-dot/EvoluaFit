const DB_NAME = 'evoluafit-offline'
const DB_VERSION = 1

let dbPromise = null

function openDatabase() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB indisponível neste navegador.'))
  }
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      dbPromise = null
      reject(request.error || new Error('Não foi possível abrir o banco offline.'))
    }

    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains('sync_queue')) {
        const queue = db.createObjectStore('sync_queue', { keyPath: 'id' })
        queue.createIndex('userId', 'userId', { unique: false })
        queue.createIndex('status', 'status', { unique: false })
        queue.createIndex('createdAt', 'createdAt', { unique: false })
        queue.createIndex('entity', 'entity', { unique: false })
        queue.createIndex('clientId', 'clientId', { unique: false })
      }

      if (!db.objectStoreNames.contains('workout_drafts')) {
        const drafts = db.createObjectStore('workout_drafts', { keyPath: 'id' })
        drafts.createIndex('userId', 'userId', { unique: false })
        drafts.createIndex('sessionClientId', 'sessionClientId', { unique: false })
      }
    }
  })

  return dbPromise
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Falha no IndexedDB.'))
  })
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('Falha na transação IndexedDB.'))
    tx.onabort = () => reject(tx.error || new Error('Transação IndexedDB abortada.'))
  })
}

export async function idbPut(storeName, value) {
  const db = await openDatabase()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).put(value)
  await txDone(tx)
  return value
}

export async function idbGet(storeName, key) {
  const db = await openDatabase()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).get(key))
}

export async function idbDelete(storeName, key) {
  const db = await openDatabase()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).delete(key)
  await txDone(tx)
}

export async function idbGetAllByIndex(storeName, indexName, query) {
  const db = await openDatabase()
  const tx = db.transaction(storeName, 'readonly')
  const index = tx.objectStore(storeName).index(indexName)
  return requestToPromise(index.getAll(query))
}

export async function idbGetAll(storeName) {
  const db = await openDatabase()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).getAll())
}

export { DB_NAME, DB_VERSION }
