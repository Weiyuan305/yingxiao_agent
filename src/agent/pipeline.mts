import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadLocalEnv } from './env.mjs'
import { generateWithLlm, getLlmState } from './llm.mjs'
import {
  buildBackupTopics,
  buildDailyRecommendations,
  buildMarketingProfile,
  getRegionLabel
} from './marketing.mjs'
import { generateWithRules } from './rules.mjs'
import { formatTime } from './text.mjs'
import type {
  AgentOptions,
  AgentStepTrace,
  BackupItem,
  CollectedPayload,
  FrontendItem,
  GeneratedDraft,
  IntelligencePayload,
  SourceItem
} from './types.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const dataDir = path.join(rootDir, 'data')
const collectedPath = path.join(dataDir, 'collected.json')
const intelligencePath = path.join(dataDir, 'intelligence.json')

const coverThemes: Record<string, string[]> = {
  HK: [
    'linear-gradient(135deg, #111827 0%, #047857 48%, #d97706 100%)',
    'linear-gradient(135deg, #111827 0%, #334155 48%, #b91c1c 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #f59e0b 100%)'
  ],
  SG: [
    'linear-gradient(135deg, #0f172a 0%, #0f766e 50%, #f97316 100%)',
    'linear-gradient(135deg, #111827 0%, #b91c1c 46%, #f59e0b 100%)',
    'linear-gradient(135deg, #020617 0%, #0369a1 50%, #16a34a 100%)'
  ],
  UK: [
    'linear-gradient(135deg, #020617 0%, #1e3a8a 52%, #16a34a 100%)',
    'linear-gradient(135deg, #18181b 0%, #4338ca 48%, #dc2626 100%)',
    'linear-gradient(135deg, #111827 0%, #4f46e5 50%, #0ea5e9 100%)'
  ]
}

export class StudyAbroadMarketingAgent {
  private readonly options: AgentOptions
  private readonly steps: AgentStepTrace[] = []

  constructor(options: AgentOptions = {}) {
    this.options = options
  }

