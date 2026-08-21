import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/utils/errors';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserRole, Prisma } from '@prisma/client';

/**
 * Fields safe to return from the admin Users API. Deliberately excludes
 * `passwordHash` and other credential/security columns.
 */
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  role: true,
  firstName: true,
  lastName: true,
  gender: true,
  isActive: true,
  isBlocked: true,
  blockReason: true,
  blockedAt: true,
  phoneVerified: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

interface UserFilters {
  role?: string | null;
  search?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
}

export async function listUsers(filters: UserFilters, pagination: Pagination) {
  const skip = (pagination.page - 1) * pagination.limit;
  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (filters.role) {
    if (!Object.values(UserRole).includes(filters.role as UserRole)) {
      throw AppError.badRequest(`Invalid role filter: ${filters.role}`);
    }
    where.role = filters.role as UserRole;
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      select: SAFE_USER_SELECT,
    }),
  ]);

  return { total, users };
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });
  if (!user) throw AppError.notFound('User not found');
  return user;
}

/**
 * Change a user's role. Authoritative role lives in Supabase `app_metadata`
 * (service-role-only). We update it there first, then mirror it into
 * `public.users.role`. Reads pick up the change on the next request because
 * `getUser()` validates against GoTrue.
 */
export async function changeUserRole(
  userId: string,
  role: UserRole,
  adminId: string
) {
  if (userId === adminId) {
    throw AppError.badRequest('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
    user_metadata: { role },
  });
  if (error)
    throw AppError.internal(`Failed to update auth role: ${error.message}`);

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return getUser(userId);
}

/**
 * Block or unblock a user. Blocking also bans the Supabase auth user so their
 * session token is rejected by GoTrue on the next request (no per-request DB
 * check needed). Unblocking lifts the ban and reactivates the account.
 */
export async function setUserBlocked(
  userId: string,
  isBlocked: boolean,
  reason: string | undefined,
  adminId: string
) {
  if (userId === adminId) {
    throw AppError.badRequest('You cannot block your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: isBlocked ? '876000h' : 'none',
  });
  if (error)
    throw AppError.internal(
      `Failed to update auth ban state: ${error.message}`
    );

  const updated = await prisma.user.update({
    where: { id: userId },
    data: isBlocked
      ? {
          isBlocked: true,
          isActive: false,
          blockReason: reason || null,
          blockedAt: new Date(),
          blockedById: adminId,
        }
      : {
          isBlocked: false,
          isActive: true,
          blockReason: null,
          blockedAt: null,
          blockedById: null,
        },
    select: SAFE_USER_SELECT,
  });

  return updated;
}
