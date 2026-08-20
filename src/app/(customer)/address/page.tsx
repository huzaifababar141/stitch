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

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Address Book
            </h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Manage your delivery and fabric collection destinations for quick
            doorstep service across Pakistan.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-6 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} className="mr-1.5" /> Add New Address
        </Button>
      </div>

      {/* ── Saved Addresses Grid ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Loading your address book...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <MapPin size={32} />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-extrabold text-gray-900">
              No Saved Addresses Found
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add your home or office address to enable instant doorstep fabric
              pickup and TCS tracked delivery on every tailoring order.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => {
            const isAddrDefault = addr.isDefault;
            const TypeIcon =
              addr.label?.toLowerCase() === 'office'
                ? Briefcase
                : addr.label?.toLowerCase() === 'studio'
                  ? Building2
                  : Home;

            return (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${
                  isAddrDefault
                    ? 'border-[#7E153A]/40 ring-2 ring-[#7E153A]/10'
                    : 'border-gray-100'
                }`}
              >
                {/* Header & Badges */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-700 flex items-center justify-center">
                        <TypeIcon size={16} className="text-[#7E153A]" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900">
                          {addr.label || 'Home'}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {addr.city}, {addr.province}
                        </span>
                      </div>
                    </div>

                    {isAddrDefault && (
                      <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wider flex items-center gap-1">
                        <Star size={10} className="fill-[#7E153A]" /> Default
                      </span>
                    )}
                  </div>

                  {/* Recipient Info */}
                  <div className="space-y-1 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <User size={13} className="text-gray-400 shrink-0" />
                      <span>{addr.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>

                  {/* Physical Address Text */}
                  <div className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900">
                      {addr.addressLine1}
                    </p>
                    {addr.addressLine2 && (
                      <p className="text-gray-600">{addr.addressLine2}</p>
                    )}
                    {addr.landmark && (
                      <p className="text-[11px] text-gray-500 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl">
                        <span className="font-bold text-amber-900">
                          Landmark:
                        </span>{' '}
                        {addr.landmark}
                      </p>
                    )}
                    <p className="text-gray-500 font-medium pt-1">
                      {addr.city}, {addr.province}{' '}
                      {addr.postalCode ? `· ${addr.postalCode}` : ''}
                    </p>
                  </div>

                  {/* TCS Courier Eligibility */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl">
                    <Truck size={13} />
                    <span>TCS Direct Doorstep Coverage</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                  <div>
                    {!isAddrDefault && (
                      <Button
                        onClick={() => handleSetDefault(addr.id, addr.label)}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-semibold text-gray-600 hover:text-[#7E153A] hover:bg-red-50 cursor-pointer rounded-lg px-2.5"
                      >
                        <Star size={13} className="mr-1 text-amber-500" /> Set
                        as Default
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleOpenEdit(addr)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-[#7E153A] hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Edit address"
                    >
                      <Edit2 size={14} />
                    </Button>

                    <Button
                      onClick={() => handleDeleteAddress(addr.id, addr.label)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-0.5">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingAddress
                    ? 'Edit Delivery Address'
                    : 'Add New Delivery Address'}
                </h2>
                <p className="text-xs text-gray-500">
                  Enter complete address details for nationwide Pakistani
                  courier delivery.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form
              id="addressForm"
              onSubmit={handleSaveAddress}
              className="flex-1 overflow-y-auto px-2 py-1 pr-3 space-y-5"
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
                        <Icon size={14} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="h-10 text-xs bg-white rounded-xl border-gray-200"
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
                    className="h-10 text-xs bg-white rounded-xl border-gray-200 font-mono"
                    required
                  />
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
                  className="h-10 text-xs bg-white rounded-xl border-gray-200"
                  required
                />
              </div>

              {/* Street Address Line 2 & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Apartment / Suite / Floor (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Apartment 302, 3rd Floor"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="h-10 text-xs bg-white rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Nearby Landmark / Instructions
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Opposite Al-Fateh Mall, White Gate"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="h-10 text-xs bg-white rounded-xl border-gray-200"
                  />
                </div>
              </div>

              {/* City, Province & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    City <span className="text-[#7E153A]">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A]"
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
                    className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A]"
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
                    className="h-10 text-xs bg-white rounded-xl border-gray-200 font-mono"
                  />
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2 pt-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7E153A] focus:ring-[#7E153A] border-gray-300 cursor-pointer"
                />
                <label
                  htmlFor="defaultAddressCheckbox"
                  className="text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Set this as my default shipping and fabric pickup address
                </label>
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="addressForm"
                disabled={saving}
                className="h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
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
