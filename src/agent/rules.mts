import type { GeneratedDraft, SourceItem } from './types.mjs'
import { buildMarketingProfile, getRegionLabel } from './marketing.mjs'
import { cleanText, cleanTextBlock, formatDate, toTag, truncate, uniqueStrings } from './text.mjs'

type Topic = '签证政策' | '奖学金' | '申请数据' | '申请信息' | '院校动态' | '新闻趋势'

export interface RulesOptions {
  variantSeed?: string
}

export function generateWithRules(item: SourceItem, opts: RulesOptions = {}): GeneratedDraft {
  const seed = opts.variantSeed || ''
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
  const draftTitle = truncate(buildRuleTitle(item, regionLabel, topic, seed), 28)

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
    draftBody: buildDraftBody(item, regionLabel, topic, marketing.privateMessageCta, marketing.reasons, seed),
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

const TOPIC_HOOKS: Record<Topic, string[]> = {
  签证政策: ['先别急着焦虑⚠️ 这条签证信息跟你有关', '签证这事踩坑代价太大，先码住📌', '关于签证，网上二手攻略别全信👇'],
  奖学金: ['钱能省一笔是一笔💰 这条先收藏', '奖学金别等别人发你才知道⏰', '冲奖学金的姐妹，这条别划走👇'],
  申请数据: ['选校只看排名的，先停一下📊', '这组数据，比你想的更影响选校', '别用感觉申请，先看这条数据👇'],
  申请信息: ['申请季最怕的就是漏时间⏰', '材料卡时间真的会翻车，先看这条', '这条申请信息，建议直接存起来📌'],
  院校动态: ['按旧版准备材料的，赶紧看这条⚠️', '目标院校有更新，别用去年的攻略', '这所学校的要求变了，先确认👇'],
  新闻趋势: ['这条留学热点，真正的影响在这', '别只看标题，重点在后面👇', '最近被问爆的这件事，说点人话']
}

function pickVariant<T>(options: T[], item: SourceItem, extraSeed = ''): T {
  const seed = `${item.id || ''}${item.title || ''}${extraSeed}`
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return options[hash % options.length] ?? options[0] as T
}

function buildDraftBody(
  item: SourceItem,
  regionLabel: string,
  topic: Topic,
  privateMessageCta: string,
  reasons: string[],
  seed = ''
): string {
  const hook = pickVariant(TOPIC_HOOKS[topic] || TOPIC_HOOKS.新闻趋势, item, seed)
  const sourceLine = item.trustLevel === 'social'
    ? `这条来自社媒讨论，先当趋势看，别直接当${regionLabel}政策结论。`
    : `这条来自「${item.sourceName}」，不是二手转述，做成${topic}笔记很稳。`
  const sourceSummary = truncate(item.summary || item.rawText || item.title, 160)
  const safeReasons = reasons.length ? reasons : ['信息和你的申请时间线有关，适合做成提醒。']
  const checklist = buildTopicChecklist(topic, regionLabel)
  const cta = privateMessageCta || `在准备${regionLabel}的姐妹，评论区扣个1，我看看人多不多~`

  return [
    hook,
    '',
    sourceLine,
    `📌 来源重点：${sourceSummary}`,
    '',
    '为什么值得看👇',
    `1️⃣ ${safeReasons[0] || '跟申请规划直接相关'}`,
    `2️⃣ ${safeReasons[1] || '能用来核对材料、截止时间或适用对象'}`,
    '3️⃣ 信息来自官方/学校来源，但发布前我都会回原文再确认一次',
    '',
    '你现在该做这几件事✅',
    `· ${checklist[0] || '打开原文确认适用范围'}`,
    `· ${checklist[1] || '把会影响你的材料和时间点标出来'}`,
    `· ${checklist[2] || '拿不准就找顾问人工复核'}`,
    '',
    cta,
    '（政策/录取/签证以官方原文为准，本文不构成任何结果承诺）'
  ].join('\n')
}

function buildRuleTitle(item: SourceItem, regionLabel: string, topic: Topic, seed = ''): string {
  const entity = shortEntity(item)
  const titles: Record<Topic, string[]> = {
    申请数据: [`${entity}数据更新，选校别只看排名📊`, `${regionLabel}申请数据出了，别凭感觉选校`],
    签证政策: [`${regionLabel}签证别只看二手攻略⚠️`, `关于${regionLabel}签证，这几点先确认`],
    奖学金: [`${regionLabel}奖学金，先看你够不够格💰`, `冲${regionLabel}奖学金，这条别错过`],
    申请信息: [`${entity}申请更新，材料赶紧重查📌`, `${regionLabel}申请别漏时间，看这条`],
    院校动态: [`${entity}要求变了，别按旧版准备⚠️`, `${entity}国际生要求更新，先确认`],
    新闻趋势: [`${regionLabel}留学热点，真正影响在这`, `这条${regionLabel}留学消息，说点人话`]
  }
  return pickVariant(titles[topic] || titles.新闻趋势, item, seed)
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
