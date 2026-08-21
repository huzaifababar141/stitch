'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Scissors,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
import { EmptyState } from '@/components/admin/empty-state';
import { KpiCard } from '@/components/admin/kpi-card';
import {
  useTailor,
  useUpdateTailor,
  useSetAvailability,
} from '@/hooks/admin/use-tailors';
import { formatStatus, formatDate, fullName } from '@/lib/admin/format';
import { ClipboardCheck, CheckCircle2, XCircle, Star } from 'lucide-react';
import type { TailorRow } from '@/lib/admin/types';

const SKILL_LEVELS = ['junior', 'mid', 'senior', 'master'] as const;

export default function AdminTailorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tailor, isLoading, isError } = useTailor(id);
  const availability = useSetAvailability(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <TailorSkeleton />;

  if (isError || !tailor) {
    return (
      <Card className="p-4">
        <EmptyState
          icon={Scissors}
          title="Tailor not found"
          description="This tailor could not be loaded."
        />
        <div className="flex justify-center pb-4">
          <Link href="/admin/tailors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to tailors
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const p = tailor.tailorProfile;
  const isAvailable = p?.isAvailable ?? false;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tailors"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-[#7E153A]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Tailors
        </Link>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {fullName(tailor.firstName, tailor.lastName)}
              </h1>
              {p && <Badge variant="info">{formatStatus(p.skillLevel)}</Badge>}
              <Badge variant={isAvailable ? 'success' : 'secondary'}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
              <Badge variant={tailor.isActive ? 'success' : 'secondary'}>
                {tailor.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">{tailor.phone}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={availability.isPending}
              onClick={() => availability.mutate(!isAvailable)}
            >
              {isAvailable ? (
                <ToggleRight className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="mr-2 h-4 w-4 text-gray-400" />
              )}
              {isAvailable ? 'Mark unavailable' : 'Mark available'}
            </Button>
          </div>
        </div>
      </div>

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Active orders"
          value={p ? String(p.currentActiveOrders) : '—'}
          icon={ClipboardCheck}
        />
        <KpiCard
          label="Completed"
          value={p ? String(p.totalOrdersCompleted) : '—'}
          icon={CheckCircle2}
        />
        <KpiCard
          label="QC rejected"
          value={p ? String(p.totalOrdersRejectedQc) : '—'}
          icon={XCircle}
        />
        <KpiCard
          label="Quality score"
          value={p ? String(p.qualityScore) : '—'}
          icon={Star}
        />
        <KpiCard
          label="On-time rate"
          value={p ? `${p.onTimeRate}%` : '—'}
          icon={Scissors}
        />
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <InfoRow label="Phone" value={tailor.phone} />
          <InfoRow label="Email" value={tailor.email ?? '—'} />
          <InfoRow label="Employee ID" value={p?.employeeId ?? '—'} />
          <InfoRow
            label="Skill level"
            value={p ? formatStatus(p.skillLevel) : '—'}
          />
          <InfoRow
            label="Daily capacity"
            value={p ? String(p.maxDailyCapacity) : '—'}
          />
          <InfoRow label="Joined" value={formatDate(tailor.createdAt)} />
        </CardContent>
      </Card>

      {editOpen && (
        <EditTailorModal tailor={tailor} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-50 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

function TailorSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

/* --------------------------------- modal --------------------------------- */

function EditTailorModal({
  tailor,
  onClose,
}: {
  tailor: TailorRow;
  onClose: () => void;
}) {
  const update = useUpdateTailor(tailor.id);
  const p = tailor.tailorProfile;
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    skillLevel: string;
    maxDailyCapacity: string;
  }>({
    firstName: tailor.firstName ?? '',
    lastName: tailor.lastName ?? '',
    email: tailor.email ?? '',
    employeeId: p?.employeeId ?? '',
    skillLevel: p?.skillLevel ?? 'junior',
    maxDailyCapacity: String(p?.maxDailyCapacity ?? 3),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const errs: Record<string, string> = {};
    if (form.firstName.trim().length < 2)
      errs.firstName = 'First name must be at least 2 characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email address';
    const cap = Number(form.maxDailyCapacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 50)
      errs.maxDailyCapacity = 'Capacity must be 1–50';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    update.mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        employeeId: form.employeeId.trim() || undefined,
        skillLevel: form.skillLevel as never,
        maxDailyCapacity: cap,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tailor</DialogTitle>
          <DialogDescription>
            Update this tailor&apos;s details and work profile.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div>
            <Label className="mb-1.5 block">Phone</Label>
            <Input value={tailor.phone} disabled />
            <p className="mt-1 text-xs text-gray-400">
              Phone can&apos;t be changed after creation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">
                First name<span className="text-[#7E153A]"> *</span>
              </Label>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Last name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Skill level</Label>
              <Select
                value={form.skillLevel}
                onChange={(e) => set('skillLevel', e.target.value)}
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Daily capacity</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.maxDailyCapacity}
                onChange={(e) => set('maxDailyCapacity', e.target.value)}
              />
              {errors.maxDailyCapacity && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.maxDailyCapacity}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Employee ID</Label>
            <Input
              value={form.employeeId}
              onChange={(e) => set('employeeId', e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={update.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
