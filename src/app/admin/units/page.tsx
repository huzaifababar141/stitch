'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  MapPin,
  UserRound,
  Scissors,
  Boxes,
  ShoppingBag,
  ShieldAlert,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { useAdminActor } from '@/components/admin/AdminActorContext';
import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
} from '@/hooks/admin/use-units';
import { fullName } from '@/lib/admin/format';
import type { UnitSummary } from '@/lib/admin/types';

export default function AdminUnitsPage() {
  const actor = useAdminActor();
  const { data: units, isLoading, isError } = useUnits(actor.isSuperAdmin);
  const updateUnit = useUpdateUnit();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitSummary | null>(null);

  if (!actor.isSuperAdmin) {
    return (
      <Card className="p-8 text-center space-y-3">
        <ShieldAlert className="mx-auto h-10 w-10 text-[#7E153A]" />
        <h2 className="text-lg font-extrabold text-gray-900">
          Super Admin Access Required
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Only the Super Admin can create tailoring units, manage unit admins,
          and control fabric stock permissions.
        </p>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  const list = units ?? [];
  const totalTailors = list.reduce((s, u) => s + u.tailorCount, 0);
  const totalCapacity = list
    .filter((u) => u.isActive)
    .reduce((s, u) => s + u.maxDailyCapacity, 0);
  const stockEnabledUnits = list.filter((u) => u.hasStockAccess).length;
  const totalPendingStock = list.reduce((s, u) => s + u.pendingStockCount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-50 text-[#7E153A]">
              <Building2 size={22} />
            </span>
            Tailoring Units & Workshop Managers
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create Unit Admin accounts, inspect workshop location, tailors &
            daily capacity, and control fabric stock submission permissions.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs font-bold shadow-md shadow-[#7E153A]/20 gap-1.5 px-4 h-10 cursor-pointer"
        >
          <Plus size={16} /> Create Unit Admin
        </Button>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
            Active Units
          </span>
          <p className="text-2xl font-black text-gray-900">
            {list.filter((u) => u.isActive).length}
            <span className="text-xs font-semibold text-gray-400 ml-1">
              / {list.length}
            </span>
          </p>
          <span className="text-[11px] text-gray-500">
            Partner workshops live
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-[#7E153A] tracking-wider">
            Unit Tailors (Darzis)
          </span>
          <p className="text-2xl font-black text-[#7E153A]">{totalTailors}</p>
          <span className="text-[11px] text-gray-500">
            Active tailors across units
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-emerald-600 tracking-wider">
            Combined Daily Capacity
          </span>
          <p className="text-2xl font-black text-emerald-700">
            {totalCapacity}
          </p>
          <span className="text-[11px] text-gray-500">
            Suits / day capacity
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-amber-600 tracking-wider">
            Stock Access Enabled
          </span>
          <p className="text-2xl font-black text-amber-700">
            {stockEnabledUnits}
            {totalPendingStock > 0 && (
              <span className="text-xs font-bold text-[#7E153A] ml-2">
                ({totalPendingStock} pending)
              </span>
            )}
          </p>
          <span className="text-[11px] text-gray-500">
            Units allowed to submit stock
          </span>
        </div>
      </div>

      {/* Units Directory */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6">
          <EmptyState
            icon={Building2}
            title="Could not load tailoring units"
            description="Please refresh and try again."
          />
        </Card>
      ) : list.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Building2}
            title="No tailoring units created yet"
            description="Create your first Tailoring Unit & Manager account to start delegating orders directly to workshops."
          />
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs font-bold"
            >
              <Plus size={15} className="mr-1.5" /> Create First Unit Admin
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {list.map((unit) => {
            const capacityPct = Math.min(
              100,
              Math.round(
                (unit.activeOrdersCount / Math.max(1, unit.maxDailyCapacity)) *
                  100
              )
            );

            return (
              <div
                key={unit.id}
                className={`bg-white rounded-2xl border shadow-xs p-5 flex flex-col justify-between gap-4 transition-all ${
                  unit.isActive
                    ? 'border-gray-200/80 hover:border-[#7E153A]/30'
                    : 'border-gray-200 bg-gray-50/70 opacity-75'
                }`}
              >
                {/* Top Info Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-gray-900 truncate">
                          {unit.name}
                        </h3>
                        <Badge
                          variant={unit.isActive ? 'success' : 'secondary'}
                        >
                          {unit.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <MapPin size={13} className="text-[#7E153A] shrink-0" />
                        <span>
                          {unit.location}, {unit.city}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUnit(unit)}
                      className="rounded-xl text-xs shrink-0 h-8 px-3"
                    >
                      <Edit2 size={13} className="mr-1" /> Edit
                    </Button>
                  </div>

                  {/* Manager Box */}
                  <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center font-extrabold shrink-0">
                        <UserRound size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          Manager:{' '}
                          {fullName(
                            unit.manager.firstName,
                            unit.manager.lastName
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 mt-0.5">
                          {unit.manager.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} /> {unit.manager.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {unit.manager.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid: Tailors, Capacity, Orders */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <Scissors size={11} /> Tailors
                      </span>
                      <p className="text-lg font-black text-gray-900 mt-0.5">
                        {unit.tailorCount}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        Darzis in unit
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <Gauge size={11} /> Capacity
                      </span>
                      <p className="text-lg font-black text-gray-900 mt-0.5">
                        {unit.activeOrdersCount}
                        <span className="text-xs font-bold text-gray-400">
                          /{unit.maxDailyCapacity}
                        </span>
                      </p>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            capacityPct >= 90
                              ? 'bg-red-600'
                              : capacityPct >= 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <ShoppingBag size={11} /> Orders
                      </span>
                      <p className="text-lg font-black text-gray-900 mt-0.5">
                        {unit.totalOrdersCount}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {unit.activeOrdersCount} active now
                      </span>
                    </div>
                  </div>

                  {/* Tailors Preview Chips */}
                  {unit.tailors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">
                        Team:
                      </span>
                      {unit.tailors.slice(0, 6).map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-700"
                        >
                          {fullName(t.firstName, t.lastName)} (
                          {t.currentActiveOrders}/{t.maxDailyCapacity})
                        </span>
                      ))}
                      {unit.tailors.length > 6 && (
                        <span className="text-[11px] text-gray-400 font-semibold">
                          +{unit.tailors.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Controls: Stock Access Toggle & Quick Links */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  {/* Live Stock Access Toggle */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={updateUnit.isPending}
                      onClick={() =>
                        updateUnit.mutate({
                          id: unit.id,
                          data: { hasStockAccess: !unit.hasStockAccess },
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        unit.hasStockAccess
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {unit.hasStockAccess ? (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      ) : (
                        <XCircle size={14} className="text-gray-400" />
                      )}
                      Stock Access: {unit.hasStockAccess ? 'ON' : 'OFF'}
                    </button>

                    {unit.pendingStockCount > 0 && (
                      <Link
                        href="/admin/stock"
                        className="text-[11px] font-bold text-[#7E153A] bg-red-50 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100"
                      >
                        {unit.pendingStockCount} Pending Stock
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/orders?unitId=${unit.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] rounded-xl"
                      >
                        View Orders
                      </Button>
                    </Link>
                    <Link href={`/admin/tailors?unitId=${unit.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] rounded-xl"
                      >
                        Tailors
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {createOpen && <CreateUnitModal onClose={() => setCreateOpen(false)} />}
      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
        />
      )}
    </div>
  );
}

/* ----------------------------- Create Modal ----------------------------- */

function CreateUnitModal({ onClose }: { onClose: () => void }) {
  const createUnit = useCreateUnit();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Lahore');
  const [maxDailyCapacity, setMaxDailyCapacity] = useState('10');
  const [hasStockAccess, setHasStockAccess] = useState(false);
  const [notes, setNotes] = useState('');

  const [managerFirstName, setManagerFirstName] = useState('');
  const [managerLastName, setManagerLastName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Unit name is required';
    if (location.trim().length < 2) errs.location = 'Location is required';
    if (managerFirstName.trim().length < 2)
      errs.managerFirstName = 'Manager first name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail.trim()))
      errs.managerEmail = 'Valid manager email is required';
    const cleanedPhone = managerPhone.replace(/[\s-]/g, '');
    if (!/^(\+92\d{10}|03\d{9})$/.test(cleanedPhone))
      errs.managerPhone = 'Use +923XXXXXXXXX or 03XXXXXXXXX';
    if (managerPassword.length < 8)
      errs.managerPassword = 'Password must be at least 8 characters';
    const cap = Number(maxDailyCapacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 500)
      errs.maxDailyCapacity = 'Capacity must be 1–500';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    createUnit.mutate(
      {
        name: name.trim(),
        location: location.trim(),
        city: city.trim() || 'Lahore',
        maxDailyCapacity: cap,
        hasStockAccess,
        notes: notes.trim() || undefined,
        managerFirstName: managerFirstName.trim(),
        managerLastName: managerLastName.trim(),
        managerEmail: managerEmail.trim().toLowerCase(),
        managerPhone: cleanedPhone,
        managerPassword,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tailoring Unit & Unit Admin</DialogTitle>
          <DialogDescription>
            Creates a new partner tailoring workshop along with its Unit Admin
            login account for /admin/login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b pb-1.5">
              1. Workshop / Unit Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Unit Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Model Town Stitching Unit"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lahore, Karachi, Islamabad..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label>Location / Area *</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Block H, Model Town Market"
                  className="mt-1"
                />
                {errors.location && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
              <div>
                <Label>Daily Capacity *</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={maxDailyCapacity}
                  onChange={(e) => setMaxDailyCapacity(e.target.value)}
                  className="mt-1"
                />
                {errors.maxDailyCapacity && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.maxDailyCapacity}
                  </p>
                )}
              </div>
            </div>

            {/* Stock Access Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="pr-3">
                <p className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Boxes size={14} className="text-[#7E153A]" />
                  Grant Fabric Stock Access
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Enable if this unit owns its own fabric stock and should be
                  able to submit stock photos for Super Admin publishing.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hasStockAccess}
                  onChange={(e) => setHasStockAccess(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7E153A]" />
              </label>
            </div>

            <div className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b pb-1.5 pt-2">
              2. Unit Manager (Admin Login Credentials)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Manager First Name *</Label>
                <Input
                  value={managerFirstName}
                  onChange={(e) => setManagerFirstName(e.target.value)}
                  placeholder="e.g. Bilal"
                  className="mt-1"
                />
                {errors.managerFirstName && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.managerFirstName}
                  </p>
                )}
              </div>
              <div>
                <Label>Manager Last Name</Label>
                <Input
                  value={managerLastName}
                  onChange={(e) => setManagerLastName(e.target.value)}
                  placeholder="e.g. Ahmed"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Login Email *</Label>
                <Input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="unit1@suidhagaa.com"
                  className="mt-1"
                />
                {errors.managerEmail && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.managerEmail}
                  </p>
                )}
              </div>
              <div>
                <Label>Manager Phone *</Label>
                <Input
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="03001234567 or +923001234567"
                  className="mt-1"
                />
                {errors.managerPhone && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.managerPhone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Initial Password *</Label>
              <Input
                type="password"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="mt-1"
              />
              {errors.managerPassword && (
                <p className="text-[11px] text-red-600 mt-1">
                  {errors.managerPassword}
                </p>
              )}
            </div>

            <div>
              <Label>Internal Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specializes in bridal, men's kurta, etc."
                className="mt-1"
              />
            </div>
          </DialogBody>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createUnit.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUnit.isPending}
              className="bg-[#7E153A] hover:bg-[#630f2d] text-white"
            >
              {createUnit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                'Create Unit & Admin Account'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Edit Modal ------------------------------ */

function EditUnitModal({
  unit,
  onClose,
}: {
  unit: UnitSummary;
  onClose: () => void;
}) {
  const updateUnit = useUpdateUnit();
  const [name, setName] = useState(unit.name);
  const [location, setLocation] = useState(unit.location);
  const [city, setCity] = useState(unit.city);
  const [maxDailyCapacity, setMaxDailyCapacity] = useState(
    String(unit.maxDailyCapacity)
  );
  const [hasStockAccess, setHasStockAccess] = useState(unit.hasStockAccess);
  const [isActive, setIsActive] = useState(unit.isActive);
  const [managerFirstName, setManagerFirstName] = useState(
    unit.manager.firstName
  );
  const [managerLastName, setManagerLastName] = useState(
    unit.manager.lastName || ''
  );
  const [notes, setNotes] = useState(unit.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUnit.mutate(
      {
        id: unit.id,
        data: {
          name: name.trim(),
          location: location.trim(),
          city: city.trim(),
          maxDailyCapacity: Number(maxDailyCapacity) || 10,
          hasStockAccess,
          isActive,
          managerFirstName: managerFirstName.trim(),
          managerLastName: managerLastName.trim(),
          notes: notes.trim() || null,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Unit — {unit.name}</DialogTitle>
          <DialogDescription>
            Update workshop location, daily capacity, manager details, or stock
            permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <DialogBody className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Capacity / Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={maxDailyCapacity}
                  onChange={(e) => setMaxDailyCapacity(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Manager First Name</Label>
                <Input
                  value={managerFirstName}
                  onChange={(e) => setManagerFirstName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Manager Last Name</Label>
                <Input
                  value={managerLastName}
                  onChange={(e) => setManagerLastName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-gray-800">
                Allow Fabric Stock Submissions
              </span>
              <input
                type="checkbox"
                checked={hasStockAccess}
                onChange={(e) => setHasStockAccess(e.target.checked)}
                className="h-4 w-4 accent-[#7E153A]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-gray-800">
                Unit Active (Can Receive Orders & Log In)
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-[#7E153A]"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateUnit.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUnit.isPending}
              className="bg-[#7E153A] hover:bg-[#630f2d] text-white"
            >
              {updateUnit.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
