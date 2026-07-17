import { PrismaClient } from '@prisma/client';
import config from './index';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (config.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
