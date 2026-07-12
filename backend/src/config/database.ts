import { PrismaClient } from '@prisma/client';
import config from './index';

export const db = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
