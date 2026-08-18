import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getOrderDetail } from '@/lib/services/tailor.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const tailor = await requireRole('tailor', 'super_admin');
    const { id } = await context.params;
    const order = await getOrderDetail(tailor.id, id);
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
