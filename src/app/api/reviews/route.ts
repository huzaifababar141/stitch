import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // 1. Fetch user's feedback reviews
    const userReviews = await prisma.orderFeedback.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            garmentType: true,
            product: {
              select: {
                name: true,
                brand: true,
              },
            },
            assignedTailor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch delivered orders that haven't been reviewed yet
    const reviewedOrderIds = userReviews.map((r) => r.orderId);
    const unreviewedOrders = await prisma.order.findMany({
      where: {
        customerId: user.id,
        status: 'delivered',
        id: { notIn: reviewedOrderIds },
      },
      select: {
        id: true,
        orderNumber: true,
        garmentType: true,
        product: {
          select: {
            name: true,
            brand: true,
          },
        },
      },
      take: 5,
    });

    // 3. Compute fit rating average
    const totalRatingSum = userReviews.reduce(
      (sum, r) => sum + (r.fitRating || r.overallRating || 5),
      0
    );
    const avgScore =
      userReviews.length > 0
        ? (totalRatingSum / userReviews.length).toFixed(1)
        : '5.0';

    return apiSuccess({
      reviews: userReviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order?.orderNumber || 'TLK-ORD',
        suitName:
          r.order?.product?.name ||
          (r.order?.product?.brand
            ? `${r.order.product.brand} Unstitched Suit`
            : 'Custom Tailored Suit'),
        date: r.createdAt,
        rating: r.fitRating || r.overallRating || 5,
        reviewText: r.comment || 'Perfect fit and master craftsmanship!',
        tailorName: r.order?.assignedTailor
          ? `Ustad ${r.order.assignedTailor.firstName} ${r.order.assignedTailor.lastName || ''}`.trim()
          : 'Workshop Master Tailor',
        verified: r.isVerified,
      })),
      averageFitScore: avgScore,
      unreviewedOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
