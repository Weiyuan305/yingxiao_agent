import type { AgentOptions, GeneratedDraft, LlmState, SourceItem } from './types.mjs'
import { generateWithRules, normalizeGenerated } from './rules.mjs'
import { cleanText, truncate } from './text.mjs'

const XHS_SYSTEM_PROMPT = [
  '你是一名资深留学博主兼小红书爆款写手，常年在小红书分享香港、英国、新加坡留学干货，粉丝把你当成靠谱又接地气的学姐。',
  '你的文案有网感、口语化、真诚，会戳中读者的焦虑和痛点，会用 emoji 自然分段，会在结尾引导互动（点赞/收藏/评论扣字）。',
  '但你有职业底线：涉及签证、录取、就业、政策条款、具体数字、截止日期等事实，你只依据给定来源，绝不夸大、不承诺结果、不编造来源里没有的数据。',
  '宁可把事实说得稳一点，也不编造。语言一律用简体中文。严格只输出一个 JSON 对象，不要输出任何解释文字或 ```代码块标记。'
].join('\n')

const XHS_PERSONA =
  '语气像真人学姐在跟朋友分享，不要客服腔、不要官方通报腔、不要“综上所述/建议您”这类 AI 措辞。可以用“姐妹们/家人们/真的会谢/码住/别踩雷/亲测”这类网感词，但别堆砌。'

const XHS_WRITING_RULES = [
  '1. 开头第一句必须是钩子：制造焦虑、点破痛点、或反常识，让人停下来。不要用“今天给大家分享”这种开场。',
  '2. 正文用 emoji 起头分点（1️⃣2️⃣3️⃣ 或 ✅⚠️📌 等），每点是一句人话短句，不要写成长段说明文。',
  '3. 适度情绪和口语，但信息要真，所有政策/数字/时间都以来源为准，拿不准就写“以官方原文为准”。',
  '4. 结尾要有互动引导（例如“在准备X的扣个1”“觉得有用先码住”），再加一句一句话的合规提示。',
  '5. emoji 适量点缀分段即可，不要每句都加，不要用生僻颜文字。',
  '6. 不要在正文里堆 #话题标签（标签放在 tags 字段），不要出现链接。'
].join('\n')

const XHS_TITLE_FORMULAS = [
  '数字型：“英国留学这5个坑，第3个最致命”',
  '痛点型：“申请季最怕的不是被拒，是…”',
  '反常识型：“港校申请别只看排名！学姐劝退”',
  '身份共鸣型：“双非想冲英国Top10，看这篇”',
  '紧迫型：“这个时间点没动，今年就晚了⏰”'
].join(' / ')

const XHS_BODY_STRUCTURE = [
  '钩子开场(1~2句戳痛点或制造紧迫)',
  '→ 一句话点明这条信息是什么、跟你有什么关系',
  '→ emoji 分点干货(2~4点，每点短句、说人话)',
  '→ 行动建议(✅ 你现在该做的1~3件事)',
  '→ 互动引导 + 一句合规提示(政策/录取/签证以官方为准，不承诺结果)'
].join('\n')

const XHS_HARD_LIMITS =
  '禁止：承诺一定录取/一定过签/一定就业；编造来源里没有的分数线、名额、截止日期、涨跌幅；把单个学校的信息说成所有学校通用；把新闻或社媒当成官方政策结论。'

