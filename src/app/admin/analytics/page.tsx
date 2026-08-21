'use client';

import {
  ShoppingBag,
  Scissors,
  ClipboardCheck,
  Users,
  Wallet,
  BarChart3,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/admin/kpi-card';
import { EmptyState } from '@/components/admin/empty-state';
import { AreaChart } from '@/components/admin/charts/area-chart';
import { DonutChart } from '@/components/admin/charts/donut-chart';
import {
  useDashboardStats,
  useRevenueByDay,
  useOrdersByStatus,
  useTailorPerformance,
} from '@/hooks/admin/use-analytics';
import { formatCurrency, formatStatus, statusColor } from '@/lib/admin/format';

export default function AdminAnalyticsPage() {
  const stats = useDashboardStats();
  const revenue = useRevenueByDay();
  const byStatus = useOrdersByStatus();
  const performance = useTailorPerformance();

  const sortedStatus = (byStatus.data ?? [])
    .slice()
    .sort((a, b) => b.count - a.count);
  const donutData = sortedStatus.map((s) => ({
    label: formatStatus(s.status),
    value: s.count,
    color: statusColor(s.status),
  }));
  const perf = (performance.data ?? [])
    .slice()
    .sort((a, b) => b.completedOrders - a.completedOrders);

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

      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
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

      {/* Status distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : sortedStatus.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {sortedStatus.map((s) => (
                  <div
                    key={s.status}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColor(s.status) }}
                    />
                    <span className="w-40 shrink-0 text-gray-600">
                      {formatStatus(s.status)}
                    </span>
                    <span className="font-medium tabular-nums text-gray-900">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tailor performance */}
      <Card>
        <CardHeader>
          <CardTitle>Tailor performance</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : perf.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No tailor data yet"
              description="Performance appears once tailors complete orders."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tailor</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">QC rejected</TableHead>
                    <TableHead className="text-right">Quality</TableHead>
                    <TableHead className="text-right">On-time</TableHead>
                    <TableHead className="text-right">Avg hrs</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perf.map((t) => (
                    <TableRow key={t.tailorId}>
                      <TableCell className="font-medium text-gray-900">
                        {t.name}
                      </TableCell>
                      <TableCell>{formatStatus(t.skillLevel)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.currentActiveOrders}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.completedOrders}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.rejectedQc}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.qualityScore}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.onTimeRate}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.avgCompletionHours == null
                          ? '—'
                          : t.avgCompletionHours}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.isAvailable ? 'success' : 'secondary'}
                        >
                          {t.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
