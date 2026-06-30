import type { SourceItem } from './types.mjs'

export interface FactDetail {
  value: string
  kind: string
  found: boolean
  snippet: string
}

export interface FactCheckResult {
  ok: boolean
  checked: number
  flagged: Array<{ value: string; kind: string }>
  details: FactDetail[]
}

type FactSource = Pick<SourceItem, 'rawText' | 'summary' | 'title'>

// 只盯“一旦编造就会造成实际伤害”的高风险数字，刻意不抓“做3件事/2点”这类口语序数，避免噪声。
const FACT_PATTERNS: Array<{ kind: string; re: RegExp }> = [
  { kind: 'percent', re: /\d+(?:\.\d+)?\s*%/g },
  { kind: 'money', re: /(?:£|\$|¥|HK\$|S\$|US\$|€|RMB)\s?\d[\d,]*(?:\.\d+)?/gi },
  { kind: 'money', re: /\d[\d,]*(?:\.\d+)?\s*(?:万|亿)?(?:英镑|镑|港币|港元|新币|新元|美元|欧元|人民币)/g },
  { kind: 'year', re: /20\d{2}/g },
  { kind: 'rank', re: /(?:前|top|第)\s?\d+/gi },
  { kind: 'quota', re: /\d[\d,]*\s*(?:个名额|名额|席位|个学位|学额)/g },
  { kind: 'score', re: /\d+(?:\.\d+)?\s*(?:分|绩点|gpa)/gi }
]

// 全角数字转半角，便于和来源里的数字比对。
function toHalfWidthDigits(value: string): string {
  return String(value || '').replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
}

function digitsOnly(value: string): string {
  return toHalfWidthDigits(value).replace(/[^0-9]/g, '')
}

/**
 * 检查正文里的高风险数字是否能在来源原文中找到。
 * 找不到的标记出来，提示人工核对——是“辅助提醒”，不是“判定为错”。
 */
// 在来源原文里定位某个数字，截取一段可读的上下文作为"引用证据"。
function findSnippet(normSource: string, value: string): string {
  const lower = normSource.toLowerCase()
  let index = lower.indexOf(value.toLowerCase())
  let hay = normSource
  if (index < 0) {
    const stripped = normSource.replace(/[,\s]/g, '')
    const core = digitsOnly(value)
    if (core.length >= 2) {
      const ci = stripped.indexOf(core)
      if (ci >= 0) { hay = stripped; index = ci }
    }
  }
  if (index < 0) return ''
  const start = Math.max(0, index - 24)
  const end = Math.min(hay.length, index + value.length + 24)
  const slice = hay.slice(start, end).replace(/\s+/g, ' ').trim()
  return `${start > 0 ? '…' : ''}${slice}${end < hay.length ? '…' : ''}`
}

export function factCheck(body: string, source: FactSource): FactCheckResult {
  const sourceRaw = `${source.title || ''}\n${source.summary || ''}\n${source.rawText || ''}`
  const normSource = toHalfWidthDigits(sourceRaw)
  const sourceDigits = digitsOnly(sourceRaw)
  const sourceLower = normSource.toLowerCase()

  const seen = new Set<string>()
  const tokens: Array<{ value: string; kind: string }> = []
  for (const { kind, re } of FACT_PATTERNS) {
    const matches = String(body || '').match(re) || []
    for (const match of matches) {
      const value = match.trim().replace(/\s+/g, '')
      if (!value || seen.has(value)) continue
      seen.add(value)
      tokens.push({ value, kind })
    }
  }

  const details: FactDetail[] = []
  const flagged: Array<{ value: string; kind: string }> = []
  for (const token of tokens) {
    const core = digitsOnly(token.value)
    const found = core.length >= 2
      ? sourceDigits.includes(core)
      : sourceLower.includes(token.value.toLowerCase())
    details.push({ value: token.value, kind: token.kind, found, snippet: found ? findSnippet(normSource, token.value) : '' })
    if (!found) flagged.push({ value: token.value, kind: token.kind })
  }

  return { ok: flagged.length === 0, checked: tokens.length, flagged, details }
}

export const FACT_KIND_LABELS: Record<string, string> = {
  percent: '百分比',
  money: '金额',
  year: '年份',
  rank: '排名',
  quota: '名额',
  score: '分数'
}