const XHS_FEWSHOT = [
  {
    draftTitle: '英国毕业签要变?先别慌📌',
    draftBody: '姐妹们先码住别划走⚠️\n最近后台被问爆：英国毕业生签证(PSW)到底还能不能用？\n\n我把官方页面翻了一遍，给你说人话👇\n\n1️⃣ 现在官方写的还是现行规则，没让你今天就慌\n2️⃣ 真正影响你的是“适用对象+递交时间”，不是网上那些二手截图\n3️⃣ 政策这种东西只认官方原文，博主说的(包括我)都只能当参考\n\n所以现在最该做的不是焦虑，是：\n✅ 打开官方原文，确认自己属于哪一类\n✅ 把入学时间、递交节点标进日历\n✅ 拿不准的直接找学校或顾问核对一遍\n\n留学最贵的成本从来不是钱，是信息差🥹\n在准备英国的扣个1，我看看人多不多~\n（政策以官方为准，本文不构成录取或签证结果承诺）',
    coverText: '英国毕业签别慌',
    tags: ['英国留学', '英国签证', '留学政策', 'PSW', '留学避坑'],
    summary: '英国官方页面更新了毕业生签证相关信息，适合做成提醒型避坑内容。',
    impact: ['毕业签是英国留学决策的高频焦虑点，互动率高', '政策类内容收藏价值高、长尾稳', '能自然引导咨询，转化路径短'],
    checks: ['标题里的“要变”需回原文确认是否真有变动，避免标题党失实', '所有签证适用条件以 GOV.UK 原文为准', '不得承诺任何过签结果']
  },
  {
    draftTitle: '港校申请别只看排名!学姐劝退',
    draftBody: '每年都有人栽在“只看排名”上，今年别再做这个冤大头了🙅‍♀️\n\n港校申请，比排名更要命的是这几点👇\n\n1️⃣ 同一所学校不同专业，难度天差地别，别拿综排骗自己\n2️⃣ 申请轮次很关键，晚一轮可能位置就没了\n3️⃣ 材料(成绩单/语言/文书)卡时间，比你想象中更容易翻车\n\n现在马上做这3件事：\n✅ 打开目标专业官网，核对最新申请要求\n✅ 把冲刺/匹配/稳妥三档学校重新排一遍\n✅ 语言没出分的，先把考试时间锁死\n\n选校这事，信息差就是分数差📈\n在看港校的姐妹评论区扣“港”，拉你进梯队~\n（具体要求以各校官网为准）',
    coverText: '港校别只看排名',
    tags: ['香港留学', '港校申请', '选校建议', '留学申请', '研究生申请'],
    summary: '提醒申请者港校选校不能只看排名，按专业和轮次重新规划。',
    impact: ['选校是申请季强需求，受众广', '“劝退/避坑”角度天然高互动', '便于引导一对一选校咨询'],
    checks: ['不点名贬低任何具体学校', '申请轮次和材料要求需以各校官网为准', '不承诺录取结果']
  }
]

function resolveTemperature(): number {
  const raw = process.env.LLM_TEMPERATURE
  if (raw === undefined || raw === '') return 0.8
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0.8
}

