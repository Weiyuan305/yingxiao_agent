import crypto from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadLocalEnv } from './env.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcesPath = path.join(rootDir, 'config', 'sources.json')
const dataDir = path.join(rootDir, 'data')
const rawDir = path.join(dataDir, 'raw')

const defaultHeaders = {
  accept: 'application/rss+xml, application/atom+xml, application/json, text/html;q=0.9, */*;q=0.8',
  'user-agent': 'StudyAgent/0.1 (+https://localhost; contact: local-mvp)'
}

export async function collectAll(options = {}) {
  await loadLocalEnv()
  const startedAt = new Date().toISOString()
  const sources = await loadSources(options.sourcesFile || sourcesPath)
  const enabledSources = sources.filter(source => source.enabled !== false)
  const allItems = []
  const sourceStatuses = []

  await mkdir(rawDir, { recursive: true })

  for (const source of enabledSources) {
    const sourceStartedAt = new Date().toISOString()
    try {
      const result = await fetchSource(source, options)
      const rawFile = path.join(rawDir, `${safeStamp(sourceStartedAt)}-${source.id}.json`)
      await writeJson(rawFile, {
        source,
        fetchedAt: new Date().toISOString(),
        skipped: Boolean(result.skipped),
        raw: result.raw ?? null,
        items: result.items
      })

      allItems.push(...result.items)
      sourceStatuses.push({
        id: source.id,
        name: source.name,
        type: source.type,
        region: source.region,
        url: source.type === 'x_recent_search' ? 'https://x.com/search' : source.url,
        sourceTypeLabel: source.sourceTypeLabel || source.type,
        trustLevel: source.trustLevel || 'unknown',
        ok: !result.skipped,
        skipped: Boolean(result.skipped),
        itemCount: result.items.length,
        message: result.message || 'ok',
        fetchedAt: new Date().toISOString()
      })
    } catch (error) {
      sourceStatuses.push({
        id: source.id,
        name: source.name,
        type: source.type,
        region: source.region,
        url: source.type === 'x_recent_search' ? 'https://x.com/search' : source.url,
        sourceTypeLabel: source.sourceTypeLabel || source.type,
        trustLevel: source.trustLevel || 'unknown',
        ok: false,
        skipped: false,
        itemCount: 0,
        message: error.message,
        fetchedAt: new Date().toISOString()
      })
    }
  }

  const minScore = Number(options.minScore ?? process.env.MIN_RELEVANCE_SCORE ?? 35)
  const dedupedItems = dedupeItems(allItems)
    .filter(item => item.relevanceScore >= minScore)
    .sort((a, b) => {
      const byScore = b.relevanceScore - a.relevanceScore
      if (byScore !== 0) return byScore
      return new Date(b.publishedAt || b.fetchedAt) - new Date(a.publishedAt || a.fetchedAt)
    })

  const payload = {
    meta: {
      mode: 'real-collector',
      startedAt,
      finishedAt: new Date().toISOString(),
      minScore,
      sourceCount: enabledSources.length,
      successfulSourceCount: sourceStatuses.filter(status => status.ok).length,
      skippedSourceCount: sourceStatuses.filter(status => status.skipped).length,
      failedSourceCount: sourceStatuses.filter(status => !status.ok && !status.skipped).length,
      rawItemCount: allItems.length,
      itemCount: dedupedItems.length
    },
    sources: sourceStatuses,
    items: dedupedItems
  }

  await mkdir(dataDir, { recursive: true })
  await writeJson(path.join(dataDir, 'collected.json'), payload)
  return payload
}

async function loadSources(file) {
  const text = await readFile(file, 'utf8')
  const parsed = JSON.parse(text)
  return parsed.sources || []
}

async function fetchSource(source, options) {
  switch (source.type) {
    case 'rss':
    case 'atom':
      return fetchFeed(source, options)
    case 'govuk_content_api':
      return fetchGovukContent(source, options)
    case 'gdelt_doc':
      return fetchGdeltDoc(source, options)
    case 'page':
      return fetchPage(source, options)
    case 'x_recent_search':
      return fetchXRecentSearch(source, options)
    case 'manual_json':
      return fetchManualJson(source)
    default:
      throw new Error(`Unsupported source type: ${source.type}`)
  }
}

