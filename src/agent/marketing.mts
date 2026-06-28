import type { MarketingProfile, SourceItem } from './types.mjs'
import { normalize } from './text.mjs'

const regionLabels: Record<string, string> = {
  HK: '香港',
  UK: '英国',
  SG: '新加坡'
}

const trustScores: Record<string, number> = {
  official: 96,
  school: 88,
  expert: 82,
  'news-discovery': 68,
  social: 54,
  manual: 62
}

const ctaTemplates = {
  visa: [
    '想知道自己适不适合这条政策，可以私信发我你的背景。',
    '评论区打“签证”，我帮你整理申请时间线。'
  ],
  deadline: [
    '评论区打“专业”，我帮你看这个时间线要不要赶。',
    '私信领取申请时间线，先把材料节点排清楚。'
  ],
  data: [
    '想看更多数据图文，评论区打“数据”。',
    '私信发目标地区，我帮你看申请趋势。'
  ],
  general: [
    '评论区打专业我帮你看。',
    '想知道自己适不适合这个地区留学，可以私信。',
    '私信领取申请时间线，先把准备节奏排清楚。'
  ]
} as const

export function buildMarketingProfile(item: SourceItem): MarketingProfile {
  const text = normalize(`${item.title} ${item.summary || ''} ${item.rawText || ''} ${(item.topics || []).join(' ')}`)
  const regionLabel = getRegionLabel(item.region)
  const dimensions = {
    policyImpact: scorePolicyImpact(item, text),
    heat: scoreHeat(item, text),
    urgency: scoreUrgency(item, text),
    saveValue: scoreSaveValue(item, text),
    credibility: scoreCredibility(item)
  }
  const total = Math.round(
    dimensions.policyImpact * 0.30 +
    dimensions.heat * 0.18 +
    dimensions.urgency * 0.22 +
    dimensions.saveValue * 0.18 +
    dimensions.credibility * 0.12
  )
  const level = total >= 82 || (dimensions.policyImpact >= 90 && dimensions.urgency >= 75 && dimensions.credibility >= 85)
    ? '今日必写'
    : total >= 68 ? '可写' : '备选'
  const reasons = buildReasons(item, dimensions, text, regionLabel)
  const contentAngle = inferContentAngle(text, regionLabel)
  const privateMessageCta = choosePrivateMessageCta(item, { total })

  return {
    total,
    level,
    regionLabel,
    dimensions,
    reasons,
    contentAngle,
    privateMessageCta,
    riskNotes: [
      '不得承诺录取、签证或就业结果。',
      '不得暗示保录、保签或政策确定性收益。',
      '涉及学校、政策、数据时必须保留原文链接并人工复核。'
    ]
  }
}

export function buildDailyRecommendations(
  items: SourceItem[],
  options: { min?: number; max?: number } = {}
): SourceItem[] {
  const min = Number(options.min || 3)
  const max = Number(options.max || 5)
  const sorted = items
    .map(item => withMarketing(item))
    .sort(compareForRecommendation)
  const strongCount = sorted.filter(item => (item.marketingScore?.total || 0) >= 68).length
  const count = Math.min(max, Math.max(Math.min(min, sorted.length), strongCount || Math.min(min, sorted.length)))
  const selected: SourceItem[] = []
  const selectedIds = new Set<string>()
  const priorityRegions: string[] = []

  for (const item of sorted) {
    if (!priorityRegions.includes(item.region)) priorityRegions.push(item.region)
  }

  for (const region of priorityRegions) {
    const candidate = sorted.find(item => item.region === region && !selectedIds.has(item.id))
    if (!candidate) continue
    selected.push(candidate)
    selectedIds.add(candidate.id)
    if (selected.length >= count) break
  }

  for (const item of sorted) {
    if (selectedIds.has(item.id)) continue
    selected.push(item)
    selectedIds.add(item.id)
    if (selected.length >= count) break
  }

  return selected.slice(0, count).map((item, index) => ({
    ...item,
    isDailyRecommendation: true,
    recommendationRank: index + 1,
    recommendationTier: 'daily'
  }))
}

export function buildBackupTopics(
  items: SourceItem[],
  selectedIds = new Set<string>(),
  options: { limit?: number } = {}
): SourceItem[] {
  const limit = Number(options.limit || 20)
  return items
    .filter(item => !selectedIds.has(item.id))
    .map(item => withMarketing(item))
    .sort(compareForRecommendation)
    .slice(0, limit)
    .map(item => ({
      ...item,
      isDailyRecommendation: false,
      recommendationTier: 'backup'
    }))
}

export function choosePrivateMessageCta(item: SourceItem, profile: Pick<MarketingProfile, 'total'> = buildMarketingProfile(item)): string {
  const text = normalize(`${item.title} ${item.summary || ''} ${item.rawText || ''} ${(item.topics || []).join(' ')}`)
  const list = /visa|签证|student pass|entry permit|iang|immigration|入境/.test(text)
    ? ctaTemplates.visa
    : /deadline|round|截止|申请季|时间线|application/.test(text)
      ? ctaTemplates.deadline
      : /data|statistics|统计|趋势|ucas|hesa/.test(text)
        ? ctaTemplates.data
        : ctaTemplates.general
  const index = Math.max(0, Math.min(list.length - 1, Math.round((profile.total || 70) / 50) - 1))
  return list[index] || list[0] || '评论区打专业我帮你看。'
}

export function getRegionLabel(region: string): string {
  return regionLabels[region] || region || '全部'
}

