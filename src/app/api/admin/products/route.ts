import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { createProductSchema } from '@/lib/validations/products';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireAdminActor();

    if (!actor.isSuperAdmin) {
      if (!actor.unit || !actor.unit.hasStockAccess) {
        throw AppError.forbidden(
          'Stock management access is not enabled for your unit. Please contact Super Admin.'
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const gender = searchParams.get('gender');
    const category =
      searchParams.get('category') ||
      searchParams.get('garmentType') ||
      searchParams.get('garmentSubtype');
    const fabricType = searchParams.get('fabricType');
    const inStock = searchParams.get('inStock');
    const approvalStatus = searchParams.get('approvalStatus');
    const unitFilter = searchParams.get('unitId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '20'))
    );
    const skip = (page - 1) * limit;

    const VALID_PRISMA_GARMENT_TYPES = new Set([
      'kameez',
      'trouser',
      'dupatta',
      'kurta',
      'shalwar',
      'full_suit',
      'kameez_only',
      'trouser_only',
      'other',
    ]);

    const baseScope: any = {
      parseSource: 'in_house',
      ...(!actor.isSuperAdmin ? { unitId: actor.unit!.id } : {}),
    };

    const where: any = { ...baseScope };

    if (actor.isSuperAdmin && unitFilter && unitFilter !== 'all') {
      where.unitId = unitFilter === 'hq' ? null : unitFilter;
    }

    if (
      approvalStatus &&
      approvalStatus !== 'all' &&
      ['approved', 'pending', 'rejected'].includes(approvalStatus)
    ) {
      where.approvalStatus = approvalStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (fabricType && fabricType !== 'all') {
      where.fabricType = fabricType;
    }

    const andConditions: any[] = [];

    if (gender && gender !== 'all') {
      andConditions.push({
        parseMetadata: {
          path: ['gender'],
          equals: gender,
        },
      });
    }

    if (category && category !== 'all') {
      const isPrismaEnum = VALID_PRISMA_GARMENT_TYPES.has(category);
      andConditions.push({
        OR: [
          ...(isPrismaEnum ? [{ garmentType: category as any }] : []),
          {
            parseMetadata: {
              path: ['garmentSubtype'],
              equals: category,
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (inStock === 'true') {
      where.isActive = true;
    } else if (inStock === 'false') {
      where.isActive = false;
    }

    const [products, totalCount, allInHouse] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ approvalStatus: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          unit: {
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: baseScope,
        select: {
          priceOriginal: true,
          isActive: true,
          approvalStatus: true,
          parseMetadata: true,
        },
      }),
    ]);

    let totalValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let pendingApprovalCount = 0;

    for (const p of allInHouse) {
      const price = Number(p.priceOriginal || 0);
      const meta = (p.parseMetadata as Record<string, any>) || {};
      const qty = Number(meta.stockQuantity || 0);

      if (p.approvalStatus === 'pending') {
        pendingApprovalCount++;
      }
      if (p.approvalStatus === 'approved') {
        totalValuation += price * qty;
        if (p.isActive && meta.inStock !== false && qty > 0) {
          inStockCount++;
        }
        if (qty > 0 && qty <= 3) {
          lowStockCount++;
        }
      }
    }

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalArticles: allInHouse.length,
        inStockCount,
        lowStockCount,
        pendingApprovalCount,
        totalValuation,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminActor();

    if (!actor.isSuperAdmin && (!actor.unit || !actor.unit.hasStockAccess)) {
      throw AppError.forbidden(
        'Stock submission access is not enabled for your unit. Contact Super Admin.'
      );
    }

    const body = await request.json();
    const validated = createProductSchema.parse(body);

    const parseMetadata = {
      gender: validated.gender,
      piecesCount: validated.piecesCount,
      garmentSubtype: validated.garmentSubtype,
      stockQuantity: validated.stockQuantity,
      inStock: validated.inStock && validated.stockQuantity > 0,
      sku: validated.sku || `TLK-${Date.now().toString(36).toUpperCase()}`,
      season: validated.season || 'Current Season',
      specifications: validated.specifications || {},
    };

    const isUnitSubmission = !actor.isSuperAdmin;

    const newProduct = await prisma.product.create({
      data: {
        name: validated.name,
        brand: validated.brand,
        description: validated.description || '',
        images: validated.images,
        fabricType: validated.fabricType,
        garmentType: validated.garmentType,
        colorTags: validated.colorTags,
        priceOriginal: validated.priceOriginal,
        currencyOriginal: 'PKR',
        // Unit submissions stay pending & unpublished until Super Admin approves
        isActive: isUnitSubmission ? false : validated.isActive,
        approvalStatus: isUnitSubmission ? 'pending' : 'approved',
        unitId: isUnitSubmission ? actor.unit!.id : null,
        parseSource: 'in_house',
        parsedAt: new Date(),
        parseMetadata: parseMetadata as any,
        createdById: actor.id,
      },
      include: {
        unit: {
          select: { id: true, name: true, location: true, city: true },
        },
      },
    });

    return apiSuccess(newProduct, 201, {
      message: isUnitSubmission
        ? 'Article submitted for Super Admin review & publishing.'
        : 'Article successfully added to in-house stock.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
