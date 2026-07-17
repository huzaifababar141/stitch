import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function reset() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Safety Stop: Cannot reset production database!');
  }

  console.log('🛑 Starting database reset...');

  const tableNames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';`;

  for (const { tablename } of tableNames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
        console.log(`Truncated table: ${tablename}`);
      } catch (error) {
        console.log(`Failed to truncate ${tablename}`, error);
      }
    }
  }

  console.log('♻️ Database wiped. Re-seeding...');
  
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });

  console.log('✅ Full database reset completed successfully!');
}

reset()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
