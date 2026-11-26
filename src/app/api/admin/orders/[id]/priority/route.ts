import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { updateOrderPriority } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;
    const { priorityLevel } = await request.json();

    if (
      typeof priorityLevel !== 'number' ||
      priorityLevel < 0 ||
      priorityLevel > 3
    ) {
      throw AppError.badRequest('priorityLevel must be 0–3');
    }

    const order = await updateOrderPriority(id, priorityLevel);
    return apiSuccess(order, 200, { message: 'Priority updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
