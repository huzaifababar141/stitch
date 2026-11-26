import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const superAdmin = await requireSuperAdmin();
    const { id } = await context.params;
    const { action, rejectionNote } = await request.json();

    if (action !== 'approve' && action !== 'reject') {
      throw AppError.badRequest('action must be either "approve" or "reject".');
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Stock article not found.');
    }

    const currentMeta = (existing.parseMetadata as Record<string, any>) || {};
    const updatedMeta = {
      ...currentMeta,
      reviewedById: superAdmin.id,
      reviewedAt: new Date().toISOString(),
      ...(action === 'reject' && rejectionNote
        ? { rejectionNote: String(rejectionNote).trim() }
        : { rejectionNote: undefined }),
    };

    const updated = await prisma.product.update({
      where: { id },
      data: {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        isActive: action === 'approve',
        parseMetadata: updatedMeta as any,
      },
      include: {
        unit: { select: { id: true, name: true, location: true, city: true } },
      },
    });

    return apiSuccess(updated, 200, {
      message:
        action === 'approve'
          ? `"${updated.name}" approved and published live to customer storefront.`
          : `"${updated.name}" rejected and hidden from storefront.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
