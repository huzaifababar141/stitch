import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getOrderById } from '@/lib/services/orders.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: orderId } = await context.params;
    const role = user.user_metadata?.role || 'customer';

    const order = await getOrderById(orderId, user.id, role);

    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
