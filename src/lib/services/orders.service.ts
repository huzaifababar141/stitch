import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AppError } from '@/lib/utils/errors';
import { GarmentType, OrderStatus } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import crypto from 'crypto';

function genOrderNum() {
  return 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function calculateTotal(
  garmentType: GarmentType,
  deliveryCity: string,
  couponCode?: string
) {
  // Read system settings for pricing or use standard defaults
  const basePrices: Record<string, number> = {
    full_suit: 3000,
    kameez: 2000,
    kameez_only: 2000,
    trouser: 1000,
    trouser_only: 1000,
    kurta: 2000,
    shalwar: 1000,
    dupatta: 500,
    other: 2500,
  };

  const deliveryRates: Record<string, number> = {
    default: 200,
    karachi: 150,
    lahore: 150,
    islamabad: 150,
  };

  const stitchingFee = basePrices[garmentType] || basePrices.full_suit;
  const deliveryFee =
    deliveryRates[deliveryCity.toLowerCase()] || deliveryRates.default;
  const addonFee = 0;

  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    const now = new Date();
    const isValidDate = !coupon?.validUntil || now < coupon.validUntil;
    const isUnderLimit =
      !coupon?.usageLimit || coupon.usedCount < coupon.usageLimit;

    if (coupon && coupon.isActive && isValidDate && isUnderLimit) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (stitchingFee * Number(coupon.discountValue)) / 100;
      } else {
        discountAmount = Number(coupon.discountValue);
      }
      discountAmount = Math.min(discountAmount, stitchingFee);
      couponId = coupon.id;
    }
  }

  const totalAmount = stitchingFee + deliveryFee + addonFee - discountAmount;

  return {
    stitchingFee,
    deliveryFee,
    addonFee,
    discountAmount,
    totalAmount,
    couponId,
  };
}

export async function createOrder(customerId: string, data: any) {
  // Validate Address
  const address = await prisma.address.findUnique({
    where: { id: data.deliveryAddressId },
  });
  if (!address || address.userId !== customerId) {
    throw AppError.badRequest('Invalid delivery address');
  }

  // Validate Measurement Profile
  const measurement = await prisma.measurementProfile.findUnique({
    where: { id: data.measurementProfileId },
  });
  if (!measurement || measurement.userId !== customerId) {
    throw AppError.badRequest('Invalid measurement profile');
  }

  // Validate Style Config
  const style = await prisma.styleConfiguration.findUnique({
    where: { id: data.styleConfigId },
  });
  if (!style || (style.userId && style.userId !== customerId)) {
    throw AppError.badRequest('Invalid style configuration');
  }

  // Calculate pricing
  const pricing = await calculateTotal(
    data.garmentType,
    address.city,
    data.couponCode
  );
  const orderNumber = genOrderNum();

  // Create Order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      productId: data.productId,
      garmentType: data.garmentType,
      measurementProfileId: measurement.id,
      measurementSnapshot: measurement as any,
      styleConfigId: style.id,
      styleSnapshot: style as any,
      deliveryAddressId: address.id,
      deliveryAddressSnapshot: address as any,
      stitchingFee: pricing.stitchingFee,
      deliveryFee: pricing.deliveryFee,
      addonFee: pricing.addonFee,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      couponId: pricing.couponId,
      internalNotes: data.internalNotes,
      status: 'pending_payment',
    },
  });

  if (pricing.couponId) {
    await prisma.couponUsage.create({
      data: {
        couponId: pricing.couponId,
        userId: customerId,
        orderId: order.id,
        discountApplied: pricing.discountAmount,
      },
    });
    await prisma.coupon.update({
      where: { id: pricing.couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Trigger tailor assignment background job via Edge Function
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    setTimeout(async () => {
      try {
        logger.info(
          `Triggering assignment edge function for order ${order.id}`
        );
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/assign-tailor`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ orderId: order.id }),
          }
        );
      } catch (e) {
        logger.error(`Edge function assign-tailor failed for ${order.id}`, e);
      }
    }, 0);
  }

  // Emit Realtime Event
  await emitOrderEvent(order.id, 'created', { orderNumber });

  return order;
}

export async function getCustomerOrders(
  customerId: string,
  filters: any = {},
  pagination = { page: 1, limit: 10 }
) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { customerId, deletedAt: null };
  if (filters.status) where.status = filters.status;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        delivery: true,
      },
    }),
  ]);

  return { total, page, limit, orders };
}

export async function getOrderById(
  orderId: string,
  requesterId: string,
  requesterRole: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
      measurementProfile: true,
      styleConfig: true,
      deliveryAddress: true,
      assignedTailor: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      delivery: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order || order.deletedAt) {
    throw AppError.notFound('Order not found');
  }

  // Ownership / Access check
  if (requesterRole === 'customer' && order.customerId !== requesterId) {
    throw AppError.forbidden('Access denied');
  }
  if (requesterRole === 'tailor' && order.assignedTailorId !== requesterId) {
    throw AppError.forbidden('Access denied');
  }
  if (requesterRole === 'qc_inspector' && order.qcInspectorId !== requesterId) {
    throw AppError.forbidden('Access denied');
  }

  return order;
}

export async function cancelOrder(
  orderId: string,
  customerId: string,
  reason: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== customerId) {
    throw AppError.notFound('Order not found');
  }

  // Only pending orders can be cancelled by customer
  if (!['pending_payment', 'payment_confirmed'].includes(order.status)) {
    throw AppError.badRequest('Order cannot be cancelled at this stage');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      cancelledById: customerId,
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: 'cancelled',
      notes: reason,
      changedById: customerId,
    },
  });

  await emitOrderEvent(orderId, 'cancelled', { reason });

  return updatedOrder;
}

export async function submitFeedback(
  orderId: string,
  customerId: string,
  feedbackData: any
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== customerId) {
    throw AppError.notFound('Order not found');
  }

  if (order.status !== 'delivered') {
    throw AppError.badRequest(
      'Feedback can only be submitted for delivered orders'
    );
  }

  const existingFeedback = await prisma.orderFeedback.findUnique({
    where: { orderId },
  });
  if (existingFeedback) {
    throw AppError.badRequest('Feedback already submitted for this order');
  }

  const feedback = await prisma.orderFeedback.create({
    data: {
      ...feedbackData,
      orderId,
      customerId,
    },
  });

  return feedback;
}

export async function emitOrderEvent(
  orderId: string,
  eventType: string,
  data: any
) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    const meta = (order.metadata as Record<string, any>) || {};
    meta.lastEvent = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    await supabaseAdmin
      .from('orders')
      .update({ metadata: meta })
      .eq('id', orderId);
  } catch (error: any) {
    logger.error(`Failed to emit order event: ${error.message}`);
  }
}
