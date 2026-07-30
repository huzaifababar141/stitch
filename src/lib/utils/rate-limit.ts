import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { AppError } from './errors'

// Initialize Upstash Redis
// Note: Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
let redis: Redis | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
  }
} catch (e) {
  console.warn('Upstash Redis not configured, rate limiting will be disabled')
}

// Fallback logic for when Redis is not configured (e.g. local dev)
const mockLimiter = {
  limit: async (identifier: string) => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 10000
  })
}

export const otpLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
}) : mockLimiter

export const authLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  analytics: true,
}) : mockLimiter

export const apiLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
}) : mockLimiter

export const webhookLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
}) : mockLimiter

export async function checkRateLimit(identifier: string, limiter: any) {
  const result = await limiter.limit(identifier)
  if (!result.success) {
    throw AppError.tooManyRequests()
  }
  return result
}
