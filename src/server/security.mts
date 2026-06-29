import { timingSafeEqual } from 'node:crypto'

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
  remaining: number
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult
}

/**
 * 滑动窗口限流：每个 key 在 windowMs 内最多 max 次。内存实现，适合单进程小团队。
 */
export function createRateLimiter(options: { max: number; windowMs: number }): RateLimiter {
  const max = Math.max(1, options.max)
  const windowMs = Math.max(1, options.windowMs)
  const hits = new Map<string, number[]>()
  let lastPrune = 0

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const windowStart = now - windowMs

      // 偶尔清理空 key，避免长期运行内存增长
      if (now - lastPrune > windowMs) {
        for (const [k, times] of hits) {
          const live = times.filter(t => t > windowStart)
          if (live.length) hits.set(k, live)
          else hits.delete(k)
        }
        lastPrune = now
      }

      const recent = (hits.get(key) || []).filter(t => t > windowStart)
      if (recent.length >= max) {
        hits.set(key, recent)
        const retryAfterMs = Math.max(0, (recent[0] ?? now) + windowMs - now)
        return { allowed: false, retryAfterMs, remaining: 0 }
      }
      recent.push(now)
      hits.set(key, recent)
      return { allowed: true, retryAfterMs: 0, remaining: max - recent.length }
    }
  }
}

/**
 * 常量时间字符串比较，避免计时侧信道。长度不同直接返回 false。
 */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(String(a ?? ''), 'utf8')
  const bufferB = Buffer.from(String(b ?? ''), 'utf8')
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}
