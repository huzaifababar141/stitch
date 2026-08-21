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
import type { OrderDetail, OrdersListResponse } from '@/lib/admin/types';

export interface OrderFilters {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

function ordersUrl(f: OrderFilters) {
  const p = new URLSearchParams();
  p.set('page', String(f.page));
  p.set('limit', String(f.limit));
  if (f.status) p.set('status', f.status);
  if (f.search) p.set('search', f.search);
  return `/api/admin/orders?${p.toString()}`;
}

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: adminKeys.orders(filters),
    queryFn: () => api.get<OrdersListResponse>(ordersUrl(filters)),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => api.get<OrderDetail>(`/api/admin/orders/${id}`),
    enabled: !!id,
  });
}

function invalidateOrder(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: adminKeys.order(id) });
  qc.invalidateQueries({ queryKey: adminKeys.ordersAll });
}

export function useAssignTailor(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tailorId: string) =>
      api.patch(`/api/admin/orders/${orderId}/assign`, { tailorId }),
    onSuccess: () => {
      invalidateOrder(qc, orderId);
      qc.invalidateQueries({ queryKey: adminKeys.tailorsAll });
      toast({ title: 'Tailor assigned', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not assign tailor',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useOverrideStatus(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      api.patch(`/api/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      invalidateOrder(qc, orderId);
      toast({ title: 'Status updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update status',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useAddNote(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: string) =>
      api.patch(`/api/admin/orders/${orderId}/notes`, { note }),
    onSuccess: () => {
      invalidateOrder(qc, orderId);
      toast({ title: 'Note added', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not add note',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useSetPriority(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (priorityLevel: number) =>
      api.patch(`/api/admin/orders/${orderId}/priority`, { priorityLevel }),
    onSuccess: () => {
      invalidateOrder(qc, orderId);
      toast({ title: 'Priority updated', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not update priority',
        description: e.message,
        variant: 'destructive',
      }),
  });
}

export function useCancelOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      api.patch(`/api/admin/orders/${orderId}/cancel`, { reason }),
    onSuccess: () => {
      invalidateOrder(qc, orderId);
      toast({ title: 'Order cancelled', variant: 'success' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Could not cancel order',
        description: e.message,
        variant: 'destructive',
      }),
  });
}
