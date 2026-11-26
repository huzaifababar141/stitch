import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getDashboardStats } from '@/lib/services/admin.service';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    const scopedUnitId = actor.isSuperAdmin
      ? null
      : (actor.unit?.id ?? '__none__');
    if (scopedUnitId === '__none__') {
      return apiSuccess({
        scope: 'unit',
        totalOrders: 0,
        activeTailors: 0,
        pendingQC: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        awaitingTailor: 0,
        inStitching: 0,
        completedOrders: 0,
        pendingStockApprovals: 0,
        totalUnits: 0,
        unassignedOrders: 0,
      });
    }
    const stats = await getDashboardStats(scopedUnitId);
    return apiSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
