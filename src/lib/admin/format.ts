import { OrderStatus, UserRole } from '@prisma/client';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline';

const STATUS_META: Record<string, { label: string; variant: BadgeVariant }> = {
  pending_payment: { label: 'Pending Payment', variant: 'warning' },
  payment_confirmed: { label: 'Payment Confirmed', variant: 'info' },
  assigned: { label: 'Assigned', variant: 'info' },
  in_stitching: { label: 'In Stitching', variant: 'info' },
  stitching_complete: { label: 'Stitching Complete', variant: 'info' },
  qc_pending: { label: 'QC Pending', variant: 'warning' },
  qc_approved: { label: 'QC Approved', variant: 'success' },
  qc_rejected: { label: 'QC Rejected', variant: 'destructive' },
  dispatched: { label: 'Dispatched', variant: 'info' },
  in_transit: { label: 'In Transit', variant: 'info' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  return_requested: { label: 'Return Requested', variant: 'warning' },
  returned: { label: 'Returned', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
};

function titleCase(s: string) {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatStatus(status: string): string {
  return STATUS_META[status]?.label ?? titleCase(status);
}

export function statusVariant(status: string): BadgeVariant {
  return STATUS_META[status]?.variant ?? 'secondary';
}

export const ORDER_STATUSES = Object.values(OrderStatus);

/** Distinct, on-brand hues per status so donut/segmented charts stay legible
 * even when many statuses are present at once. */
const STATUS_HEX: Record<string, string> = {
  pending_payment: '#f59e0b',
  payment_confirmed: '#6366f1',
  assigned: '#0ea5e9',
  in_stitching: '#3b82f6',
  stitching_complete: '#8b5cf6',
  qc_pending: '#eab308',
  qc_approved: '#10b981',
  qc_rejected: '#ef4444',
  dispatched: '#14b8a6',
  in_transit: '#06b6d4',
  out_for_delivery: '#f97316',
  delivered: '#22c55e',
  return_requested: '#d97706',
  returned: '#a1a1aa',
  cancelled: '#dc2626',
  refunded: '#71717a',
};

export function statusColor(status: string): string {
  return STATUS_HEX[status] ?? '#9ca3af';
}

const ROLE_META: Record<string, { label: string; variant: BadgeVariant }> = {
  customer: { label: 'Customer', variant: 'secondary' },
  admin: { label: 'Admin', variant: 'default' },
  tailor: { label: 'Tailor', variant: 'info' },
  qc_inspector: { label: 'QC Inspector', variant: 'warning' },
  delivery_agent: { label: 'Delivery Agent', variant: 'info' },
  super_admin: { label: 'Super Admin', variant: 'default' },
};

export function formatRole(role: string): string {
  return ROLE_META[role]?.label ?? titleCase(role);
}

export function roleVariant(role: string): BadgeVariant {
  return ROLE_META[role]?.variant ?? 'secondary';
}

export const USER_ROLES = Object.values(UserRole);

const currencyFmt = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
});

export function formatCurrency(
  value: number | string | null | undefined
): string {
  const n = Number(value ?? 0);
  return `Rs ${currencyFmt.format(Number.isFinite(n) ? n : 0)}`;
}

/** Compact currency for chart axes, e.g. Rs 12.5k */
export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `Rs ${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `Rs ${(value / 1_000).toFixed(1)}k`;
  return `Rs ${Math.round(value)}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(
  value: string | Date | null | undefined
): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fullName(first?: string | null, last?: string | null): string {
  return [first, last].filter(Boolean).join(' ') || '—';
}
