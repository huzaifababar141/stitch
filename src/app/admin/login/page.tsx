'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Scissors,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { supabase, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
  const errorParam = searchParams.get('error');

  const displayedError =
    errorMessage ||
    (errorParam === 'forbidden'
      ? 'Access Denied: The logged-in account does not possess administrator privileges.'
      : '');

  // If already logged in as admin, auto-redirect to dashboard
  useEffect(() => {
    async function checkExistingAdmin() {
      if (user && !authLoading) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          router.push(redirectUrl);
        }
      }
    }
    checkExistingAdmin();
  }, [user, authLoading, redirectUrl, router, supabase]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user returned.');
      }

      // 2. Verify admin role in database
      const { data: profile } = await supabase
        .from('users')
        .select('role, first_name, last_name')
        .eq('id', data.user.id)
        .single();

      const userRole = profile?.role || data.user.user_metadata?.role;

      if (userRole !== 'admin' && userRole !== 'super_admin') {
        // Not authorized: Log them out immediately
        await supabase.auth.signOut();
        setErrorMessage(
          'Access Denied: This account is registered as a customer and does not have administrator clearance.'
        );
        toast({
          title: 'Access Restricted',
          description:
            'Administrator credentials are required to enter this portal.',
          variant: 'destructive',
        });
        return;
      }

      // 3. Success: Redirect to Admin Dashboard
      toast({
        title: 'Authentication Successful',
        description: 'Welcome to the TailorLink Admin Command Center.',
      });

      router.push(redirectUrl);
    } catch (err: any) {
      const msg =
        err.message || 'Invalid administrator email address or password.';
      setErrorMessage(msg);
      toast({
        title: 'Login Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111315] flex flex-col justify-between font-sans text-gray-100 selection:bg-[#7E153A] selection:text-white">
      {/* Top Bar */}
      <header className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7E153A] flex items-center justify-center text-white shadow-lg shadow-[#7E153A]/30">
            <Scissors size={20} />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">
              TailorLink<span className="text-[#A01B4C]">.pk</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">
              Admin Gateway
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
        >
          Customer Portal <ArrowRight size={14} />
        </Link>
      </header>

      {/* Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#181B1E] rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-[#A01B4C] mb-2">
              <Shield size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Command Center
            </h1>
            <p className="text-xs text-gray-400">
              Authorized personnel only. Enter your administrator credentials.
            </p>
          </div>

          {/* Error Alert */}
          {displayedError && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
              <p className="leading-relaxed">{displayedError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">
                Administrator Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <Input
                  type="email"
                  placeholder="admin@stitch.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A] rounded-xl"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">
                Security Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A] rounded-xl font-mono"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#7E153A]/30 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Verifying Credentials...
                </>
              ) : (
                'Access Admin Command'
              )}
            </Button>
          </form>

          {/* Footer Security Notice */}
          <div className="pt-4 border-t border-white/5 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            256-Bit Encrypted Secure Session
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="p-6 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} TailorLink Operations Portal. All
        rights reserved.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111315] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#7E153A]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
