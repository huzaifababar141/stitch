import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { validateMeasurementsWithAI } from '@/lib/services/ai-validation';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    // Trigger AI validation synchronously and return result
    const updatedProfile = await validateMeasurementsWithAI(profileId);

    if (!updatedProfile) {
      throw AppError.internal('AI validation failed to process');
    }

    return apiSuccess(updatedProfile, 200, {
      message: 'AI validation completed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
