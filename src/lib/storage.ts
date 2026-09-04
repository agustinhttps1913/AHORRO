import type { FinanceState } from '../types/finance'

const DB_NAME = 'flowmoney-local-db'
const STORE = 'app'
const KEY = 'finance-state-v2'
const LEGACY_KEY = 'flowmoney-state-v1'

function canUseIndexedDb() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function readFinanceState(): Promise<FinanceState | null> {
  if (canUseIndexedDb()) {
    try {
      const db = await openDb()
      const value = await new Promise<FinanceState | null>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const request = tx.objectStore(STORE).get(KEY)
        request.onsuccess = () => resolve((request.result as FinanceState | undefined) ?? null)
        request.onerror = () => reject(request.error)
      })
      db.close()
      if (value) return value
    } catch {
      // Fall through to localStorage.
    }
  }

  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    return raw ? (JSON.parse(raw) as FinanceState) : null
  } catch {
    return null
  }
}

export async function writeFinanceState(state: FinanceState): Promise<void> {
  if (canUseIndexedDb()) {
    try {
      const db = await openDb()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(state, KEY)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
      return
    } catch {
      // Fall through to localStorage.
    }
  }
  localStorage.setItem(LEGACY_KEY, JSON.stringify(state))
}

export async function clearFinanceState(): Promise<void> {
  if (canUseIndexedDb()) {
    try {
      const db = await openDb()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(KEY)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    } catch {
      // Ignore and also clear localStorage below.
    }
  }
  localStorage.removeItem(LEGACY_KEY)
}
