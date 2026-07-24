import { Router } from 'express';
import * as ordersController from './orders.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createOrderSchema,
  cancelOrderSchema,
  submitFeedbackSchema,
  calculateTotalSchema,
} from './orders.validator';

const router = Router();

// Protect all order endpoints with JWT authentication
router.use(authenticate);

router.post('/calculate-total', validate(calculateTotalSchema), ordersController.calculateTotal);
router.post('/', validate(createOrderSchema), ordersController.createOrder);
router.get('/', ordersController.getCustomerOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/:id/cancel', validate(cancelOrderSchema), ordersController.cancelOrder);
router.post('/:id/feedback', validate(submitFeedbackSchema), ordersController.submitFeedback);

export default router;
