import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { updateProductSchema } from '@/lib/validations/products';

function assertProductAccess(
  actor: Awaited<ReturnType<typeof requireAdminActor>>,
  productUnitId: string | null
) {
  if (actor.isSuperAdmin) return;
  if (!actor.unit || !actor.unit.hasStockAccess) {
    throw AppError.forbidden(
      'Stock management access is not enabled for your unit.'
    );
  }
  if (productUnitId !== actor.unit.id) {
    throw AppError.forbidden(
      'You can only manage stock submitted by your own unit.'
    );
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        unit: { select: { id: true, name: true, location: true, city: true } },
      },
    });

    if (!product) {
      throw AppError.notFound('Product article not found.');
    }

    assertProductAccess(actor, product.unitId);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Product article not found.');
    }

    assertProductAccess(actor, existing.unitId);

    const validated = updateProductSchema.parse(body);

    const currentMeta = (existing.parseMetadata as Record<string, any>) || {};
    const updatedMeta = {
      ...currentMeta,
      ...(validated.gender ? { gender: validated.gender } : {}),
      ...(validated.piecesCount ? { piecesCount: validated.piecesCount } : {}),
      ...(validated.garmentSubtype
        ? { garmentSubtype: validated.garmentSubtype }
        : {}),
      ...(typeof validated.stockQuantity === 'number'
        ? {
            stockQuantity: validated.stockQuantity,
            inStock: validated.stockQuantity > 0 && validated.inStock !== false,
          }
        : {}),
      ...(typeof validated.inStock === 'boolean'
        ? { inStock: validated.inStock }
        : {}),
      ...(validated.sku ? { sku: validated.sku } : {}),
      ...(validated.season ? { season: validated.season } : {}),
      ...(validated.specifications
        ? {
            specifications: {
              ...(currentMeta.specifications || {}),
              ...validated.specifications,
            },
          }
        : {}),
    };

    const isUnitEdit = !actor.isSuperAdmin;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(validated.name ? { name: validated.name } : {}),
        ...(validated.brand ? { brand: validated.brand } : {}),
        ...(typeof validated.description === 'string'
          ? { description: validated.description }
          : {}),
        ...(validated.images ? { images: validated.images } : {}),
        ...(validated.fabricType ? { fabricType: validated.fabricType } : {}),
        ...(validated.garmentType
          ? { garmentType: validated.garmentType }
          : {}),
        ...(validated.colorTags ? { colorTags: validated.colorTags } : {}),
        ...(typeof validated.priceOriginal === 'number'
          ? { priceOriginal: validated.priceOriginal }
          : {}),
        ...(isUnitEdit
          ? { approvalStatus: 'pending', isActive: false }
          : typeof validated.isActive === 'boolean'
            ? { isActive: validated.isActive }
            : {}),
        parseMetadata: updatedMeta as any,
      },
      include: {
        unit: { select: { id: true, name: true, location: true, city: true } },
      },
    });

    return apiSuccess(updated, 200, {
      message: isUnitEdit
        ? 'Changes saved and re-submitted for Super Admin approval.'
        : 'Product article updated successfully.',
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
    const actor = await requireAdminActor();
    const { id } = await context.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });

    if (!existing) {
      throw AppError.notFound('Product article not found.');
    }

    assertProductAccess(actor, existing.unitId);

    if (existing._count.orders > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return apiSuccess(null, 200, {
        message:
          'Article deactivated as existing customer orders reference it.',
      });
    }

    await prisma.product.delete({ where: { id } });

    return apiSuccess(null, 200, {
      message: 'Article removed from stock successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
