import type {
  OrderStatus,
  UserRole,
  TailorSkillLevel,
  CouponType,
  PaymentStatus,
  PaymentMethod,
  DeliveryStatus,
  Gender,
  GarmentType,
  QcResult,
} from '@prisma/client';

/**
 * DTOs for the admin panel — the JSON-serialized shapes returned by the
 * `/api/admin/*` routes. Prisma `Decimal` columns serialize to strings, and
 * `DateTime` columns to ISO strings; money fields are typed as `string`
 * accordingly (services that pre-normalize Decimals to numbers are noted).
 */

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Dashboard & analytics -------------------------------------------------

export interface DashboardStats {
  totalOrders: number;
  activeTailors: number;
  pendingQC: number;
  totalCustomers: number;
  totalRevenue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

export interface TailorPerformance {
  tailorId: string;
  name: string;
  skillLevel: TailorSkillLevel;
  isActive: boolean;
  isAvailable: boolean;
  currentActiveOrders: number;
  completedOrders: number;
  rejectedQc: number;
  qualityScore: number;
  onTimeRate: number;
  avgCompletionHours: number | null;
}

// --- Shared refs -----------------------------------------------------------

export interface CustomerRef {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
}

export interface TailorRef {
  id: string;
  firstName: string;
  lastName: string | null;
  phone?: string;
}

// --- Orders ----------------------------------------------------------------

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priorityLevel: number;
  garmentType: GarmentType;
  totalAmount: string;
  createdAt: string;
  customer: CustomerRef;
  assignedTailor: TailorRef | null;
}

export interface OrdersListResponse {
  orders: OrderListItem[];
  pagination: Pagination;
}

export interface OrderStatusHistoryItem {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedById: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentItem {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  courierName: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: DeliveryStatus;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
}

export interface OrderCouponRef {
  id: string;
  code: string;
  discountType: CouponType;
  discountValue: string;
}

export interface OrderCustomerFull extends CustomerRef {
  email: string | null;
  gender: Gender | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priorityLevel: number;
  garmentType: GarmentType;
  currency: string;
  stitchingFee: string;
  deliveryFee: string;
  addonFee: string;
  discountAmount: string;
  totalAmount: string;
  isCod: boolean;
  qcResult: QcResult | null;
  qcNotes: string | null;
  adminNotes: string | null;
  internalNotes: string | null;
  assignmentReason: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  assignedAt: string | null;
  stitchingDeadline: string | null;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  measurementSnapshot: Record<string, unknown> | null;
  styleSnapshot: Record<string, unknown> | null;
  productSnapshot: Record<string, unknown> | null;
  deliveryAddressSnapshot: Record<string, unknown> | null;
  customer: OrderCustomerFull;
  assignedTailor: TailorRef | null;
  qcInspector: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  statusHistory: OrderStatusHistoryItem[];
  payments: PaymentItem[];
  delivery: DeliveryItem | null;
  coupon: OrderCouponRef | null;
}

// --- Tailors ---------------------------------------------------------------

export interface TailorProfileDTO {
  id: string;
  employeeId: string | null;
  skillLevel: TailorSkillLevel;
  maxDailyCapacity: number;
  currentActiveOrders: number;
  totalOrdersCompleted: number;
  totalOrdersRejectedQc: number;
  qualityScore: number;
  onTimeRate: number;
  isAvailable: boolean;
}

export interface TailorRow {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  tailorProfile: TailorProfileDTO | null;
}

// --- Users -----------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string | null;
  gender: Gender | null;
  isActive: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  blockedAt: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UsersListResponse {
  users: AdminUser[];
  pagination: Pagination;
}

// --- Coupons ---------------------------------------------------------------

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: CouponType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}
