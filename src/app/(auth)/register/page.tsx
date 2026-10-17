'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { Scissors, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const formatPhone = (p: string) => {
    let formatted = p.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = formatted.substring(1);
    return `+92${formatted}`;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError && val.length === 10) setPhoneError('');
    if (serverError) setServerError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setServerError('');

    let hasError = false;

    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      hasError = true;
    }

    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      hasError = true;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      hasError = true;
    }

    if (hasError) {
      toast({
        title: 'Missing Fields',
        description: 'Please correct the highlighted fields to continue.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhone(phone);

    try {
      // 1. Check if email already exists in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        const msg =
          'An account with this email address already exists. Please log in.';
        setServerError(msg);
        toast({
          title: 'Email Already Registered',
          description: msg,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 2. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: formattedPhone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 3. Create user profile in public database tables
        await saveProfile(data.user.id, formattedPhone);
      } else {
        toast({
          title: 'Account Created',
          description:
            'Please check your email inbox to confirm your registration.',
        });
      }
    } catch (err: any) {
      const errMsg =
        err.message || 'Failed to create account. Please try again.';
      if (
        errMsg.toLowerCase().includes('already registered') ||
        errMsg.toLowerCase().includes('user_already_exists')
      ) {
        const dupMsg =
          'An account with this email address already exists. Please log in.';
        setServerError(dupMsg);
        toast({
          title: 'Email Already Registered',
          description: dupMsg,
          variant: 'destructive',
        });
      } else {
        setServerError(errMsg);
        toast({
          title: 'Registration Error',
          description: errMsg,
          variant: 'destructive',
        });
      }
      setLoading(false);
    }
  };

  const saveProfile = async (userId: string, userPhone: string) => {
    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || fullName.trim();
      const lastName = nameParts.slice(1).join(' ') || null;

      // Upsert public.users record
      const now = new Date().toISOString();
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        phone: userPhone,
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
        updated_at: now,
        created_at: now,
      });

      if (userError) throw userError;

      toast({
        title: 'Account Created 🎉',
        description: 'Welcome to TailorLink.pk!',
      });
      router.push('/dashboard');
    } catch (err: any) {
      const profileMsg = err.message || 'Failed to save profile details.';
      setServerError(profileMsg);
      toast({
        title: 'Profile Error',
        description: profileMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 font-sans sm:px-6 isolate">
      {/* ── Unique Atelier Tailoring Graphics Background ── */}
      <AuthBackground />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* ── TOP LOGO (Centered above card) ── */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 transition-transform duration-200 hover:scale-105"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7E153A] to-[#A31D4C] text-white shadow-md shadow-[#7E153A]/25">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              TailorLink<span className="text-[#7E153A]">.pk</span>
            </span>
          </Link>
        </div>

        {/* ── CENTERED CARD (Matching LoginPage exact visual rhythm) ── */}
        <div className="relative w-full max-w-[480px] overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_12px_45px_rgba(0,0,0,0.06)] sm:p-9">
          {/* Top vibrant brand accent bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7E153A] via-[#9B1B4A] to-[#7E153A]" />

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Join TailorLink to order custom-stitched suits online
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span className="leading-relaxed">{serverError}</span>
            </div>
          )}

          {/* ── REGISTRATION FORM ── */}
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full name <span className="text-[#7E153A]">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                    if (serverError) setServerError('');
                  }}
                  placeholder="e.g. Ali Ahmed"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#7E153A] focus:outline-none focus:ring-4 focus:ring-[#7E153A]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base"
                />
              </div>
              {nameError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address <span className="text-[#7E153A]">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                    if (serverError) setServerError('');
                  }}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#7E153A] focus:outline-none focus:ring-4 focus:ring-[#7E153A]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base"
                />
              </div>
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone number <span className="text-[#7E153A]">*</span>
              </label>
              <div className="mt-1.5">
                <PhoneInput
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  error={phoneError}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-[#7E153A]">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (serverError) setServerError('');
                  }}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#7E153A] focus:outline-none focus:ring-4 focus:ring-[#7E153A]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7E153A] to-[#9B1B4A] text-sm font-semibold text-white shadow-md shadow-[#7E153A]/20 transition-all duration-200 hover:brightness-105 hover:shadow-lg hover:shadow-[#7E153A]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Already have an account */}
          <p className="mt-5 text-center text-xs text-gray-500 sm:text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#7E153A] transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Footer disclaimer */}
          <p className="mt-5 text-center text-xs text-gray-400">
            By creating an account you agree to our{' '}
            <Link
              href="/help"
              className="font-medium text-gray-600 transition-colors hover:underline"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/help"
              className="font-medium text-gray-600 transition-colors hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
