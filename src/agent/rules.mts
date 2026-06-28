import type { GeneratedDraft, SourceItem } from './types.mjs'
import { buildMarketingProfile, getRegionLabel } from './marketing.mjs'
import { cleanText, cleanTextBlock, formatDate, toTag, truncate, uniqueStrings } from './text.mjs'

type Topic = '签证政策' | '奖学金' | '申请数据' | '申请信息' | '院校动态' | '新闻趋势'

export function generateWithRules(item: SourceItem): GeneratedDraft {
  const regionLabel = getRegionLabel(item.region)
  const sourceKind = item.trustLevel === 'official'
    ? '官方来源'
    : item.trustLevel === 'school'
      ? '学校来源'
      : item.trustLevel === 'social' ? '社媒来源' : '信息来源'
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
      `原文发布时间：${formatDate(item.publishedAt || item.fetchedAt || '')}。`,
      item.trustLevel === 'social' ? '社媒内容只作为趋势信号，不能作为政策事实。' : '标题和细节需要按原文逐条核对，不能扩大解释。',
      '文案不得承诺录取、签证或就业结果。'
    ],
    tags,
    draftTitle,
    draftBody: buildDraftBody(item, regionLabel, topic, marketing.privateMessageCta, marketing.reasons),
    coverText
  }
}

export function normalizeGenerated(value: unknown, item: SourceItem): GeneratedDraft {
  const source = isRecord(value) ? value : {}
  const fallback = generateWithRules(item)
  return {
    summary: cleanText(String(source.summary || '')) || fallback.summary,
    impact: normalizeList(source.impact, fallback.impact, 3),
    checks: normalizeList(source.checks, fallback.checks, 3),
    tags: normalizeList(source.tags, fallback.tags, 5).map(tag => tag.replace(/^#/, '')),
    draftTitle: truncate(cleanText(String(source.draftTitle || '')) || fallback.draftTitle, 28),
    draftBody: cleanTextBlock(String(source.draftBody || '')) || fallback.draftBody,
    coverText: truncate(cleanText(String(source.coverText || '')) || fallback.coverText, 16)
  }
}

export function inferTopic(item: SourceItem): Topic {
  const label = String(item.sourceTypeLabel || '').toLowerCase()
  const topics = (item.topics || []).join(' ').toLowerCase()
  const labelText = `${label} ${topics}`
  if (/(签证|准证|visa|student pass|immigration|entry permit|iang)/i.test(labelText)) return '签证政策'
  if (/(奖学金|scholarship|funding)/i.test(labelText)) return '奖学金'
  if (/(数据|统计|data|statistics|ucas|hesa)/i.test(labelText)) return '申请数据'
  if (/(申请|指南|admission|application|undergraduate|postgraduate)/i.test(labelText)) return '申请信息'
  if (/(院校|university|school|programme|program)/i.test(labelText)) return '院校动态'

  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`.toLowerCase()
  if (/(data|statistics|ucas|hesa|enrolment|dataset|统计|数据|趋势)/i.test(text)) return '申请数据'
  if (/(scholarship|funding|奖学金|费用)/i.test(text)) return '奖学金'
  if (/(visa|immigration|iang|签证|入境)/i.test(text)) return '签证政策'
  if (/(admission|application|deadline|requirement|申请|录取|截止|语言)/i.test(text)) return '申请信息'
  if (/(university|school|programme|program|大学|学校|专业)/i.test(text)) return '院校动态'
  return '新闻趋势'
}

function buildDraftBody(
  item: SourceItem,
  regionLabel: string,
  topic: Topic,
  privateMessageCta: string,
  reasons: string[]
): string {
  const sourceLine = item.trustLevel === 'social'
    ? '这条来自社媒趋势观察，不能直接当成政策结论。'
    : `这条来自 ${item.sourceName}，不是二手转述，适合做成可收藏的${topic}内容。`
  const sourceSummary = truncate(item.summary || item.rawText || item.title, 180)
  const safeReasons = reasons.length
    ? reasons
    : ['信息和申请时间线有关，适合做提醒型内容。']
  const checklist = buildTopicChecklist(topic, regionLabel)

  return [
    `${regionLabel}留学今天这条信息，建议先收藏。`,
    '',
    sourceLine,
    `来源重点：${sourceSummary}`,
    '',
    '为什么值得看：',
    `1. ${safeReasons[0] || '信息与申请规划有关。'}`,
    `2. ${safeReasons[1] || '适合用来核对申请材料、截止时间或政策适用对象。'}`,
    '3. 信息来自官方/学校/可信来源，但发布前仍要打开原文确认。',
    '',
    '你现在先做 3 件事：',
    `1. ${checklist[0] || '打开原文确认适用范围。'}`,
    `2. ${checklist[1] || '把可能影响自己的材料和时间点标出来。'}`,
    `3. ${checklist[2] || '必要时找顾问做人工复核。'}`,
    '',
    `适合人群：正在关注${regionLabel}申请、签证、选校或奖学金的同学。`,
    privateMessageCta,
    '',
    '注意：这条不能写成录取保证、保签保证，也不要把个别页面信息扩大成所有学校政策。'
  ].join('\n')
}

function buildRuleTitle(item: SourceItem, regionLabel: string, topic: Topic): string {
  const entity = shortEntity(item)
  if (topic === '申请数据') return `${entity}数据更新，选校别只看排名`
  if (topic === '签证政策') return `${regionLabel}签证政策，别只看二手攻略`
  if (topic === '奖学金') return `${regionLabel}奖学金信息，先看适用对象`
  if (topic === '申请信息') return `${entity}申请页更新，材料要重查`
  if (topic === '院校动态') return `${entity}国际生要求，别按旧版准备`
  return `${regionLabel}留学热点，真正影响在这`
}

function buildRuleCoverText(item: SourceItem, regionLabel: string, topic: Topic): string {
  const entity = shortEntity(item)
  if (topic === '申请数据') return `${regionLabel}申请数据`
  if (topic === '签证政策') return `${regionLabel}签证避坑`
  if (topic === '奖学金') return `${regionLabel}奖学金`
  if (topic === '申请信息') return `${entity}申请提醒`
  if (topic === '院校动态') return `${entity}要求更新`
  return `${regionLabel}留学热点`
}

function buildTopicChecklist(topic: Topic, regionLabel: string): string[] {
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

function shortEntity(item: SourceItem): string {
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

function cleanDraftTitle(value: string): string {
  return cleanText(value)
    .replace(/\s*[|｜-]\s*.*$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 18)
}

function buildTags(item: SourceItem, topic: Topic): string[] {
  const base = item.region === 'HK'
    ? ['香港留学', '港校申请']
    : item.region === 'SG'
      ? ['新加坡留学', '新加坡申请']
      : ['英国留学', '英国申请']
  const topicTags: Record<Topic, string[]> = {
    签证政策: ['签证政策', '留学政策'],
    申请数据: ['申请数据', '选校建议'],
    申请信息: ['申请季', '留学申请'],
    院校动态: ['院校动态', '选校建议'],
    奖学金: ['奖学金', '留学费用'],
    新闻趋势: ['留学资讯', '热点解读']
  }
  return uniqueStrings([...base, ...(topicTags[topic] || topicTags.新闻趋势), ...(item.topics || []).slice(0, 2).map(toTag)], 6)
}

function normalizeList(value: unknown, fallback: string[], limit: number): string[] {
  const list = Array.isArray(value) ? value : []
  const cleaned = list.map(item => cleanText(String(item))).filter(Boolean)
  return (cleaned.length ? cleaned : fallback).slice(0, limit)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
