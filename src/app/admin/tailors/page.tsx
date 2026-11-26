'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Scissors, Plus, Building2, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import { useAdminActor } from '@/components/admin/AdminActorContext';
import { useTailors, useCreateTailor } from '@/hooks/admin/use-tailors';
import { useUnits } from '@/hooks/admin/use-units';
import { formatStatus, fullName } from '@/lib/admin/format';

const SKILL_LEVELS = ['junior', 'mid', 'senior', 'master'] as const;

function AdminTailorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actor = useAdminActor();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const [unitId, setUnitId] = useState(searchParams.get('unitId') || '');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: units } = useUnits(actor.isSuperAdmin);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: tailors,
    isLoading,
    isError,
  } = useTailors({
    isActive: active === '' ? undefined : active === 'true',
    search: search || undefined,
    unitId: actor.isSuperAdmin ? unitId || undefined : undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            {actor.isSuperAdmin
              ? 'Tailor Management (All Units)'
              : `My Tailors (Darzis) — ${actor.unit?.name ?? 'Workshop'}`}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {actor.isSuperAdmin
              ? 'View tailors across all workshops, track capacities, and see currently assigned suits.'
              : 'Add and manage the darzis in your unit, and track exactly which suits are currently assigned to each tailor.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or phone…"
            className="pl-9"
          />
        </div>

        {actor.isSuperAdmin && (
          <div className="sm:w-52">
            <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">All units</option>
              <option value="unassigned">HQ / No unit</option>
              {(units ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="sm:w-40">
          <Select value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="">All tailors</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#7E153A] hover:bg-[#630f2d] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add tailor (Darzi)
        </Button>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Scissors}
            title="Couldn't load tailors"
            description="Please retry."
          />
        ) : (tailors?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No tailors yet"
            description={
              search || active || unitId
                ? 'Try adjusting your filters.'
                : 'Add your first tailor (darzi) to start assigning incoming suits.'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tailor Name</TableHead>
                <TableHead>Phone</TableHead>
                {actor.isSuperAdmin && <TableHead>Unit</TableHead>}
                <TableHead>Skill</TableHead>
                <TableHead>Active Load</TableHead>
                <TableHead>Assigned Suits</TableHead>
                <TableHead>Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tailors?.map((t) => {
                const p = t.tailorProfile;
                const activeSuits = t.ordersAsTailor ?? [];
                return (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/tailors/${t.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {fullName(t.firstName, t.lastName)}
                    </TableCell>
                    <TableCell className="text-gray-500">{t.phone}</TableCell>
                    {actor.isSuperAdmin && (
                      <TableCell>
                        {p?.unit ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-800">
                            <Building2 className="h-3 w-3 text-[#7E153A]" />
                            {p.unit.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">HQ</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {p ? formatStatus(p.skillLevel) : '—'}
                    </TableCell>
                    <TableCell>
                      {p
                        ? `${p.currentActiveOrders}/${p.maxDailyCapacity}`
                        : '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {activeSuits.length === 0 ? (
                        <span className="text-xs text-gray-400">
                          No active suits
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {activeSuits.map((ord) => (
                            <Link
                              key={ord.id}
                              href={`/admin/orders/${ord.id}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-[#7E153A] border border-red-200 hover:bg-red-100"
                              title={`${formatStatus(ord.garmentType)} — ${fullName(ord.customer.firstName, ord.customer.lastName)}`}
                            >
                              <ShoppingBag className="h-2.5 w-2.5" />
                              {ord.orderNumber}
                            </Link>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {p?.isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {createOpen && (
        <CreateTailorModal
          isSuperAdmin={actor.isSuperAdmin}
          defaultUnitId={actor.isSuperAdmin ? unitId : actor.unit?.id || ''}
          units={units ?? []}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminTailorsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AdminTailorsContent />
    </Suspense>
  );
}

/* --------------------------------- modal --------------------------------- */

interface FormState {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  skillLevel: string;
  maxDailyCapacity: string;
  unitId: string;
}

function CreateTailorModal({
  isSuperAdmin,
  defaultUnitId,
  units,
  onClose,
}: {
  isSuperAdmin: boolean;
  defaultUnitId: string;
  units: Array<{ id: string; name: string; city: string }>;
  onClose: () => void;
}) {
  const create = useCreateTailor();
  const [form, setForm] = useState<FormState>({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    skillLevel: 'mid',
    maxDailyCapacity: '3',
    unitId: defaultUnitId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const errs: Record<string, string> = {};
    const cleanedPhone = form.phone.replace(/[\s-]/g, '');
    if (!/^(\+92\d{10}|03\d{9})$/.test(cleanedPhone))
      errs.phone = 'Use +923001234567 or 03001234567';
    if (form.firstName.trim().length < 2)
      errs.firstName = 'First name must be at least 2 characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email address';
    const cap = Number(form.maxDailyCapacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 50)
      errs.maxDailyCapacity = 'Capacity must be 1–50';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    create.mutate(
      {
        phone: cleanedPhone,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        employeeId: form.employeeId.trim() || undefined,
        skillLevel: form.skillLevel as never,
        maxDailyCapacity: cap,
        unitId: isSuperAdmin ? form.unitId || undefined : undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tailor (Darzi)</DialogTitle>
          <DialogDescription>
            {isSuperAdmin
              ? 'Creates a tailor record and optionally assigns them to a tailoring unit.'
              : 'Adds a darzi to your tailoring unit so you can assign incoming suits to them.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName} required>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="e.g. Master Rashid"
              />
            </Field>
            <Field label="Last name">
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Optional"
              />
            </Field>
          </div>
          <Field label="Phone" error={errors.phone} required>
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="03001234567 or +923001234567"
            />
          </Field>
          {isSuperAdmin && (
            <Field label="Assign to Tailoring Unit">
              <Select
                value={form.unitId}
                onChange={(e) => set('unitId', e.target.value)}
              >
                <option value="">HQ / Unassigned</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.city})
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Skill level">
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
            </Field>
            <Field label="Daily capacity" error={errors.maxDailyCapacity}>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.maxDailyCapacity}
                onChange={(e) => set('maxDailyCapacity', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Email (optional)" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={create.isPending}
            className="bg-[#7E153A] hover:bg-[#630f2d] text-white"
          >
            {create.isPending ? 'Adding…' : 'Add Tailor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
