import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { hashOTP, verifyOTP } from '../../shared/utils/crypto.utils';
import { generateAccessToken } from '../../shared/utils/token.utils';
import crypto from 'crypto';
import config from '../../config';

export class AuthService {
  static async sendOtp(phone: string, purpose: string) {
    let user = await db.user.findUnique({ where: { phone } });
    
    if (!user && purpose === 'register') {
      user = await db.user.create({
        data: {
          phone,
          firstName: 'Guest',
        }
      });
    } else if (!user) {
      throw AppError.notFound('User not found. Please register first.');
    }

    if (!user.isActive || user.isBlocked) {
      throw AppError.forbidden('Account is blocked or inactive.');
    }

    // Invalidate old OTPs for this phone+purpose
    await db.otpCode.updateMany({
      where: { phone, purpose, isUsed: false, expiresAt: { gt: new Date() } },
      data: { isUsed: true } 
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    const codeHash = await hashOTP(otp);

    await db.otpCode.create({
      data: {
        userId: user.id,
        phone,
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    if (config.NODE_ENV === 'development') {
      console.log(`[DEV OTP] Generated: ${otp} for ${phone}`);
    }

    return { success: true, expiresIn: 300 };
  }

  static async verifyOtp(phone: string, otp: string, purpose: string) {
    const otpRecord = await db.otpCode.findFirst({
      where: { phone, purpose, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) throw AppError.badRequest('Invalid or expired OTP.');
    
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw AppError.tooManyRequests('Maximum attempts reached. Please request a new OTP.');
    }

    await db.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } }
    });

    const isValid = await verifyOTP(otp, otpRecord.codeHash);
    if (!isValid) throw AppError.unauthorized('Invalid OTP code.');

    await db.otpCode.update({ where: { id: otpRecord.id }, data: { isUsed: true, usedAt: new Date() } });

    const user = await db.user.update({
      where: { phone },
      data: { phoneVerified: true, lastLoginAt: new Date() }
    });

    return user;
  }

  static async generateTokenPair(userId: string, deviceInfo: any, ipAddress: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('Token binding failed: User missing');

    const accessToken = generateAccessToken({ 
      id: userId,
      role: user.role,
      email: user.email,
      phone: user.phone
    });
    
    // Generate refresh token cryptographic string
    const refreshToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.authToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo,
        ipAddress,
        expiresAt
      }
    });

    return { accessToken, refreshToken };
  }

  static async refreshTokens(refreshToken: string, ipAddress: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const authToken = await db.authToken.findUnique({ where: { tokenHash } });
    if (!authToken || authToken.isRevoked || new Date() > authToken.expiresAt) {
      if (authToken?.isRevoked) {
         // Security Alert: Compromised family - revoke all active elements of family string
         await db.authToken.updateMany({
           where: { family: authToken.family },
           data: { isRevoked: true, revokeReason: 'Security alert: reused compromised token' }
         });
      }
      throw AppError.unauthorized('Invalid refresh token.');
    }

    const { accessToken, refreshToken: newRefresh } = await this.generateTokenPair(authToken.userId, authToken.deviceInfo as any, ipAddress);
    
    // Pass family down
    const newHash = crypto.createHash('sha256').update(newRefresh).digest('hex');
    await db.authToken.update({
      where: { tokenHash: newHash },
      data: { family: authToken.family }
    });

    // Revoke old
    await db.authToken.update({
      where: { id: authToken.id },
      data: { isRevoked: true, revokedAt: new Date() }
    });

    return { accessToken, refreshToken: newRefresh };
  }

  static async logout(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.authToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true, revokedAt: new Date() }
    });
  }

  static async logoutAll(userId: string) {
    await db.authToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() }
    });
  }

  static async getCurrentUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        gender: true,
        profileImageUrl: true,
        tailorProfile: true
      }
    });
    if (!user) throw AppError.notFound('User not found.');
    return user;
  }
}
