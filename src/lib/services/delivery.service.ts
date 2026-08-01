import { prisma } from '../prisma'
import { TcsService } from './tcs.service'
import { AppError } from '../utils/errors'
import { DeliveryStatus } from '@prisma/client'
import { createClient } from '../supabase/server'
import { logger } from '../utils/logger'

export class DeliveryService {
  /**
   * Admin dispatches an order via TCS
   */
  static async dispatchOrder(orderId: string, adminId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { profile: true } },
        shippingAddress: true,
        delivery: true
      }
    })

    if (!order) {
      throw AppError.notFound('Order not found')
    }

    if (order.status !== 'ready_for_delivery') {
      throw AppError.badRequest('Order is not ready for delivery')
    }

    if (order.delivery) {
      throw AppError.badRequest('Delivery is already scheduled for this order')
    }

    if (!order.shippingAddress) {
      throw AppError.badRequest('Shipping address is required to dispatch')
    }

    // Attempt to book with TCS
    const bookingResult = await TcsService.bookShipment({
      orderId: order.id,
      customerName: order.customer.profile?.fullName || 'Customer',
      customerPhone: order.customer.profile?.phoneNumber || '',
      customerAddress: order.shippingAddress.addressLine1,
      customerCity: order.shippingAddress.city,
      weight: 1.5, // Default weight for a dress
      codAmount: order.totalAmount.toNumber() // Assuming 100% COD or handle properly
    })

    if (!bookingResult.success) {
      throw AppError.internal('Failed to book shipment with TCS: ' + bookingResult.error)
    }

    // Transaction to create Delivery and update Order
    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.create({
        data: {
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
              source: 'admin'
            }
          }
        }
      })

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'out_for_delivery' }
      })

      return delivery
    })

    return result
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
      where: { orderId }
    })

    if (!delivery) {
      throw AppError.notFound('Delivery record not found')
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: delivery.id },
        data: {
          status,
          deliveredAt: status === 'delivered' ? new Date() : undefined,
          failedReason: status === 'failed_attempt' ? notes : undefined
        }
      })

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: delivery.id,
          status,
          notes,
          recordedById: agentId,
          source: agentId ? 'agent' : 'webhook'
        }
      })

      if (status === 'delivered') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'delivered' }
        })
      } else if (status === 'failed_attempt') {
        await tx.delivery.update({
          where: { id: delivery.id },
          data: { attemptCount: { increment: 1 }, lastAttemptAt: new Date() }
        })
      }

      return updatedDelivery
    })

    return result
  }

  /**
   * Upload POD image to Supabase and link to Delivery
   */
  static async uploadProofOfDelivery(orderId: string, fileBuffer: Buffer, fileName: string, contentType: string) {
    const supabase = createClient() // Must be called in App Router context (Server Action/API Route)
    
    const delivery = await prisma.delivery.findUnique({
      where: { orderId }
    })

    if (!delivery) {
      throw AppError.notFound('Delivery record not found')
    }

    const filePath = `${orderId}/${Date.now()}-${fileName}`

    const { data, error } = await supabase.storage
      .from('pod-images')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      })

    if (error) {
      logger.error('Failed to upload POD to Supabase Storage', error)
      throw AppError.internal('Failed to upload Proof of Delivery image')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pod-images')
      .getPublicUrl(filePath)

    await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        podImageUrl: urlData.publicUrl
      }
    })

    return urlData.publicUrl
  }
}
