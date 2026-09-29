import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { updateProductSchema } from '@/lib/validations/products';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('admin', 'super_admin');
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw AppError.notFound('Product article not found.');
    }

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
    await requireRole('admin', 'super_admin');
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Product article not found.');
    }

    const validated = updateProductSchema.parse(body);

    const currentMeta = (existing.parseMetadata as Record<string, any>) || {};
    const updatedMeta = {
      ...currentMeta,
      ...(validated.gender ? { gender: validated.gender } : {}),
      ...(validated.piecesCount ? { piecesCount: validated.piecesCount } : {}),
      ...(validated.garmentSubtype ? { garmentSubtype: validated.garmentSubtype } : {}),
      ...(typeof validated.stockQuantity === 'number'
        ? {
            stockQuantity: validated.stockQuantity,
            inStock: validated.stockQuantity > 0 && validated.inStock !== false,
          }
        : {}),
      ...(typeof validated.inStock === 'boolean' ? { inStock: validated.inStock } : {}),
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
        ...(validated.garmentType ? { garmentType: validated.garmentType } : {}),
        ...(validated.colorTags ? { colorTags: validated.colorTags } : {}),
        ...(typeof validated.priceOriginal === 'number'
          ? { priceOriginal: validated.priceOriginal }
          : {}),
        ...(typeof validated.isActive === 'boolean'
          ? { isActive: validated.isActive }
          : {}),
        parseMetadata: updatedMeta as any,
      },
    });

    return apiSuccess(updated, 200, {
      message: 'Product article updated successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('admin', 'super_admin');
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

    // If orders already exist for this product, soft-delete by deactivating it
    if (existing._count.orders > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return apiSuccess(
        null,
        200,
        { message: 'Article deactivated as existing customer orders reference it.' }
      );
    }

    // Otherwise permanently delete
    await prisma.product.delete({ where: { id } });

    return apiSuccess(null, 200, {
      message: 'Article removed from stock successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
