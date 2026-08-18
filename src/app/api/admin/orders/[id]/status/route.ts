import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { overrideOrderStatus } from '@/lib/services/admin.service';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole('super_admin'); // Only super admin can override
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw AppError.badRequest('Valid status is required');
    }

    const order = await overrideOrderStatus(id, status, admin.id);
    return apiSuccess(order, 200, {
      message: 'Status overridden successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
