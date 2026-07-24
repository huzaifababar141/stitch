import { Request, Response, NextFunction } from 'express';
import { measurementsService } from './measurements.service';

export const listMeasurements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profiles = await measurementsService.list(userId);
    res.status(200).json({ status: 'success', data: { profiles } });
  } catch (error) {
    next(error);
  }
};

export const getMeasurementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const profile = await measurementsService.getById(userId, id);
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const createMeasurement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await measurementsService.create(userId, req.body);
    res.status(201).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const updateMeasurement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const profile = await measurementsService.update(userId, id, req.body);
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const deleteMeasurement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const result = await measurementsService.delete(userId, id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

export const setDefaultMeasurement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const profile = await measurementsService.setDefault(userId, id);
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const validateMeasurementWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    // Verify user owns profile before running AI validation
    await measurementsService.getById(userId, id);
    const result = await measurementsService.validateWithAI(id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
