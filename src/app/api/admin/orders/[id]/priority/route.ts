import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { updateOrderPriority } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('admin', 'super_admin');
    const { id } = await context.params;
    const { priorityLevel } = await request.json();

    if (priorityLevel === undefined || typeof priorityLevel !== 'number') {
      throw AppError.badRequest('Valid priorityLevel is required');
    }

    const order = await updateOrderPriority(id, priorityLevel);
    return apiSuccess(order, 200, { message: 'Priority updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
