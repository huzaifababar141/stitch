'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Home,
  Briefcase,
  Building2,
  Phone,
  User,
  Plus,
  Star,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Truck,
  Navigation,
  CheckCircle2,
  Compass,
  AlertCircle,
  ShieldCheck,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// ─── Major Pakistani Cities & Provinces ──────────────────────────────────────

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Kashmir',
  'Gilgit-Baltistan',
];

const POPULAR_CITIES = [
  { name: 'Karachi', province: 'Sindh' },
  { name: 'Lahore', province: 'Punjab' },
  { name: 'Islamabad', province: 'Islamabad Capital Territory' },
  { name: 'Rawalpindi', province: 'Punjab' },
  { name: 'Faisalabad', province: 'Punjab' },
  { name: 'Multan', province: 'Punjab' },
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa' },
  { name: 'Quetta', province: 'Balochistan' },
  { name: 'Sialkot', province: 'Punjab' },
  { name: 'Gujranwala', province: 'Punjab' },
  { name: 'Hyderabad', province: 'Sindh' },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa' },
  { name: 'Bahawalpur', province: 'Punjab' },
  { name: 'Sargodha', province: 'Punjab' },
  { name: 'Sukkur', province: 'Sindh' },
  { name: 'Gujrat', province: 'Punjab' },
  { name: 'Mardan', province: 'Khyber Pakhtunkhwa' },
  { name: 'Kasur', province: 'Punjab' },
  { name: 'Rahim Yar Khan', province: 'Punjab' },
  { name: 'Sahiwal', province: 'Punjab' },
  { name: 'Wah Cantt', province: 'Punjab' },
  { name: 'Mirpur', province: 'Azad Kashmir' },
  { name: 'Muzaffarabad', province: 'Azad Kashmir' },
  { name: 'Gilgit', province: 'Gilgit-Baltistan' },
  { name: 'Skardu', province: 'Gilgit-Baltistan' },
];

const ADDRESS_TYPES = [
  { key: 'Home', label: 'Home', icon: Home },
  { key: 'Office', label: 'Office', icon: Briefcase },
  { key: 'Studio', label: 'Studio / Boutique', icon: Building2 },
  { key: 'Other', label: 'Other', icon: MapPin },
];

// ─── Main Address Book Page Component ────────────────────────────────────────