async function fetchManualJson(source) {
  const file = path.resolve(rootDir, source.url)
  let json
  try {
    json = JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return {
      skipped: true,
      message: `manual inbox not found: ${source.url}`,
      raw: null,
      items: []
    }
  }

  const entries = Array.isArray(json.items) ? json.items : []
  const items = entries.map(entry => {
    const entrySource = {
      ...source,
      region: entry.region || source.region,
      name: entry.sourceName || source.name,
      sourceTypeLabel: entry.sourceTypeLabel || source.sourceTypeLabel,
      trustLevel: entry.trustLevel || source.trustLevel
    }
    return normalizeItem(entrySource, {
      title: entry.title,
      url: entry.url,
      publishedAt: entry.publishedAt,
      summary: entry.summary || entry.note || '',
      rawText: [entry.title, entry.summary, entry.note, entry.platform, entry.author].filter(Boolean).join(' '),
      imageUrl: entry.imageUrl || '',
      imageOrigin: entry.imageUrl ? 'manual' : 'none',
      publisher: entry.author || entry.platform || source.name
    })
  })

  return { raw: { itemCount: entries.length }, items }
}

async function fetchFeed(source, options) {
  const xml = await fetchText(source.url, options)
  const parsed = parseFeed(xml)
  const items = parsed.map(entry =>
    normalizeItem(source, {
      title: entry.title,
      url: entry.link || source.url,
      publishedAt: entry.publishedAt,
      summary: entry.summary,
      rawText: entry.summary,
      imageUrl: entry.imageUrl,
      imageOrigin: entry.imageUrl ? 'rss-media' : 'none'
    })
  )
  return { raw: { itemCount: parsed.length }, items }
}

async function fetchGovukContent(source, options) {
  const json = await fetchJson(source.url, options)
  const body = stripHtml(json.details?.body || json.description || '')
  const items = [
    normalizeItem(source, {
      title: json.title || source.name,
      url: json.web_url || source.url.replace('https://content-api.publishing.service.gov.uk/content', 'https://www.gov.uk'),
      publishedAt: json.public_updated_at || json.updated_at,
      summary: json.description || truncate(body, 260),
      rawText: body,
      imageUrl: extractGovukImage(json),
      imageOrigin: extractGovukImage(json) ? 'govuk-image' : 'none'
    })
  ]
  return { raw: compactRaw(json), items }
}

async function fetchGdeltDoc(source, options) {
  const url = new URL(source.url)
  url.searchParams.set('query', source.query)
  url.searchParams.set('mode', 'ArtList')
  url.searchParams.set('format', 'json')
  url.searchParams.set('maxrecords', String(source.maxRecords || options.maxRecords || 20))
  url.searchParams.set('sort', 'DateDesc')

  const json = await fetchJson(url.toString(), options)
  const articles = Array.isArray(json.articles) ? json.articles : []
  const items = articles.map(article =>
    normalizeItem(source, {
      title: article.title,
      url: article.url,
      publishedAt: parseGdeltDate(article.seendate),
      summary: article.seendate ? `GDELT news discovery from ${article.domain || 'news source'}.` : '',
      rawText: [article.title, article.domain, article.sourcecountry].filter(Boolean).join(' '),
      imageUrl: article.socialimage,
      imageOrigin: article.socialimage ? 'gdelt-socialimage' : 'none',
      publisher: article.domain
    })
  )
  return { raw: { articleCount: articles.length }, items }
}

async function fetchPage(source, options) {
  const html = await fetchText(source.url, options)
  const page = parseHtmlPage(html, source.url)
  const links = source.extractLinks ? extractPageLinks(html, source) : []
  const itemInputs = links.length ? links.map(link => ({
    title: link.title,
    url: link.url,
    publishedAt: page.publishedAt,
    summary: `Tracked link from ${source.name}: ${link.title}`,
    rawText: `${link.title} ${page.description}`,
    imageUrl: page.imageUrl,
    imageOrigin: page.imageUrl ? 'og:image' : 'none'
  })) : [
    {
      title: page.title || source.name,
      url: page.canonicalUrl || source.url,
      publishedAt: page.publishedAt,
      summary: page.description || `Tracked official page: ${source.name}`,
      rawText: page.text,
      imageUrl: page.imageUrl,
      imageOrigin: page.imageUrl ? 'og:image' : 'none'
    }
  ]
  return { raw: { ...page.raw, extractedLinkCount: links.length }, items: itemInputs.map(input => normalizeItem(source, input)) }
}

