'use client';

import { useEffect, useState } from 'react';
import { Search, Ticket, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
} from '@/hooks/admin/use-coupons';
import { formatCurrency, formatDate } from '@/lib/admin/format';
import type { Coupon } from '@/lib/admin/types';
import type {
  CreateCouponInput,
  UpdateCouponInput,
} from '@/lib/validations/coupon';

type DiscountType = 'percentage' | 'fixed_amount' | 'free_delivery';

const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed_amount', label: 'Fixed amount' },
  { value: 'free_delivery', label: 'Free delivery' },
];

function discountLabel(c: Coupon): string {
  if (c.discountType === 'percentage') return `${c.discountValue}%`;
  if (c.discountType === 'fixed_amount') return formatCurrency(c.discountValue);
  return 'Free delivery';
}

export default function AdminCouponsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const [modal, setModal] = useState<
    { mode: 'create' } | { mode: 'edit'; coupon: Coupon } | null
  >(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: coupons,
    isLoading,
    isError,
  } = useCoupons({
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
            placeholder="Search by code…"
            className="pl-9"
          />
        </div>
        <div className="sm:w-44">
          <Select value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="">All coupons</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
        <Button onClick={() => setModal({ mode: 'create' })}>
          <Plus className="mr-2 h-4 w-4" />
          Create coupon
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
            icon={Ticket}
            title="Couldn't load coupons"
            description="Please retry."
          />
        ) : (coupons?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No coupons yet"
            description={
              search || active
                ? 'Try adjusting your filters.'
                : 'Create your first discount coupon.'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((c) => (
                <CouponRow
                  key={c.id}
                  coupon={c}
                  onEdit={() => setModal({ mode: 'edit', coupon: c })}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {modal?.mode === 'create' && (
        <CouponModal mode="create" onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <CouponModal
          mode="edit"
          coupon={modal.coupon}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function CouponRow({ coupon, onEdit }: { coupon: Coupon; onEdit: () => void }) {
  const update = useUpdateCoupon(coupon.id);
  return (
    <TableRow>
      <TableCell className="font-medium text-gray-900">{coupon.code}</TableCell>
      <TableCell>{discountLabel(coupon)}</TableCell>
      <TableCell>
        {coupon.minOrderAmount > 0
          ? formatCurrency(coupon.minOrderAmount)
          : '—'}
      </TableCell>
      <TableCell className="tabular-nums">
        {coupon.usedCount}
        {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ' / ∞'}
      </TableCell>
      <TableCell className="text-gray-500">
        {coupon.validUntil ? formatDate(coupon.validUntil) : 'No expiry'}
      </TableCell>
      <TableCell>
        {coupon.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant={coupon.isActive ? 'ghost' : 'outline'}
            size="sm"
            disabled={update.isPending}
            onClick={() => update.mutate({ isActive: !coupon.isActive })}
          >
            {coupon.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* --------------------------------- modal --------------------------------- */

interface CouponForm {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  perUserLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: string; // 'true' | 'false'
}

function toForm(c?: Coupon): CouponForm {
  return {
    code: c?.code ?? '',
    description: c?.description ?? '',
    discountType: (c?.discountType as DiscountType) ?? 'percentage',
    discountValue: c ? String(c.discountValue) : '',
    minOrderAmount: c && c.minOrderAmount > 0 ? String(c.minOrderAmount) : '',
    maxDiscountAmount:
      c?.maxDiscountAmount != null ? String(c.maxDiscountAmount) : '',
    usageLimit: c?.usageLimit != null ? String(c.usageLimit) : '',
    perUserLimit: c ? String(c.perUserLimit) : '1',
    validFrom: c?.validFrom ? c.validFrom.slice(0, 10) : '',
    validUntil: c?.validUntil ? c.validUntil.slice(0, 10) : '',
    isActive: c ? String(c.isActive) : 'true',
  };
}

function CouponModal({
  mode,
  coupon,
  onClose,
}: {
  mode: 'create' | 'edit';
  coupon?: Coupon;
  onClose: () => void;
}) {
  const create = useCreateCoupon();
  const update = useUpdateCoupon(coupon?.id ?? '');
  const pending = create.isPending || update.isPending;

  const [form, setForm] = useState<CouponForm>(() => toForm(coupon));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CouponForm>(k: K, v: CouponForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }) as CouponForm);

  const num = (s: string) => (s.trim() === '' ? undefined : Number(s));

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'create' && form.code.trim().length < 3)
      e.code = 'Code must be at least 3 characters';
    const dv = Number(form.discountValue);
    if (form.discountValue.trim() === '' || !(dv > 0))
      e.discountValue = 'Discount value must be greater than 0';
    else if (form.discountType === 'percentage' && dv > 100)
      e.discountValue = 'Percentage cannot exceed 100';
    if (form.minOrderAmount.trim() !== '' && Number(form.minOrderAmount) < 0)
      e.minOrderAmount = 'Cannot be negative';
    if (
      form.maxDiscountAmount.trim() !== '' &&
      !(Number(form.maxDiscountAmount) > 0)
    )
      e.maxDiscountAmount = 'Must be greater than 0';
    if (
      form.usageLimit.trim() !== '' &&
      !(
        Number.isInteger(Number(form.usageLimit)) && Number(form.usageLimit) > 0
      )
    )
      e.usageLimit = 'Must be a positive whole number';
    if (!(
      Number.isInteger(Number(form.perUserLimit)) &&
      Number(form.perUserLimit) > 0
    ))
      e.perUserLimit = 'Must be a positive whole number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    if (mode === 'create') {
      const payload: CreateCouponInput = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: num(form.minOrderAmount),
        maxDiscountAmount:
          form.maxDiscountAmount.trim() === ''
            ? null
            : Number(form.maxDiscountAmount),
        usageLimit:
          form.usageLimit.trim() === '' ? null : Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit),
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || null,
        isActive: form.isActive === 'true',
      };
      create.mutate(payload, { onSuccess: onClose });
    } else {
      const payload: UpdateCouponInput = {
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: num(form.minOrderAmount),
        maxDiscountAmount:
          form.maxDiscountAmount.trim() === ''
            ? null
            : Number(form.maxDiscountAmount),
        usageLimit:
          form.usageLimit.trim() === '' ? null : Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit),
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || null,
        isActive: form.isActive === 'true',
      };
      update.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create coupon' : `Edit ${coupon?.code}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Set up a discount coupon customers can apply at checkout.'
              : 'Update this coupon. The code cannot be changed.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[65vh] space-y-3 overflow-y-auto">
          {mode === 'create' ? (
            <F label="Code" error={errors.code} required>
              <Input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="EID2026"
              />
            </F>
          ) : (
            <F label="Code">
              <Input value={form.code} disabled />
            </F>
          )}

          <F label="Description">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Discount type">
              <Select
                value={form.discountType}
                onChange={(e) =>
                  set('discountType', e.target.value as DiscountType)
                }
              >
                {DISCOUNT_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </F>
            <F
              label={
                form.discountType === 'percentage'
                  ? 'Discount (%)'
                  : 'Discount value'
              }
              error={errors.discountValue}
              required
            >
              <Input
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
              />
            </F>
          </div>
          {form.discountType === 'free_delivery' && (
            <p className="-mt-1 text-xs text-gray-400">
              For free delivery, the value isn&apos;t applied to totals but is
              still required.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <F label="Min order amount" error={errors.minOrderAmount}>
              <Input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) => set('minOrderAmount', e.target.value)}
                placeholder="0"
              />
            </F>
            <F label="Max discount amount" error={errors.maxDiscountAmount}>
              <Input
                type="number"
                min={0}
                value={form.maxDiscountAmount}
                onChange={(e) => set('maxDiscountAmount', e.target.value)}
                placeholder="No cap"
              />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Usage limit (total)" error={errors.usageLimit}>
              <Input
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => set('usageLimit', e.target.value)}
                placeholder="Unlimited"
              />
            </F>
            <F label="Per-user limit" error={errors.perUserLimit} required>
              <Input
                type="number"
                min={1}
                value={form.perUserLimit}
                onChange={(e) => set('perUserLimit', e.target.value)}
              />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Valid from">
              <Input
                type="date"
                value={form.validFrom}
                onChange={(e) => set('validFrom', e.target.value)}
              />
            </F>
            <F label="Valid until">
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => set('validUntil', e.target.value)}
              />
            </F>
          </div>

          <F label="Status">
            <Select
              value={form.isActive}
              onChange={(e) => set('isActive', e.target.value)}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </F>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending
              ? 'Saving…'
              : mode === 'create'
                ? 'Create coupon'
                : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({
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
