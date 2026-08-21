'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { adminKeys } from './keys';
import type {
  DashboardStats,
  RevenuePoint,
  StatusCount,
  TailorPerformance,
} from '@/lib/admin/types';

export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: () => api.get<DashboardStats>('/api/admin/analytics'),
  });
}

export function useRevenueByDay() {
  return useQuery({
    queryKey: adminKeys.revenue,
    queryFn: () => api.get<RevenuePoint[]>('/api/admin/analytics/revenue'),
  });
}

export function useOrdersByStatus() {
  return useQuery({
    queryKey: adminKeys.ordersByStatus,
    queryFn: () => api.get<StatusCount[]>('/api/admin/analytics/status'),
  });
}

export function useTailorPerformance() {
  return useQuery({
    queryKey: adminKeys.tailorPerformance,
    queryFn: () => api.get<TailorPerformance[]>('/api/admin/analytics/tailors'),
  });
}
