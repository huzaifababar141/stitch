import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: profileId } = await context.params;

    // Verify ownership
    const existingProfile = await prisma.measurementProfile.findFirst({
      where: { id: profileId, userId: user.id, deletedAt: null },
    });

    if (!existingProfile) {
      throw AppError.notFound('Measurement profile not found');
    }

    if (existingProfile.isDefault) {
      return apiSuccess(existingProfile, 200, {
        message: 'Measurement profile is already default',
      });
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Unset previous defaults
      await tx.measurementProfile.updateMany({
        where: { userId: user.id, isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });

      // Set this as default
      return await tx.measurementProfile.update({
        where: { id: profileId },
        data: { isDefault: true },
      });
    });

    return apiSuccess(updatedProfile, 200, {
      message: 'Default measurement profile updated',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
