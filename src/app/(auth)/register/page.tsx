'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PhoneInput } from '@/components/auth/PhoneInput';
import {
  Scissors,
  ShieldCheck,
  Truck,
  Ruler,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react';

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
  const [phoneError, setPhoneError] = useState('');

  const formatPhone = (p: string) => {
    let formatted = p.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = formatted.substring(1);
    return `+92${formatted}`;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError && val.length === 10) setPhoneError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setPhoneError('');
    const formattedPhone = formatPhone(phone);

    try {
      // 1. Check if email already exists in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        toast({
          title: 'Email Already Registered',
          description:
            'An account with this email address already exists. Please log in.',
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
            full_name: fullName,
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
      if (
        err.message?.toLowerCase().includes('already registered') ||
        err.message?.toLowerCase().includes('user_already_exists')
      ) {
        toast({
          title: 'Email Already Registered',
          description:
            'An account with this email address already exists. Please log in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Error',
          description:
            err.message || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
      }
      setLoading(false);
    }
  };

  const saveProfile = async (userId: string, userPhone: string) => {
    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || fullName;
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
      toast({
        title: 'Profile Error',
        description: err.message || 'Failed to save profile details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-white font-sans lg:h-screen lg:overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="relative flex w-full flex-col lg:w-[55%] xl:w-[52%] lg:h-screen lg:overflow-y-auto no-scrollbar">
        {/* Subtle right border */}
        <div className="absolute inset-y-0 right-0 w-px bg-gray-100" />

        {/* Header */}
        <header className="flex-none px-8 pt-8 pb-4 lg:px-12 lg:pt-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7E153A] text-white shadow-lg shadow-[#7E153A]/30 transition-transform duration-200 group-hover:scale-105">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[17px] font-bold leading-none tracking-tight text-gray-900">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                You Link It, We Stitch It
              </p>
            </div>
          </Link>
        </header>

        {/* Form area */}
        <main className="flex flex-1 flex-col justify-center px-8 py-6 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-sm">
            {/* Page heading */}
            <div className="mb-7">
              <h2 className="text-[28px] font-extrabold tracking-tight text-gray-900">
                Create an Account
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Join TailorLink to order custom-stitched suits online.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Full Name <span className="text-[#7E153A]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    disabled={loading}
                    className="h-12 pl-10 border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Email Address <span className="text-[#7E153A]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali@example.com"
                    disabled={loading}
                    className="h-12 pl-10 border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Phone Number <span className="text-[#7E153A]">*</span>
                </label>
                <PhoneInput
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  error={phoneError}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Password <span className="text-[#7E153A]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    disabled={loading}
                    className="h-12 pl-10 pr-10 border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7E153A] text-[15px] font-semibold text-white shadow-md shadow-[#7E153A]/25 transition-all duration-150 hover:bg-[#6b1131] hover:shadow-lg hover:shadow-[#7E153A]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  or
                </span>
              </div>
            </div>

            <p className="text-center text-[13px] text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-[#7E153A] underline-offset-4 transition-colors hover:text-[#6b1131] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </main>

        {/* Trust badges footer */}
        <footer className="flex-none border-t border-gray-100 bg-gray-50/80 px-8 py-4 lg:px-12">
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
            {[
              { Icon: ShieldCheck, label: 'Secure Payments' },
              { Icon: Truck, label: '7-Day Delivery' },
              { Icon: Scissors, label: 'Master Stitching' },
              { Icon: Ruler, label: 'Custom Fit' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#7E153A]/10 text-[#7E153A]">
                  <Icon size={13} />
                </div>
                <span className="text-[11px] font-semibold text-gray-600">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[48%] h-full items-center justify-center bg-[#1a0d11] overflow-hidden">
        <Image
          src="/login_bg.jpg"
          alt=""
          fill
          aria-hidden
          sizes="48vw"
          className="object-cover object-center opacity-20 blur-xl scale-110"
          priority
        />
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <Image
            src="/login_bg.jpg"
            alt="Embroidered unstitched suit on a mannequin in a boutique"
            fill
            sizes="48vw"
            className="object-contain object-center"
            priority
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1a0d11] to-transparent z-20" />
      </div>
    </div>
  );
}
