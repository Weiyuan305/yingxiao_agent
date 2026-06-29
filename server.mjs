import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import { collectAll } from './scripts/collect.mjs'
import { buildIntelligence, generateOne, streamOne, factCheck } from './scripts/agent.mjs'
import { loadLocalEnv } from './scripts/env.mjs'
import { createRepository, DRAFT_STATUSES, DRAFT_STATUS_LABELS } from './scripts/store.mjs'
import { createRateLimiter, safeEqual } from './scripts/security.mjs'

await loadLocalEnv()

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'
const refreshIntervalHours = Number(process.env.REFRESH_INTERVAL_HOURS || 24)
let collecting = false

// ---- 安全：鉴权（默认 OFF）+ 限流 + 用量统计 ----
const appToken = String(process.env.APP_TOKEN || '').trim()
const authRequired = appToken.length > 0
if (!authRequired) {
  console.warn('⚠ APP_TOKEN 未设置：/api 接口未鉴权（本机开发可用；对外/多人前请设置 APP_TOKEN）。')
}
const rateLimitPerMin = Number(process.env.RATE_LIMIT_PER_MIN || 20)
const generateLimiter = createRateLimiter({ max: Math.max(1, rateLimitPerMin), windowMs: 60_000 })
const usagePath = path.join(rootDir, 'data', 'usage.json')
const usage = await loadUsage()

function clientIp(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || request.socket?.remoteAddress || 'unknown'
}

function isAuthorized(request) {
  if (!authRequired) return true
  const header = String(request.headers['authorization'] || '')
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
  const provided = bearer || String(request.headers['x-app-token'] || '')
  return Boolean(provided) && safeEqual(provided, appToken)
}

