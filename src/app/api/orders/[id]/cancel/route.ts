import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { cancelOrderSchema } from '@/lib/validations/orders';
import { cancelOrder } from '@/lib/services/orders.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: orderId } = await context.params;
    const { reason } = await validateBody(request, cancelOrderSchema);

    const updatedOrder = await cancelOrder(orderId, user.id, reason);

    return apiSuccess(updatedOrder, 200, {
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