export function getLlmState(options: AgentOptions = {}): LlmState {
  const apiKey = options.apiKey || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY
  const disabled = Boolean(options.disableLlm || process.env.DISABLE_LLM === '1')
  const baseUrl = normalizeLlmBaseUrl(process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1')
  const provider = process.env.LLM_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai-compatible' : 'custom-compatible')
  const model = options.model || process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'

  return {
    enabled: Boolean(apiKey && !disabled),
    ...(apiKey ? { apiKey } : {}),
    provider,
    baseUrl,
    chatCompletionsUrl: `${baseUrl}/chat/completions`,
    model
  }
}

export interface GenerateOptions {
  style?: string
  variant?: number | string
  temperature?: number
  fix?: string[]
}

function fixDirective(fix?: string[]): string {
  const list = (fix || []).map(text => String(text).trim()).filter(Boolean).slice(0, 8)
  if (!list.length) return ''
  return `这是对上一版草稿的定向修正。请保持事实不变，但必须修好以下问题：${list.join('；')}。`
}

export const XHS_STYLE_DIRECTIVES: Record<string, string> = {
  default: '',
  punchy: '风格更冲、更像爆款：开场钩子更狠，emoji 更密集，多用短句和感叹，制造紧迫感和“再不看就晚了”的情绪。',
  warm: '风格更温柔共情：像贴心学姐在安慰人，语气软、有陪伴感，少一点冲，多一点理解，让人觉得被接住了。',
  pro: '风格更专业稳重：像资深留学顾问，emoji 克制（全文不超过4个），逻辑清楚、条理分明，少网络梗，但仍然口语、不要官方通报腔。',
  story: '用第一人称小故事或踩坑经历开场（“我当年/我有个学妹…”），代入感强，再自然带出干货。'
}

function styleDirective(style?: string): string {
  if (!style) return ''
  return XHS_STYLE_DIRECTIVES[style] || ''
}

function variantHint(variant?: number | string): string {
  if (variant === undefined || variant === '' || variant === 0) return ''
  return '这是同一条素材的重写版本，请换一个全新的开场钩子、标题角度和分点切入方式，不要和常规写法雷同，但事实依据保持一致。'
}

function buildFullPrompt(item: SourceItem, options: GenerateOptions): string {
  const directive = styleDirective(options.style)
  const variant = variantHint(options.variant)
  const fix = fixDirective(options.fix)
  return JSON.stringify({
    task: '基于下面这条真实来源，写一篇可以直接发小红书的留学图文笔记。只返回 JSON，不要任何解释或代码块标记。',
    persona: XHS_PERSONA,
    writing_rules: XHS_WRITING_RULES,
    title_formulas: XHS_TITLE_FORMULAS,
    body_structure: XHS_BODY_STRUCTURE,
    hard_limits: XHS_HARD_LIMITS,
    ...(directive ? { style_directive: directive } : {}),
    ...(variant ? { variant_hint: variant } : {}),
    ...(fix ? { fix_directives: fix } : {}),
    style_reference_examples: XHS_FEWSHOT,
    required_schema: {
      draftTitle: '小红书标题, 不超过20字, 用 title_formulas 里的钩子, 可带1~2个 emoji',
      draftBody: '小红书正文, 严格按 body_structure 写, 多段, 用 emoji 起头分点, 口语化, 250~550字, 段落之间用换行分隔',
      coverText: '封面大字, 不超过10字, 一句能戳人的钩子',
      tags: ['小红书话题词, 不带#号, 5~8个, 贴合地区和选题'],
      summary: '一句话信息摘要, 给运营看的, 不是发布文案',
      impact: ['运营视角: 这条为什么值得做成内容', '...', '共3条'],
      checks: ['发布前的人工核验点, 比如要回原文核对的事实', '...', '共3条']
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
      rawText: truncate(item.rawText || '', 1200)
    }
  })
}

export async function generateWithLlm(
  item: SourceItem,
  llmState: LlmState,
  options: GenerateOptions = {}
): Promise<GeneratedDraft> {
  if (!llmState.apiKey) {
    throw new Error('LLM api key is missing')
  }
  const temperature = options.temperature ?? resolveTemperature()
  const content = await requestChat(llmState, buildFullPrompt(item, options), temperature)
  return normalizeGenerated(JSON.parse(extractJson(content)), item)
}

/**
 * 只重写标题与封面大字，输出短、调用快，用于前端「只换标题」按钮。
 */
export async function generateTitleOnly(
  item: SourceItem,
  llmState: LlmState,
  options: GenerateOptions = {}
): Promise<{ draftTitle: string; coverText: string }> {
  if (!llmState.apiKey) {
    throw new Error('LLM api key is missing')
  }

  const directive = styleDirective(options.style)
  const prompt = {
    task: '只为下面这条留学素材重写小红书标题和封面大字，换一个更抓人的角度。只返回 JSON：{"draftTitle": "...", "coverText": "..."}。',
    persona: XHS_PERSONA,
    title_formulas: XHS_TITLE_FORMULAS,
    hard_limits: XHS_HARD_LIMITS,
    requirements: 'draftTitle 不超过20字、可带1~2个emoji、用钩子公式；coverText 不超过10字、一句戳人的话。不要标题党失实，事实以来源为准。',
    ...(directive ? { style_directive: directive } : {}),
    variant_hint: '换一个和常规完全不同的新角度，别重复老套路。',
    source_item: {
      title: item.title,
      sourceName: item.sourceName,
      region: item.region,
      summary: truncate(item.summary || item.rawText || item.title, 400)
    }
  }

  const temperature = options.temperature ?? Math.max(resolveTemperature(), 0.9)
  const content = await requestChat(llmState, JSON.stringify(prompt), temperature)
  const parsed = JSON.parse(extractJson(content)) as Record<string, unknown>
  const fallback = generateWithRules(item)
  return {
    draftTitle: truncate(cleanText(String(parsed.draftTitle || '')) || fallback.draftTitle, 28),
    coverText: truncate(cleanText(String(parsed.coverText || '')) || fallback.coverText, 16)
  }
}

async function requestChat(llmState: LlmState, userContent: string, temperature: number): Promise<string> {
  const controller = new AbortController()
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 45000)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
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
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: XHS_SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ]
      })
    })
  } catch (error) {
    const detail = error instanceof Error && error.name === 'AbortError'
      ? `timeout after ${timeoutMs}ms`
      : error instanceof Error ? error.message : String(error)
    throw new Error(`LLM request failed: ${detail}`)
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`LLM ${response.status} ${response.statusText}: ${truncate(errorText, 180)}`)
  }

  const json = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return json.choices?.[0]?.message?.content || ''
}

