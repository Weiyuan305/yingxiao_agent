import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  createDraftFromSource,
  evaluateTransition,
  fillSeedGaps,
  makeEvent,
  type ClientSyncRecord,
  type DraftListFilter,
  type DraftRepository,
  type SourceLike
} from './repository.mjs'
import type { Draft, DraftEvent, DraftStatus, StoreData } from './types.mjs'

const STORE_VERSION = 1
const MAX_EVENTS = 4000

function emptyStore(): StoreData {
  return { version: STORE_VERSION, drafts: {}, events: [] }
}

// 浅合并 patch，已知嵌套对象（verification/publish/metrics）做子合并，其余整体替换。
function mergeDraft(existing: Draft, patch: Partial<Draft>): Draft {
  const next: Draft = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  if (patch.verification) next.verification = { ...existing.verification, ...patch.verification }
  if (patch.publish) next.publish = { ...existing.publish, ...patch.publish }
  if (patch.metrics) next.metrics = { ...existing.metrics, ...patch.metrics }
  if (patch.tags) next.tags = patch.tags.map(String)
  // 状态不允许通过 patch 改，必须走 transition
  next.status = existing.status
  next.statusUpdatedAt = existing.statusUpdatedAt
  next.id = existing.id
  next.createdAt = existing.createdAt
  return next
}

export class JsonDraftRepository implements DraftRepository {
  private readonly filePath: string
  private data: StoreData = emptyStore()
  private loaded = false
  private writeChain: Promise<void> = Promise.resolve()

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<StoreData>
      this.data = {
        version: STORE_VERSION,
        drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {},
        events: Array.isArray(parsed.events) ? parsed.events : []
      }
    } catch {
      this.data = emptyStore()
    }
    this.loaded = true
  }

  // 串行化的原子写：写临时文件再 rename，避免并发损坏。
  private persist(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      await mkdir(path.dirname(this.filePath), { recursive: true })
      const tmp = `${this.filePath}.tmp`
      await writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf8')
      await rename(tmp, this.filePath)
    }).catch(error => {
      console.error(`store persist failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    return this.writeChain
  }

  private addEvent(event: DraftEvent): void {
    this.data.events.push(event)
    if (this.data.events.length > MAX_EVENTS) {
      this.data.events = this.data.events.slice(-MAX_EVENTS)
    }
  }

  async list(filter: DraftListFilter = {}): Promise<Draft[]> {
    await this.ensureLoaded()
    let drafts = Object.values(this.data.drafts)
    if (filter.status) drafts = drafts.filter(draft => draft.status === filter.status)
    return drafts.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  }

  async get(id: string): Promise<Draft | null> {
    await this.ensureLoaded()
    return this.data.drafts[id] || null
  }

  async patch(id: string, patch: Partial<Draft>): Promise<Draft | null> {
    await this.ensureLoaded()
    const existing = this.data.drafts[id]
    if (!existing) return null
    const next = mergeDraft(existing, patch)
    this.data.drafts[id] = next
    this.addEvent(makeEvent(id, 'edit', { keys: Object.keys(patch) }))
    await this.persist()
    return next
  }

  async transition(id: string, to: DraftStatus): Promise<{ ok: boolean; draft?: Draft; reason?: string }> {
    await this.ensureLoaded()
    const existing = this.data.drafts[id]
    if (!existing) return { ok: false, reason: '草稿不存在' }
    const verdict = evaluateTransition(existing, to)
    if (!verdict.ok) return { ok: false, reason: verdict.reason || '不允许的状态流转' }
    const now = new Date().toISOString()
    const next: Draft = { ...existing, status: to, statusUpdatedAt: now, updatedAt: now }
    this.data.drafts[id] = next
    this.addEvent(makeEvent(id, 'transition', { from: existing.status, to }))
    await this.persist()
    return { ok: true, draft: next }
  }

  async events(id: string): Promise<DraftEvent[]> {
    await this.ensureLoaded()
    return this.data.events.filter(event => event.draftId === id)
  }

  async seedFromSources(items: SourceLike[]): Promise<number> {
    await this.ensureLoaded()
    let created = 0
    for (const item of items) {
      const id = typeof item.id === 'string' ? item.id : ''
      if (!id) continue
      const existing = this.data.drafts[id]
      if (existing) {
        this.data.drafts[id] = fillSeedGaps(existing, item)
      } else {
        const draft = createDraftFromSource(item)
        this.data.drafts[id] = draft
        this.addEvent(makeEvent(id, 'seed', { status: draft.status }))
        created += 1
      }
    }
    await this.persist()
    return created
  }

  async syncFromClient(records: ClientSyncRecord[]): Promise<number> {
    await this.ensureLoaded()
    let merged = 0
    for (const record of records) {
      const existing = this.data.drafts[record.id]
      if (!existing) continue
      const patch: Partial<Draft> = {}
      if (record.draftTitle) patch.draftTitle = record.draftTitle
      if (record.draftBody) patch.draftBody = record.draftBody
      if (record.coverText) patch.coverText = record.coverText
      if (record.privateMessageCta) patch.privateMessageCta = record.privateMessageCta
      if (Array.isArray(record.tags) && record.tags.length) patch.tags = record.tags
      if (record.verification) patch.verification = { ...existing.verification, ...record.verification }
      if (record.publish) patch.publish = { ...existing.publish, ...record.publish }
      if (record.metrics) patch.metrics = { ...existing.metrics, ...record.metrics }
      if (Object.keys(patch).length) {
        this.data.drafts[record.id] = mergeDraft(existing, patch)
        merged += 1
      }
    }
    if (merged) {
      this.addEvent(makeEvent('*', 'edit', { sync: merged }))
      await this.persist()
    }
    return merged
  }
}
