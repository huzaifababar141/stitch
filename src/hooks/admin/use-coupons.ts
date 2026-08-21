'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { adminKeys } from './keys';
import type { Coupon } from '@/lib/admin/types';
import type {
  CreateCouponInput,
  UpdateCouponInput,
} from '@/lib/validations/coupon';

export interface CouponFilters {
  isActive?: boolean;
  search?: string;
}

function couponsUrl(f: CouponFilters) {
  const p = new URLSearchParams();
  if (f.isActive !== undefined) p.set('isActive', String(f.isActive));
  if (f.search) p.set('search', f.search);
  const qs = p.toString();
  return `/api/admin/coupons${qs ? `?${qs}` : ''}`;
}

export function useCoupons(filters: CouponFilters = {}) {
  return useQuery({
    queryKey: adminKeys.coupons(filters),
    queryFn: () => api.get<Coupon[]>(couponsUrl(filters)),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) =>
      api.post<Coupon>('/api/admin/coupons', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.couponsAll });
      toast({ title: 'Coupon created', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not create coupon',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useUpdateCoupon(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCouponInput) =>
      api.patch<Coupon>(`/api/admin/coupons/${id}`, input),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: adminKeys.couponsAll });
      // A bare `isActive` change is the toggle action; label it distinctly.
      const isToggle = Object.keys(input).length === 1 && 'isActive' in input;
      toast({
        title: isToggle
          ? input.isActive
            ? 'Coupon activated'
            : 'Coupon deactivated'
          : 'Coupon updated',
        variant: 'success',
      });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update coupon',
        description: e.message,
        variant: 'destructive',
      }),
  });
}
