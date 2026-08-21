'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Scissors, Plus } from 'lucide-react';
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
import { useTailors, useCreateTailor } from '@/hooks/admin/use-tailors';
import { formatStatus, fullName } from '@/lib/admin/format';

const SKILL_LEVELS = ['junior', 'mid', 'senior', 'master'] as const;

export default function AdminTailorsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(''); // '' | 'true' | 'false'
  const [createOpen, setCreateOpen] = useState(false);

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
  });

  return (
    <div className="space-y-4">
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
        <div className="sm:w-44">
          <Select value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="">All tailors</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add tailor
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
              search || active
                ? 'Try adjusting your filters.'
                : 'Add your first tailor to start assigning orders.'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tailors?.map((t) => {
                const p = t.tailorProfile;
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
                    <TableCell>
                      {p ? formatStatus(p.skillLevel) : '—'}
                    </TableCell>
                    <TableCell>
                      {p
                        ? `${p.currentActiveOrders}/${p.maxDailyCapacity}`
                        : '—'}
                    </TableCell>
                    <TableCell>{p ? p.totalOrdersCompleted : '—'}</TableCell>
                    <TableCell>{p ? `${p.qualityScore}` : '—'}</TableCell>
                    <TableCell>
                      {p?.isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {createOpen && <CreateTailorModal onClose={() => setCreateOpen(false)} />}
    </div>
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
}

const EMPTY: FormState = {
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  employeeId: '',
  skillLevel: 'junior',
  maxDailyCapacity: '3',
};

function CreateTailorModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTailor();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!/^\+92\d{10}$/.test(form.phone))
      errs.phone = 'Phone must be like +923001234567';
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
        phone: form.phone.trim(),
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
          <DialogTitle>Add tailor</DialogTitle>
          <DialogDescription>
            Creates a tailor account and their work profile.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <Field label="Phone" error={errors.phone} required>
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+923001234567"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName} required>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
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
          <Field label="Employee ID">
            <Input
              value={form.employeeId}
              onChange={(e) => set('employeeId', e.target.value)}
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
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create tailor'}
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
      <Label className="mb-1.5 block">
        {label}
        {required && <span className="text-[#7E153A]"> *</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
