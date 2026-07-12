import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{2})(\d{3})(\d{4})(\d{3})/, '$1 $2 ****$4');
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pending Payment',
    payment_confirmed: 'Payment Confirmed',
    assigned: 'Assigned to Tailor',
    in_stitching: 'In Stitching',
    stitching_complete: 'Stitching Complete',
    qc_pending: 'QC Pending',
    qc_approved: 'QC Approved',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
  };
  return labels[status.toLowerCase()] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: 'text-warning border-warning bg-warning/10',
    payment_confirmed: 'text-success border-success bg-success/10',
    in_stitching: 'text-primary border-primary bg-primary/10',
    delivered: 'text-success border-success bg-success/10',
    cancelled: 'text-danger border-danger bg-danger/10',
  };
  return colors[status.toLowerCase()] || 'text-gray-500 border-gray-500 bg-gray-100';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
