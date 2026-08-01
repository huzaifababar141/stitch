import { DeliveryService } from '@/lib/services/delivery.service'
import { TcsService } from '@/lib/services/tcs.service'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    delivery: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
    deliveryStatusHistory: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/services/tcs.service', () => ({
  TcsService: {
    bookShipment: jest.fn(),
  },
}))

describe('DeliveryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully dispatch an order and create delivery', async () => {
    const mockOrder = {
      id: 'order-1',
      status: 'ready_for_delivery',
      customer: { profile: { fullName: 'Test', phoneNumber: '123' } },
      shippingAddress: { addressLine1: 'Line 1', city: 'Lahore' },
      totalAmount: { toNumber: () => 1000 },
      delivery: null,
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
    ;(TcsService.bookShipment as jest.Mock).mockResolvedValue({
      success: true,
      trackingNumber: 'TCS-123',
      bookingId: 'B-123',
    })
    ;(prisma.delivery.create as jest.Mock).mockResolvedValue({ id: 'del-1' })

    const result = await DeliveryService.dispatchOrder('order-1', 'admin-1')

    expect(TcsService.bookShipment).toHaveBeenCalled()
    expect(prisma.delivery.create).toHaveBeenCalled()
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'out_for_delivery' },
    })
    expect(result).toBeDefined()
  })

  it('should fail if order is not ready for delivery', async () => {
    const mockOrder = {
      id: 'order-1',
      status: 'in_progress', // Not ready
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    await expect(DeliveryService.dispatchOrder('order-1', 'admin-1')).rejects.toThrow(
      AppError
    )
  })

  it('should update delivery status and add history log', async () => {
    const mockDelivery = { id: 'del-1', orderId: 'order-1' }
    ;(prisma.delivery.findUnique as jest.Mock).mockResolvedValue(mockDelivery)

    await DeliveryService.updateStatus('order-1', 'delivered', 'agent-1', 'Left at door')

    expect(prisma.delivery.update).toHaveBeenCalled()
    expect(prisma.deliveryStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'delivered',
          notes: 'Left at door',
          recordedById: 'agent-1',
        }),
      })
    )
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'delivered' },
    })
  })
})
