'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingBag, Building2, Scissors, Boxes } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { Pagination } from '@/components/admin/pagination';
import { useAdminActor } from '@/components/admin/AdminActorContext';
import { useOrders } from '@/hooks/admin/use-orders';
import { useUnits } from '@/hooks/admin/use-units';
import {
  ORDER_STATUSES,
  formatStatus,
  formatCurrency,
  formatDate,
  fullName,
} from '@/lib/admin/format';

const LIMIT = 10;

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actor = useAdminActor();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [unitId, setUnitId] = useState(searchParams.get('unitId') || '');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data: units } = useUnits(actor.isSuperAdmin);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  const { data, isLoading, isError, isPlaceholderData } = useOrders({
    page,
    limit: LIMIT,
    status: status || undefined,
    search: search || undefined,
    unitId: actor.isSuperAdmin ? unitId || undefined : undefined,
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            {actor.isSuperAdmin
              ? 'Orders Control (All Platform Orders)'
              : `Assigned Orders — ${actor.unit?.name ?? 'My Unit'}`}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {actor.isSuperAdmin
              ? 'All incoming customer orders arrive here. Click any order to assign it to a tailoring unit.'
              : 'Orders assigned to your workshop by Super Admin. Open any order to assign a tailor (darzi) and update stitching progress.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number or customer name…"
            className="pl-9"
          />
        </div>

        {actor.isSuperAdmin && (
          <div className="sm:w-56">
            <Select
              value={unitId}
              onChange={(e) => {
                setUnitId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All units</option>
              <option value="unassigned">Unassigned to unit</option>
              {(units ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.city})
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="sm:w-52">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={ShoppingBag}
            title="Couldn't load orders"
            description="Something went wrong fetching orders. Please retry."
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description={
              search || status || unitId
                ? 'Try adjusting your filters.'
                : actor.isSuperAdmin
                  ? 'Orders will appear here once customers start placing them.'
                  : 'No orders have been assigned to your unit yet.'
            }
          />
        ) : (
          <>
            <div
              className={
                isPlaceholderData
                  ? 'opacity-60 transition-opacity'
                  : 'transition-opacity'
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    {actor.isSuperAdmin && <TableHead>Assigned Unit</TableHead>}
                    <TableHead>Assigned Tailor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{o.orderNumber}</span>
                          {o.product?.unitId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7E153A] mt-0.5">
                              <Boxes className="h-3 w-3" /> Unit Own Stock
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {fullName(o.customer.firstName, o.customer.lastName)}
                      </TableCell>
                      {actor.isSuperAdmin && (
                        <TableCell>
                          {o.assignedUnit ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 text-xs flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-[#7E153A]" />
                                {o.assignedUnit.name}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {o.assignedUnit.location}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="warning">Unassigned</Badge>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {o.assignedTailor ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-800">
                            <Scissors className="h-3 w-3 text-gray-400" />
                            {fullName(
                              o.assignedTailor.firstName,
                              o.assignedTailor.lastName
                            )}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold">
                            Awaiting Darzi
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell>
                        {o.priorityLevel > 0 ? (
                          <Badge variant="warning">P{o.priorityLevel}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
            </div>
            <Pagination
              page={page}
              totalPages={data?.pagination.totalPages ?? 1}
              total={data?.pagination.total ?? 0}
              onPage={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
