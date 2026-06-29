import {
  DRAFT_STATUSES,
  DRAFT_STATUS_LABELS,
  type Draft,
  type DraftEvent,
  type DraftStatus
} from './types.mjs'

export interface TransitionResult {
  ok: boolean
  reason?: string
}

export function statusIndex(status: DraftStatus): number {
  return DRAFT_STATUSES.indexOf(status)
}

/**
 * 状态机规则：只能前进一步；可后退到任意更早状态（"退回重写"）。
 */
export function canTransition(from: DraftStatus, to: DraftStatus): boolean {
  if (from === to) return false
  const fromIndex = statusIndex(from)
  const toIndex = statusIndex(to)
  if (fromIndex < 0 || toIndex < 0) return false
  if (toIndex < fromIndex) return true
  return toIndex === fromIndex + 1
}

/**
 * 「可发布」闸门：质检未过 / 有数字未核验 → 拒绝进入 ready。
 * 这是 "无法核验的内容不能直接进入可发布" 的落地点。
 */
export function readyGate(draft: Draft): TransitionResult {
  if (!draft.quality || !draft.quality.passed) {
    return { ok: false, reason: '质检未通过（有合规红线或尚未质检）' }
  }
  if (draft.factCheck && !draft.factCheck.ok) {
    return { ok: false, reason: `有 ${draft.factCheck.flagged.length} 处数字未在来源中核验` }
  }
  return { ok: true }
}

export function evaluateTransition(draft: Draft, to: DraftStatus): TransitionResult {
  if (!DRAFT_STATUSES.includes(to)) return { ok: false, reason: '未知目标状态' }
  if (!canTransition(draft.status, to)) {
    return {
      ok: false,
      reason: `不能从「${DRAFT_STATUS_LABELS[draft.status]}」直接到「${DRAFT_STATUS_LABELS[to]}」`
    }
  }
  if (to === 'ready') return readyGate(draft)
  return { ok: true }
}

// 来源条目（intelligence.json item）建档时用的宽松输入。
export interface SourceLike {
  id?: string
  sourceId?: string
  region?: string
  regionLabel?: string
  title?: string
  source?: string
  sourceUrl?: string
  sourceType?: string
  sourceTrustLevel?: string
  draftTitle?: string
  draftBody?: string
  coverText?: string
  tags?: string[]
  privateMessageCta?: string
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function createDraftFromSource(item: SourceLike, now = new Date().toISOString()): Draft {
  const hasContent = Boolean(str(item.draftBody) || str(item.draftTitle))
  return {
    id: str(item.id) || `draft-${Date.now()}`,
    sourceId: str(item.sourceId) || str(item.id),
    region: str(item.region, 'UK'),
    regionLabel: str(item.regionLabel),
    sourceTitle: str(item.title),
    sourceName: str(item.source),
    sourceUrl: str(item.sourceUrl),
    sourceType: str(item.sourceType),
    sourceTrustLevel: str(item.sourceTrustLevel, 'unknown'),
    draftTitle: str(item.draftTitle),
    draftBody: str(item.draftBody),
    coverText: str(item.coverText),
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    privateMessageCta: str(item.privateMessageCta),
    coverStyle: 'source',
    status: hasContent ? 'to_qc' : 'to_generate',
    statusUpdatedAt: now,
    quality: null,
    factCheck: null,
    assignee: '',
    reviewNote: '',
    publish: { channel: '小红书', time: '', status: '待复制', reminder: '发布前 30 分钟' },
    metrics: { views: '', saves: '', comments: '', dms: '', notes: '' },
    verification: { cover: false, source: false, facts: false, risk: false },
    createdAt: now,
    updatedAt: now
  }
}

/**
 * 已存在的 draft 只补空字段、不覆盖用户编辑/状态/质检结果。
 */
export function fillSeedGaps(existing: Draft, item: SourceLike): Draft {
  const next = { ...existing }
  if (!next.sourceTitle) next.sourceTitle = str(item.title)
  if (!next.sourceName) next.sourceName = str(item.source)
  if (!next.sourceUrl) next.sourceUrl = str(item.sourceUrl)
  if (!next.sourceType) next.sourceType = str(item.sourceType)
  if (!next.regionLabel) next.regionLabel = str(item.regionLabel)
  return next
}

export function makeEvent(draftId: string, type: DraftEvent['type'], payload: unknown): DraftEvent {
  return {
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    draftId,
    type,
    payload,
    at: new Date().toISOString()
  }
}

export interface DraftListFilter {
  status?: DraftStatus
}

export interface DraftRepository {
  list(filter?: DraftListFilter): Promise<Draft[]>
  get(id: string): Promise<Draft | null>
  patch(id: string, patch: Partial<Draft>): Promise<Draft | null>
  transition(id: string, to: DraftStatus): Promise<{ ok: boolean; draft?: Draft; reason?: string }>
  events(id: string): Promise<DraftEvent[]>
  seedFromSources(items: SourceLike[]): Promise<number>
  syncFromClient(records: ClientSyncRecord[]): Promise<number>
}

// 前端 localStorage 一次性迁移用的记录。
export interface ClientSyncRecord {
  id: string
  draftTitle?: string
  draftBody?: string
  coverText?: string
  privateMessageCta?: string
  tags?: string[]
  verification?: Partial<Draft['verification']>
  publish?: Partial<Draft['publish']>
  metrics?: Partial<Draft['metrics']>
}
