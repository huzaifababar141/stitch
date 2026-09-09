'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  User,
  Phone,
  Mail,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  LogOut,
  MessageSquare,
  Lock,
  Sparkles,
  Check,
  Smartphone,
  Calendar,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<string>('female');
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Notification toggles
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const json = await res.json();
        const profile = json.data || json;
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setPhone(profile.phone || user.phone || '');
          setEmail(profile.email || user.email || '');
          if (profile.gender) setGender(profile.gender.toLowerCase());

          const meta = profile.metadata || {};
          if (meta.notifications) {
            setWhatsappNotifications(meta.notifications.whatsapp !== false);
            setSmsNotifications(meta.notifications.sms !== false);
            setMarketingNotifications(meta.notifications.marketing !== false);
          }
        }
      } else {
        // Fallback to auth session metadata
        const meta = user.user_metadata || {};
        setFirstName(meta.first_name || meta.name || '');
        setLastName(meta.last_name || '');
        setPhone(user.phone || meta.phone || '');
        setEmail(user.email || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast({
        title: 'First Name Required',
        description: 'Please enter your first name.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          email: email.trim() || undefined,
          gender:
            gender === 'female'
              ? 'female'
              : gender === 'male'
                ? 'male'
                : 'other',
          metadata: {
            notifications: {
              whatsapp: whatsappNotifications,
              sms: smsNotifications,
              marketing: marketingNotifications,
            },
          },
        }),
      });

      if (res.ok) {
        toast({
          title: 'Profile Updated 🎉',
          description:
            'Your personal information and notification preferences have been saved.',
        });
      } else {
        const json = await res.json();
        toast({
          title: 'Update Error',
          description: json.error?.message || 'Could not save profile changes.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error Saving Settings',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const f = firstName ? firstName[0] : 'T';
    const l = lastName ? lastName[0] : '';
    return `${f}${l}`.toUpperCase();
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-xs font-semibold text-gray-600">
          Loading your settings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <Settings size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Account Settings
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={11} /> Verified Member
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Manage your personal profile, phone verification, and tailor
            milestone WhatsApp notification preferences.
          </p>
        </div>

        <Button
          onClick={() => signOut()}
          variant="outline"
          className="w-full sm:w-auto h-11 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 rounded-xl cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
        >
          <LogOut size={14} /> Sign Out
        </Button>
      </div>

      {/* ── Customer Identity Preview Card ── */}
      <div className="bg-gradient-to-r from-red-50/70 via-white to-red-50/40 rounded-2xl sm:rounded-3xl border border-red-100/80 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7E153A] to-[#9e1b4a] text-white font-black text-xl flex items-center justify-center shadow-md shadow-[#7E153A]/20 shrink-0">
            {getInitials()}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base text-gray-900 truncate">
              {firstName || 'Valued'} {lastName || 'Customer'}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
              {phone || user?.phone || 'Phone verified'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <span className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs">
            Pakistan (PKT)
          </span>
          <span className="text-[11px] font-bold text-[#7E153A] bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl">
            Direct TailorLink VIP
          </span>
        </div>
      </div>

      {/* ── Settings Form ── */}
      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <User size={18} className="text-[#7E153A]" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                First Name <span className="text-[#7E153A]">*</span>
              </label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. Fatima"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. Ali"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">
                  Primary Mobile Number
                </label>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <Check size={11} /> OTP Verified
                </span>
              </div>
              <div className="relative">
                <Input
                  value={phone}
                  readOnly
                  className="h-11 sm:h-10 bg-gray-100/90 border-gray-200 text-xs rounded-xl text-gray-600 font-mono pr-8"
                />
                <Lock
                  size={14}
                  className="text-gray-400 absolute right-3 top-3"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Contact support to update your registered Pakistani mobile
                number.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Email Address (Optional)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. fatima@example.com"
              />
              <p className="text-[10px] text-gray-400">
                Used for PDF invoice receipts and order backup confirmations.
              </p>
            </div>
          </div>

          {/* Gender Preference Chips */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-gray-700 block">
              Garment Sizing Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'female', label: "Women's Wear" },
                { key: 'male', label: "Men's Wear" },
                { key: 'other', label: 'Bespoke Unisex' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGender(item.key)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    gender === item.key
                      ? 'bg-red-50 border-[#7E153A] text-[#7E153A] ring-1 ring-[#7E153A]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Notification Preferences */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell size={18} className="text-[#7E153A]" /> Live Tailoring
            Notification Preferences
          </h2>

          <div className="space-y-3">
            {/* WhatsApp Alerts */}
            <div className="flex items-start sm:items-center justify-between p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={13} />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    WhatsApp Order Milestone Alerts
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 pl-8 leading-relaxed">
                  Instant WhatsApp updates when master tailor starts cutting,
                  stitching finishes, QC inspection passes, and rider is
                  dispatched.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#7E153A] cursor-pointer shrink-0 mt-1 sm:mt-0"
              />
            </div>

            {/* SMS Alerts */}
            <div className="flex items-start sm:items-center justify-between p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Smartphone size={13} />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    SMS Courier Delivery Tracking
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 pl-8 leading-relaxed">
                  Receive SMS when TCS / Leopards courier rider is out for
                  delivery with parcel tracking code.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#7E153A] cursor-pointer shrink-0 mt-1 sm:mt-0"
              />
            </div>

            {/* Festive & Eid Alerts */}
            <div className="flex items-start sm:items-center justify-between p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    Festive & Eid Tailoring Priority Slots
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 pl-8 leading-relaxed">
                  Early bird notifications when Ramadan and Eid stitching
                  booking windows open.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingNotifications}
                onChange={(e) => setMarketingNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#7E153A] cursor-pointer shrink-0 mt-1 sm:mt-0"
              />
            </div>
          </div>
        </div>

        {/* Security & Privacy Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900">
              256-Bit Encrypted Data Privacy
            </h4>
            <p className="text-[11px] text-gray-500">
              Your measurement profiles and delivery addresses are encrypted and
              strictly protected.
            </p>
          </div>
        </div>

        {/* Save Button Row */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto h-12 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-8 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" /> Saving
                Changes...
              </>
            ) : (
              'Save Profile Settings'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
