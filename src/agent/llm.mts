import type { AgentOptions, GeneratedDraft, LlmState, SourceItem } from './types.mjs'
import { normalizeGenerated } from './rules.mjs'
import { truncate } from './text.mjs'

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

export async function generateWithLlm(item: SourceItem, llmState: LlmState): Promise<GeneratedDraft> {
  if (!llmState.apiKey) {
    throw new Error('LLM api key is missing')
  }

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
      rawText: truncate(item.rawText || '', 900)
    }
  }

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
  const content = json.choices?.[0]?.message?.content || ''
  return normalizeGenerated(JSON.parse(extractJson(content)), item)
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
