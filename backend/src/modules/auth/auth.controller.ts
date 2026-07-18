import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import config from '../../config';
import { AppError } from '../../shared/errors/AppError';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    // For universal entry, purpose logic dynamically triggers registration when 'login' fails natively in service
    const purpose = 'login'; 
    const result = await AuthService.sendOtp(phone, purpose);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, purpose } = req.body;
    const user = await AuthService.verifyOtp(phone, otp, purpose);
    
    // Inject headers manually if request misses origin bindings to support web+mobile parity
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = Array.isArray(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'][0] 
      : req.ip || 'unknown';

    const { accessToken, refreshToken } = await AuthService.generateTokenPair(
      user.id,
      userAgent,
      ipAddress
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  req.body.purpose = 'login';
  await verifyOtp(req, res, next);
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw AppError.unauthorized('No refresh token provided');

    const ipAddress = Array.isArray(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'][0] 
      : req.ip || 'unknown';

    const { accessToken, refreshToken: newRefresh } = await AuthService.refreshTokens(
      refreshToken,
      ipAddress
    );

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore Native user bindings come from auth.middleware.ts attached on Request interface
    await AuthService.logoutAll(req.user.id);
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = await AuthService.getCurrentUser(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