export default function AddressBookPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load User Addresses from API
  const loadAddresses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/addresses');
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        setAddresses(items);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Open modal in Create mode
  const handleOpenCreate = () => {
    setEditingAddress(null);
    setLabel('Home');
    setFullName(
      user?.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : ''
    );
    setPhone(user?.phone || user?.user_metadata?.phone || '');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setCity('Lahore');
    setProvince('Punjab');
    setPostalCode('');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEdit = (addr: any) => {
    setEditingAddress(addr);
    setLabel(addr.label || 'Home');
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setAddressLine1(addr.addressLine1 || '');
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Lahore');
    setProvince(addr.province || 'Punjab');
    setPostalCode(addr.postalCode || '');
    setIsDefault(addr.isDefault || false);
    setIsModalOpen(true);
  };

  // City selection auto-sets matching province
  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const matched = POPULAR_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (matched) {
      setProvince(matched.province);
    }
  };

  // Save / Update Address Handler
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !province.trim()
    ) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please complete all required address information.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        label: label.trim() || 'Home',
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim() || undefined,
        country: 'Pakistan',
        isDefault,
      };

      const isEdit = !!editingAddress?.id;
      const url = isEdit
        ? `/api/users/addresses/${editingAddress.id}`
        : '/api/users/addresses';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: isEdit ? 'Address Updated' : 'Address Added',
          description: `"${label}" address saved successfully.`,
        });
        setIsModalOpen(false);
        loadAddresses();
      } else {
        const json = await res.json();
        toast({
          title: 'Save Failed',
          description: json.error?.message || 'Could not save address details.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to process address request.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Set Default Address
  const handleSetDefault = async (addressId: string, addressLabel: string) => {
    try {
      const res = await fetch(`/api/users/addresses/${addressId}/default`, {
        method: 'PATCH',
      });

      if (res.ok) {
        toast({
          title: 'Default Address Updated',
          description: `"${addressLabel}" is now your default delivery address.`,
        });
        loadAddresses();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update default address.',
        variant: 'destructive',
      });
    }
  };

  // Delete Address
  const handleDeleteAddress = async (
    addressId: string,
    addressLabel: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${addressLabel}"?`)) return;

    try {
      const res = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Address Removed',
          description: `"${addressLabel}" has been deleted from your address book.`,
        });
        loadAddresses();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete address.',
        variant: 'destructive',
      });
    }
  };

  // Copy full address text
  const handleCopyAddress = (addr: any) => {
    const formatted = `${addr.fullName}\n${addr.phone}\n${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}${addr.landmark ? ' (Near: ' + addr.landmark + ')' : ''}\n${addr.city}, ${addr.province} ${addr.postalCode || ''}, Pakistan`;
    navigator.clipboard.writeText(formatted);
    toast({
      title: 'Address Copied',
      description: 'Full delivery address copied to clipboard.',
    });
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <MapPin size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Address Book
              </h1>
              {addresses.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {addresses.length}{' '}
                  {addresses.length === 1 ? 'saved' : 'saved'}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Manage your delivery and doorstep fabric pickup locations across
            Pakistan for seamless order fulfillment.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 sm:px-6 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer shrink-0 flex items-center justify-center"
        >
          <Plus size={16} className="mr-1.5 shrink-0" /> Add New Address
        </Button>
      </div>

      {/* ── Nationwide Delivery Logistics Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              TCS & Leopards Courier
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Nationwide door-to-door transit
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Navigation size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              Doorstep Fabric Pickup
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Free rider pickup from saved address
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs sm:col-span-1 col-span-1">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              100% Insured Delivery
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Safe garment handling guarantee
            </p>
          </div>
        </div>
      </div>

      {/* ── Saved Addresses Grid ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Loading your address book...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <MapPin size={32} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-extrabold text-gray-900">
              No Saved Addresses Yet
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add your home, office, or boutique address to enable instant
              doorstep fabric pickup and TCS tracked delivery on every bespoke
              tailoring order.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {addresses.map((addr) => {
            const isAddrDefault = addr.isDefault;
            const TypeIcon =
              addr.label?.toLowerCase() === 'office'
                ? Briefcase
                : addr.label?.toLowerCase() === 'studio'
                  ? Building2
                  : addr.label?.toLowerCase() === 'other'
                    ? MapPin
                    : Home;

            return (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 sm:space-y-6 ${
                  isAddrDefault
                    ? 'border-[#7E153A]/40 ring-2 ring-[#7E153A]/10 bg-gradient-to-b from-white to-red-50/20'
                    : 'border-gray-100'
                }`}
              >
                {/* Header & Badges */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0 border border-red-100/50">
                        <TypeIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-gray-900 truncate">
                          {addr.label || 'Home'}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                          {addr.city}, {addr.province}
                        </span>
                      </div>
                    </div>

                    {isAddrDefault && (
                      <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-200/60 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Star size={10} className="fill-[#7E153A]" /> Default
                      </span>
                    )}
                  </div>

                  {/* Recipient Info Pill */}
                  <div className="space-y-1 bg-gray-50/80 p-3 rounded-xl sm:rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 min-w-0">
                      <User size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{addr.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <a
                        href={`tel:${addr.phone}`}
                        className="hover:text-[#7E153A] hover:underline transition-colors truncate"
                      >
                        {addr.phone}
                      </a>
                    </div>
                  </div>

                  {/* Physical Address Text */}
                  <div className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900 break-words">
                      {addr.addressLine1}
                    </p>
                    {addr.addressLine2 && (
                      <p className="text-gray-600 break-words">
                        {addr.addressLine2}
                      </p>
                    )}
                    {addr.landmark && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 p-2 rounded-xl break-words">
                        <span className="font-bold">Landmark:</span>{' '}
                        {addr.landmark}
                      </p>
                    )}
                    <p className="text-gray-500 font-medium pt-0.5">
                      {addr.city}, {addr.province}{' '}
                      {addr.postalCode ? `· ${addr.postalCode}` : ''}
                    </p>
                  </div>

                  {/* TCS Courier Eligibility */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl">
                    <Truck size={13} className="shrink-0" />
                    <span className="truncate">
                      TCS Direct Doorstep Coverage
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    {!isAddrDefault ? (
                      <Button
                        onClick={() => handleSetDefault(addr.id, addr.label)}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-semibold text-gray-600 hover:text-[#7E153A] hover:bg-red-50 cursor-pointer rounded-lg px-2"
                      >
                        <Star
                          size={13}
                          className="mr-1 text-amber-500 shrink-0"
                        />{' '}
                        Set as Default
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 pl-1">
                        <Check size={12} className="text-emerald-500" /> Primary
                        Address
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleCopyAddress(addr)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-[#7E153A] hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Copy Address"
                    >
                      <Copy size={13} />
                    </Button>

                    <Button
                      onClick={() => handleOpenEdit(addr)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-[#7E153A] hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Edit address"
                    >
                      <Edit2 size={13} />
                    </Button>

                    <Button
                      onClick={() => handleDeleteAddress(addr.id, addr.label)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Address Modal (Create / Edit) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  {editingAddress
                    ? 'Edit Delivery Address'
                    : 'Add New Delivery Address'}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Enter complete address details for nationwide courier
                  delivery.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form
              id="addressForm"
              onSubmit={handleSaveAddress}
              className="flex-1 overflow-y-auto px-1 py-1 pr-2 space-y-4 sm:space-y-5"
            >
              {/* Address Label Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Address Type / Label
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ADDRESS_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected =
                      label.toLowerCase() === type.key.toLowerCase();
                    return (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setLabel(type.key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 border-[#7E153A] text-[#7E153A] ring-1 ring-[#7E153A]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Recipient Full Name{' '}
                    <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Fatima Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Contact Phone Number{' '}
                    <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. 0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200 font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-400">
                    Rider will contact before delivery / pickup
                  </p>
                </div>
              </div>

              {/* Street Address Line 1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Street Address / House / Flat No.{' '}
                  <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. House # 14-B, Street 5, Sector F-8/2"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200"
                  required
                />
              </div>

              {/* Street Address Line 2 & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Apartment / Suite / Floor (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Apartment 302, 3rd Floor"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Nearby Landmark / Instructions (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Opposite Al-Fateh Mall, White Gate"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200"
                  />
                </div>
              </div>

              {/* City, Province & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    City <span className="text-[#7E153A]">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full h-11 sm:h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A]"
                    required
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Province / Region <span className="text-[#7E153A]">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-11 sm:h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A]"
                    required
                  >
                    {PAKISTAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Postal Code (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 54000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-11 sm:h-10 text-xs bg-white rounded-xl border-gray-200 font-mono"
                  />
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-start sm:items-center gap-3 bg-gray-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-[#7E153A] focus:ring-[#7E153A] border-gray-300 cursor-pointer shrink-0"
                />
                <label
                  htmlFor="defaultAddressCheckbox"
                  className="text-xs font-semibold text-gray-700 cursor-pointer leading-tight"
                >
                  Set this as my primary shipping and fabric pickup address
                </label>
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="addressForm"
                disabled={saving}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving Address...
                  </>
                ) : (
                  'Save Address'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
