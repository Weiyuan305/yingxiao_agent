import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadLocalEnv } from './env.mjs'
import {
  buildBackupTopics,
  buildDailyRecommendations,
  buildMarketingProfile,
  getRegionLabel
} from './marketing.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(rootDir, 'data')
const collectedPath = path.join(dataDir, 'collected.json')
const intelligencePath = path.join(dataDir, 'intelligence.json')

const regionLabels = {
  HK: '香港',
  UK: '英国',
  SG: '新加坡'
}

const coverThemes = {
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

export async function buildIntelligence(options = {}) {
  await loadLocalEnv()
  const collected = await readJson(options.input || collectedPath)
  const llmState = getLlmState(options)
  const limit = Number(options.limit || process.env.AGENT_ITEM_LIMIT || 24)
  const minDisplayScore = Number(options.minDisplayScore || process.env.AGENT_MIN_DISPLAY_SCORE || 45)
  const perSourceLimit = Number(options.perSourceLimit || process.env.AGENT_PER_SOURCE_LIMIT || 5)
  const dailyRecommendationMin = Number(options.dailyRecommendationMin || process.env.DAILY_RECOMMENDATION_MIN || 3)
  const dailyRecommendationMax = Number(options.dailyRecommendationMax || process.env.DAILY_RECOMMENDATION_MAX || 5)
  const eligibleItems = collected.items.filter(item => item.relevanceScore >= minDisplayScore)
  const dailySourceItems = buildDailyRecommendations(eligibleItems, {
    min: dailyRecommendationMin,
    max: dailyRecommendationMax
  })
  const dailyIds = new Set(dailySourceItems.map(item => item.id))
  const remainingItems = selectSourceItems(
    eligibleItems.filter(item => !dailyIds.has(item.id)),
    Math.max(0, limit - dailySourceItems.length),
    perSourceLimit
  )
  const selectedSourceItems = [...dailySourceItems, ...remainingItems].slice(0, limit)
  const selectedIds = new Set(selectedSourceItems.map(item => item.id))
  const backupItems = buildBackupTopics(eligibleItems, selectedIds, {
    limit: Number(options.backupLimit || process.env.BACKUP_TOPIC_LIMIT || 20)
  }).map(toBackupItem)
  const items = []
  const llmErrors = []
  const llmConcurrency = llmState.enabled
    ? Math.max(1, Number(options.llmConcurrency || process.env.LLM_CONCURRENCY || 3))
    : 1

  const generatedItems = await mapWithConcurrency(selectedSourceItems, llmConcurrency, async (sourceItem, index) => {
    let generated
    if (llmState.enabled) {
      try {
        generated = await generateWithLlm(sourceItem, llmState)
      } catch (error) {
        llmErrors.push({ id: sourceItem.id, message: error.message })
        generated = generateWithRules(sourceItem)
      }
    } else {
      generated = generateWithRules(sourceItem)
    }

    return toFrontendItem(sourceItem, generated, index)
  })
  items.push(...generatedItems)

  const payload = {
    meta: {
      mode: 'real-data',
      generatedAt: new Date().toISOString(),
      collectedAt: collected.meta?.finishedAt || '',
      sourceCount: collected.meta?.sourceCount || 0,
      successfulSourceCount: collected.meta?.successfulSourceCount || 0,
      skippedSourceCount: collected.meta?.skippedSourceCount || 0,
      failedSourceCount: collected.meta?.failedSourceCount || 0,
      rawItemCount: collected.meta?.rawItemCount || 0,
      itemCount: items.length,
      dailyRecommendationCount: items.filter(item => item.isDailyRecommendation).length,
      backupItemCount: backupItems.length,
      minDisplayScore,
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
    items
  }

  await mkdir(dataDir, { recursive: true })
  await writeJson(options.output || intelligencePath, payload)
  return payload
}

function selectSourceItems(items, limit, perSourceLimit) {
  const selected = []
  const counts = new Map()

  for (const item of items) {
    const count = counts.get(item.sourceId) || 0
    if (count >= perSourceLimit) continue
    selected.push(item)
    counts.set(item.sourceId, count + 1)
    if (selected.length >= limit) return selected
  }

  return selected
}

async function mapWithConcurrency(values, concurrency, worker) {
  const results = new Array(values.length)
  let nextIndex = 0

  async function runNext() {
    const index = nextIndex
    nextIndex += 1
    if (index >= values.length) return
    results[index] = await worker(values[index], index)
    await runNext()
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, runNext))
  return results
}

function toFrontendItem(item, generated, index) {
  const marketingScore = item.marketingScore || buildMarketingProfile(item)
  const regionLabel = getRegionLabel(item.region)
  const timeSource = item.publishedAt || item.fetchedAt
  const coverThemeList = coverThemes[item.region] || coverThemes.UK

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
    imageUrl: item.imageUrl,
    imageOrigin: item.imageOrigin,
    imageLicenseStatus: item.imageLicenseStatus,
    canPublishImage: item.canPublishImage,
    coverTheme: coverThemeList[index % coverThemeList.length],
    time: formatTime(timeSource),
    publishedAt: item.publishedAt,
    fetchedAt: item.fetchedAt,
    score: item.relevanceScore,
    marketingScore,
    recommendationTier: item.recommendationTier || (marketingScore.level === '今日必写' ? 'daily-candidate' : marketingScore.level === '可写' ? 'candidate' : 'backup'),
    isDailyRecommendation: Boolean(item.isDailyRecommendation),
    recommendationRank: item.recommendationRank || 0,
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

function toBackupItem(item, index) {
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
    publishedAt: item.publishedAt,
    fetchedAt: item.fetchedAt,
    time: formatTime(item.publishedAt || item.fetchedAt),
    score: item.relevanceScore,
    marketingScore,
    recommendationTier: 'backup',
    backupRank: index + 1,
    contentAngle: marketingScore.contentAngle,
    privateMessageCta: marketingScore.privateMessageCta,
    reason: marketingScore.reasons[0] || '备选题库素材'
  }
}

function generateWithRules(item) {
  const regionLabel = regionLabels[item.region] || item.region
  const sourceKind = item.trustLevel === 'official' ? '官方来源' : item.trustLevel === 'school' ? '学校来源' : item.trustLevel === 'social' ? '社媒来源' : '信息来源'
  const rawSummary = item.summary || item.rawText || item.title
  const summary = `${sourceKind}「${item.sourceName}」更新了与${regionLabel}留学相关的信息：${truncate(rawSummary, 150)}`
  const topic = inferTopic(item)
  const marketing = buildMarketingProfile(item)
  const tags = buildTags(item, topic)
  const coverText = truncate(buildRuleCoverText(item, regionLabel, topic), 16)
  const draftTitle = truncate(buildRuleTitle(item, regionLabel, topic), 28)

  return {
    summary,
    impact: [
      marketing.contentAngle,
      ...marketing.reasons.slice(0, 2),
      '如果涉及签证、录取或就业，发布前必须由顾问按官方原文复核。'
    ].slice(0, 3),
    checks: [
      `原始来源：${item.sourceName}。`,
      `原文发布时间：${formatDate(item.publishedAt || item.fetchedAt)}。`,
      item.trustLevel === 'social' ? '社媒内容只作为趋势信号，不能作为政策事实。' : '标题和细节需要按原文逐条核对，不能扩大解释。',
      '文案不得承诺录取、签证或就业结果。'
    ],
    tags,
    draftTitle,
    draftBody: buildDraftBody(item, regionLabel, topic, marketing),
    coverText
  }
}

async function generateWithLlm(item, llmState) {
  const prompt = {
    instruction: '你是留学营销内容审核型 agent。请基于真实来源生成小红书图文草稿，必须谨慎，不夸大，不承诺录取/签证/就业。只返回 JSON。',
    required_schema: {
      summary: 'string',
      impact: ['string', 'string', 'string'],
      checks: ['string', 'string', 'string'],
      tags: ['string'],
      draftTitle: 'string, <= 24 Chinese chars preferred',
      draftBody: 'string, Xiaohongshu style, factual, <= 800 Chinese chars',
      coverText: 'string, <= 12 Chinese chars'
    },
    source_item: {
      title: item.title,
      url: item.url,
      sourceName: item.sourceName,
      sourceType: item.sourceTypeLabel,
      region: item.region,
      trustLevel: item.trustLevel,
      publishedAt: item.publishedAt,
      summary: item.summary,
      rawText: truncate(item.rawText, 900)
    }
  }

  const controller = new AbortController()
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 45000)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let response
  try {
    response = await fetch(llmState.chatCompletionsUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${llmState.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: llmState.model,
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only. Use Chinese. Keep policy and admissions claims conservative.'
          },
          {
            role: 'user',
            content: JSON.stringify(prompt)
          }
        ]
      })
    })
  } catch (error) {
    const detail = error.name === 'AbortError'
      ? `timeout after ${timeoutMs}ms`
      : [error.cause?.code, error.cause?.message || error.message].filter(Boolean).join(' ')
    throw new Error(`LLM request failed: ${detail}`)
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`LLM ${response.status} ${response.statusText}: ${truncate(errorText, 180)}`)
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content || ''
  return normalizeGenerated(JSON.parse(extractJson(content)), item)
}

