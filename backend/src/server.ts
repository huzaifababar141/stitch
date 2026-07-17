import { createServer } from 'http';
import app from './app';
import { db } from './config/database';
import { redis } from './config/redis';
import { Server } from 'socket.io';
import config from './config';
import { logger } from './config/logger';

const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [config.FRONTEND_URL, config.ADMIN_URL],
    credentials: true,
  },
});

const startServer = async () => {
  try {
    await db.$connect();
    logger.info('Connected to PostgreSQL database');
    
    await redis.ping();
    logger.info('Connected to Redis server');

    server.listen(config.PORT, () => {
      logger.info(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to services', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  logger.info('Gracefully shutting down server...');
  server.close(async () => {
    await db.$disconnect();
    redis.quit();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
