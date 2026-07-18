import { Request, Response } from 'express';
import { db } from '../../config/database';
import { redis } from '../../config/redis';

export const checkHealth = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  let dbStatus = 'ok';
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await db.$queryRawUnsafe('SELECT 1');
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'down';
  }

  let redisStatus = 'ok';
  let redisLatency = 0;
  try {
    const redisStart = Date.now();
    await redis.ping();
    redisLatency = Date.now() - redisStart;
  } catch (error) {
    redisStatus = 'down';
  }

  const memory = process.memoryUsage();
  const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100;
  const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100;
  const rssMB = Math.round(memory.rss / 1024 / 1024 * 100) / 100;
  const memoryUtilization = memory.heapUsed / memory.heapTotal;

  let overallStatus = 'ok';
  let statusCode = 200;

  if (dbStatus === 'down' || redisStatus === 'down') {
    overallStatus = 'down';
    statusCode = 503;
  } else if (memoryUtilization > 0.8) {
    overallStatus = 'degraded';
  }

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: { status: dbStatus, latencyMs: dbLatency },
      redis: { status: redisStatus, latencyMs: redisLatency },
      memory: { heapUsedMB, heapTotalMB, rssMB }
    }
  });
};

export const checkReadiness = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.$queryRawUnsafe('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'unready' });
  }
};

export const checkLiveness = (req: Request, res: Response): void => {
  res.status(200).json({ status: 'alive' });
};
