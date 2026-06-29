import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAll } from './scripts/collect.mjs'
import { buildIntelligence, generateOne, streamOne, factCheck } from './scripts/agent.mjs'
import { loadLocalEnv } from './scripts/env.mjs'

await loadLocalEnv()

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'
const refreshIntervalHours = Number(process.env.REFRESH_INTERVAL_HOURS || 24)
let collecting = false

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

    if (url.pathname === '/api/health') {
      return sendJson(response, {
        ok: true,
        mode: 'node-server',
        now: new Date().toISOString(),
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY),
        hasXBearerToken: Boolean(process.env.X_BEARER_TOKEN)
      })
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

function sendJson(response, payload) {
  response.writeHead(200, {
    'content-type': 'application/json;charset=utf-8',
    'cache-control': 'no-store'
  })
  response.end(JSON.stringify(payload))
}
