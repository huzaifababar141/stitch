import jwt from 'jsonwebtoken';
import config from '@/config';
import crypto from 'crypto';

export interface TokenPayload {
  id: string;
  role: string;
  email: string | null;
  phone: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
