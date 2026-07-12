import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/token.utils';
import { AppError } from '../shared/errors/AppError';
import { db } from '../config/database';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, email: true, phone: true, isActive: true, isBlocked: true, deletedAt: true }
    });

    if (!user) throw AppError.unauthorized('User no longer exists');
    if (!user.isActive) throw AppError.unauthorized('Account is inactive');
    if (user.isBlocked) throw AppError.forbidden('Account is blocked');
    if (user.deletedAt) throw AppError.unauthorized('Account was deleted');

    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
