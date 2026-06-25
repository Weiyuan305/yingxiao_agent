import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAll } from './scripts/collect.mjs'
import { buildIntelligence } from './scripts/agent.mjs'
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
