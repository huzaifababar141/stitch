import { Prisma, GarmentType, OrderStatus, UserRole, AuditTriggerType } from '@prisma/client';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { orderEvents } from './orders.events';
import { CreateOrderInput, SubmitFeedbackInput } from './orders.validator';

const BASE_STITCHING_FEES: Record<GarmentType, number> = {
  full_suit: 3500,
  kameez: 2200,
  trouser: 1500,
  dupatta: 800,
  kurta: 1800,
  shalwar: 1200,
  kameez_only: 2000,
  trouser_only: 1400,
  other: 2500,
};

export class OrdersService {
  /**
   * Calculate stitching fee, delivery fee, addon fee, discount & total (server-side protection)
   */
  async calculateTotal(garmentType: GarmentType, deliveryCity: string, couponCode?: string | null) {
    const stitchingFee = BASE_STITCHING_FEES[garmentType] || 2500;

    // Delivery Fee: Major metropolitan cities (Lahore, Karachi, Islamabad) get discounted rate
    const majorCities = ['lahore', 'karachi', 'islamabad', 'rawalpindi'];
    const normalizedCity = deliveryCity.toLowerCase().trim();
    const deliveryFee = majorCities.some((c) => normalizedCity.includes(c)) ? 250 : 350;

    const addonFee = 0;
    let discountAmount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.validUntil || coupon.validUntil > new Date()) &&
        stitchingFee >= Number(coupon.minOrderAmount)
      ) {
        couponId = coupon.id;
        if (coupon.discountType === 'percentage') {
          const rawDiscount = (stitchingFee * Number(coupon.discountValue)) / 100;
          discountAmount = coupon.maxDiscountAmount
            ? Math.min(rawDiscount, Number(coupon.maxDiscountAmount))
            : rawDiscount;
        } else if (coupon.discountType === 'fixed_amount') {
          discountAmount = Math.min(stitchingFee, Number(coupon.discountValue));
        } else if (coupon.discountType === 'free_delivery') {
          discountAmount = deliveryFee;
        }
      }
    }

    const subtotal = stitchingFee + deliveryFee + addonFee;
    const totalAmount = Math.max(0, subtotal - discountAmount);

    return {
      stitchingFee,
      deliveryFee,
      addonFee,
      discountAmount,
      totalAmount,
      couponId,
    };
  }

  /**
   * Generate unique order number e.g. ORD-LX8K2-789
   */
  private generateOrderNumber(): string {
    const randomHex = Math.floor(100 + Math.random() * 900);
    const timestampStr = Date.now().toString(36).toUpperCase().slice(-5);
    return `ORD-${timestampStr}-${randomHex}`;
  }

  /**
   * Create order with complete deep snapshots & transaction status history
   */
  async createOrder(customerId: string, data: CreateOrderInput) {
    // 1. Verify customer exists and active
    const customer = await db.user.findFirst({
      where: { id: customerId, deletedAt: null },
    });

    if (!customer || !customer.isActive || customer.isBlocked) {
      throw AppError.forbidden('Customer account is invalid or restricted');
    }

    // 2. Verify and snapshot measurement profile
    const measurementProfile = await db.measurementProfile.findFirst({
      where: { id: data.measurementProfileId, userId: customerId, deletedAt: null },
    });

    if (!measurementProfile) {
      throw AppError.badRequest('Measurement profile not found or does not belong to customer');
    }

    // 3. Verify and snapshot delivery address
    const deliveryAddress = await db.address.findFirst({
      where: { id: data.deliveryAddressId, userId: customerId, deletedAt: null },
    });

    if (!deliveryAddress) {
      throw AppError.badRequest('Delivery address not found or does not belong to customer');
    }

    // 4. Verify product (if provided)
    let productSnapshot: Record<string, any> = {};
    if (data.productId) {
      const product = await db.product.findUnique({
        where: { id: data.productId },
      });

      if (product) {
        productSnapshot = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          images: product.images,
          priceOriginal: product.priceOriginal,
          sourceUrl: product.sourceUrl,
        };
      }
    }

    // 5. Verify style config (if provided)
    let styleSnapshot: Record<string, any> = data.styleOverrides ?? {};
    if (data.styleConfigId) {
      const styleConfig = await db.styleConfiguration.findFirst({
        where: { id: data.styleConfigId },
      });
      if (styleConfig) {
        styleSnapshot = { ...styleConfig, ...data.styleOverrides };
      }
    }

    // 6. Calculate total server-side
    const pricing = await this.calculateTotal(
      data.garmentType,
      deliveryAddress.city,
      data.couponCode
    );

    const isCod = data.paymentMethod === 'cod';
    const initialStatus: OrderStatus = isCod ? 'payment_confirmed' : 'pending_payment';
    const orderNumber = this.generateOrderNumber();

    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          productId: data.productId ?? null,
          garmentType: data.garmentType,
          measurementProfileId: data.measurementProfileId,
          measurementSnapshot: measurementProfile as any,
          styleConfigId: data.styleConfigId ?? null,
          styleSnapshot,
          productSnapshot,
          deliveryAddressId: data.deliveryAddressId,
          deliveryAddressSnapshot: deliveryAddress as any,
          status: initialStatus,
          stitchingFee: new Prisma.Decimal(pricing.stitchingFee),
          deliveryFee: new Prisma.Decimal(pricing.deliveryFee),
          addonFee: new Prisma.Decimal(pricing.addonFee),
          discountAmount: new Prisma.Decimal(pricing.discountAmount),
          couponId: pricing.couponId ?? null,
          totalAmount: new Prisma.Decimal(pricing.totalAmount),
          isCod,
          adminNotes: data.specialInstructions ?? null,
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          statusHistory: true,
        },
      });

      // Create initial status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: createdOrder.id,
          fromStatus: null,
          toStatus: initialStatus,
          changedById: customerId,
          triggerType: AuditTriggerType.manual,
          notes: isCod
            ? 'Order placed with Cash on Delivery (Auto-confirmed)'
            : 'Order created, awaiting payment',
        },
      });

      return createdOrder;
    });

    // Trigger lifecycle events
    orderEvents.emit('order:created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId,
    });

    if (isCod) {
      orderEvents.emit('order:payment_confirmed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    return order;
  }

  /**
   * Get customer orders with status filter & pagination
   */
  async getCustomerOrders(
    customerId: string,
    filters?: { status?: OrderStatus; search?: string },
    pagination?: { page?: number; limit?: number }
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      customerId,
      deletedAt: null,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } } as any,
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          delivery: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID with ownership or role check
   */
  async getOrderById(orderId: string, requesterId: string, requesterRole: UserRole) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        assignedTailor: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        qcInspector: {
          select: { id: true, firstName: true, lastName: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        delivery: true,
        feedback: true,
      },
    });

    if (!order || order.deletedAt) {
      throw AppError.notFound('Order not found');
    }

    // Role check: Customers can only view their own orders
    if (requesterRole === UserRole.customer && order.customerId !== requesterId) {
      throw AppError.forbidden('You are not authorized to view this order');
    }

    return order;
  }

  /**
   * Cancel an order (Allowed if status is pending_payment, payment_confirmed, or assigned)
   */
  async cancelOrder(orderId: string, requesterId: string, reason: string) {
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.deletedAt) {
      throw AppError.notFound('Order not found');
    }

    const nonCancellableStatuses: OrderStatus[] = [
      'in_stitching',
      'stitching_complete',
      'qc_pending',
      'qc_approved',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (nonCancellableStatuses.includes(order.status)) {
      throw AppError.badRequest(
        `Order cannot be cancelled in current status '${order.status}'. Stitching or delivery has already commenced.`
      );
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason,
          cancelledById: requesterId,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'cancelled',
          changedById: requesterId,
          triggerType: AuditTriggerType.manual,
          notes: `Order cancelled by user. Reason: ${reason}`,
        },
      });

      return cancelled;
    });

    orderEvents.emit('order:cancelled', { orderId, reason });

    return updatedOrder;
  }

  /**
   * Submit feedback for delivered order and update tailor quality score
   */
  async submitFeedback(orderId: string, customerId: string, data: SubmitFeedbackInput) {
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.deletedAt) {
      throw AppError.notFound('Order not found');
    }

    if (order.customerId !== customerId) {
      throw AppError.forbidden('You can only submit feedback for your own orders');
    }

    if (order.status !== 'delivered') {
      throw AppError.badRequest('Feedback can only be submitted for delivered orders');
    }

    const existingFeedback = await db.orderFeedback.findUnique({
      where: { orderId },
    });

    if (existingFeedback) {
      throw AppError.conflict('Feedback has already been submitted for this order');
    }

    const feedback = await db.$transaction(async (tx) => {
      const createdFeedback = await tx.orderFeedback.create({
        data: {
          orderId,
          customerId,
          tailorId: order.assignedTailorId ?? null,
          overallRating: data.overallRating,
          qualityRating: data.qualityRating ?? null,
          fitRating: data.fitRating ?? null,
          deliveryRating: data.deliveryRating ?? null,
          comment: data.comment ?? null,
          images: data.images ?? [],
        },
      });

      // Update tailor rolling quality score if tailor was assigned
      if (order.assignedTailorId) {
        const tailorProfile = await tx.tailorProfile.findUnique({
          where: { userId: order.assignedTailorId },
        });

        if (tailorProfile) {
          const currentCount = tailorProfile.totalOrdersCompleted || 1;
          const currentScore = Number(tailorProfile.qualityScore) || 5.0;
          const newScore = (currentScore * currentCount + data.overallRating) / (currentCount + 1);

          await tx.tailorProfile.update({
            where: { userId: order.assignedTailorId },
            data: {
              qualityScore: new Prisma.Decimal(newScore.toFixed(2)),
            },
          });
        }
      }

      return createdFeedback;
    });

    orderEvents.emit('order:feedback_submitted', {
      orderId,
      rating: data.overallRating,
    });

    return feedback;
  }
}

export const ordersService = new OrdersService();
