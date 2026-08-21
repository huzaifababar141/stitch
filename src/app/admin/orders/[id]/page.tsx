'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Scissors,
  Truck,
  CreditCard,
  Ticket,
  Clock,
  FileText,
  Flag,
  Ban,
  ShieldAlert,
  UserRound,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { useAuth } from '@/hooks/useAuth';
import {
  useOrder,
  useAssignTailor,
  useOverrideStatus,
  useAddNote,
  useSetPriority,
  useCancelOrder,
} from '@/hooks/admin/use-orders';
import { useTailors } from '@/hooks/admin/use-tailors';
import {
  formatCurrency,
  formatStatus,
  statusColor,
  formatDate,
  formatDateTime,
  fullName,
  ORDER_STATUSES,
} from '@/lib/admin/format';
import type { OrderDetail } from '@/lib/admin/types';

const CLOSED_STATUSES = new Set([
  'cancelled',
  'delivered',
  'refunded',
  'returned',
]);

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Elevated' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Urgent' },
];

type ModalKind = 'assign' | 'priority' | 'note' | 'status' | 'cancel';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.app_metadata?.role === 'super_admin';

  const { data: order, isLoading, isError } = useOrder(id);
  const [modal, setModal] = useState<ModalKind | null>(null);

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <Card className="p-4">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="This order could not be loaded. It may have been removed."
        />
        <div className="flex justify-center pb-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const isClosed = CLOSED_STATUSES.has(order.status);
  const discount = Number(order.discountAmount);

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-[#7E153A]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Orders
        </Link>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
              {order.priorityLevel > 0 && (
                <Badge variant="warning">Priority {order.priorityLevel}</Badge>
              )}
              {order.isCod && <Badge variant="secondary">COD</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formatStatus(order.garmentType)} · Placed{' '}
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModal('assign')}
            >
              <Scissors className="mr-2 h-4 w-4" />
              {order.assignedTailor ? 'Reassign' : 'Assign'} tailor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModal('priority')}
            >
              <Flag className="mr-2 h-4 w-4" />
              Priority
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModal('note')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Add note
            </Button>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal('status')}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Override status
              </Button>
            )}
            {!isClosed && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setModal('cancel')}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: summary, snapshots, timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent>
              <FeeRow label="Stitching fee" value={order.stitchingFee} />
              <FeeRow label="Delivery fee" value={order.deliveryFee} />
              <FeeRow label="Add-ons" value={order.addonFee} />
              {discount > 0 && (
                <FeeRow
                  label="Discount"
                  value={`-${formatCurrency(order.discountAmount)}`}
                  raw
                />
              )}
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-lg font-semibold text-[#7E153A]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <SnapshotCard
            title="Measurements"
            snapshot={order.measurementSnapshot}
          />
          <SnapshotCard title="Style details" snapshot={order.styleSnapshot} />
          <SnapshotCard title="Product" snapshot={order.productSnapshot} />

          <Timeline order={order} />
        </div>

        {/* Right: people, delivery, payments, notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#7E153A]" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <InfoRow
                label="Name"
                value={fullName(
                  order.customer.firstName,
                  order.customer.lastName
                )}
              />
              <InfoRow label="Phone" value={order.customer.phone} />
              {order.customer.email && (
                <InfoRow label="Email" value={order.customer.email} />
              )}
              {order.customer.gender && (
                <InfoRow
                  label="Gender"
                  value={formatStatus(order.customer.gender)}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-[#7E153A]" />
                Tailor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {order.assignedTailor ? (
                <>
                  <InfoRow
                    label="Name"
                    value={fullName(
                      order.assignedTailor.firstName,
                      order.assignedTailor.lastName
                    )}
                  />
                  {order.assignedTailor.phone && (
                    <InfoRow label="Phone" value={order.assignedTailor.phone} />
                  )}
                  {order.assignedAt && (
                    <InfoRow
                      label="Assigned"
                      value={formatDateTime(order.assignedAt)}
                    />
                  )}
                  {order.stitchingDeadline && (
                    <InfoRow
                      label="Deadline"
                      value={formatDate(order.stitchingDeadline)}
                    />
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No tailor assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#7E153A]" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {order.delivery ? (
                <>
                  <InfoRow label="Courier" value={order.delivery.courierName} />
                  <InfoRow
                    label="Status"
                    value={formatStatus(order.delivery.status)}
                  />
                  {order.delivery.trackingNumber && (
                    <InfoRow
                      label="Tracking"
                      value={order.delivery.trackingNumber}
                    />
                  )}
                  {order.delivery.estimatedDelivery && (
                    <InfoRow
                      label="ETA"
                      value={formatDate(order.delivery.estimatedDelivery)}
                    />
                  )}
                  {order.delivery.deliveredAt && (
                    <InfoRow
                      label="Delivered"
                      value={formatDateTime(order.delivery.deliveredAt)}
                    />
                  )}
                </>
              ) : order.estimatedDeliveryDate ? (
                <InfoRow
                  label="Est. delivery"
                  value={formatDate(order.estimatedDeliveryDate)}
                />
              ) : (
                <p className="text-sm text-gray-400">No delivery record yet.</p>
              )}
              {order.deliveryAddressSnapshot && (
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <SnapshotEntries snapshot={order.deliveryAddressSnapshot} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#7E153A]" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <p className="text-sm text-gray-400">No payments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {formatCurrency(p.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatStatus(p.method)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          p.status === 'completed' ? 'success' : 'warning'
                        }
                      >
                        {formatStatus(p.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {order.coupon && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#7E153A]" />
                  Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <InfoRow label="Code" value={order.coupon.code} />
                <InfoRow
                  label="Discount"
                  value={
                    order.coupon.discountType === 'percentage'
                      ? `${order.coupon.discountValue}%`
                      : formatCurrency(order.coupon.discountValue)
                  }
                />
              </CardContent>
            </Card>
          )}

          {(order.adminNotes ||
            order.internalNotes ||
            order.qcNotes ||
            order.cancellationReason) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#7E153A]" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.adminNotes && (
                  <NoteBlock label="Admin notes" text={order.adminNotes} />
                )}
                {order.internalNotes && (
                  <NoteBlock
                    label="Internal notes"
                    text={order.internalNotes}
                  />
                )}
                {order.qcNotes && (
                  <NoteBlock label="QC notes" text={order.qcNotes} />
                )}
                {order.cancellationReason && (
                  <NoteBlock
                    label="Cancellation reason"
                    text={order.cancellationReason}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals — mounted only while open */}
      {modal === 'assign' && (
        <AssignTailorModal
          orderId={id}
          currentTailorId={order.assignedTailor?.id ?? ''}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'priority' && (
        <PriorityModal
          orderId={id}
          current={order.priorityLevel}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'note' && (
        <NoteModal orderId={id} onClose={() => setModal(null)} />
      )}
      {modal === 'status' && (
        <StatusModal
          orderId={id}
          current={order.status}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'cancel' && (
        <CancelModal
          orderId={id}
          orderNumber={order.orderNumber}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------- bits --------------------------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

function FeeRow({
  label,
  value,
  raw = false,
}: {
  label: string;
  value: string;
  raw?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">
        {raw ? value : formatCurrency(value)}
      </span>
    </div>
  );
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{text}</p>
    </div>
  );
}

function formatKey(k: string) {
  return k
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_.-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function flatten(
  obj: Record<string, unknown>,
  prefix = ''
): [string, unknown][] {
  const out: [string, unknown][] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix} · ${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v as Record<string, unknown>, key));
    } else {
      out.push([key, v]);
    }
  }
  return out;
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v))
    return v.length ? v.map((x) => String(x)).join(', ') : '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

function SnapshotEntries({ snapshot }: { snapshot: Record<string, unknown> }) {
  const entries = flatten(snapshot);
  if (entries.length === 0) return <p className="text-sm text-gray-400">—</p>;
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-4 text-sm"
        >
          <span className="text-gray-500">{formatKey(k)}</span>
          <span className="text-right font-medium text-gray-800">
            {renderValue(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SnapshotCard({
  title,
  snapshot,
}: {
  title: string;
  snapshot: Record<string, unknown> | null;
}) {
  if (!snapshot || Object.keys(snapshot).length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <SnapshotEntries snapshot={snapshot} />
      </CardContent>
    </Card>
  );
}

function Timeline({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#7E153A]" />
          Status timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.statusHistory.length === 0 ? (
          <p className="text-sm text-gray-400">
            No status changes recorded yet.
          </p>
        ) : (
          <ol className="relative space-y-5 border-l border-gray-200 pl-6">
            {order.statusHistory.map((h) => (
              <li key={h.id} className="relative">
                <span
                  className="absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white"
                  style={{ backgroundColor: statusColor(h.toStatus) }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={h.toStatus} />
                  {h.fromStatus && (
                    <span className="text-xs text-gray-400">
                      from {formatStatus(h.fromStatus)}
                    </span>
                  )}
                </div>
                {h.notes && (
                  <p className="mt-1 text-sm text-gray-600">{h.notes}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDateTime(h.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- modals -------------------------------- */

function AssignTailorModal({
  orderId,
  currentTailorId,
  onClose,
}: {
  orderId: string;
  currentTailorId: string;
  onClose: () => void;
}) {
  const { data: tailors, isLoading } = useTailors({ isActive: true });
  const assign = useAssignTailor(orderId);
  const [tailorId, setTailorId] = useState(currentTailorId);

  const submit = () => {
    if (!tailorId) return;
    assign.mutate(tailorId, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign tailor</DialogTitle>
          <DialogDescription>
            Assigning moves the order into stitching and notifies the tailor.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="tailor">Tailor</Label>
          <Select
            id="tailor"
            className="mt-1.5"
            value={tailorId}
            disabled={isLoading}
            onChange={(e) => setTailorId(e.target.value)}
          >
            <option value="">
              {isLoading ? 'Loading tailors…' : 'Select a tailor'}
            </option>
            {tailors?.map((t) => {
              const p = t.tailorProfile;
              const load = p
                ? ` — ${p.currentActiveOrders}/${p.maxDailyCapacity} active`
                : '';
              const avail = p && !p.isAvailable ? ' (unavailable)' : '';
              return (
                <option key={t.id} value={t.id}>
                  {fullName(t.firstName, t.lastName)}
                  {load}
                  {avail}
                </option>
              );
            })}
          </Select>
          {!isLoading && (tailors?.length ?? 0) === 0 && (
            <p className="mt-2 text-sm text-gray-400">
              No active tailors. Create one from the Tailors panel first.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assign.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!tailorId || assign.isPending}>
            {assign.isPending ? 'Assigning…' : 'Assign tailor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PriorityModal({
  orderId,
  current,
  onClose,
}: {
  orderId: string;
  current: number;
  onClose: () => void;
}) {
  const setPriority = useSetPriority(orderId);
  const [level, setLevel] = useState(String(current));

  const submit = () =>
    setPriority.mutate(Number(level), { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set priority</DialogTitle>
          <DialogDescription>
            Higher priority orders surface first for tailors.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="priority">Priority level</Label>
          <Select
            id="priority"
            className="mt-1.5"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={String(o.value)}>
                {o.label} ({o.value})
              </option>
            ))}
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={setPriority.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={setPriority.isPending}>
            {setPriority.isPending ? 'Saving…' : 'Save priority'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NoteModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const addNote = useAddNote(orderId);
  const [note, setNote] = useState('');

  const submit = () => {
    if (!note.trim()) return;
    addNote.mutate(note.trim(), { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            Notes are appended to the order&apos;s admin log.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            className="mt-1.5"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write an internal note about this order…"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={addNote.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!note.trim() || addNote.isPending}>
            {addNote.isPending ? 'Adding…' : 'Add note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusModal({
  orderId,
  current,
  onClose,
}: {
  orderId: string;
  current: string;
  onClose: () => void;
}) {
  const override = useOverrideStatus(orderId);
  const [status, setStatus] = useState(current);

  const submit = () => {
    if (status === current) return onClose();
    override.mutate(status, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override status</DialogTitle>
          <DialogDescription>
            Manually set the order status. This bypasses the normal workflow —
            use with care.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="status">New status</Label>
          <Select
            id="status"
            className="mt-1.5"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={override.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={override.isPending}>
            {override.isPending ? 'Updating…' : 'Update status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelModal({
  orderId,
  orderNumber,
  onClose,
}: {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
}) {
  const cancel = useCancelOrder(orderId);
  const [reason, setReason] = useState('');

  const submit = () => cancel.mutate(reason.trim(), { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel order {orderNumber}?</DialogTitle>
          <DialogDescription>
            This marks the order as cancelled. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            className="mt-1.5"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this order being cancelled?"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={cancel.isPending}
          >
            Keep order
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={cancel.isPending}
          >
            {cancel.isPending ? 'Cancelling…' : 'Cancel order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
