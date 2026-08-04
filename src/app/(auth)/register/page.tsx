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
import { OTPInput } from '@/components/auth/OTPInput';
import { CountdownTimer } from '@/components/auth/CountdownTimer';
import { Scissors, ShieldCheck, Truck, Ruler, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setPhoneError('');

    try {
      if (user) {
        await saveProfile(user.id, user.phone || formatPhone(phone));
        return;
      }

      const formattedPhone = formatPhone(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;

      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the 6-digit code.',
      });
    } catch (err: any) {
      toast({
        title: 'Auth Error',
        description: err.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhone(phone);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      if (data.user) {
        await saveProfile(data.user.id, formattedPhone);
      }
    } catch (err: any) {
      toast({
        title: 'Verification Error',
        description: err.message || 'Invalid OTP code',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const saveProfile = async (userId: string, userPhone: string) => {
    try {
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        phone_number: userPhone,
        email: email || null,
        role: 'customer',
      });
      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('customer_profiles')
        .upsert({
          user_id: userId,
          full_name: fullName,
        });
      if (profileError) throw profileError;

      toast({
        title: 'Account Created 🎉',
        description: 'Welcome to TailorLink.pk!',
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save profile',
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

            {step === 'details' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Full Name <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    disabled={loading}
                    className="h-12 border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20"
                  />
                </div>

                {/* Phone Number */}
                {!user && (
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
                )}

                {/* Email (optional) */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Email Address{' '}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali@example.com"
                    disabled={loading}
                    className="h-12 border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7E153A] text-[15px] font-semibold text-white shadow-md shadow-[#7E153A]/25 transition-all duration-150 hover:bg-[#6b1131] hover:shadow-lg hover:shadow-[#7E153A]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : user ? (
                    'Complete Profile'
                  ) : (
                    'Continue with OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-semibold text-gray-700">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-[12px] font-medium text-[#7E153A] hover:underline"
                    >
                      Edit Details
                    </button>
                  </div>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end">
                  <CountdownTimer
                    initialSeconds={60}
                    onResend={handleSendOtp}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7E153A] text-[15px] font-semibold text-white shadow-md shadow-[#7E153A]/25 transition-all duration-150 hover:bg-[#6b1131] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </Button>
              </form>
            )}

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