async function fetchXRecentSearch(source, options) {
  const token = options.xBearerToken || process.env.X_BEARER_TOKEN
  if (!token) {
    return {
      skipped: true,
      message: 'missing X_BEARER_TOKEN',
      raw: null,
      items: []
    }
  }

  const url = new URL(source.url)
  url.searchParams.set('query', source.query)
  url.searchParams.set('max_results', String(source.maxResults || 10))
  url.searchParams.set('tweet.fields', 'created_at,author_id,public_metrics,attachments')
  url.searchParams.set('expansions', 'attachments.media_keys,author_id')
  url.searchParams.set('media.fields', 'url,preview_image_url,type')

  const json = await fetchJson(url.toString(), {
    ...options,
    headers: {
      authorization: `Bearer ${token}`
    }
  })

  const mediaByKey = new Map((json.includes?.media || []).map(media => [media.media_key, media]))
  const items = (json.data || []).map(tweet => {
    const mediaKey = tweet.attachments?.media_keys?.[0]
    const media = mediaKey ? mediaByKey.get(mediaKey) : null
    return normalizeItem(source, {
      title: truncate(tweet.text.replace(/\s+/g, ' '), 90),
      url: `https://x.com/i/web/status/${tweet.id}`,
      publishedAt: tweet.created_at,
      summary: truncate(tweet.text.replace(/\s+/g, ' '), 240),
      rawText: tweet.text,
      imageUrl: media?.url || media?.preview_image_url,
      imageOrigin: media ? 'x-media' : 'none',
      publisher: tweet.author_id
    })
  })

  return { raw: { resultCount: items.length }, items }
}

function normalizeItem(source, input) {
  const title = cleanText(input.title || source.name)
  const url = canonicalizeUrl(input.url || source.url)
  const fetchedAt = new Date().toISOString()
  const summary = cleanText(input.summary || '')
  const rawText = cleanText(input.rawText || summary || title)
  const publishedAt = normalizeDate(input.publishedAt) || fetchedAt
  const hash = sha256([source.id, url, title].join('|'))
  const relevanceScore = scoreItem(source, { title, summary, rawText })

  return {
    id: hash.slice(0, 16),
    sourceId: source.id,
    sourceName: source.name,
    sourceType: source.type,
    sourceTypeLabel: source.sourceTypeLabel || source.type,
    region: source.region,
    topics: source.topics || [],
    trustLevel: source.trustLevel || 'unknown',
    title,
    url,
    canonicalUrl: url,
    publishedAt,
    fetchedAt,
    summary,
    rawText: truncate(rawText, 1600),
    imageUrl: input.imageUrl || '',
    imageOrigin: input.imageOrigin || 'none',
    imageLicenseStatus: inferImageLicense(source, input.imageOrigin),
    canPublishImage: inferCanPublishImage(source, input.imageOrigin),
    publisher: input.publisher || source.name,
    relevanceScore,
    hash
  }
}

