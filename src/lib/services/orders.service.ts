import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AppError } from '@/lib/utils/errors'
import { GarmentType, OrderStatus } from '@prisma/client'
import { logger } from '@/lib/utils/logger'
import { generateOrderNumber } from '@/lib/utils/crypto' // Or define a local helper
import crypto from 'crypto'

// Local helper if crypto doesn't have it
function genOrderNum() {
  return 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

export async function calculateTotal(
  garmentType: GarmentType, 
  deliveryCity: string, 
  couponCode?: string
) {
  // Read system settings for pricing
  const basePricesSetting = await prisma.systemSetting.findUnique({ where: { key: 'pricing_base' } })
  const basePrices: Record<string, number> = basePricesSetting?.value as any || { full_suit: 3000, kurti: 1500, trouser: 1000 }
  
  const deliverySetting = await prisma.systemSetting.findUnique({ where: { key: 'delivery_rates' } })
  const deliveryRates: Record<string, number> = deliverySetting?.value as any || { default: 200, karachi: 150 }

  const stitchingFee = basePrices[garmentType] || basePrices.full_suit
  const deliveryFee = deliveryRates[deliveryCity.toLowerCase()] || deliveryRates.default
  const addonFee = 0 // Mock for now

  let discountAmount = 0
  let couponId = null

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
    if (coupon && coupon.isActive && new Date() < coupon.expiresAt && coupon.usageCount < (coupon.maxUses || Infinity)) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (stitchingFee * Number(coupon.discountValue)) / 100
      } else {
        discountAmount = Number(coupon.discountValue)
      }
      // Ensure we don't discount more than the stitching fee
      discountAmount = Math.min(discountAmount, stitchingFee)
      couponId = coupon.id
    }
  }

  const totalAmount = stitchingFee + deliveryFee + addonFee - discountAmount

  return {
    stitchingFee,
    deliveryFee,
    addonFee,
    discountAmount,
    totalAmount,
    couponId
  }
}

export async function createOrder(customerId: string, data: any) {
  // Validate Address
  const address = await prisma.address.findUnique({ where: { id: data.deliveryAddressId } })
  if (!address || address.userId !== customerId) {
    throw AppError.badRequest('Invalid delivery address')
  }

  // Validate Measurement Profile
  const measurement = await prisma.measurementProfile.findUnique({ where: { id: data.measurementProfileId } })
  if (!measurement || measurement.userId !== customerId) {
    throw AppError.badRequest('Invalid measurement profile')
  }

  // Validate Style Config
  const style = await prisma.styleConfiguration.findUnique({ where: { id: data.styleConfigId } })
  if (!style || style.userId !== customerId) {
    throw AppError.badRequest('Invalid style configuration')
  }

  // Calculate pricing
  const pricing = await calculateTotal(data.garmentType, address.city, data.couponCode)

  const orderNumber = genOrderNum()

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
      status: 'pending_payment'
    }
  })

  if (pricing.couponId) {
    await prisma.couponUsage.create({
      data: {
        couponId: pricing.couponId,
        userId: customerId,
        orderId: order.id,
        discountApplied: pricing.discountAmount
      }
    })
    await prisma.coupon.update({
      where: { id: pricing.couponId },
      data: { usageCount: { increment: 1 } }
    })
  }

  // Trigger tailor assignment background job via Edge Function
  // Wait, Next.js route handlers can just use native fetch to call Edge Functions
  setTimeout(async () => {
    try {
      logger.info(`Triggering assignment edge function for order ${order.id}`)
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/assign-tailor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ orderId: order.id })
      })
    } catch (e) {
      logger.error(`Edge function assign-tailor failed for ${order.id}`, e)
    }
  }, 0)

  // Emit Realtime Event
  await emitOrderEvent(order.id, 'created', { orderNumber })

  return order
}

export async function getCustomerOrders(customerId: string, filters: any = {}, pagination = { page: 1, limit: 10 }) {
  const skip = (pagination.page - 1) * pagination.limit
  
  const where: any = { customerId, deletedAt: null }
  if (filters.status) where.status = filters.status

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return { total, orders }
}

export async function getOrderById(orderId: string, requesterId: string, requesterRole: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order || order.deletedAt) {
    throw AppError.notFound('Order not found')
  }

  // Ownership / Access check
  if (requesterRole === 'customer' && order.customerId !== requesterId) {
    throw AppError.forbidden('Access denied')
  }
  if (requesterRole === 'tailor' && order.assignedTailorId !== requesterId) {
    throw AppError.forbidden('Access denied')
  }
  if (requesterRole === 'qc_inspector' && order.qcInspectorId !== requesterId) {
    throw AppError.forbidden('Access denied')
  }

  return order
}

export async function cancelOrder(orderId: string, customerId: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.customerId !== customerId) {
    throw AppError.notFound('Order not found')
  }

  // Only pending orders can be cancelled by customer
  if (!['pending_payment', 'confirmed'].includes(order.status)) {
    throw AppError.badRequest('Order cannot be cancelled at this stage')
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      cancelledById: customerId
    }
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: 'cancelled',
      notes: reason,
      createdById: customerId
    }
  })

  await emitOrderEvent(orderId, 'cancelled', { reason })

  return updatedOrder
}

export async function submitFeedback(orderId: string, customerId: string, feedbackData: any) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.customerId !== customerId) {
    throw AppError.notFound('Order not found')
  }

  if (order.status !== 'delivered') {
    throw AppError.badRequest('Feedback can only be submitted for delivered orders')
  }

  const existingFeedback = await prisma.orderFeedback.findUnique({ where: { orderId } })
  if (existingFeedback) {
    throw AppError.badRequest('Feedback already submitted for this order')
  }

  const feedback = await prisma.orderFeedback.create({
    data: {
      ...feedbackData,
      orderId,
      customerId
    }
  })

  return feedback
}

export async function emitOrderEvent(orderId: string, eventType: string, data: any) {
  try {
    // We update the metadata field to trigger Supabase Realtime via Postgres CDC
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return
    
    const meta = (order.metadata as Record<string, any>) || {}
    meta.lastEvent = { type: eventType, data, timestamp: new Date().toISOString() }

    await supabaseAdmin
      .from('orders')
      .update({ metadata: meta })
      .eq('id', orderId)
      
    logger.info(`Emitted realtime event ${eventType} for order ${orderId}`)
  } catch (error) {
    logger.error(`Failed to emit order event ${eventType} for ${orderId}:`, error)
  }
}
