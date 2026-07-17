import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  // @ts-ignore
  req.requestId = requestId;
  // @ts-ignore
  req.logger = logger.child({ requestId });
  
  res.setHeader('X-Request-ID', requestId);
  
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // @ts-ignore
    req.logger.info(`[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
