import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Redis } from '@upstash/redis'
// If not using upstash, can mock it or check package.json version
import pkg from '../../../../package.json'

// Check if redis env vars exist
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

export async function GET(request: NextRequest) {
  const startDb = Date.now()
  let dbStatus = 'down'
  let dbLatency = -1

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'ok'
    dbLatency = Date.now() - startDb
  } catch (error) {
    console.error('DB Health Check Failed:', error)
  }

  const startRedis = Date.now()
  let redisStatus = redis ? 'down' : 'not_configured'
  let redisLatency = -1

  if (redis) {
    try {
      await redis.ping()
      redisStatus = 'ok'
      redisLatency = Date.now() - startRedis
    } catch (error) {
      console.error('Redis Health Check Failed:', error)
    }
  }

  const status = dbStatus === 'ok' && (redisStatus === 'ok' || redisStatus === 'not_configured') ? 'ok' : 'degraded'
  const statusCode = dbStatus === 'down' ? 503 : 200

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: pkg.version || '1.0.0',
    checks: {
      database: { status: dbStatus, latencyMs: dbLatency },
      redis: { status: redisStatus, latencyMs: redisLatency }
    }
  }, { status: statusCode })
}
