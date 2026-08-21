'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { adminKeys } from './keys';
import type { AdminUser, UsersListResponse } from '@/lib/admin/types';

export interface UserFilters {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}

function usersUrl(f: UserFilters) {
  const p = new URLSearchParams();
  p.set('page', String(f.page));
  p.set('limit', String(f.limit));
  if (f.role) p.set('role', f.role);
  if (f.search) p.set('search', f.search);
  return `/api/admin/users?${p.toString()}`;
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => api.get<UsersListResponse>(usersUrl(filters)),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => api.get<AdminUser>(`/api/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useChangeRole(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: string) =>
      api.patch<AdminUser>(`/api/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.user(userId) });
      qc.invalidateQueries({ queryKey: adminKeys.usersAll });
      toast({ title: 'Role updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not change role',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useSetBlocked(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { isBlocked: boolean; reason?: string }) =>
      api.patch<AdminUser>(`/api/admin/users/${userId}/block`, vars),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: adminKeys.user(userId) });
      qc.invalidateQueries({ queryKey: adminKeys.usersAll });
      toast({
        title: vars.isBlocked ? 'User blocked' : 'User unblocked',
        variant: 'success',
      });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update user',
        description: e.message,
        variant: 'destructive',
      }),
  });
}