function normalizeLlmBaseUrl(value: string): string {
  return String(value || 'https://api.openai.com/v1')
    .replace(/\/+$/, '')
    .replace(/\/chat\/completions$/i, '')
}

function extractJson(value: string): string {
  const text = String(value || '').trim()
  if (text.startsWith('{')) return text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match?.[0]) throw new Error('LLM response did not contain JSON')
  return match[0]
}

export interface GenerateOneOptions extends GenerateOptions {
  mode?: 'full' | 'title'
  disableLlm?: boolean
  apiKey?: string
}

export interface GenerateOneResult {
  mode: 'full' | 'title'
  source: 'llm' | 'rules'
  draft: GeneratedDraft | { draftTitle: string; coverText: string }
  warning?: string
}

/**
 * 单篇即时生成：供前端「再来一版 / 换风格 / 只换标题」调用。
 * LLM 优先，失败或未配置 key 时用规则兜底，永远返回可用结果。
 */
export async function generateOne(item: SourceItem, options: GenerateOneOptions = {}): Promise<GenerateOneResult> {
  const mode = options.mode === 'title' ? 'title' : 'full'
  const llmState = getLlmState({
    ...(options.apiKey ? { apiKey: options.apiKey } : {}),
    ...(options.disableLlm !== undefined ? { disableLlm: options.disableLlm } : {})
  })
  const seed = String(options.variant ?? Date.now())
  const genOptions: GenerateOptions = {
    ...(options.style ? { style: options.style } : {}),
    variant: options.variant ?? seed,
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.fix && options.fix.length ? { fix: options.fix } : {})
  }

  if (mode === 'title') {
    if (llmState.enabled) {
      try {
        return { mode, source: 'llm', draft: await generateTitleOnly(item, llmState, genOptions) }
      } catch (error) {
        const rules = generateWithRules(item, { variantSeed: seed })
        return {
          mode,
          source: 'rules',
          draft: { draftTitle: rules.draftTitle, coverText: rules.coverText },
          warning: error instanceof Error ? error.message : String(error)
        }
      }
    }
    const rules = generateWithRules(item, { variantSeed: seed })
    return { mode, source: 'rules', draft: { draftTitle: rules.draftTitle, coverText: rules.coverText } }
  }

  if (llmState.enabled) {
    try {
      return { mode, source: 'llm', draft: await generateWithLlm(item, llmState, genOptions) }
    } catch (error) {
      return {
        mode,
        source: 'rules',
        draft: generateWithRules(item, { variantSeed: seed }),
        warning: error instanceof Error ? error.message : String(error)
      }
    }
  }
  return { mode, source: 'rules', draft: generateWithRules(item, { variantSeed: seed }) }
}