function normalizeGenerated(value, item) {
  const fallback = generateWithRules(item)
  return {
    summary: cleanText(value.summary) || fallback.summary,
    impact: normalizeList(value.impact, fallback.impact, 3),
    checks: normalizeList(value.checks, fallback.checks, 3),
    tags: normalizeList(value.tags, fallback.tags, 5).map(tag => tag.replace(/^#/, '')),
    draftTitle: truncate(cleanText(value.draftTitle) || fallback.draftTitle, 28),
    draftBody: cleanTextBlock(value.draftBody) || fallback.draftBody,
    coverText: truncate(cleanText(value.coverText) || fallback.coverText, 16)
  }
}

function buildDraftBody(item, regionLabel, topic, marketing) {
  const sourceLine = item.trustLevel === 'social'
    ? '这条来自社媒趋势观察，不能直接当成政策结论。'
    : `这条来自 ${item.sourceName}，不是二手转述，适合做成可收藏的${topic}内容。`
  const sourceSummary = truncate(item.summary || item.rawText || item.title, 180)
  const reasons = marketing.reasons.length
    ? marketing.reasons
    : ['信息和申请时间线有关，适合做提醒型内容。']
  const checklist = buildTopicChecklist(topic, regionLabel)

  return [
    `${regionLabel}留学今天这条信息，建议先收藏。`,
    '',
    sourceLine,
    `来源重点：${sourceSummary}`,
    '',
    '为什么值得看：',
    `1. ${reasons[0]}`,
    `2. ${reasons[1] || '适合用来核对申请材料、截止时间或政策适用对象。'}`,
    '3. 信息来自官方/学校/可信来源，但发布前仍要打开原文确认。',
    '',
    '你现在先做 3 件事：',
    `1. ${checklist[0]}`,
    `2. ${checklist[1]}`,
    `3. ${checklist[2]}`,
    '',
    `适合人群：正在关注${regionLabel}申请、签证、选校或奖学金的同学。`,
    marketing.privateMessageCta,
    '',
    '注意：这条不能写成录取保证、保签保证，也不要把个别页面信息扩大成所有学校政策。'
  ].join('\n')
}

function buildRuleTitle(item, regionLabel, topic) {
  const entity = shortEntity(item)
  if (topic === '申请数据') return `${entity}数据更新，选校别只看排名`
  if (topic === '签证政策') return `${regionLabel}签证政策，别只看二手攻略`
  if (topic === '奖学金') return `${regionLabel}奖学金信息，先看适用对象`
  if (topic === '申请信息') return `${entity}申请页更新，材料要重查`
  if (topic === '院校动态') return `${entity}国际生要求，别按旧版准备`
  return `${regionLabel}留学热点，真正影响在这`
}

function buildRuleCoverText(item, regionLabel, topic) {
  const entity = shortEntity(item)
  if (topic === '申请数据') return `${regionLabel}申请数据`
  if (topic === '签证政策') return `${regionLabel}签证避坑`
  if (topic === '奖学金') return `${regionLabel}奖学金`
  if (topic === '申请信息') return `${entity}申请提醒`
  if (topic === '院校动态') return `${entity}要求更新`
  return `${regionLabel}留学热点`
}

function buildTopicChecklist(topic, regionLabel) {
  if (topic === '申请数据') {
    return ['看数据口径和发布时间，不要只看截图。', '用数据判断申请热度，而不是直接判断录取难度。', '把目标专业、学校梯度和申请轮次重新排一遍。']
  }
  if (topic === '签证政策') {
    return ['先确认自己属于哪类签证/准证适用对象。', '核对材料、资金、CAS/入学证明和递交时间。', '不要把政策便利理解成一定能获批。']
  }
  if (topic === '奖学金') {
    return ['确认奖学金是否面向国际/非本地学生。', '核对截止日期、成绩要求和是否需要单独申请。', '把奖学金和主申请材料分开做时间线。']
  }
  if (topic === '申请信息') {
    return ['打开目标专业页面核对最新要求。', '检查语言、成绩单、推荐信和文书是否会卡时间。', '把冲刺、匹配、稳妥学校重新排优先级。']
  }
  return [`确认这条信息是否影响你的${regionLabel}申请目标。`, '不要只看标题，先看原文适用范围。', '把可能变化的材料和截止时间单独标出来。']
}

function shortEntity(item) {
  const text = `${item.sourceName || ''} ${item.title || ''}`
  if (/ucas/i.test(text)) return 'UCAS'
  if (/hesa/i.test(text)) return 'HESA'
  if (/\bica\b/i.test(text)) return 'ICA'
  if (/\bntu\b/i.test(text)) return 'NTU'
  if (/study in hong kong/i.test(text)) return '香港官方'
  if (/immigration|入境/i.test(text)) return '入境处'
  if (/bristol/i.test(text)) return '布里斯托'
  if (/edinburgh/i.test(text)) return '爱丁堡'
  if (/manchester/i.test(text)) return '曼大'
  if (/polyu/i.test(text)) return 'PolyU'
  if (/cuhk/i.test(text)) return 'CUHK'
  if (/hkmu/i.test(text)) return 'HKMU'
  return cleanDraftTitle(item.title).slice(0, 8) || '官方'
}

function cleanDraftTitle(value) {
  return cleanText(value)
    .replace(/\s*[|｜-]\s*.*$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 18)
}

function buildTags(item, topic) {
  const base = item.region === 'HK'
    ? ['香港留学', '港校申请']
    : item.region === 'SG'
      ? ['新加坡留学', '新加坡申请']
      : ['英国留学', '英国申请']
  const topicTags = {
    签证政策: ['签证政策', '留学政策'],
    申请数据: ['申请数据', '选校建议'],
    申请信息: ['申请季', '留学申请'],
    院校动态: ['院校动态', '选校建议'],
    奖学金: ['奖学金', '留学费用'],
    新闻趋势: ['留学资讯', '热点解读']
  }
  return [...new Set([...base, ...(topicTags[topic] || topicTags.新闻趋势), ...item.topics.slice(0, 2).map(toTag)])].slice(0, 6)
}

function inferTopic(item) {
  const label = String(item.sourceTypeLabel || '').toLowerCase()
  const topics = (item.topics || []).join(' ').toLowerCase()
  if (/(签证|准证|visa|student pass|immigration|entry permit|iang)/i.test(`${label} ${topics}`)) return '签证政策'
  if (/(奖学金|scholarship|funding)/i.test(`${label} ${topics}`)) return '奖学金'
  if (/(数据|统计|data|statistics|ucas|hesa)/i.test(`${label} ${topics}`)) return '申请数据'
  if (/(申请|指南|admission|application|undergraduate|postgraduate)/i.test(`${label} ${topics}`)) return '申请信息'
  if (/(院校|university|school|programme|program)/i.test(`${label} ${topics}`)) return '院校动态'

  const text = `${item.title} ${item.summary} ${item.rawText}`.toLowerCase()
  if (/(data|statistics|ucas|hesa|enrolment|dataset|统计|数据|趋势)/i.test(text)) return '申请数据'
  if (/(scholarship|funding|奖学金|费用)/i.test(text)) return '奖学金'
  if (/(visa|immigration|iang|签证|入境)/i.test(text)) return '签证政策'
  if (/(admission|application|deadline|requirement|申请|录取|截止|语言)/i.test(text)) return '申请信息'
  if (/(university|school|programme|program|大学|学校|专业)/i.test(text)) return '院校动态'
  return '新闻趋势'
}

function mediaStatus(item) {
  if (!item.imageUrl) return '无来源图，用模板封面'
  if (item.canPublishImage) return '来源图可预览，发布前仍需复核授权'
  return '来源图仅供后台参考，不建议发布'
}

function credibility(trustLevel) {
  const map = {
    official: 4.8,
    school: 4.5,
    expert: 4.2,
    'news-discovery': 3.8,
    social: 3.2
  }
  return map[trustLevel] || 3.5
}

function getLlmState(options) {
  const apiKey = options.apiKey || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY
  const disabled = options.disableLlm || process.env.DISABLE_LLM === '1'
  const baseUrl = normalizeLlmBaseUrl(process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1')
  return {
    enabled: Boolean(apiKey && !disabled),
    apiKey,
    provider: process.env.LLM_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai-compatible' : 'custom-compatible'),
    baseUrl,
    chatCompletionsUrl: `${baseUrl}/chat/completions`,
    model: options.model || process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }
}

function normalizeLlmBaseUrl(value) {
  return String(value || 'https://api.openai.com/v1')
    .replace(/\/+$/, '')
    .replace(/\/chat\/completions$/i, '')
}

function extractJson(value) {
  const text = String(value || '').trim()
  if (text.startsWith('{')) return text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('LLM response did not contain JSON')
  return match[0]
}

function normalizeList(value, fallback, limit) {
  const list = Array.isArray(value) ? value : []
  const cleaned = list.map(cleanText).filter(Boolean)
  return (cleaned.length ? cleaned : fallback).slice(0, limit)
}

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知'
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function toTag(value) {
  return cleanText(value)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .slice(0, 12)
}

function cleanText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function cleanTextBlock(value = '') {
  return String(value).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()
}

function truncate(value = '', length = 240) {
  const text = cleanText(value)
  return text.length > length ? text.slice(0, length) : text
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
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
