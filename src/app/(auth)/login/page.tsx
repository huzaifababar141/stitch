'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Scissors, ShieldCheck, Truck, Ruler, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { OTPInput } from '@/components/auth/OTPInput';
import { CountdownTimer } from '@/components/auth/CountdownTimer';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();

  const formatPhone = (p: string) => {
    let formatted = p.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = formatted.substring(1);
    return `+92${formatted}`;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError && val.length === 10) {
      setPhoneError('');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    setPhoneError('');
    setLoading(true);
    const formattedPhone = formatPhone(phone);

    try {
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
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

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      if (!profile) {
        router.push('/register');
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });

      const role = profile.role;
      if (role === 'admin' || role === 'super_admin')
        router.push('/admin/dashboard');
      else if (role === 'tailor') router.push('/tailor/dashboard');
      else if (role === 'qc_inspector') router.push('/qc/dashboard');
      else if (role === 'delivery_agent') router.push('/delivery/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Verification Error',
        description: err.message || 'Invalid OTP code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="relative flex w-full flex-col lg:w-[55%] xl:w-[52%]">
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
        <main className="flex flex-1 flex-col justify-center px-8 lg:px-16 xl:px-20 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-sm">
            {/* Page heading */}
            <div className="mb-8">
              <h2 className="text-[28px] font-extrabold tracking-tight text-gray-900">
                Welcome Back
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Sign in to manage your orders and custom measurements.
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    error={phoneError}
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
                      <span>Sending code...</span>
                    </>
                  ) : (
                    'Login with OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-semibold text-gray-700">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-[12px] font-medium text-[#7E153A] hover:underline"
                    >
                      Change Number
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify & Sign In'
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
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-[#7E153A] underline-offset-4 transition-colors hover:text-[#6b1131] hover:underline"
              >
                Create Account
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