// ---- 流式生成 ----

/**
 * 从尚未结束的 JSON 文本里，尽力取出某个字符串字段的当前值（用于边生成边显示正文）。
 * 容忍未闭合的引号；处理 \n \" \\ \uXXXX 转义。
 */
export function extractPartialJsonString(buffer: string, key: string): string {
  const marker = `"${key}"`
  const at = buffer.indexOf(marker)
  if (at === -1) return ''
  let i = buffer.indexOf('"', at + marker.length)
  if (i === -1) return ''
  i += 1
  let out = ''
  while (i < buffer.length) {
    const ch = buffer[i]
    if (ch === '\\') {
      const next = buffer[i + 1]
      if (next === undefined) break
      if (next === 'n') out += '\n'
      else if (next === 't') out += '\t'
      else if (next === 'r') out += '\r'
      else if (next === 'u') {
        const hex = buffer.slice(i + 2, i + 6)
        if (hex.length < 4) break
        out += String.fromCharCode(parseInt(hex, 16))
        i += 6
        continue
      } else out += next
      i += 2
      continue
    }
    if (ch === '"') break
    out += ch
    i += 1
  }
  return out
}

/**
 * 流式调用 LLM。每收到一段增量就回调当前累计的完整文本，最后返回完整内容。
 */
async function streamChat(
  llmState: LlmState,
  userContent: string,
  temperature: number,
  onContent: (full: string) => void
): Promise<string> {
  const controller = new AbortController()
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 45000)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
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
        temperature,
        stream: true,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: XHS_SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ]
      })
    })
  } catch (error) {
    clearTimeout(timeout)
    const detail = error instanceof Error && error.name === 'AbortError'
      ? `timeout after ${timeoutMs}ms`
      : error instanceof Error ? error.message : String(error)
    throw new Error(`LLM stream request failed: ${detail}`)
  }

  if (!response.ok || !response.body) {
    clearTimeout(timeout)
    const errorText = await response.text().catch(() => '')
    throw new Error(`LLM ${response.status} ${response.statusText}: ${truncate(errorText, 180)}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
          const piece = json.choices?.[0]?.delta?.content
          if (piece) {
            full += piece
            onContent(full)
          }
        } catch {
          // 跨 chunk 截断的行，忽略
        }
      }
    }
  } finally {
    clearTimeout(timeout)
  }
  return full
}

export interface StreamOneResult {
  source: 'llm'
  draft: GeneratedDraft
}

/**
 * 流式版的单篇生成（仅 full 模式）。边生成边把正文增量回调给 onBody。
 * 不做规则兜底——流式失败时由调用方回退到非流式 generateOne。
 */
export async function streamOne(
  item: SourceItem,
  options: GenerateOneOptions,
  onBody: (partialBody: string) => void
): Promise<StreamOneResult> {
  const llmState = getLlmState({
    ...(options.apiKey ? { apiKey: options.apiKey } : {}),
    ...(options.disableLlm !== undefined ? { disableLlm: options.disableLlm } : {})
  })
  if (!llmState.enabled) throw new Error('LLM not enabled')

  const genOptions: GenerateOptions = {
    ...(options.style ? { style: options.style } : {}),
    variant: options.variant ?? Date.now(),
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.fix && options.fix.length ? { fix: options.fix } : {})
  }
  const temperature = genOptions.temperature ?? resolveTemperature()

  let lastBody = ''
  const full = await streamChat(llmState, buildFullPrompt(item, genOptions), temperature, content => {
    const body = extractPartialJsonString(content, 'draftBody')
    if (body && body !== lastBody) {
      lastBody = body
      onBody(body)
    }
  })
  return { source: 'llm', draft: normalizeGenerated(JSON.parse(extractJson(full)), item) }
}
