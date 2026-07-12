import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

export const createLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: { code: 'TOO_MANY_REQUESTS', message } },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error - Known typing issue with rate-limit-redis and ioredis
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
  });
};

export const authLimiter = createLimiter(10 * 60 * 1000, 5, 'Too many auth attempts from this IP, please try again after 10 minutes');
export const otpLimiter = createLimiter(10 * 60 * 1000, 3, 'Too many OTP requests from this IP, please try again after 10 minutes');
export const apiLimiter = createLimiter(60 * 1000, 100, 'Too many requests from this IP, please try again after a minute');
export const adminLimiter = createLimiter(60 * 1000, 200, 'Too many admin requests');
export const webhookLimiter = createLimiter(60 * 1000, 50, 'Too many webhook triggers');
