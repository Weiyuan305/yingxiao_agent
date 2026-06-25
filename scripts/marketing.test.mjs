import assert from 'node:assert/strict'
import {
  buildBackupTopics,
  buildDailyRecommendations,
  buildMarketingProfile,
  choosePrivateMessageCta
} from './marketing.mjs'

const policyItem = {
  id: 'policy-visa',
  region: 'HK',
  title: 'Hong Kong student visa application deadline update',
  sourceName: 'Immigration Department',
  sourceTypeLabel: '签证政策',
  trustLevel: 'official',
  topics: ['visa', 'policy'],
  summary: 'Official student visa and entry permit application requirement update before the coming intake.',
  rawText: 'visa policy deadline requirement application immigration student pass',
  relevanceScore: 86,
  publishedAt: new Date().toISOString(),
  imageUrl: 'https://example.com/cover.jpg',
  canPublishImage: true
}

const softNewsItem = {
  id: 'soft-news',
  region: 'UK',
  title: 'Campus life story for international students',
  sourceName: 'University blog',
  sourceTypeLabel: '院校动态',
  trustLevel: 'school',
  topics: ['student life'],
  summary: 'A general campus life update with limited application urgency.',
  rawText: 'campus student life community story',
  relevanceScore: 48,
  publishedAt: '2025-01-01T00:00:00.000Z'
}

const singaporeItem = {
  id: 'sg-pass',
  region: 'SG',
  title: 'Singapore Student Pass application guide for international students',
  sourceName: 'ICA',
  sourceTypeLabel: '签证政策',
  trustLevel: 'official',
  topics: ['student pass', 'visa'],
  summary: 'Student pass application requirements for international students in Singapore.',
  rawText: 'student pass visa application requirement international students Singapore',
  relevanceScore: 82,
  publishedAt: new Date().toISOString()
}

const profile = buildMarketingProfile(policyItem)
assert.equal(profile.regionLabel, '香港')
assert.equal(profile.level, '今日必写')
assert.ok(profile.total >= 85)
assert.ok(profile.dimensions.policyImpact >= 80)
assert.ok(profile.dimensions.urgency >= 70)
assert.ok(profile.reasons.some(reason => reason.includes('政策')))
assert.ok(profile.privateMessageCta.includes('私信') || profile.privateMessageCta.includes('评论区'))

const sgProfile = buildMarketingProfile(singaporeItem)
assert.equal(sgProfile.regionLabel, '新加坡')
assert.equal(choosePrivateMessageCta(singaporeItem, sgProfile), sgProfile.privateMessageCta)

const recommendations = buildDailyRecommendations([softNewsItem, policyItem, singaporeItem], {
  min: 3,
  max: 5
})
assert.equal(recommendations.length, 3)
assert.deepEqual(recommendations.map(item => item.id), ['policy-visa', 'sg-pass', 'soft-news'])
assert.equal(recommendations[0].isDailyRecommendation, true)

const backups = buildBackupTopics([policyItem, softNewsItem, singaporeItem], new Set(['policy-visa', 'sg-pass']), {
  limit: 5
})
assert.equal(backups.length, 1)
assert.equal(backups[0].id, 'soft-news')
assert.equal(backups[0].recommendationTier, 'backup')

console.log('marketing tests passed')
