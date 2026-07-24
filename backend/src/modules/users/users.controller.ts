import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { AppError } from '../../shared/errors/AppError';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await usersService.getProfile(userId);
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const updatedProfile = await usersService.updateProfile(userId, req.body);
    res.status(200).json({ status: 'success', data: { profile: updatedProfile } });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    if (!req.file) {
      throw AppError.badRequest('Image file is required');
    }

    const result = await usersService.uploadProfileImage(
      userId,
      req.file.buffer,
      req.file.mimetype
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const addresses = await usersService.listAddresses(userId);
    res.status(200).json({ status: 'success', data: { addresses } });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const address = await usersService.createAddress(userId, req.body);
    res.status(201).json({ status: 'success', data: { address } });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const address = await usersService.updateAddress(userId, id, req.body);
    res.status(200).json({ status: 'success', data: { address } });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const result = await usersService.deleteAddress(userId, id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const address = await usersService.setDefaultAddress(userId, id);
    res.status(200).json({ status: 'success', data: { address } });
  } catch (error) {
    next(error);
  }
};