  async run(collected: CollectedPayload): Promise<IntelligencePayload> {
    this.steps.length = 0
    const minDisplayScore = numberOption(this.options.minDisplayScore, process.env.AGENT_MIN_DISPLAY_SCORE, 45)
    const limit = numberOption(this.options.limit, process.env.AGENT_ITEM_LIMIT, 24)
    const perSourceLimit = numberOption(this.options.perSourceLimit, process.env.AGENT_PER_SOURCE_LIMIT, 5)
    const dailyRecommendationMin = numberOption(this.options.dailyRecommendationMin, process.env.DAILY_RECOMMENDATION_MIN, 3)
    const dailyRecommendationMax = numberOption(this.options.dailyRecommendationMax, process.env.DAILY_RECOMMENDATION_MAX, 5)
    const backupLimit = numberOption(this.options.backupLimit, process.env.BACKUP_TOPIC_LIMIT, 20)

    const eligibleItems = await this.step('ingest', '读取并过滤真实数据', () => {
      return collected.items
        .filter(item => Number(item.relevanceScore || 0) >= minDisplayScore)
        .sort((a, b) => {
          const byScore = Number(b.relevanceScore || 0) - Number(a.relevanceScore || 0)
          if (byScore !== 0) return byScore
          return new Date(b.publishedAt || b.fetchedAt || 0).getTime() - new Date(a.publishedAt || a.fetchedAt || 0).getTime()
        })
    }, items => ({
      itemCount: items.length,
      message: `保留 ${items.length}/${collected.items.length} 条达到展示分数的情报`
    }))

    const scoredItems = await this.step('score', '营销价值评分', () => {
      return eligibleItems.map(item => {
        const marketingScore = item.marketingScore || buildMarketingProfile(item)
        return {
          ...item,
          marketingScore,
          contentAngle: item.contentAngle || marketingScore.contentAngle,
          privateMessageCta: item.privateMessageCta || marketingScore.privateMessageCta,
          riskNotes: item.riskNotes || marketingScore.riskNotes
        }
      })
    }, items => ({
      itemCount: items.length,
      message: `按政策影响、热点热度、紧急程度、收藏价值、可信度完成评分`
    }))

    const recommendationResult = await this.step('recommend', '规划每日选题', () => {
      const dailySourceItems = buildDailyRecommendations(scoredItems, {
        min: dailyRecommendationMin,
        max: dailyRecommendationMax
      })
      const dailyIds = new Set(dailySourceItems.map(item => item.id))
      const remainingItems = selectSourceItems(
        scoredItems.filter(item => !dailyIds.has(item.id)),
        Math.max(0, limit - dailySourceItems.length),
        perSourceLimit
      )
      const selectedSourceItems = [...dailySourceItems, ...remainingItems].slice(0, limit)
      const selectedIds = new Set(selectedSourceItems.map(item => item.id))
      const backupSourceItems = buildBackupTopics(scoredItems, selectedIds, { limit: backupLimit })

      return { selectedSourceItems, backupSourceItems }
    }, result => ({
      itemCount: result.selectedSourceItems.length,
      message: `选择 ${result.selectedSourceItems.length} 条进入今日创作，${result.backupSourceItems.length} 条进入备选题库`
    }))

    const llmState = getLlmState(this.options)
    const llmErrors: Array<{ id: string; message: string }> = []
    const llmConcurrency = llmState.enabled
      ? Math.max(1, numberOption(this.options.llmConcurrency, process.env.LLM_CONCURRENCY, 3))
      : 1

    const generatedItems = await this.step('generate', '生成小红书草稿', async () => {
      return mapWithConcurrency(recommendationResult.selectedSourceItems, llmConcurrency, async (sourceItem, index) => {
        let generated: GeneratedDraft
        if (llmState.enabled) {
          try {
            generated = await generateWithLlm(sourceItem, llmState)
          } catch (error) {
            llmErrors.push({ id: sourceItem.id, message: error instanceof Error ? error.message : String(error) })
            generated = generateWithRules(sourceItem)
          }
        } else {
          generated = generateWithRules(sourceItem)
        }

        return toFrontendItem(sourceItem, generated, index)
      })
    }, items => ({
      itemCount: items.length,
      status: llmErrors.length ? 'warning' : 'ok',
      message: llmState.enabled
        ? `模型生成 ${items.length - llmErrors.length} 条，规则兜底 ${llmErrors.length} 条`
        : `未启用模型，规则生成 ${items.length} 条`
    }))

    return this.step('package', '输出前端工作台 payload', () => {
      const backupItems = recommendationResult.backupSourceItems.map(toBackupItem)
      return {
        meta: {
          mode: 'agent-pipeline',
          generatedAt: new Date().toISOString(),
          collectedAt: collected.meta?.finishedAt || '',
          sourceCount: Number(collected.meta?.sourceCount || 0),
          successfulSourceCount: Number(collected.meta?.successfulSourceCount || 0),
          skippedSourceCount: Number(collected.meta?.skippedSourceCount || 0),
          failedSourceCount: Number(collected.meta?.failedSourceCount || 0),
          rawItemCount: Number(collected.meta?.rawItemCount || 0),
          itemCount: generatedItems.length,
          dailyRecommendationCount: generatedItems.filter(item => item.isDailyRecommendation).length,
          backupItemCount: backupItems.length,
          minDisplayScore,
          agent: {
            name: 'StudyAbroadMarketingAgent',
            version: '0.2.0',
            strategy: 'collect -> score -> recommend -> generate -> verify-ready package',
            steps: [...this.steps]
          },
          llm: {
            enabled: llmState.enabled,
            provider: llmState.provider,
            model: llmState.enabled ? llmState.model : '',
            mode: llmState.enabled ? 'api' : 'rules-fallback',
            errorCount: llmErrors.length,
            fallbackCount: llmErrors.length,
            errors: llmErrors.slice(0, 6)
          }
        },
        sources: collected.sources || [],
        backupItems,
        items: generatedItems
      } satisfies IntelligencePayload
    }, payload => ({
      itemCount: payload.items.length,
      message: `输出 ${payload.items.length} 条草稿、${payload.backupItems.length} 条备选题`
    }))
  }

