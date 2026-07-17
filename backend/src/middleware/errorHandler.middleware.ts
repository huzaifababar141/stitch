import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import config from '@/config';
import { logger } from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') error = AppError.conflict('Resource already exists');
    if (err.code === 'P2025') error = AppError.notFound('Database record');
  }

  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    error = AppError.unprocessable('Validation failed', details);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Invalid or expired token');
  }

  if (!(error instanceof AppError)) {
    logger.error('Unhandled Exception', err);
    error = AppError.internal();
  }

  const response: any = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details })
    }
  };

  if (config.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};
