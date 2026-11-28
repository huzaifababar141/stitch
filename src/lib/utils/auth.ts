import { NextRequest } from 'next/server';
import { createClient } from '../supabase/server';
import { supabaseAdmin } from '../supabase/admin';
import { prisma } from '../prisma';
import { AppError } from './errors';
import { AuthUser, FullUser } from '../types';

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user as AuthUser;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw AppError.unauthorized();
  return user;
}

export async function requireRole(
  ...args: string[] | [string[]]
): Promise<AuthUser> {
  // Accept both requireRole('admin', 'tailor') and requireRole(['admin', 'tailor'])
  const roles: string[] = Array.isArray(args[0]) ? args[0] : (args as string[]);
  const user = await requireAuth();

  // Authoritative role lives in server-only app_metadata (not the user-editable
  // user_metadata). If it's missing or doesn't grant access, fall back to the
  // database record, which is also authoritative — so a legitimate admin whose
  // app_metadata hasn't been backfilled yet is never locked out.
  let userRole = (user as any).app_metadata?.role as string | undefined;

  // If not found in app_metadata or it doesn't match, query the database user profile
  if (!userRole || (!roles.includes(userRole) && userRole !== 'super_admin')) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      if (dbUser?.role) {
        userRole = dbUser.role;
      }
    } catch (e) {
      console.error('Error querying role from DB:', e);
    }
  }

  userRole = userRole || 'customer';

  if (!roles.includes(userRole) && userRole !== 'super_admin') {
    throw AppError.forbidden(
      `Access restricted to: ${roles.join(', ')}. Your role is: ${userRole}`
    );
  }
  return user;
}

export async function getFullUser(userId: string): Promise<FullUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export interface AdminUnitInfo {
  id: string;
  name: string;
  location: string;
  city: string;
  maxDailyCapacity: number;
  hasStockAccess: boolean;
  isActive: boolean;
}

export interface AdminActor {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  isSuperAdmin: boolean;
  unit: AdminUnitInfo | null;
}

/**
 * Resolves the authenticated admin or super_admin together with their assigned
 * TailoringUnit (for unit admins). Centralizes RBAC + unit scoping in one place.
 */
export async function requireAdminActor(): Promise<AdminActor> {
  const authUser = await requireRole('admin', 'super_admin');

  let dbUser: {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string | null;
    role: string;
    isActive: boolean;
    isBlocked: boolean;
    managedUnit: AdminUnitInfo | null;
  } | null = null;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isBlocked: true,
        managedUnit: {
          select: {
            id: true,
            name: true,
            location: true,
            city: true,
            maxDailyCapacity: true,
            hasStockAccess: true,
            isActive: true,
          },
        },
      },
    });
  } catch (prismaErr) {
    // Graceful HTTPS fallback via Supabase service-role client so transient
    // PostgreSQL pooler/network errors on serverless never lock out valid admins.
    console.error(
      'requireAdminActor Prisma lookup failed, falling back to Supabase REST:',
      prismaErr
    );
    try {
      const sbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? supabaseAdmin
        : await createClient();
      const { data: uRow } = await sbClient
        .from('users')
        .select('id, email, first_name, last_name, role, is_active, is_blocked')
        .eq('id', authUser.id)
        .maybeSingle();

      if (uRow) {
        let managedUnit: AdminUnitInfo | null = null;
        if (uRow.role === 'admin') {
          const { data: unitRow } = await sbClient
            .from('tailoring_units')
            .select(
              'id, name, location, city, max_daily_capacity, has_stock_access, is_active'
            )
            .eq('manager_id', authUser.id)
            .maybeSingle();

          if (unitRow) {
            managedUnit = {
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

        dbUser = {
          id: uRow.id,
          email: uRow.email,
          firstName: uRow.first_name || '',
          lastName: uRow.last_name || null,
          role: uRow.role,
          isActive: uRow.is_active ?? true,
          isBlocked: uRow.is_blocked ?? false,
          managedUnit,
        };
      }
    } catch (sbErr) {
      console.error('requireAdminActor Supabase fallback failed:', sbErr);
    }
  }

  if (dbUser && (!dbUser.isActive || dbUser.isBlocked)) {
    throw AppError.forbidden(
      'Your administrator account is inactive or blocked.'
    );
  }

  const resolvedRole =
    dbUser?.role === 'super_admin' ||
    (authUser as any).app_metadata?.role === 'super_admin'
      ? 'super_admin'
      : 'admin';

  const firstName =
    dbUser?.firstName || (authUser.user_metadata?.first_name as string) || '';
  const lastName =
    dbUser?.lastName || (authUser.user_metadata?.last_name as string) || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Administrator';

  return {
    id: authUser.id,
    email: dbUser?.email || authUser.email || '',
    fullName,
    role: resolvedRole,
    isSuperAdmin: resolvedRole === 'super_admin',
    unit: resolvedRole === 'super_admin' ? null : (dbUser?.managedUnit ?? null),
  };
}

export async function requireSuperAdmin(): Promise<AdminActor> {
  const actor = await requireAdminActor();
  if (!actor.isSuperAdmin) {
    throw AppError.forbidden('This action is restricted to Super Admin only.');
  }
  return actor;
}
