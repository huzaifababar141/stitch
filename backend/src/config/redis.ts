import { Redis } from 'ioredis';
import config from './index';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 10,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => console.error('Redis error:', err));
