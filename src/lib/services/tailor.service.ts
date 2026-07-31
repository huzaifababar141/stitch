import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'
import { emitOrderEvent } from '@/lib/services/orders.service'
import { OrderStatus } from '@prisma/client'

export async function getMyDashboard(tailorId: string) {
  const [activeOrders, pendingOrders, completedOrders] = await Promise.all([
    prisma.order.count({ where: { assignedTailorId: tailorId, status: 'in_stitching' } }),
    prisma.order.count({ where: { assignedTailorId: tailorId, status: 'assigned' } }),
    prisma.order.count({ where: { assignedTailorId: tailorId, status: 'stitching_complete' } })
  ])

  // Mock quality score
  const qualityScore = 4.8

  return { activeOrders, pendingOrders, completedOrders, qualityScore }
}

export async function getMyOrders(tailorId: string, filters: any = {}) {
  const where: any = { assignedTailorId: tailorId, deletedAt: null }
  if (filters.status) where.status = filters.status

  const orders = await prisma.order.findMany({
    where,
    orderBy: { stitchingDeadline: 'asc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      stitchingDeadline: true,
      garmentType: true,
      measurementSnapshot: true,
      styleSnapshot: true,
      priorityLevel: true
    }
  })

  return orders
}

export async function getOrderDetail(tailorId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order || order.deletedAt) throw AppError.notFound('Order not found')
  if (order.assignedTailorId !== tailorId) throw AppError.forbidden('Access denied to this order')

  return order
}

export async function updateWorkStatus(tailorId: string, orderId: string, newStatus: OrderStatus) {
  const order = await getOrderDetail(tailorId, orderId)

  // State machine logic
  if (order.status === 'assigned' && newStatus !== 'in_stitching') {
    throw AppError.badRequest('Can only move from assigned to in_stitching')
  }
  if (order.status === 'in_stitching' && newStatus !== 'stitching_complete') {
    throw AppError.badRequest('Can only move from in_stitching to stitching_complete')
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: newStatus,
      notes: `Status updated by tailor`,
      createdById: tailorId
    }
  })

  await emitOrderEvent(orderId, 'work_status_updated', { status: newStatus })

  // Trigger Supabase Edge Function for notification if stitching complete
  if (newStatus === 'stitching_complete') {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: order.customerId, // assuming we notify the customer or admin, let's notify admin for QC
        templateKey: 'ORDER_READY_FOR_QC',
        variables: { orderId: order.orderNumber },
        channel: 'in_app'
      })
    }).catch(console.error)
  }

  return updatedOrder
}