  private async step<T>(
    id: AgentStepTrace['id'],
    label: string,
    run: () => T | Promise<T>,
    summarize: (value: T) => { itemCount: number; message: string; status?: AgentStepTrace['status'] }
  ): Promise<T> {
    const startedAt = new Date().toISOString()
    try {
      const value = await run()
      const summary = summarize(value)
      const trace: AgentStepTrace = {
        id,
        label,
        status: summary.status || 'ok',
        startedAt,
        finishedAt: new Date().toISOString(),
        itemCount: summary.itemCount,
        message: summary.message
      }
      this.steps.push(trace)
      if (id === 'package' && isIntelligencePayload(value)) {
        value.meta.agent.steps = [...this.steps]
      }
      return value
    } catch (error) {
      this.steps.push({
        id,
        label,
        status: 'failed',
        startedAt,
        finishedAt: new Date().toISOString(),
        itemCount: 0,
        message: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

export async function buildIntelligence(options: AgentOptions = {}): Promise<IntelligencePayload> {
  await loadLocalEnv(path.join(rootDir, '.env'))
  const collected = await readJson<CollectedPayload>(options.input || collectedPath)
  const agent = new StudyAbroadMarketingAgent(options)
  const payload = await agent.run(collected)
  await mkdir(dataDir, { recursive: true })
  await writeJson(options.output || intelligencePath, payload)
  return payload
}

function selectSourceItems(items: SourceItem[], limit: number, perSourceLimit: number): SourceItem[] {
  const selected: SourceItem[] = []
  const counts = new Map<string, number>()

  for (const item of items) {
    const count = counts.get(item.sourceId) || 0
    if (count >= perSourceLimit) continue
    selected.push(item)
    counts.set(item.sourceId, count + 1)
    if (selected.length >= limit) return selected
  }

  return selected
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length)
  let nextIndex = 0

  async function runNext(): Promise<void> {
    const index = nextIndex
    nextIndex += 1
    if (index >= values.length) return
    const value = values[index]
    if (value === undefined) return
    results[index] = await worker(value, index)
    await runNext()
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, runNext))
  return results
}

function toFrontendItem(item: SourceItem, generated: GeneratedDraft, index: number): FrontendItem {
  const marketingScore = item.marketingScore || buildMarketingProfile(item)
  const regionLabel = getRegionLabel(item.region)
  const timeSource = item.publishedAt || item.fetchedAt || ''
  const coverThemeList = coverThemes[item.region] || coverThemes.UK || []

  return {
    id: item.id,
    region: item.region,
    regionLabel,
    title: item.title,
    source: item.sourceName,
    sourceUrl: item.url,
    sourceType: item.sourceTypeLabel,
    sourceId: item.sourceId,
    sourceTrustLevel: item.trustLevel,
    mediaStatus: mediaStatus(item),
    imageUrl: item.imageUrl || '',
    imageOrigin: item.imageOrigin || 'none',
    imageLicenseStatus: item.imageLicenseStatus || 'none',
    canPublishImage: Boolean(item.canPublishImage),
    coverTheme: coverThemeList[index % Math.max(1, coverThemeList.length)] || coverThemes.UK?.[0] || '#111827',
    time: formatTime(timeSource),
    publishedAt: item.publishedAt || '',
    fetchedAt: item.fetchedAt || '',
    score: Number(item.relevanceScore || 0),
    marketingScore,
    recommendationTier: item.recommendationTier || (marketingScore.level === '今日必写' ? 'daily-candidate' : marketingScore.level === '可写' ? 'candidate' : 'backup'),
    isDailyRecommendation: Boolean(item.isDailyRecommendation),
    recommendationRank: Number(item.recommendationRank || 0),
    contentAngle: item.contentAngle || marketingScore.contentAngle,
    privateMessageCta: item.privateMessageCta || marketingScore.privateMessageCta,
    riskNotes: item.riskNotes || marketingScore.riskNotes,
    credibility: credibility(item.trustLevel),
    status: '待核验',
    summary: generated.summary,
    impact: generated.impact,
    checks: generated.checks,
    tags: generated.tags,
    draftTitle: generated.draftTitle,
    draftBody: generated.draftBody,
    coverText: generated.coverText
  }
}

function toBackupItem(item: SourceItem, index: number): BackupItem {
  const marketingScore = item.marketingScore || buildMarketingProfile(item)
  return {
    id: item.id,
    region: item.region,
    regionLabel: getRegionLabel(item.region),
    title: item.title,
    source: item.sourceName,
    sourceUrl: item.url,
    sourceType: item.sourceTypeLabel,
    sourceTrustLevel: item.trustLevel,
    publishedAt: item.publishedAt || '',
    fetchedAt: item.fetchedAt || '',
    time: formatTime(item.publishedAt || item.fetchedAt || ''),
    score: Number(item.relevanceScore || 0),
    marketingScore,
    recommendationTier: 'backup',
    backupRank: index + 1,
    contentAngle: marketingScore.contentAngle,
    privateMessageCta: marketingScore.privateMessageCta,
    reason: marketingScore.reasons[0] || '备选题库素材'
  }
}

function mediaStatus(item: SourceItem): string {
  if (!item.imageUrl) return '无来源图，用模板封面'
  if (item.canPublishImage) return '来源图可预览，发布前仍需复核授权'
  return '来源图仅供后台参考，不建议发布'
}

function credibility(trustLevel: string): number {
  const map: Record<string, number> = {
    official: 4.8,
    school: 4.5,
    expert: 4.2,
    'news-discovery': 3.8,
    social: 3.2
  }
  return map[trustLevel] || 3.5
}

function numberOption(optionValue: unknown, envValue: string | undefined, fallback: number): number {
  const value = optionValue ?? envValue
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function isIntelligencePayload(value: unknown): value is IntelligencePayload {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'meta' in value &&
    'items' in value
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  buildIntelligence()
    .then(payload => {
      console.log(`Generated ${payload.meta.itemCount} intelligence cards using ${payload.meta.llm.mode}.`)
      if (payload.meta.llm.errorCount) {
        console.log(`${payload.meta.llm.errorCount} LLM calls failed and used rules fallback.`)
      }
    })
    .catch(error => {
      console.error(error)
      process.exitCode = 1
    })
}
