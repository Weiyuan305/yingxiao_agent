import assert from 'node:assert/strict'
import { createRateLimiter, safeEqual } from '../dist/server/security.mjs'

// ---- 限流：窗口内放行，超限拒绝，窗口滑动后恢复 ----
{
  const limiter = createRateLimiter({ max: 3, windowMs: 1000 })
  const t0 = 1_000_000
  assert.equal(limiter.check('ip1', t0).allowed, true, '第1次放行')
  assert.equal(limiter.check('ip1', t0 + 10).allowed, true, '第2次放行')
  assert.equal(limiter.check('ip1', t0 + 20).allowed, true, '第3次放行')
  const blocked = limiter.check('ip1', t0 + 30)
  assert.equal(blocked.allowed, false, '第4次超限拒绝')
  assert.ok(blocked.retryAfterMs > 0, '给出 retryAfter')

  // 不同 key 独立计数
  assert.equal(limiter.check('ip2', t0 + 30).allowed, true, '另一个 IP 独立')

  // 窗口滑过后恢复
  assert.equal(limiter.check('ip1', t0 + 1100).allowed, true, '窗口滑动后恢复')
  console.log('security: 限流窗口/超限/独立/恢复 ✓')
}

// ---- 常量时间比较 ----
{
  assert.equal(safeEqual('secret-token', 'secret-token'), true, '相同放行')
  assert.equal(safeEqual('secret-token', 'wrong'), false, '不同长度拒绝')
  assert.equal(safeEqual('secret-token', 'secret-tokeX'), false, '同长不同拒绝')
  assert.equal(safeEqual('', ''), true, '空串相等')
  console.log('security: 常量时间比较 ✓')
}

console.log('security tests passed')