function withMarketing(item: SourceItem): SourceItem {
  const marketingScore = buildMarketingProfile(item)
  return {
    ...item,
    marketingScore,
    contentAngle: marketingScore.contentAngle,
    privateMessageCta: marketingScore.privateMessageCta,
    riskNotes: marketingScore.riskNotes,
    recommendationTier: marketingScore.level === '今日必写' ? 'daily-candidate' : marketingScore.level === '可写' ? 'candidate' : 'backup'
  }
}

function compareForRecommendation(a: SourceItem, b: SourceItem): number {
  const byMarketing = recommendationSortScore(b) - recommendationSortScore(a)
  if (byMarketing !== 0) return byMarketing
  const bySource = Number(b.relevanceScore || 0) - Number(a.relevanceScore || 0)
  if (bySource !== 0) return bySource
  return new Date(b.publishedAt || b.fetchedAt || 0).getTime() - new Date(a.publishedAt || a.fetchedAt || 0).getTime()
}

function recommendationSortScore(item: SourceItem): number {
  const imageBonus = item.imageUrl && item.canPublishImage ? 6 : 0
  return Number(item.marketingScore?.total || 0) + imageBonus
}

function scorePolicyImpact(item: SourceItem, text: string): number {
  let score = baseByTrust(item, 42)
  score += countTerms(text, ['visa', 'student pass', 'entry permit', 'immigration', 'policy', 'requirement', 'graduate visa', 'iang', '签证', '入境', '政策', '要求']) * 12
  score += countTerms(text, ['ucas', 'hesa', 'ugc', 'moe', 'ica', 'gov.uk', 'government', '政府', '教育局', '入境事务处']) * 8
  return clamp(score)
}

function scoreHeat(item: SourceItem, text: string): number {
  let score = Number(item.relevanceScore || 45) * 0.55
  score += countTerms(text, ['news', 'trend', 'hot', 'recent', 'updated', 'release', 'ranking', '最新', '热议', '更新', '趋势', '新闻']) * 8
  score += item.trustLevel === 'news-discovery' ? 16 : 0
  score += item.trustLevel === 'social' ? 18 : 0
  return clamp(score)
}

function scoreUrgency(item: SourceItem, text: string): number {
  let score = 38
  score += countTerms(text, ['deadline', 'round', 'apply', 'application', 'open', 'close', 'visa', 'student pass', '2026', '2027', '截止', '申请', '开放', '签证', '时间线']) * 9
  const publishedAt = new Date(item.publishedAt || item.fetchedAt || '')
  if (!Number.isNaN(publishedAt.getTime())) {
    const ageDays = Math.max(0, (Date.now() - publishedAt.getTime()) / 86400000)
    if (ageDays <= 7) score += 18
    else if (ageDays <= 30) score += 10
    else if (ageDays <= 90) score += 4
  }
  return clamp(score)
}

function scoreSaveValue(item: SourceItem, text: string): number {
  let score = 36
  score += countTerms(text, ['requirement', 'guide', 'how to apply', 'scholarship', 'fees', 'funding', 'data', 'statistics', 'checklist', 'visa', 'student pass', 'deadline', 'application', '申请要求', '指南', '奖学金', '费用', '数据', '清单', '签证', '截止', '申请']) * 10
  score += item.sourceTypeLabel?.includes('申请') ? 12 : 0
  score += item.sourceTypeLabel?.includes('数据') || item.sourceTypeLabel?.includes('统计') ? 14 : 0
  return clamp(score)
}

function scoreCredibility(item: SourceItem): number {
  return trustScores[item.trustLevel] || 66
}

function buildReasons(item: SourceItem, dimensions: MarketingProfile['dimensions'], text: string, regionLabel: string): string[] {
  const reasons: string[] = []
  if (dimensions.policyImpact >= 80) reasons.push(`${regionLabel}留学政策/申请影响强，适合做专业解读。`)
  if (dimensions.urgency >= 75) reasons.push('存在时间线或材料准备压力，适合做提醒型内容。')
  if (dimensions.saveValue >= 75) reasons.push('信息具备收藏价值，适合做清单、流程或数据图文。')
  if (dimensions.heat >= 75) reasons.push('热点热度较高，适合快速跟进。')
  if (/city|城市|london|manchester|hong kong|singapore|留学城市/.test(text)) reasons.push('可延展到留学城市生活、就业或选校话题。')
  if (!reasons.length) reasons.push('适合放入备选题库，后续做合集或背景资料。')
  return reasons.slice(0, 4)
}

function inferContentAngle(text: string, regionLabel: string): string {
  if (/visa|student pass|entry permit|iang|immigration|签证|入境/.test(text)) {
    return `${regionLabel}签证/入境政策解读`
  }
  if (/data|statistics|ucas|hesa|统计|数据|趋势/.test(text)) {
    return `${regionLabel}留学数据图文`
  }
  if (/deadline|round|application|requirement|申请|截止|要求/.test(text)) {
    return `${regionLabel}申请时间线与避坑`
  }
  if (/scholarship|funding|奖学金|费用/.test(text)) {
    return `${regionLabel}费用与奖学金收藏清单`
  }
  return `${regionLabel}留学资讯避坑`
}

function baseByTrust(item: SourceItem, base: number): number {
  if (item.trustLevel === 'official') return base + 22
  if (item.trustLevel === 'school') return base + 16
  if (item.trustLevel === 'expert') return base + 12
  if (item.trustLevel === 'news-discovery') return base + 6
  return base
}

function countTerms(text: string, terms: string[]): number {
  return terms.reduce((count, term) => count + (text.includes(term.toLowerCase()) ? 1 : 0), 0)
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}
