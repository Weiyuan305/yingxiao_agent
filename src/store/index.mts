import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JsonDraftRepository } from './json-repository.mjs'
import type { DraftRepository } from './repository.mjs'

function defaultStorePath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url)) // dist/store
  return path.join(here, '..', '..', 'data', 'store.json')
}

export function createRepository(filePath?: string): DraftRepository {
  return new JsonDraftRepository(filePath || defaultStorePath())
}

export { JsonDraftRepository }
export * from './types.mjs'
export * from './repository.mjs'
