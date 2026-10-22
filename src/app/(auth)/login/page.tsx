'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { LogoNeedle } from '@/components/illustrations/LogoNeedle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setServerError('');

    let hasError = false;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    }

    if (hasError) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both your email address and password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Fetch user profile role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      toast({
        title: 'Welcome Back',
        description: 'Login successful. Redirecting to your dashboard...',
      });

      const role = profile?.role || 'customer';
      if (role === 'admin' || role === 'super_admin')
        router.push('/admin/dashboard');
      else if (role === 'tailor') router.push('/tailor/dashboard');
      else if (role === 'qc_inspector') router.push('/qc/dashboard');
      else if (role === 'delivery_agent') router.push('/delivery/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      const errMsg = err.message || 'Invalid email address or password.';
      if (errMsg.toLowerCase().includes('email not confirmed')) {
        const notConfirmedMsg =
          'Please check your email inbox for the verification link, or disable "Confirm email" in your Supabase Auth settings to log in immediately.';
        setServerError(notConfirmedMsg);
        toast({
          title: 'Email Not Confirmed',
          description: notConfirmedMsg,
          variant: 'destructive',
        });
      } else {
        setServerError(errMsg);
        toast({
          title: 'Login Error',
          description: errMsg,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen min-h-[100dvh] w-full flex-col items-center p-4 py-8 sm:py-12 font-sans isolate">
      {/* ── Unique Atelier Tailoring Graphics Background ── */}
      <AuthBackground />

      <div className="relative z-10 w-full flex flex-col items-center my-auto">
        {/* ── TOP LOGO (Centered above card) ── */}
        <div className="w-full flex justify-center items-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="group flex items-center justify-center gap-3 transition-transform duration-200 hover:scale-105"
          >
            <div className="text-[#7E153A] shrink-0 flex items-center justify-center">
              <LogoNeedle className="h-[36px] w-[36px]" />
            </div>
            <span className="text-[26px] font-bold tracking-tight text-gray-900 sm:text-3xl leading-none">
              TailorLink<span className="text-[#7E153A]">.pk</span>
            </span>
          </Link>
        </div>

        {/* ── CARD CONTAINER (with subtle radial overlay behind) ── */}
        <div className="relative mx-auto w-[calc(100%-32px)] sm:w-full max-w-[560px]">
          {/* Subtle radial white overlay behind the card (rgba(255,255,255,0.35), blur) so background doesn't compete */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 sm:-inset-14 -z-10 rounded-[48px] blur-2xl"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.35) 60%, rgba(255, 255, 255, 0) 85%)',
            }}
          />

          {/* ── CENTERED CARD ── */}
          <div className="relative w-full overflow-clip rounded-3xl border border-gray-100 bg-white p-6 sm:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.06)] isolate">
            {/* Top vibrant brand accent bar following card's rounded corners */}
            <div className="absolute inset-x-0 top-0 h-1 sm:h-1.5 rounded-t-3xl bg-gradient-to-r from-[#7E153A] via-[#9B1B4A] to-[#7E153A]" />

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Sign in to continue your tailoring journey
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span className="leading-relaxed">{serverError}</span>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {/* Email address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
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
                    className="h-12 min-h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[16px] text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#7E153A] focus:outline-none focus:ring-4 focus:ring-[#7E153A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: 'Password Reset',
                        description:
                          'Please check your email inbox for password recovery instructions or contact support.',
                      });
                    }}
                    className="text-xs font-medium text-[#7E153A] transition-colors hover:underline sm:text-sm"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (serverError) setServerError('');
                    }}
                    placeholder={
                      showPassword ? 'Enter your password' : '••••••••'
                    }
                    disabled={loading}
                    style={
                      !showPassword
                        ? {
                            fontSize: '20px',
                            letterSpacing: '0.2em',
                            lineHeight: '1',
                          }
                        : {
                            fontSize: '16px',
                            letterSpacing: 'normal',
                            lineHeight: 'normal',
                          }
                    }
                    className={`password-input h-12 min-h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal placeholder:text-[14px] transition-all focus:border-[#7E153A] focus:outline-none focus:ring-4 focus:ring-[#7E153A]/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                      showPassword
                        ? '!text-[16px] !tracking-normal'
                        : '!text-[20px] ![letter-spacing:0.2em] !leading-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/60 transition-colors focus:outline-none cursor-pointer"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7E153A] to-[#9B1B4A] text-[16px] font-semibold text-white shadow-md shadow-[#7E153A]/20 transition-all duration-200 hover:brightness-105 hover:shadow-lg hover:shadow-[#7E153A]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Don't have an account */}
            <p className="mt-5 text-center text-xs text-gray-500 sm:text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#7E153A] transition-colors hover:underline"
              >
                Sign up free
              </Link>
            </p>

            {/* Footer disclaimer */}
            <p className="mt-5 text-center text-xs text-[#6B6B7B] text-balance leading-relaxed">
              By signing in you agree to our{' '}
              <Link
                href="/help"
                className="font-medium text-[#6B6B7B] underline underline-offset-2 transition-colors hover:text-gray-900"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/help"
                className="font-medium text-[#6B6B7B] underline underline-offset-2 transition-colors hover:text-gray-900 whitespace-nowrap"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
