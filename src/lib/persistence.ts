import { openDB } from 'idb'
import type { Clip } from '../types'

interface PersistedSession {
  id: 'current'
  audioBlob: Blob
  audioFileName: string
  clips: Clip[]
}

function getDB() {
  return openDB('woodshed', 1, {
    upgrade(db) {
      db.createObjectStore('session', { keyPath: 'id' })
    },
  })
}

export async function saveSession(
  audioBlob: Blob,
  audioFileName: string,
  clips: Clip[]
): Promise<void> {
  const db = await getDB()
  await db.put('session', { id: 'current', audioBlob, audioFileName, clips })
}

export async function loadSession(): Promise<PersistedSession | undefined> {
  const db = await getDB()
  return db.get('session', 'current')
}

export async function clearSession(): Promise<void> {
  const db = await getDB()
  await db.delete('session', 'current')
}
