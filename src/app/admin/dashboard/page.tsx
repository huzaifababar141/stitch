'use client';

import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Scissors,
  ClipboardCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  useDashboardStats,
  useRevenueByDay,
  useOrdersByStatus,
} from '@/hooks/admin/use-analytics';
import { useOrders } from '@/hooks/admin/use-orders';
import {
  formatCurrency,
  formatStatus,
  statusColor,
  formatDate,
  fullName,
} from '@/lib/admin/format';

export default function AdminDashboardPage() {
  const router = useRouter();
  const stats = useDashboardStats();
  const revenue = useRevenueByDay();
  const byStatus = useOrdersByStatus();
  const recent = useOrders({ page: 1, limit: 8 });

  const donutData = (byStatus.data ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      label: formatStatus(s.status),
      value: s.count,
      color: statusColor(s.status),
    }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Total Orders"
          value={stats.data?.totalOrders.toLocaleString() ?? '—'}
          icon={ShoppingBag}
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
