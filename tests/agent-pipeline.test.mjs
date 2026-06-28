import assert from 'node:assert/strict'
import { StudyAbroadMarketingAgent } from '../dist/agent/pipeline.mjs'

const now = new Date().toISOString()

const collected = {
  meta: {
    mode: 'test',
    finishedAt: now,
    sourceCount: 3,
    successfulSourceCount: 3,
    skippedSourceCount: 0,
    failedSourceCount: 0,
    rawItemCount: 3,
    itemCount: 3
  },
  sources: [
    {
      id: 'hk-immd',
      name: 'Hong Kong Immigration Department',
      type: 'page',
      region: 'HK',
      trustLevel: 'official',
      ok: true,
      skipped: false,
      itemCount: 1
    }
  ],
  items: [
    {
      id: 'hk-visa',
      sourceId: 'hk-immd',
      sourceName: 'Hong Kong Immigration Department',
      sourceType: 'page',
      sourceTypeLabel: '签证政策',
      region: 'HK',
      topics: ['visa', 'policy'],
      trustLevel: 'official',
      title: 'Hong Kong student visa application requirement update',
      url: 'https://example.com/hk-visa',
      canonicalUrl: 'https://example.com/hk-visa',
      publishedAt: now,
      fetchedAt: now,
      summary: 'Official entry for study visa application requirement update for non-local students.',
      rawText: 'student visa immigration entry permit application requirement deadline Hong Kong',
      imageUrl: 'https://example.com/hk.jpg',
      imageOrigin: 'og:image',
      imageLicenseStatus: 'review-required',
      canPublishImage: false,
      publisher: 'Hong Kong Immigration Department',
      relevanceScore: 92,
      hash: 'hk-visa'
    },
    {
      id: 'uk-data',
      sourceId: 'ucas',
      sourceName: 'UCAS',
      sourceType: 'rss',
      sourceTypeLabel: '申请数据',
      region: 'UK',
      topics: ['ucas', 'data'],
      trustLevel: 'expert',
      title: 'UCAS undergraduate application data release',
      url: 'https://example.com/uk-data',
      canonicalUrl: 'https://example.com/uk-data',
      publishedAt: now,
      fetchedAt: now,
      summary: 'UCAS data and analysis for undergraduate applications.',
      rawText: 'ucas data statistics undergraduate application international students',
      imageUrl: '',
      imageOrigin: 'none',
      imageLicenseStatus: 'none',
      canPublishImage: false,
      publisher: 'UCAS',
      relevanceScore: 86,
      hash: 'uk-data'
    },
    {
      id: 'sg-pass',
      sourceId: 'sg-ica',
      sourceName: 'ICA',
      sourceType: 'page',
      sourceTypeLabel: '签证政策',
      region: 'SG',
      topics: ['student pass'],
      trustLevel: 'official',
      title: 'Singapore Student Pass application guide',
      url: 'https://example.com/sg-pass',
      canonicalUrl: 'https://example.com/sg-pass',
      publishedAt: now,
      fetchedAt: now,
      summary: 'Student Pass application requirements for international students.',
      rawText: 'Singapore Student Pass visa application requirement ICA international students',
      imageUrl: '',
      imageOrigin: 'none',
      imageLicenseStatus: 'none',
      canPublishImage: false,
      publisher: 'ICA',
      relevanceScore: 84,
      hash: 'sg-pass'
    }
  ]
}

const agent = new StudyAbroadMarketingAgent({
  disableLlm: true,
  limit: 3,
  dailyRecommendationMin: 3,
  dailyRecommendationMax: 3,
  backupLimit: 5
})

const payload = await agent.run(collected)

assert.equal(payload.meta.mode, 'agent-pipeline')
assert.equal(payload.meta.itemCount, 3)
assert.equal(payload.meta.llm.mode, 'rules-fallback')
assert.equal(payload.meta.agent.steps.length, 5)
assert.deepEqual(
  payload.meta.agent.steps.map(step => step.id),
  ['ingest', 'score', 'recommend', 'generate', 'package']
)
assert.ok(payload.items.every(item => item.draftTitle && item.draftBody && item.coverText))
assert.ok(payload.items.every(item => item.marketingScore.total > 0))
assert.ok(payload.items.every(item => item.privateMessageCta.includes('私信') || item.privateMessageCta.includes('评论区')))
assert.equal(payload.items.filter(item => item.isDailyRecommendation).length, 3)
assert.equal(payload.backupItems.length, 0)

const hk = payload.items.find(item => item.id === 'hk-visa')
assert.equal(hk.regionLabel, '香港')
assert.equal(hk.sourceUrl, 'https://example.com/hk-visa')
assert.ok(hk.checks.some(check => check.includes('不得承诺') || check.includes('不能')))
assert.ok(hk.coverText.length <= 16)

console.log('agent pipeline tests passed')
