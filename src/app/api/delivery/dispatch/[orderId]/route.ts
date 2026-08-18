import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { requireRole } from '@/lib/utils/auth';
import { DeliveryService } from '@/lib/services/delivery.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireRole('admin', 'super_admin');
    const { orderId } = await context.params;

    const delivery = await DeliveryService.dispatchOrder(orderId, user.id);

    return apiSuccess({ delivery }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