async function loadUsage() {
  try {
    const parsed = JSON.parse(await readFile(usagePath, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

let usageWriteTimer = null
function recordUsage(endpoint) {
  const day = new Date().toISOString().slice(0, 10)
  usage[day] = usage[day] || {}
  usage[day][endpoint] = (usage[day][endpoint] || 0) + 1
  clearTimeout(usageWriteTimer)
  usageWriteTimer = setTimeout(() => {
    writeFile(usagePath, JSON.stringify(usage, null, 2)).catch(() => {})
  }, 1000)
}

const repo = createRepository(path.join(rootDir, 'data', 'store.json'))
// 启动时用现有 intelligence.json 建档（已存在的只补空、不覆盖）。
await seedDraftsFromIntelligence().catch(error => console.error(`seed drafts failed: ${error.message}`))

async function seedDraftsFromIntelligence() {
  try {
    const intelligence = await readJson(path.join(rootDir, 'data', 'intelligence.json'))
    const items = Array.isArray(intelligence.items) ? intelligence.items : []
    const created = await repo.seedFromSources(items)
    if (created) console.log(`Seeded ${created} new drafts into store.`)
  } catch {
    // intelligence.json 还没生成时跳过
  }
}

const mimeTypes = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml;charset=utf-8',
  '.txt': 'text/plain;charset=utf-8'
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`)

    // health 永远开放，前端据此知道是否需要 token
    if (url.pathname === '/api/health') {
      return sendJson(response, {
        ok: true,
        mode: 'node-server',
        now: new Date().toISOString(),
        authRequired,
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY),
        hasXBearerToken: Boolean(process.env.X_BEARER_TOKEN)
      })
    }

    // 其余 /api/* 需要鉴权（默认 OFF）
    if (url.pathname.startsWith('/api/') && !isAuthorized(request)) {
      return sendJson(response, { ok: false, code: 'unauthorized', message: '需要有效的访问令牌' }, 401)
    }

    // 生成类端点按 IP 限流，防止 token 被刷
    if (url.pathname === '/api/generate' || url.pathname === '/api/generate/stream') {
      const verdict = generateLimiter.check(clientIp(request))
      if (!verdict.allowed) {
        response.writeHead(429, {
          'content-type': 'application/json;charset=utf-8',
          'retry-after': String(Math.ceil(verdict.retryAfterMs / 1000))
        })
        return response.end(JSON.stringify({ ok: false, code: 'rate_limited', message: `请求过于频繁，请 ${Math.ceil(verdict.retryAfterMs / 1000)} 秒后再试` }))
      }
      recordUsage(url.pathname === '/api/generate/stream' ? 'stream' : 'generate')
    }
    if (url.pathname === '/api/factcheck') recordUsage('factcheck')

    if (url.pathname === '/api/usage' && request.method === 'GET') {
      return sendJson(response, { ok: true, usage })
    }

    if (url.pathname === '/api/sources') {
      const sources = await readJson(path.join(rootDir, 'config', 'sources.json'))
      return sendJson(response, sources)
    }

    if (url.pathname === '/api/intelligence') {
      const intelligence = await readJson(path.join(rootDir, 'data', 'intelligence.json'))
      return sendJson(response, intelligence)
    }

    if (url.pathname === '/api/collect/run' && request.method === 'POST') {
      if (collecting) {
        response.writeHead(409, { 'content-type': 'application/json;charset=utf-8' })
        return response.end(JSON.stringify({ ok: false, message: 'collection already running' }))
      }

      collecting = true
      try {
        const { collected, intelligence } = await runRefresh()
        await repo.seedFromSources(Array.isArray(intelligence.items) ? intelligence.items : [])
        return sendJson(response, {
          ok: true,
          collected: collected.meta,
          meta: intelligence.meta,
          sources: intelligence.sources,
          items: intelligence.items
        })
      } finally {
        collecting = false
      }
    }

    // ---- 草稿生命周期 drafts ----
    if (url.pathname === '/api/drafts' && request.method === 'GET') {
      const status = url.searchParams.get('status') || undefined
      const drafts = await repo.list(status ? { status } : {})
      return sendJson(response, { ok: true, drafts, statuses: DRAFT_STATUSES, labels: DRAFT_STATUS_LABELS })
    }

    if (url.pathname === '/api/drafts/sync' && request.method === 'POST') {
      const body = await readJsonBody(request)
      const records = Array.isArray(body.records) ? body.records : []
      const merged = await repo.syncFromClient(records)
      return sendJson(response, { ok: true, merged })
    }

    const draftMatch = url.pathname.match(/^\/api\/drafts\/([^/]+)(\/(transition|events))?$/)
    if (draftMatch) {
      const id = decodeURIComponent(draftMatch[1])
      const sub = draftMatch[3]

      if (!sub && request.method === 'GET') {
        const draft = await repo.get(id)
        if (!draft) return sendJson(response, { ok: false, message: 'draft not found' }, 404)
        return sendJson(response, { ok: true, draft })
      }

      if (!sub && request.method === 'PATCH') {
        const body = await readJsonBody(request)
        const draft = await repo.patch(id, sanitizeDraftPatch(body))
        if (!draft) return sendJson(response, { ok: false, message: 'draft not found' }, 404)
        return sendJson(response, { ok: true, draft })
      }

      if (sub === 'transition' && request.method === 'POST') {
        const body = await readJsonBody(request)
        const result = await repo.transition(id, String(body.to || ''))
        return sendJson(response, result.ok ? { ok: true, draft: result.draft } : { ok: false, reason: result.reason })
      }

      if (sub === 'events' && request.method === 'GET') {
        const events = await repo.events(id)
        return sendJson(response, { ok: true, events })
      }
    }

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      const body = await readJsonBody(request)
      const sourceItem = await resolveSourceItem(body)
      if (!sourceItem) {
        response.writeHead(400, { 'content-type': 'application/json;charset=utf-8' })
        return response.end(JSON.stringify({ ok: false, code: 'bad_request', message: 'missing id or item payload' }))
      }

      const mode = body.mode === 'title' ? 'title' : 'full'
      const baseOptions = {
        mode,
        ...(body.style ? { style: String(body.style) } : {}),
        ...(Number.isFinite(Number(body.temperature)) ? { temperature: Number(body.temperature) } : {}),
        ...(Array.isArray(body.fix) && body.fix.length ? { fix: body.fix.map(String) } : {})
      }

      const count = Math.min(Math.max(Number(body.count) || 1, 1), 4)
      if (count > 1 && mode === 'full') {
        const rotation = ['default', 'punchy', 'warm', 'pro', 'story']
        const variants = await Promise.all(
          Array.from({ length: count }, (_, index) => generateOne(sourceItem, {
            ...baseOptions,
            variant: `${Date.now()}-${index}`,
            ...(body.style ? {} : { style: rotation[index % rotation.length] })
          }))
        )
        return sendJson(response, {
          ok: true,
          mode,
          variants: variants.map((result, index) => ({
            style: body.style || rotation[index % rotation.length],
            source: result.source,
            draft: result.draft,
            factCheck: factCheckDraft(result.draft, sourceItem),
            ...(result.warning ? { warning: result.warning } : {})
          }))
        })
      }

      const result = await generateOne(sourceItem, {
        ...baseOptions,
        ...(body.variant !== undefined ? { variant: body.variant } : {})
      })
      return sendJson(response, { ok: true, ...result, factCheck: factCheckDraft(result.draft, sourceItem) })
    }

    if (url.pathname === '/api/generate/stream' && request.method === 'POST') {
      const body = await readJsonBody(request)
      const sourceItem = await resolveSourceItem(body)
      if (!sourceItem) {
        response.writeHead(400, { 'content-type': 'application/json;charset=utf-8' })
        return response.end(JSON.stringify({ ok: false, code: 'bad_request', message: 'missing id or item payload' }))
      }
      response.writeHead(200, {
        'content-type': 'text/event-stream;charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive'
      })
      const send = obj => response.write(`data: ${JSON.stringify(obj)}\n\n`)
      try {
        const result = await streamOne(sourceItem, {
          mode: 'full',
          ...(body.style ? { style: String(body.style) } : {}),
          ...(Number.isFinite(Number(body.temperature)) ? { temperature: Number(body.temperature) } : {}),
          ...(Array.isArray(body.fix) && body.fix.length ? { fix: body.fix.map(String) } : {}),
          ...(body.variant !== undefined ? { variant: body.variant } : {})
        }, partialBody => send({ type: 'delta', body: partialBody }))
        send({ type: 'done', source: result.source, draft: result.draft, factCheck: factCheckDraft(result.draft, sourceItem) })
      } catch (error) {
        send({ type: 'error', message: error.message })
      }
      return response.end()
    }

    if (url.pathname === '/api/factcheck' && request.method === 'POST') {
      const body = await readJsonBody(request)
      const sourceItem = await resolveSourceItem(body)
      if (!sourceItem) {
        response.writeHead(400, { 'content-type': 'application/json;charset=utf-8' })
        return response.end(JSON.stringify({ ok: false, code: 'bad_request', message: 'missing id or item payload' }))
      }
      return sendJson(response, { ok: true, factCheck: factCheck(String(body.draftBody || ''), sourceItem) })
    }

    if (url.pathname.startsWith('/api/')) {
      response.writeHead(404, { 'content-type': 'application/json;charset=utf-8' })
      return response.end(JSON.stringify({ ok: false, message: 'not found' }))
    }

    return serveStatic(url.pathname, response)
  } catch (error) {
    response.writeHead(500, { 'content-type': 'application/json;charset=utf-8' })
    response.end(JSON.stringify({ ok: false, message: error.message }))
  }
})

server.listen(port, host, () => {
  console.log(`StudyAgent server running at http://localhost:${port}/`)
  if (refreshIntervalHours > 0) {
    console.log(`Auto refresh scheduled every ${refreshIntervalHours} hour(s).`)
  }
})

if (refreshIntervalHours > 0) {
  setInterval(async () => {
    if (collecting) return
    collecting = true
    try {
      const { intelligence } = await runRefresh()
      console.log(`Auto refresh complete: ${intelligence.meta.itemCount} cards at ${intelligence.meta.generatedAt}`)
    } catch (error) {
      console.error(`Auto refresh failed: ${error.message}`)
    } finally {
      collecting = false
    }
  }, refreshIntervalHours * 60 * 60 * 1000)
}

async function serveStatic(pathname, response) {
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1))
  const filePath = path.normalize(path.join(rootDir, relativePath))

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403)
    return response.end('Forbidden')
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) throw new Error('not a file')
    const ext = path.extname(filePath)
    response.writeHead(200, {
      'content-type': mimeTypes[ext] || 'application/octet-stream'
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain;charset=utf-8' })
    response.end('Not found')
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

// 只对带正文的草稿做数字核对（title 模式没有正文）。
function factCheckDraft(draft, sourceItem) {
  if (!draft || typeof draft.draftBody !== 'string' || !draft.draftBody) return null
  return factCheck(draft.draftBody, sourceItem)
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let data = ''
    let size = 0
    request.on('data', chunk => {
      size += chunk.length
      if (size > 1_000_000) {
        reject(new Error('request body too large'))
        request.destroy()
        return
      }
      data += chunk
    })
    request.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (error) {
        reject(new Error(`invalid JSON body: ${error.message}`))
      }
    })
    request.on('error', reject)
  })
}

