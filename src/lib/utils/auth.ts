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
  const userRole = user.user_metadata?.role || 'customer';
  if (!roles.includes(userRole) && userRole !== 'super_admin') {
    throw AppError.forbidden(`Requires one of roles: ${roles.join(', ')}`);
  }
  return user;
}

export async function getFullUser(userId: string): Promise<FullUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}
