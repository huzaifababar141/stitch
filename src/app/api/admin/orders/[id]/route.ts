import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getOrder } from '@/lib/services/admin.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('admin', 'super_admin');
    const { id } = await context.params;
    const order = await getOrder(id);
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