function scoreItem(source, item) {
  const text = `${item.title} ${item.summary} ${item.rawText}`.toLowerCase()
  if (source.trustLevel === 'manual') {
    return Math.max(45, Math.min(100, Number(source.score || 65)))
  }
  if (source.excludeKeywords?.length && matchesAny(text, source.excludeKeywords)) {
    return 0
  }
  if (source.requiredAnyKeywords?.length && !matchesAny(text, source.requiredAnyKeywords)) {
    return 0
  }
  if (source.requiredRegionKeywords?.length && !matchesAny(text, source.requiredRegionKeywords)) {
    return 0
  }
  let score = 0

  const regionTerms = source.region === 'HK'
    ? ['hong kong', '香港', '港校', 'non-local', 'iang', 'immigration', '入境']
    : source.region === 'SG'
      ? ['singapore', '新加坡', "student's pass", 'student pass', 'ica', 'ntu', 'nus', 'smu']
      : ['uk', 'united kingdom', 'britain', '英国', 'graduate visa', 'student visa', 'ucas']
  const studentTerms = ['international student', 'international students', 'student visa', "student's pass", 'student pass', 'study abroad', 'admission', 'application', 'postgraduate', 'undergraduate', 'scholarship', 'tuition', 'deadline', '留学', '申请', '签证', '学生准证', '录取', '硕士', '本科']
  const policyTerms = ['visa', "student's pass", 'student pass', 'immigration', 'graduate route', 'graduate visa', 'student route', 'policy', 'requirement', 'deadline', 'iang', '入境', '政策', '要求', '截止']
  const weakNoiseTerms = ['sports', 'weather', 'traffic', 'festival', 'crime']

  score += source.trustLevel === 'official' ? 25 : 0
  score += source.trustLevel === 'school' ? 20 : 0
  score += source.trustLevel === 'expert' ? 18 : 0
  score += source.trustLevel === 'news-discovery' ? 12 : 0
  score += source.trustLevel === 'social' ? 8 : 0

  score += countMatches(text, regionTerms) * 12
  score += countMatches(text, studentTerms) * 10
  score += countMatches(text, policyTerms) * 8
  score += (source.topics || []).some(topic => text.includes(String(topic).toLowerCase())) ? 10 : 0
  score -= countMatches(text, weakNoiseTerms) * 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

function dedupeItems(items) {
  const byKey = new Map()
  for (const item of items) {
    const key = item.canonicalUrl || item.hash
    const existing = byKey.get(key)
    if (!existing || item.relevanceScore > existing.relevanceScore) {
      byKey.set(key, item)
    }
  }
  return [...byKey.values()]
}

function parseFeed(xml) {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi)
  const entryBlocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi)
  const blocks = itemBlocks?.length ? itemBlocks : entryBlocks || []

  return blocks.map(block => {
    const link = getTagValue(block, 'link') || getTagAttribute(block, 'link', 'href')
    const mediaUrl =
      getTagAttribute(block, 'media:content', 'url') ||
      getTagAttribute(block, 'media:thumbnail', 'url') ||
      getTagAttribute(block, 'enclosure', 'url')

    return {
      title: stripHtml(getTagValue(block, 'title')),
      link: decodeEntities(link),
      publishedAt: getTagValue(block, 'pubDate') || getTagValue(block, 'published') || getTagValue(block, 'updated'),
      summary: stripHtml(getTagValue(block, 'description') || getTagValue(block, 'summary') || getTagValue(block, 'content')),
      imageUrl: decodeEntities(mediaUrl)
    }
  }).filter(item => item.title && item.link)
}