// 优先用 collected.json 里的原始素材（含 rawText，质量更好）；
// 找不到时，用前端传来的字段重建一个最小可用的 SourceItem。
async function resolveSourceItem(body = {}) {
  const id = body.id || body.item?.id
  if (id) {
    try {
      const collected = await readJson(path.join(rootDir, 'data', 'collected.json'))
      const items = Array.isArray(collected) ? collected : collected.items || []
      const found = items.find(entry => entry.id === id)
      if (found) return found
    } catch {
      // collected.json 不存在或损坏时，回退到前端字段
    }
  }

  const item = body.item
  if (!item || !(item.title || item.draftTitle)) return null
  return {
    id: item.id || `live-${Date.now()}`,
    sourceId: item.sourceId || 'live',
    sourceName: item.source || item.sourceName || '来源',
    sourceType: item.sourceType || 'news',
    sourceTypeLabel: item.sourceType || item.sourceTypeLabel || '资讯',
    region: item.region || 'UK',
    topics: Array.isArray(item.topics) ? item.topics : [],
    trustLevel: item.sourceTrustLevel || item.trustLevel || 'unknown',
    title: item.title || item.draftTitle || '',
    url: item.sourceUrl || item.url || '',
    publishedAt: item.publishedAt || '',
    fetchedAt: item.fetchedAt || '',
    summary: item.summary || '',
    rawText: item.rawText || item.summary || ''
  }
}

async function runRefresh() {
  const collected = await collectAll()
  const intelligence = await buildIntelligence()
  return { collected, intelligence }
}

function sendJson(response, payload, statusCode = 200) {
  response.writeHead(statusCode, {
    'content-type': 'application/json;charset=utf-8',
    'cache-control': 'no-store'
  })
  response.end(JSON.stringify(payload))
}

// 只接受白名单字段；状态必须走 transition，不能从 PATCH 改。
const DRAFT_PATCH_FIELDS = [
  'draftTitle', 'draftBody', 'coverText', 'tags', 'privateMessageCta', 'coverStyle',
  'quality', 'factCheck', 'assignee', 'reviewNote', 'publish', 'metrics', 'verification'
]
function sanitizeDraftPatch(body = {}) {
  const patch = {}
  for (const key of DRAFT_PATCH_FIELDS) {
    if (body[key] !== undefined) patch[key] = body[key]
  }
  return patch
}
