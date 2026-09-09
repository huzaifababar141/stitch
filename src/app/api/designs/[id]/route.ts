import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const design = await prisma.styleConfiguration.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!design) {
      throw AppError.notFound('Design preset not found');
    }

    return apiSuccess(design);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.styleConfiguration.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw AppError.notFound('Design preset not found');
    }

    const updated = await prisma.styleConfiguration.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return apiSuccess(updated, 200, {
      message: 'Design preset updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.styleConfiguration.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw AppError.notFound('Design preset not found');
    }

    await prisma.styleConfiguration.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return apiSuccess({ id }, 200, {
      message: 'Design preset deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
