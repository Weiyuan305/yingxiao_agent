// 草稿生命周期状态。顺序即流程顺序（数组下标用于判断前进/后退）。
export const DRAFT_STATUSES = [
  'collected',    // 已采集
  'triage',       // 待选题
  'to_generate',  // 待生成
  'to_qc',        // 待质检
  'to_cover',     // 待封面
  'to_review',    // 待审核
  'ready',        // 可发布
  'published',    // 已发布
  'retro'         // 复盘待录入
] as const

export type DraftStatus = typeof DRAFT_STATUSES[number]

export const DRAFT_STATUS_LABELS: Record<DraftStatus, string> = {
  collected: '已采集',
  triage: '待选题',
  to_generate: '待生成',
  to_qc: '待质检',
  to_cover: '待封面',
  to_review: '待审核',
  ready: '可发布',
  published: '已发布',
  retro: '复盘待录入'
}

export interface DraftQuality {
  score: number
  passed: boolean
  errors: number
  warns: number
}

export interface DraftFactCheck {
  ok: boolean
  checked: number
  flagged: Array<{ value: string; kind: string }>
}

export interface DraftPublishPlan {
  channel: string
  time: string
  status: string
  reminder: string
}

export interface DraftMetrics {
  views: string
  saves: string
  comments: string
  dms: string
  notes: string
}

export interface DraftVerification {
  cover: boolean
  source: boolean
  facts: boolean
  risk: boolean
}

export interface Draft {
  id: string
  sourceId: string
  region: string
  regionLabel: string
  // 来源元信息
  sourceTitle: string
  sourceName: string
  sourceUrl: string
  sourceType: string
  sourceTrustLevel: string
  // 内容
  draftTitle: string
  draftBody: string
  coverText: string
  tags: string[]
  privateMessageCta: string
  coverStyle: string
  // 状态
  status: DraftStatus
  statusUpdatedAt: string
  // 质量 / 事实
  quality: DraftQuality | null
  factCheck: DraftFactCheck | null
  // 协作
  assignee: string
  reviewNote: string
  // 发布 / 效果 / 核验
  publish: DraftPublishPlan
  metrics: DraftMetrics
  verification: DraftVerification
  // 时间
  createdAt: string
  updatedAt: string
}

export type DraftEventType =
  | 'seed'
  | 'edit'
  | 'generate'
  | 'snapshot'
  | 'apply-variant'
  | 'transition'
  | 'review'

export interface DraftEvent {
  id: string
  draftId: string
  type: DraftEventType
  payload: unknown
  at: string
}

// store.json 的磁盘结构
export interface StoreData {
  version: number
  drafts: Record<string, Draft>
  events: DraftEvent[]
}
