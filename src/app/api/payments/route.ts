import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // 1. Fetch payments linked directly or via orders
    const payments = await prisma.payment.findMany({
      where: { customerId: user.id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            isCod: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Also fetch orders that might be COD without a separate payment record yet
    const orders = await prisma.order.findMany({
      where: {
        customerId: user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        isCod: true,
        codCollected: true,
        codCollectedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Merge transactions
    const transactionList = [
      ...payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        orderNumber: p.order?.orderNumber || 'TLK-ORD',
        amount: Number(p.amount),
        currency: p.currency || 'PKR',
        method: p.method,
        status: p.status,
        date: p.paidAt || p.createdAt,
        gatewayTxId: p.gatewayTransactionId || null,
        isCod: false,
      })),
      ...orders
        .filter((o) => !payments.some((p) => p.orderId === o.id))
        .map((o) => ({
          id: `ord_${o.id}`,
          orderId: o.id,
          orderNumber: o.orderNumber,
          amount: Number(o.totalAmount),
          currency: 'PKR',
          method: o.isCod ? 'cod' : 'bank_transfer',
          status:
            o.codCollected ||
            o.status === 'payment_confirmed' ||
            o.status === 'delivered'
              ? 'completed'
              : 'pending',
          date: o.codCollectedAt || o.createdAt,
          gatewayTxId: null,
          isCod: o.isCod,
        })),
    ];

    // Sort by date descending
    transactionList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return apiSuccess({
      transactions: transactionList,
      totalSpent: transactionList
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
