'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { adminKeys } from './keys';
import type { TailorRow } from '@/lib/admin/types';
import type {
  CreateTailorInput,
  UpdateTailorInput,
} from '@/lib/validations/tailor';

export interface TailorFilters {
  isActive?: boolean;
  search?: string;
}

function tailorsUrl(f: TailorFilters) {
  const p = new URLSearchParams();
  if (f.isActive !== undefined) p.set('isActive', String(f.isActive));
  if (f.search) p.set('search', f.search);
  const qs = p.toString();
  return `/api/admin/tailors${qs ? `?${qs}` : ''}`;
}

export function useTailors(filters: TailorFilters = {}) {
  return useQuery({
    queryKey: adminKeys.tailors(filters),
    queryFn: () => api.get<TailorRow[]>(tailorsUrl(filters)),
  });
}

export function useTailor(id: string) {
  return useQuery({
    queryKey: adminKeys.tailor(id),
    queryFn: () => api.get<TailorRow>(`/api/admin/tailors/${id}`),
    enabled: !!id,
  });
}

export function useCreateTailor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTailorInput) =>
      api.post<TailorRow>('/api/admin/tailors', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.tailorsAll });
      toast({ title: 'Tailor created', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not create tailor',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useUpdateTailor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTailorInput) =>
      api.patch<TailorRow>(`/api/admin/tailors/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.tailor(id) });
      qc.invalidateQueries({ queryKey: adminKeys.tailorsAll });
      toast({ title: 'Tailor updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update tailor',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useSetAvailability(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      api.patch<TailorRow>(`/api/admin/tailors/${id}/availability`, {
        isAvailable,
      }),
    onSuccess: (_data, isAvailable) => {
      qc.invalidateQueries({ queryKey: adminKeys.tailor(id) });
      qc.invalidateQueries({ queryKey: adminKeys.tailorsAll });
      toast({
        title: isAvailable ? 'Marked available' : 'Marked unavailable',
        variant: 'success',
      });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update availability',
        description: e.message,
        variant: 'destructive',
      }),
  });
}
