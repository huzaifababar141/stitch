import { prisma } from '../prisma';
import { TcsService } from './tcs.service';
import { AppError } from '../utils/errors';
import { DeliveryStatus } from '@prisma/client';
import { supabaseAdmin } from '../supabase/admin';
import { logger } from '../utils/logger';

export class DeliveryService {
  /**
   * Admin dispatches an order via TCS
   */
  static async dispatchOrder(orderId: string, adminId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        deliveryAddress: true,
        delivery: true,
      },
    });

    if (!order) {
      throw AppError.notFound('Order not found');
    }

    if (
      order.status !== 'qc_approved' &&
      order.status !== 'stitching_complete'
    ) {
      throw AppError.badRequest(
        'Order is not ready for delivery (QC must be approved first)'
      );
    }

    if (order.delivery && order.delivery.trackingNumber) {
      throw AppError.badRequest(
        'Delivery tracking is already assigned for this order'
      );
    }

    if (!order.deliveryAddress) {
      throw AppError.badRequest('Delivery address is required to dispatch');
    }

    // Attempt to book with TCS
    const bookingResult = await TcsService.bookShipment({
      orderId: order.id,
      customerName:
        `${order.customer.firstName} ${order.customer.lastName || ''}`.trim(),
      customerPhone: order.customer.phone || '',
      customerAddress: order.deliveryAddress.addressLine1,
      customerCity: order.deliveryAddress.city,
      weight: 1.5,
      codAmount: order.totalAmount.toNumber(),
    });

    if (!bookingResult.success) {
      throw AppError.internal(
        'Failed to book shipment with TCS: ' + bookingResult.error
      );
    }

    // Transaction to create/update Delivery and update Order
    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courierName: 'TCS',
          trackingNumber: bookingResult.trackingNumber,
          courierBookingId: bookingResult.bookingId,
          status: 'pending',
          bookedAt: new Date(),
          statusHistory: {
            create: {
              status: 'pending',
              notes: 'Booked with TCS',
              recordedById: adminId,
              source: 'admin',
            },
          },
        },
        update: {
          courierName: 'TCS',
          trackingNumber: bookingResult.trackingNumber,
          courierBookingId: bookingResult.bookingId,
          status: 'pending',
          bookedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'dispatched' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'dispatched',
          notes: `Dispatched via TCS Tracking #${bookingResult.trackingNumber}`,
          changedById: adminId,
        },
      });

      return delivery;
    });

    return result;
  }

  /**
   * Update Delivery Status (used by webhooks or manual delivery agents)
   */
  static async updateStatus(
    orderId: string,
    status: DeliveryStatus,
    agentId?: string,
    notes?: string
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    if (!delivery) {
      throw AppError.notFound('Delivery record not found');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: delivery.id },
        data: {
          status,
          deliveredAt: status === 'delivered' ? new Date() : undefined,
          failedReason: status === 'failed_attempt' ? notes : undefined,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: delivery.id,
          status,
          notes,
          recordedById: agentId,
          source: agentId ? 'agent' : 'webhook',
        },
      });

      if (status === 'delivered') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'delivered' },
        });
      } else if (status === 'failed_attempt') {
        await tx.delivery.update({
          where: { id: delivery.id },
          data: { attemptCount: { increment: 1 }, lastAttemptAt: new Date() },
        });
      }

      return updatedDelivery;
    });

    return result;
  }

  /**
   * Upload POD image to Supabase and link to Delivery
   */
  static async uploadProofOfDelivery(
    orderId: string,
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    if (!delivery) {
      throw AppError.notFound('Delivery record not found');
    }

    const filePath = `${orderId}/${Date.now()}-${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from('pod-images')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      logger.error('Failed to upload POD to Supabase Storage', error);
      throw AppError.internal('Failed to upload Proof of Delivery image');
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('pod-images')
      .getPublicUrl(filePath);

    await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        podImageUrl: urlData.publicUrl,
      },
    });

    return urlData.publicUrl;
  }
}
