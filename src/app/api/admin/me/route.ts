import { createClient } from '@/lib/supabase/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import type { AdminActor, AdminUnitInfo } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';

/**
 * Resolves the logged-in administrator and their TailoringUnit using Supabase
 * SSR Auth + HTTPS REST (no direct PostgreSQL/Prisma TCP dependency), so the
 * admin shell verification never fails due to serverless DB pooler cold starts.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw AppError.unauthorized('Please sign in to access the admin portal.');
    }

    const appRole = (user.app_metadata as { role?: string } | undefined)?.role;

    const { data: uRow } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, is_blocked')
      .eq('id', user.id)
      .maybeSingle();

    if (uRow && (uRow.is_active === false || uRow.is_blocked === true)) {
      throw AppError.forbidden(
        'Your administrator account is inactive or blocked.'
      );
    }

    const resolvedRole =
      appRole === 'super_admin' || uRow?.role === 'super_admin'
        ? 'super_admin'
        : appRole === 'admin' || uRow?.role === 'admin'
          ? 'admin'
          : null;

    if (!resolvedRole) {
      throw AppError.forbidden(
        'You do not have administrator permissions for this portal.'
      );
    }

    let unit: AdminUnitInfo | null = null;
    if (resolvedRole === 'admin') {
      const { data: unitRow } = await supabase
        .from('tailoring_units')
        .select(
          'id, name, location, city, max_daily_capacity, has_stock_access, is_active'
        )
        .eq('manager_id', user.id)
        .maybeSingle();

      if (unitRow) {
        unit = {
          id: unitRow.id,
          name: unitRow.name,
          location: unitRow.location,
          city: unitRow.city,
          maxDailyCapacity: unitRow.max_daily_capacity,
          hasStockAccess: unitRow.has_stock_access,
          isActive: unitRow.is_active,
        };
      }
    }

    const firstName =
      uRow?.first_name || (user.user_metadata?.first_name as string) || '';
    const lastName =
      uRow?.last_name || (user.user_metadata?.last_name as string) || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Administrator';

    const actor: AdminActor = {
      id: user.id,
      email: uRow?.email || user.email || '',
      fullName,
      role: resolvedRole,
      isSuperAdmin: resolvedRole === 'super_admin',
      unit,
    };

    return apiSuccess(actor);
  } catch (error) {
    return handleApiError(error);
  }
}
