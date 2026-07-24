import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';

export const calculateTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { garmentType, city, couponCode } = req.body;
    const result = await ordersService.calculateTotal(garmentType, city, couponCode);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user.id;
    const order = await ordersService.createOrder(customerId, req.body);
    res.status(201).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user.id;
    const { status, search, page, limit } = req.query;

    const filters = {
      status: status as any,
      search: search as string,
    };

    const pagination = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const result = await ordersService.getCustomerOrders(customerId, filters, pagination);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = (req as any).user.id;
    const requesterRole = (req as any).user.role;
    const { id } = req.params;

    const order = await ordersService.getOrderById(id, requesterId, requesterRole);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = (req as any).user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await ordersService.cancelOrder(id, requesterId, reason);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user.id;
    const { id } = req.params;

    const feedback = await ordersService.submitFeedback(id, customerId, req.body);
    res.status(201).json({ status: 'success', data: { feedback } });
  } catch (error) {
    next(error);
  }
};
