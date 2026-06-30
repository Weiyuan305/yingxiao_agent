import assert from 'node:assert/strict'
import { factCheck } from '../dist/agent/factcheck.mjs'

const source = {
  title: 'Graduate visa update 2026',
  summary: 'The graduate route allows 2 years stay. Scholarship covers £10,000.',
  rawText: 'Applicants need IELTS 6.5. Around 30% of places go to international students. Deadline 2026.'
}

// 来源里有的数字：不该被标记，且带来源引用片段
{
  const body = '英国毕业签可以留 2 年，奖学金有 £10,000，雅思要 6.5 分，国际生占 30%，截止 2026。'
  const result = factCheck(body, source)
  assert.equal(result.ok, true, `不该误报: ${JSON.stringify(result.flagged)}`)
  assert.ok(Array.isArray(result.details) && result.details.length > 0, '返回逐项 details')
  const pct = result.details.find(d => d.value.includes('30'))
  assert.ok(pct && pct.found && pct.snippet.length > 0, `30% 应有来源引用片段: ${JSON.stringify(pct)}`)
  console.log('factcheck: source-backed numbers pass + 引用片段 ✓')
}

// 编造的数字：必须被标记
{
  const body = '录取率高达 95%，奖学金 £50,000，前 3 名直接录取。'
  const result = factCheck(body, source)
  const values = result.flagged.map(f => f.value)
  assert.equal(result.ok, false, '编造数字应被标记')
  assert.ok(values.some(v => v.includes('95')), `应标记 95%: ${JSON.stringify(values)}`)
  assert.ok(values.some(v => v.includes('50')), `应标记 £50,000: ${JSON.stringify(values)}`)
  console.log('factcheck: fabricated numbers flagged ✓')
}

// 口语序数（做3件事）不应被当成事实数字误报
{
  const body = '你现在做 3 件事就行，先看官网。'
  const result = factCheck(body, source)
  assert.equal(result.flagged.length, 0, `序数不该被标记: ${JSON.stringify(result.flagged)}`)
  console.log('factcheck: colloquial ordinals ignored ✓')
}

console.log('factcheck tests passed')
