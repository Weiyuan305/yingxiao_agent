export type Region = 'HK' | 'UK' | 'SG' | string

export type TrustLevel =
  | 'official'
  | 'school'
  | 'expert'
  | 'news-discovery'
  | 'social'
  | 'manual'
  | 'demo'
  | 'unknown'
  | string

export interface SourceStatus {
  id: string
  name: string
  type: string
  region?: Region
  url?: string
  sourceTypeLabel?: string
  trustLevel?: TrustLevel
  ok?: boolean
  skipped?: boolean
  itemCount?: number
  message?: string
  fetchedAt?: string
}

export interface CollectedMeta {
  mode?: string
  startedAt?: string
  finishedAt?: string
  minScore?: number
  sourceCount?: number
  successfulSourceCount?: number
  skippedSourceCount?: number
  failedSourceCount?: number
  rawItemCount?: number
  itemCount?: number
}

export interface SourceItem {
  id: string
  sourceId: string
  sourceName: string
  sourceType: string
  sourceTypeLabel: string
  region: Region
  topics: string[]
  trustLevel: TrustLevel
  title: string
  url: string
  canonicalUrl?: string
  publishedAt?: string
  fetchedAt?: string
  summary?: string
  rawText?: string
  imageUrl?: string
  imageOrigin?: string
  imageLicenseStatus?: string
  canPublishImage?: boolean
  publisher?: string
  relevanceScore?: number
  hash?: string
  marketingScore?: MarketingProfile
  contentAngle?: string
  privateMessageCta?: string
  riskNotes?: string[]
  recommendationTier?: string
  isDailyRecommendation?: boolean
  recommendationRank?: number
}

export interface CollectedPayload {
  meta?: CollectedMeta
  sources?: SourceStatus[]
  items: SourceItem[]
}

export interface MarketingDimensions {
  policyImpact: number
  heat: number
  urgency: number
  saveValue: number
  credibility: number
}

export interface MarketingProfile {
  total: number
  level: '今日必写' | '可写' | '备选'
  regionLabel: string
  dimensions: MarketingDimensions
  reasons: string[]
  contentAngle: string
  privateMessageCta: string
  riskNotes: string[]
}

export interface GeneratedDraft {
  summary: string
  impact: string[]
  checks: string[]
  tags: string[]
  draftTitle: string
  draftBody: string
  coverText: string
}

export interface LlmState {
  enabled: boolean
  apiKey?: string
  provider: string
  baseUrl: string
  chatCompletionsUrl: string
  model: string
}

export interface AgentOptions {
  input?: string
  output?: string
  memoryPath?: string
  apiKey?: string
  model?: string
  disableLlm?: boolean
  disableMemory?: boolean
  limit?: number
  minDisplayScore?: number
  perSourceLimit?: number
  dailyRecommendationMin?: number
  dailyRecommendationMax?: number
  backupLimit?: number
  llmConcurrency?: number
}

export interface AgentStepTrace {
  id: 'observe' | 'ingest' | 'score' | 'plan' | 'recommend' | 'generate' | 'review' | 'remember' | 'package'
  label: string
  status: 'ok' | 'warning' | 'failed'
  startedAt: string
  finishedAt: string
  itemCount: number
  message: string
}

export interface AgentGoal {
  id: string
  label: string
  objective: string
  successCriteria: string[]
  constraints: string[]
}

export interface AgentObservation {
  id: string
  label: string
  value: string
  severity: 'info' | 'warning' | 'critical'
}

export interface AgentPlanItem {
  id: string
  label: string
  tool: string
  reason: string
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed'
}

export interface AgentToolTrace {
  id: string
  tool: string
  label: string
  status: 'ok' | 'warning' | 'failed'
  startedAt: string
  finishedAt: string
  input: string
  output: string
}

export interface AgentDecision {
  id: string
  label: string
  rationale: string
  evidence: string[]
  action: string
}

export interface AgentMemorySnapshot {
  loaded: boolean
  updatedAt?: string
  recentTopicIds: string[]
  recentTopicSignatures: string[]
  learnings: string[]
  warning?: string
}

export interface AgentNextAction {
  label: string
  owner: 'agent' | 'operator' | 'team'
  priority: 'P0' | 'P1' | 'P2'
  reason: string
}

export interface FrontendItem {
  id: string
  region: Region
  regionLabel: string
  title: string
  source: string
  sourceUrl: string
  sourceType: string
  sourceId: string
  sourceTrustLevel: TrustLevel
  mediaStatus: string
  imageUrl: string
  imageOrigin: string
  imageLicenseStatus: string
  canPublishImage: boolean
  coverTheme: string
  time: string
  publishedAt: string
  fetchedAt: string
  score: number
  marketingScore: MarketingProfile
  recommendationTier: string
  isDailyRecommendation: boolean
  recommendationRank: number
  contentAngle: string
  privateMessageCta: string
  riskNotes: string[]
  credibility: number
  status: '待核验' | '可发布'
  summary: string
  impact: string[]
  checks: string[]
  tags: string[]
  draftTitle: string
  draftBody: string
  coverText: string
}

export interface BackupItem {
  id: string
  region: Region
  regionLabel: string
  title: string
  source: string
  sourceUrl: string
  sourceType: string
  sourceTrustLevel: TrustLevel
  publishedAt: string
  fetchedAt: string
  time: string
  score: number
  marketingScore: MarketingProfile
  recommendationTier: 'backup'
  backupRank: number
  contentAngle: string
  privateMessageCta: string
  reason: string
}

export interface IntelligencePayload {
  meta: {
    mode: 'agent-pipeline'
    generatedAt: string
    collectedAt: string
    sourceCount: number
    successfulSourceCount: number
    skippedSourceCount: number
    failedSourceCount: number
    rawItemCount: number
    itemCount: number
    dailyRecommendationCount: number
    backupItemCount: number
    minDisplayScore: number
    agent: {
      name: string
      version: string
      strategy: string
      goal?: AgentGoal
      observations?: AgentObservation[]
      plan?: AgentPlanItem[]
      steps: AgentStepTrace[]
      tools?: AgentToolTrace[]
      decisions?: AgentDecision[]
      memory?: AgentMemorySnapshot
      nextActions?: AgentNextAction[]
    }
    llm: {
      enabled: boolean
      provider: string
      model: string
      mode: 'api' | 'rules-fallback'
      errorCount: number
      fallbackCount: number
      errors: Array<{ id: string; message: string }>
    }
  }
  sources: SourceStatus[]
  backupItems: BackupItem[]
  items: FrontendItem[]
}
