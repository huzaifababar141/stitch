import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../../config';

export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, config.BCRYPT_ROUNDS);
};

export const verifyToken = async (token: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(token, hash);
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script[^>]*?>.*?<\/script>/gi, '').replace(/<[\/\w\s]+.*?>/g, '');
};
