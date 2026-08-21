/** Centralized React Query keys for the admin panel. Prefix-based so that
 * invalidating e.g. `['admin','orders']` also refreshes every paginated
 * `['admin','orders', filters]` cache entry. */
export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  revenue: ['admin', 'revenue'] as const,
  ordersByStatus: ['admin', 'orders-by-status'] as const,
  tailorPerformance: ['admin', 'tailor-performance'] as const,

  ordersAll: ['admin', 'orders'] as const,
  orders: (filters: unknown) => ['admin', 'orders', filters] as const,
  order: (id: string) => ['admin', 'order', id] as const,

  tailorsAll: ['admin', 'tailors'] as const,
  tailors: (filters: unknown) => ['admin', 'tailors', filters] as const,
  tailor: (id: string) => ['admin', 'tailor', id] as const,

  usersAll: ['admin', 'users'] as const,
  users: (filters: unknown) => ['admin', 'users', filters] as const,
  user: (id: string) => ['admin', 'user', id] as const,

  couponsAll: ['admin', 'coupons'] as const,
  coupons: (filters: unknown) => ['admin', 'coupons', filters] as const,
};
