import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getOrdersByStatus } from '@/lib/services/admin.service';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin']);
    const data = await getOrdersByStatus();
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
