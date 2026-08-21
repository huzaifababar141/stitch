import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { setTailorAvailability } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const { isAvailable } = await request.json();

    if (isAvailable === undefined || typeof isAvailable !== 'boolean') {
      throw AppError.badRequest('isAvailable boolean is required');
    }

    const tailor = await setTailorAvailability(id, isAvailable);
    return apiSuccess(tailor, 200, {
      message: 'Availability updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
