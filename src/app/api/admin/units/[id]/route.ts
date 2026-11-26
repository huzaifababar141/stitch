import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { updateUnitSchema } from '@/lib/validations/unit';
import { getUnit, updateUnit, deleteUnit } from '@/lib/services/units.service';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;
    const unit = await getUnit(id);
    return apiSuccess(unit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;
    const data = await validateBody(request, updateUnitSchema);
    const unit = await updateUnit(id, data);
    return apiSuccess(unit, 200, {
      message: 'Tailoring unit updated successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;
    const result = await deleteUnit(id);
    return apiSuccess(result, 200, { message: result.message });
  } catch (error) {
    return handleApiError(error);
  }
}
