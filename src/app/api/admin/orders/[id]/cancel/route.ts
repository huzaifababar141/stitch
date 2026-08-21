import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { cancelOrder } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const { reason } = await request.json().catch(() => ({}));

    const order = await cancelOrder(
      id,
      typeof reason === 'string' ? reason.trim() : '',
      admin.id
    );
    return apiSuccess(order, 200, { message: 'Order cancelled successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
