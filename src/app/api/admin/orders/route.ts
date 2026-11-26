import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { listOrders } from '@/lib/services/admin.service';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireAdminActor();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '10'))
    );
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const requestedUnitId = searchParams.get('unitId');

    // Unit Admin is strictly scoped to orders assigned to their own unit
    if (!actor.isSuperAdmin) {
      if (!actor.unit) {
        return apiSuccess({
          orders: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        });
      }
      const result = await listOrders(
        { status, search, unitId: actor.unit.id },
        { page, limit }
      );
      return apiSuccess({
        orders: result.orders,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    }

    // Super Admin sees all orders (with optional unitId filter)
    const result = await listOrders(
      { status, search, unitId: requestedUnitId },
      { page, limit }
    );

    return apiSuccess({
      orders: result.orders,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