function parseHtmlPage(html, sourceUrl) {
  const title = stripHtml(getHtmlTag(html, 'title') || getMetaContent(html, 'og:title') || '')
  const description = stripHtml(
    getMetaContent(html, 'description') ||
    getMetaContent(html, 'og:description') ||
    ''
  )
  const imageUrl = resolveMaybeUrl(getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image'), sourceUrl)
  const canonicalUrl = resolveMaybeUrl(getTagAttribute(html, 'link', 'href', 'rel', 'canonical'), sourceUrl)
  const publishedAt =
    getMetaContent(html, 'article:published_time') ||
    getMetaContent(html, 'article:modified_time') ||
    getMetaContent(html, 'date')
  const text = truncate(stripHtml(html), 1600)

  return {
    title,
    description,
    imageUrl,
    canonicalUrl,
    publishedAt,
    text,
    raw: {
      title,
      description,
      imageUrl,
      canonicalUrl
    }
  }
}

function extractPageLinks(html, source) {
  const keywords = source.linkIncludeKeywords || source.requiredAnyKeywords || []
  const seen = new Set()
  const links = []
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi

  for (const match of html.matchAll(anchorPattern)) {
    const attrs = match[1]
    const href = getAttributeValue(attrs, 'href')
    const title = stripHtml(match[2])
    if (!href || !title || title.length < 5) continue
    if (/^(#|mailto:|javascript:)/i.test(href)) continue

    const combined = `${title} ${href}`.toLowerCase()
    if (keywords.length && !matchesAny(combined, keywords)) continue

    const url = resolveMaybeUrl(href, source.url)
    if (seen.has(url)) continue
    seen.add(url)
    links.push({ title: truncate(title, 140), url })
    if (links.length >= Number(source.maxPageLinks || 12)) break
  }

  return links
}

async function fetchText(url, options = {}) {
  const response = await fetchWithTimeout(url, options)
  return response.text()
}

async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.headers || {})
    }
  })
  return response.json()
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || process.env.FETCH_TIMEOUT_MS || 18000))
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    })
    if (response.status === 429 && !options.didRetry) {
      clearTimeout(timeout)
      await sleep(Number(process.env.FETCH_RETRY_DELAY_MS || 3500))
      return fetchWithTimeout(url, { ...options, didRetry: true })
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} for ${url}`)
    }
    return response
  } finally {
    clearTimeout(timeout)
  }
}

function getTagValue(block, name) {
  const escaped = escapeRegex(name)
  const match = block.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'))
  return match ? decodeEntities(match[1].trim()) : ''
}

function getHtmlTag(html, name) {
  const escaped = escapeRegex(name)
  const match = html.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'))
  return match ? decodeEntities(match[1].trim()) : ''
}

function getTagAttribute(block, tagName, attrName, requiredAttrName, requiredAttrValue) {
  const escapedTag = escapeRegex(tagName)
  const tagPattern = new RegExp(`<${escapedTag}\\b([^>]*)>`, 'gi')
  for (const match of block.matchAll(tagPattern)) {
    const attrs = match[1]
    if (requiredAttrName) {
      const required = getAttributeValue(attrs, requiredAttrName)
      if (String(required).toLowerCase() !== String(requiredAttrValue).toLowerCase()) continue
    }
    const value = getAttributeValue(attrs, attrName)
    if (value) return decodeEntities(value)
  }
  return ''
}

function getMetaContent(html, name) {
  const metaPattern = /<meta\b([^>]*)>/gi
  for (const match of html.matchAll(metaPattern)) {
    const attrs = match[1]
    const property = getAttributeValue(attrs, 'property') || getAttributeValue(attrs, 'name')
    if (String(property).toLowerCase() === String(name).toLowerCase()) {
      return decodeEntities(getAttributeValue(attrs, 'content'))
    }
  }
  return ''
}

function getAttributeValue(attrs, name) {
  const escaped = escapeRegex(name)
  const match = attrs.match(new RegExp(`${escaped}\\s*=\\s*["']([^"']+)["']`, 'i'))
  return match ? match[1].trim() : ''
}

function stripHtml(value = '') {
  return decodeEntities(String(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim())
}

function cleanText(value = '') {
  return decodeEntities(String(value).replace(/\s+/g, ' ').trim())
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function canonicalizeUrl(value) {
  try {
    const url = new URL(value)
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$/.test(key)) url.searchParams.delete(key)
    }
    url.hash = ''
    return url.toString()
  } catch {
    return value
  }
}

function resolveMaybeUrl(value, base) {
  if (!value) return ''
  try {
    return new URL(value, base).toString()
  } catch {
    return value
  }
}

function normalizeDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function parseGdeltDate(value) {
  if (!value) return ''
  const normalized = String(value).replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  )
  return normalizeDate(normalized)
}

function extractGovukImage(json) {
  return json.links?.primary_publishing_organisation?.[0]?.logo?.formatted_title ? '' : ''
}

function compactRaw(json) {
  return {
    title: json.title,
    document_type: json.document_type,
    public_updated_at: json.public_updated_at,
    web_url: json.web_url,
    description: json.description
  }
}

function inferImageLicense(source, imageOrigin) {
  if (!imageOrigin || imageOrigin === 'none') return 'no-image'
  if (source.trustLevel === 'official' || source.trustLevel === 'school') return 'official-page'
  if (imageOrigin === 'x-media') return 'user-generated'
  return 'unknown'
}

function inferCanPublishImage(source, imageOrigin) {
  return Boolean(imageOrigin && imageOrigin !== 'none' && (source.trustLevel === 'official' || source.trustLevel === 'school'))
}

function countMatches(text, terms) {
  return terms.reduce((count, term) => count + (text.includes(String(term).toLowerCase()) ? 1 : 0), 0)
}

function matchesAny(text, terms) {
  return terms.some(term => text.includes(String(term).toLowerCase()))
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function truncate(value = '', length = 240) {
  const text = cleanText(value)
  return text.length > length ? `${text.slice(0, length - 1)}...` : text
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function safeStamp(value) {
  return value.replace(/[:.]/g, '-')
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  collectAll()
    .then(payload => {
      console.log(`Collected ${payload.meta.itemCount} relevant items from ${payload.meta.successfulSourceCount}/${payload.meta.sourceCount} sources.`)
      if (payload.meta.failedSourceCount > 0) {
        console.log(`${payload.meta.failedSourceCount} sources failed. See data/collected.json for details.`)
      }
      if (payload.meta.skippedSourceCount > 0) {
        console.log(`${payload.meta.skippedSourceCount} sources skipped. Usually this means a missing API token.`)
      }
    })
    .catch(error => {
      console.error(error)
      process.exitCode = 1
    })
}
