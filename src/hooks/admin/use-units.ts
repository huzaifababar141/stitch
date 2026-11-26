'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { adminKeys } from './keys';
import type { UnitSummary } from '@/lib/admin/types';
import type { CreateUnitInput, UpdateUnitInput } from '@/lib/validations/unit';

export function useUnits(enabled = true) {
  return useQuery({
    queryKey: adminKeys.unitsAll,
    queryFn: () => api.get<UnitSummary[]>('/api/admin/units'),
    enabled,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUnitInput) =>
      api.post<UnitSummary>('/api/admin/units', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.unitsAll });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard });
      toast({
        title: 'Tailoring unit created',
        description: 'Unit Admin login and workshop profile are now active.',
        variant: 'success',
      });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not create tailoring unit',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUnitInput }) =>
      api.patch<UnitSummary>(`/api/admin/units/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.unitsAll });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard });
      toast({ title: 'Tailoring unit updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update unit',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/units/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.unitsAll });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard });
      toast({ title: 'Tailoring unit updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not remove unit',
        description: e.message,
        variant: 'destructive',
      }),
  });
}
