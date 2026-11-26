'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Scissors,
  ClipboardCheck,
  Users,
  Wallet,
  Building2,
  Boxes,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/admin/kpi-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { AreaChart } from '@/components/admin/charts/area-chart';
import { DonutChart } from '@/components/admin/charts/donut-chart';
import { useAdminActor } from '@/components/admin/AdminActorContext';
import {
  useDashboardStats,
  useRevenueByDay,
  useOrdersByStatus,
} from '@/hooks/admin/use-analytics';
import { useOrders } from '@/hooks/admin/use-orders';
import { useUnits } from '@/hooks/admin/use-units';
import {
  formatCurrency,
  formatStatus,
  statusColor,
  formatDate,
  fullName,
} from '@/lib/admin/format';

export default function AdminDashboardPage() {
  const router = useRouter();
  const actor = useAdminActor();
  const stats = useDashboardStats();
  const revenue = useRevenueByDay();
  const byStatus = useOrdersByStatus();
  const recent = useOrders({ page: 1, limit: 8 });
  const units = useUnits(actor.isSuperAdmin);

  const donutData = (byStatus.data ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      label: formatStatus(s.status),
      value: s.count,
      color: statusColor(s.status),
    }));

  // ── UNIT ADMIN (WORKSHOP MANAGER) DASHBOARD ──
  if (!actor.isSuperAdmin) {
    return (
      <div className="space-y-6">
        {/* Unit Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-50 text-[#7E153A]">
                <Building2 size={18} />
              </span>
              <h1 className="text-xl font-black text-gray-900">
                {actor.unit?.name ?? 'Tailoring Unit Dashboard'}
              </h1>
            </div>
            {actor.unit && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#7E153A]" />
                {actor.unit.location}, {actor.unit.city} · Daily Capacity:{' '}
                <strong>{actor.unit.maxDailyCapacity} suits/day</strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tailors">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs"
              >
                <Scissors className="mr-1.5 h-3.5 w-3.5" /> Manage My Darzis
              </Button>
            </Link>
            {actor.unit?.hasStockAccess && (
              <Link href="/admin/stock">
                <Button
                  size="sm"
                  className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs"
                >
                  <Boxes className="mr-1.5 h-3.5 w-3.5" /> Submit Unit Stock
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Unit KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            label="Assigned Orders"
            value={stats.data?.totalOrders.toLocaleString() ?? '—'}
            icon={ShoppingBag}
            loading={stats.isLoading}
          />
          <KpiCard
            label="Awaiting Tailor"
            value={stats.data?.awaitingTailor?.toLocaleString() ?? '—'}
            icon={Clock}
            loading={stats.isLoading}
          />
          <KpiCard
            label="In Stitching"
            value={stats.data?.inStitching?.toLocaleString() ?? '—'}
            icon={Scissors}
            loading={stats.isLoading}
          />
          <KpiCard
            label="My Tailors"
            value={stats.data?.activeTailors.toLocaleString() ?? '—'}
            icon={CheckCircle2}
            loading={stats.isLoading}
          />
        </div>

        {/* Unit Assigned Orders */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Orders Assigned to Your Unit</CardTitle>
            <button
              onClick={() => router.push('/admin/orders')}
              className="text-sm font-medium text-[#7E153A] hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            {recent.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (recent.data?.orders.length ?? 0) === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                No orders have been assigned to your unit by Super Admin yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Assigned Tailor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.data?.orders.map((o) => (
                    <TableRow
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>
                        {fullName(o.customer.firstName, o.customer.lastName)}
                      </TableCell>
                      <TableCell>
                        {o.assignedTailor ? (
                          fullName(
                            o.assignedTailor.firstName,
                            o.assignedTailor.lastName
                          )
                        ) : (
                          <Badge variant="warning">Assign Darzi</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── SUPER ADMIN (HQ) DASHBOARD ──
  return (
    <div className="space-y-6">
      {/* Actionable Alerts Bar for Super Admin */}
      {((stats.data?.unassignedOrders ?? 0) > 0 ||
        (stats.data?.pendingStockApprovals ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(stats.data?.unassignedOrders ?? 0) > 0 && (
            <Link
              href="/admin/orders?unitId=unassigned"
              className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200/70 text-amber-900">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-950">
                    {stats.data?.unassignedOrders} Order(s) Awaiting Unit
                    Assignment
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Assign incoming orders to a tailoring workshop unit.
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-amber-800 shrink-0" />
            </Link>
          )}

          {(stats.data?.pendingStockApprovals ?? 0) > 0 && (
            <Link
              href="/admin/stock?approvalStatus=pending"
              className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#7E153A]/15 text-[#7E153A]">
                  <Boxes size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#7E153A]">
                    {stats.data?.pendingStockApprovals} Unit Stock Article(s)
                    Pending Publishing
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Review photos & approve to publish on customer storefront.
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#7E153A] shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total Orders"
          value={stats.data?.totalOrders.toLocaleString() ?? '—'}
          icon={ShoppingBag}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Active Units"
          value={stats.data?.totalUnits?.toLocaleString() ?? '—'}
          icon={Building2}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Active Tailors"
          value={stats.data?.activeTailors.toLocaleString() ?? '—'}
          icon={Scissors}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Pending QC"
          value={stats.data?.pendingQC.toLocaleString() ?? '—'}
          icon={ClipboardCheck}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Customers"
          value={stats.data?.totalCustomers.toLocaleString() ?? '—'}
          icon={Users}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Revenue (delivered)"
          value={stats.data ? formatCurrency(stats.data.totalRevenue) : '—'}
          icon={Wallet}
          loading={stats.isLoading}
        />
      </div>

      {/* Tailoring Units Quick Directory on Dashboard (voice1.ogg: units shown below with manager, location, tailors, capacity) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#7E153A]" />
              Tailoring Units Overview
            </CardTitle>
          </div>
          <Link
            href="/admin/units"
            className="text-xs font-bold text-[#7E153A] hover:underline flex items-center gap-1"
          >
            Manage Units <ArrowRight size={13} />
          </Link>
        </CardHeader>
        <CardContent>
          {units.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (units.data?.length ?? 0) === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-gray-400">
                No tailoring units added yet.
              </p>
              <Link href="/admin/units">
                <Button
                  size="sm"
                  className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs"
                >
                  Create First Unit Admin
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {units.data!.map((u) => (
                <div
                  key={u.id}
                  onClick={() => router.push(`/admin/orders?unitId=${u.id}`)}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-[#7E153A]/40 bg-stone-50/40 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-gray-900 truncate">
                      {u.name}
                    </p>
                    <Badge variant={u.hasStockAccess ? 'success' : 'secondary'}>
                      {u.hasStockAccess ? 'Stock ON' : 'Stitch Only'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#7E153A]" />
                    {u.location}, {u.city}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1.5 border-t border-gray-200/60">
                    <span>
                      Mgr:{' '}
                      <strong>
                        {fullName(u.manager.firstName, u.manager.lastName)}
                      </strong>
                    </span>
                    <span>
                      <strong>{u.tailorCount}</strong> tailors ·{' '}
                      <strong>
                        {u.activeOrdersCount}/{u.maxDailyCapacity}
                      </strong>{' '}
                      cap
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : revenue.isError ? (
              <p className="py-16 text-center text-sm text-red-600">
                Failed to load revenue.
              </p>
            ) : (
              <AreaChart data={revenue.data ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : donutData.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                No orders yet.
              </p>
            ) : (
              <DonutChart data={donutData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-sm font-medium text-[#7E153A] hover:underline"
          >
            View all
          </button>
        </CardHeader>
        <CardContent>
          {recent.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (recent.data?.orders.length ?? 0) === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No orders to show.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.data?.orders.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell>
                      {fullName(o.customer.firstName, o.customer.lastName)}
                    </TableCell>
                    <TableCell>
                      {o.assignedUnit ? (
                        <span className="text-xs font-semibold text-gray-800">
                          {o.assignedUnit.name}
                        </span>
                      ) : (
                        <Badge variant="warning">Unassigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(o.totalAmount)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(o.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
