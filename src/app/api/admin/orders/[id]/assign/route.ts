import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { assignTailor } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole('admin', 'super_admin');
    const { id } = await context.params;
    const { tailorId } = await request.json();

    if (!tailorId) throw AppError.badRequest('tailorId is required');

    const order = await assignTailor(id, tailorId, admin.id);
    return apiSuccess(order, 200, { message: 'Tailor assigned successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
