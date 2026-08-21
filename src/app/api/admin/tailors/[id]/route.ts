import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getTailor, updateTailor } from '@/lib/services/admin.service';
import { validateBody } from '@/lib/utils/validation';
import { updateTailorSchema } from '@/lib/validations/tailor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const tailor = await getTailor(id);
    return apiSuccess(tailor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const data = await validateBody(request, updateTailorSchema);

    const updatedTailor = await updateTailor(id, data);
    return apiSuccess(updatedTailor, 200, {
      message: 'Tailor updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
