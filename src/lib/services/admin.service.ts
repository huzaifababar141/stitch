import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'
import { emitOrderEvent } from '@/lib/services/orders.service'
import { OrderStatus } from '@prisma/client'

export async function listOrders(filters: any, pagination: any) {
  const skip = (pagination.page - 1) * pagination.limit
  const where: any = { deletedAt: null }
  
  if (filters.status) where.status = filters.status
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { customer: { firstName: { contains: filters.search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: filters.search, mode: 'insensitive' } } }
    ]
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, firstName: true, lastName: true } } }
    })
  ])

  return { total, orders }
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      assignedTailor: true,
      qcInspector: true
    }
  })

  if (!order) throw AppError.notFound('Order not found')
  return order
}

export async function assignTailor(orderId: string, tailorId: string, adminId: string) {
  const order = await getOrder(orderId)
  
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor', isActive: true }
  })
  if (!tailor) throw AppError.badRequest('Invalid or inactive tailor')

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      assignedTailorId: tailorId,
      assignedAt: new Date(),
      status: 'in_stitching'
    }
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: 'in_stitching',
      notes: 'Manually assigned by admin',
      createdById: adminId
    }
  })

  await emitOrderEvent(orderId, 'assigned', { tailorId })

  // Trigger tailor notification via edge function
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      userId: tailorId,
      templateKey: 'ORDER_ASSIGNED',
      variables: { orderId: order.orderNumber },
      channel: 'in_app'
    })
  }).catch(console.error)

  return updatedOrder
}

export async function updateOrderPriority(orderId: string, priorityLevel: number) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { priorityLevel }
  })
}

export async function addAdminNote(orderId: string, note: string) {
  const order = await getOrder(orderId)
  const existingNotes = order.adminNotes ? order.adminNotes + '\n' : ''
  
  return await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: existingNotes + note }
  })
}

export async function overrideOrderStatus(orderId: string, status: OrderStatus, adminId: string) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status,
      notes: 'Status overridden by Super Admin',
      createdById: adminId
    }
  })

  await emitOrderEvent(orderId, 'status_override', { status })
  return updatedOrder
}

export async function listTailors(filters: any = {}) {
  return await prisma.user.findMany({
    where: { role: 'tailor', ...filters },
    select: { id: true, firstName: true, lastName: true, phone: true, isActive: true, metadata: true }
  })
}

export async function getDashboardStats() {
  const [totalOrders, activeTailors, pendingQC] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'tailor', isActive: true } }),
    prisma.order.count({ where: { status: 'stitching_complete' } })
  ])
  
  return { totalOrders, activeTailors, pendingQC }
}

export async function getRevenueByDay() {
  // Simple mock for revenue aggregation
  return [
    { date: '2025-01-01', revenue: 5000 },
    { date: '2025-01-02', revenue: 7500 }
  ]
}

export async function getTailorPerformance() {
  // Simple mock for tailor performance
  return [
    { tailorId: 'tailor1', completedOrders: 15, avgQcScore: 4.8 }
  ]
}
