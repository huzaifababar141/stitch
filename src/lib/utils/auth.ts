import { NextRequest } from 'next/server';
import { createClient } from '../supabase/server';
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
