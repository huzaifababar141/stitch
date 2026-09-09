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
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Notification toggles
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

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

          const meta = profile.metadata || {};
          if (meta.notifications) {
            setWhatsappNotifications(meta.notifications.whatsapp !== false);
            setSmsNotifications(meta.notifications.sms !== false);
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
    setSaving(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          email: email.trim() || undefined,
          metadata: {
            notifications: {
              whatsapp: whatsappNotifications,
              sms: smsNotifications,
            },
          },
        }),
      });

      if (res.ok) {
        toast({
          title: 'Profile Updated 🎉',
          description:
            'Your personal preferences and notification settings have been saved.',
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

  if (authLoading || loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-xs font-semibold text-gray-600">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <Settings size={14} /> Profile & Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal profile, phone verification, and notification
            preferences.
          </p>
        </div>

        <Button
          onClick={() => signOut()}
          variant="outline"
          className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 rounded-xl cursor-pointer"
        >
          <LogOut size={14} className="mr-1.5" /> Sign Out
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-[#7E153A]" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                First Name *
              </label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. Sarah"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. Khan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Phone Number (Primary)
              </label>
              <Input
                value={phone}
                readOnly
                className="h-11 bg-gray-100 border-gray-200 text-xs rounded-xl text-gray-500 font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Linked with OTP login
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                placeholder="e.g. sarah@example.com"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-[#7E153A]" /> Live Notification
            Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  WhatsApp Order Milestone Alerts
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Receive live updates when cutting starts, QC passes, and TCS
                  is dispatched.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#7E153A] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  SMS Courier Delivery Alerts
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Receive SMS when driver is out for delivery with your parcel
                  tracking code.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#7E153A] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="h-12 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-8 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin mr-1.5" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
