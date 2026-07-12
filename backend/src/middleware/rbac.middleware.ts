import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { UserRole } from '@prisma/client';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userRole = req.user?.role as UserRole;
    
    if (!userRole || !roles.includes(userRole)) {
      next(AppError.forbidden(`Requires one of roles: ${roles.join(', ')}`));
      return;
    }
    next();
  };
};
