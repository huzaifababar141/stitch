import { ordersService } from './orders.service';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { orderEvents } from './orders.events';
import { GarmentType, PaymentMethod, UserRole } from '@prisma/client';

jest.mock('../../config/database', () => ({
  db: {
    user: {
      findFirst: jest.fn(),
    },
    measurementProfile: {
      findFirst: jest.fn(),
    },
    address: {
      findFirst: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    styleConfiguration: {
      findFirst: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    orderFeedback: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tailorProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(db)),
  },
}));

describe('Orders Module — Service Tests', () => {
  const mockCustomerId = '11111111-1111-1111-1111-111111111111';
  const mockOrderId = '22222222-2222-2222-2222-222222222222';
  const mockMeasurementProfileId = '33333333-3333-3333-3333-333333333333';
  const mockAddressId = '44444444-4444-4444-4444-444444444444';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTotal', () => {
    it('should calculate stitching fee and local delivery fee for major metro city', async () => {
      const result = await ordersService.calculateTotal('full_suit' as GarmentType, 'Lahore');
      expect(result.stitchingFee).toBe(3500);
      expect(result.deliveryFee).toBe(250);
      expect(result.totalAmount).toBe(3750);
    });

    it('should calculate national delivery fee for non-metro city', async () => {
      const result = await ordersService.calculateTotal('kameez' as GarmentType, 'Faisalabad');
      expect(result.stitchingFee).toBe(2200);
      expect(result.deliveryFee).toBe(350);
      expect(result.totalAmount).toBe(2550);
    });

    it('should apply valid coupon percentage discount', async () => {
      (db.coupon.findUnique as jest.Mock).mockResolvedValue({
        id: 'coupon-1',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        isActive: true,
      });

      const result = await ordersService.calculateTotal('full_suit' as GarmentType, 'Lahore', 'SAVE10');
      expect(result.discountAmount).toBe(350); // 10% of 3500
      expect(result.totalAmount).toBe(3400); // 3500 + 250 - 350
    });
  });

  describe('createOrder', () => {
    it('should create order and auto-confirm payment if paymentMethod is COD', async () => {
      const mockCustomer = { id: mockCustomerId, isActive: true, isBlocked: false };
      const mockMeasurement = { id: mockMeasurementProfileId, chest: 40 };
      const mockAddress = { id: mockAddressId, city: 'Lahore' };

      (db.user.findFirst as jest.Mock).mockResolvedValue(mockCustomer);
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue(mockMeasurement);
      (db.address.findFirst as jest.Mock).mockResolvedValue(mockAddress);

      (db.order.create as jest.Mock).mockResolvedValue({
        id: mockOrderId,
        orderNumber: 'ORD-TEST-1',
        status: 'payment_confirmed',
        isCod: true,
      });

      const input = {
        garmentType: 'full_suit' as GarmentType,
        measurementProfileId: mockMeasurementProfileId,
        deliveryAddressId: mockAddressId,
        paymentMethod: 'cod' as PaymentMethod,
      };

      const spyEmit = jest.spyOn(orderEvents, 'emit');

      const result = await ordersService.createOrder(mockCustomerId, input);

      expect(result.status).toBe('payment_confirmed');
      expect(db.order.create).toHaveBeenCalled();
      expect(spyEmit).toHaveBeenCalledWith('order:created', expect.any(Object));
      expect(spyEmit).toHaveBeenCalledWith('order:payment_confirmed', expect.any(Object));
    });

    it('should throw error if measurement profile does not belong to customer', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({ id: mockCustomerId, isActive: true });
      (db.measurementProfile.findFirst as jest.Mock).mockResolvedValue(null);

      const input = {
        garmentType: 'full_suit' as GarmentType,
        measurementProfileId: mockMeasurementProfileId,
        deliveryAddressId: mockAddressId,
        paymentMethod: 'jazzcash' as PaymentMethod,
      };

      await expect(ordersService.createOrder(mockCustomerId, input)).rejects.toThrow(AppError);
    });
  });

  describe('getCustomerOrders', () => {
    it('should return paginated orders for customer', async () => {
      const mockOrders = [{ id: 'order-1' }, { id: 'order-2' }];
      (db.order.count as jest.Mock).mockResolvedValue(2);
      (db.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const result = await ordersService.getCustomerOrders(mockCustomerId, {}, { page: 1, limit: 10 });
      expect(result.orders).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getOrderById', () => {
    it('should allow customer to view their own order', async () => {
      const mockOrder = { id: mockOrderId, customerId: mockCustomerId, status: 'assigned' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getOrderById(mockOrderId, mockCustomerId, UserRole.customer);
      expect(result).toEqual(mockOrder);
    });

    it('should forbid customer from viewing another customer order', async () => {
      const mockOrder = { id: mockOrderId, customerId: 'other-user', status: 'assigned' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ordersService.getOrderById(mockOrderId, mockCustomerId, UserRole.customer)
      ).rejects.toThrow(AppError);
    });

    it('should allow admin to view any order', async () => {
      const mockOrder = { id: mockOrderId, customerId: 'other-user', status: 'assigned' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getOrderById(mockOrderId, 'admin-id', UserRole.admin);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order if status is pending_payment', async () => {
      const mockOrder = { id: mockOrderId, customerId: mockCustomerId, status: 'pending_payment' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (db.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      const result = await ordersService.cancelOrder(mockOrderId, mockCustomerId, 'Changed mind');
      expect(result.status).toBe('cancelled');
    });

    it('should throw error if order status is in_stitching or delivered', async () => {
      const mockOrder = { id: mockOrderId, customerId: mockCustomerId, status: 'in_stitching' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ordersService.cancelOrder(mockOrderId, mockCustomerId, 'Changed mind')
      ).rejects.toThrow(AppError);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback for delivered order and update tailor quality score', async () => {
      const mockTailorId = 'tailor-555';
      const mockOrder = {
        id: mockOrderId,
        customerId: mockCustomerId,
        assignedTailorId: mockTailorId,
        status: 'delivered',
      };

      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (db.orderFeedback.findUnique as jest.Mock).mockResolvedValue(null);
      (db.orderFeedback.create as jest.Mock).mockResolvedValue({ id: 'feedback-1', overallRating: 5 });
      (db.tailorProfile.findUnique as jest.Mock).mockResolvedValue({
        userId: mockTailorId,
        totalOrdersCompleted: 9,
        qualityScore: 4.5,
      });

      const feedbackData = {
        overallRating: 5,
        comment: 'Excellent stitching quality!',
      };

      const result = await ordersService.submitFeedback(mockOrderId, mockCustomerId, feedbackData);
      expect(result.overallRating).toBe(5);
      expect(db.tailorProfile.update).toHaveBeenCalled();
    });

    it('should reject feedback if order is not in delivered status', async () => {
      const mockOrder = { id: mockOrderId, customerId: mockCustomerId, status: 'in_stitching' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ordersService.submitFeedback(mockOrderId, mockCustomerId, { overallRating: 5 })
      ).rejects.toThrow(AppError);
    });
  });
});
