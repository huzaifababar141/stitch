import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config';
import { errorHandler } from './middleware/errorHandler.middleware';
import { requestLogger } from './middleware/requestLogger.middleware';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';

const app: Express = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: [config.FRONTEND_URL, config.ADMIN_URL],
    credentials: true,
  })
);

app.use(
  morgan('dev', {
    skip: (req: Request) => req.originalUrl === '/health',
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: '10kb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(requestLogger);

app.use('/health', healthRoutes);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

export default app;
