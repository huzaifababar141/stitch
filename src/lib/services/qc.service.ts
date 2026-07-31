import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'
import { emitOrderEvent } from '@/lib/services/orders.service'
import { QcResult } from '@prisma/client'

export async function getPendingInspections(inspectorId: string) {
  // Find orders where stitching is complete but QC not done, 
  // or specifically assigned to this inspector.
  const orders = await prisma.order.findMany({
    where: {
      status: 'stitching_complete',
      deletedAt: null,
      OR: [
        { qcInspectorId: inspectorId },
        { qcInspectorId: null }
      ]
    },
    select: {
      id: true,
      orderNumber: true,
      stitchingDeadline: true,
      garmentType: true,
      priorityLevel: true,
      assignedTailor: { select: { firstName: true, lastName: true } }
    },
    orderBy: { priorityLevel: 'desc' }
  })

  return orders
}

export async function getInspectionDetail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      assignedTailor: { select: { firstName: true, lastName: true } },
      customer: { select: { firstName: true, lastName: true, phone: true } },
      measurementProfile: true
    }
  })

  if (!order) throw AppError.notFound('Order not found')
  return order
}

export async function submitInspection(
  inspectorId: string,
  orderId: string,
  data: {
    result: QcResult,
    notes?: string,
    images?: string[]
  }
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw AppError.notFound('Order not found')

  if (order.status !== 'stitching_complete') {
    throw AppError.badRequest('Order is not ready for QC inspection')
  }

  const isApproved = data.result === 'approved'
  const newStatus = isApproved ? 'ready_for_delivery' : 'in_stitching'

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Update order status and QC fields
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        qcInspectorId: inspectorId,
        qcResult: data.result,
        qcInspectedAt: new Date(),
        qcNotes: data.notes,
        qcImages: data.images || order.qcImages,
        qcRetryCount: isApproved ? order.qcRetryCount : order.qcRetryCount + 1
      }
    })

    // 2. Add history
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        notes: `QC ${data.result}: ${data.notes || ''}`,
        createdById: inspectorId
      }
    })

    // 3. Create delivery record if approved
    if (isApproved) {
      await tx.delivery.create({
        data: {
          orderId,
          status: 'pending'
        }
      })
    }

    return updated
  })

  // Fire realtime event
  await emitOrderEvent(orderId, 'qc_completed', { result: data.result })

  // Fire notifications
  if (isApproved) {
    // Notify admin or customer
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: updatedOrder.customerId,
        templateKey: 'ORDER_DISPATCHED',
        variables: { orderId: updatedOrder.orderNumber },
        channel: 'whatsapp'
      })
    }).catch(console.error)
  } else {
    // Notify Tailor
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: updatedOrder.assignedTailorId,
        templateKey: 'QC_FAILED',
        variables: { orderId: updatedOrder.orderNumber, reason: data.notes },
        channel: 'in_app'
      })
    }).catch(console.error)
  }

  return updatedOrder
}

export async function getInspectionHistory(inspectorId: string) {
  return await prisma.order.findMany({
    where: {
      qcInspectorId: inspectorId,
      qcInspectedAt: { not: null }
    },
    select: {
      id: true,
      orderNumber: true,
      qcResult: true,
      qcInspectedAt: true,
      qcNotes: true
    },
    orderBy: { qcInspectedAt: 'desc' },
    take: 50
  })
}
