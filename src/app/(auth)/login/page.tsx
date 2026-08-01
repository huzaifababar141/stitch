'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { Scissors, ShieldCheck, Truck, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { OTPInput } from '@/components/auth/OTPInput'
import { CountdownTimer } from '@/components/auth/CountdownTimer'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useAuth()

  const formatPhone = (p: string) => {
    let formatted = p.replace(/\D/g, '')
    if (formatted.startsWith('0')) formatted = formatted.substring(1)
    return `+92${formatted}`
  }

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (phone.length < 10) {
      toast({ title: 'Invalid Phone', description: 'Please enter a valid 10-digit number', variant: 'destructive' })
      return
    }

    setLoading(true)
    const formattedPhone = formatPhone(phone)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) throw error

      setStep('otp')
      toast({ title: 'OTP Sent', description: 'Please check your phone.' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send OTP', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit code', variant: 'destructive' })
      return
    }

    setLoading(true)
    const formattedPhone = formatPhone(phone)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      })

      if (error) throw error
      
      // Success - user is authenticated. 
      // Need to check if user has a profile in our public.users table.
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single()

      if (!profile) {
        // New user, redirect to profile completion
        router.push('/register')
        return
      }

      toast({ title: 'Login Successful', description: 'Redirecting...' })
      
      const role = profile.role
      if (role === 'admin' || role === 'super_admin') router.push('/admin/dashboard')
      else if (role === 'tailor') router.push('/tailor/dashboard')
      else if (role === 'qc_inspector') router.push('/qc/dashboard')
      else if (role === 'delivery_agent') router.push('/delivery/dashboard')
      else router.push('/dashboard')

    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Invalid OTP', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-between relative">
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-2">
            <div className="text-[#7E153A]">
              <svg width="32" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M8 6h8" />
                <path d="M12 22l-4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">TailorLink<span className="text-[#7E153A]">.pk</span></h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">You Link it, We Stitch it</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 xl:px-32 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back 👋</h2>
            <p className="text-gray-500 text-sm">Login to continue to your account</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white h-12 rounded-md font-medium text-base transition-colors"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Login with OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter OTP Code</label>
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
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
                className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white h-12 rounded-md font-medium text-base transition-colors"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </form>
          )}

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#FDFDFD] text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-[#7E153A] hover:underline font-medium">Sign up</a>
          </div>
        </div>

        <div className="bg-[#F8F8F8] p-6 lg:p-8 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 max-w-md mx-auto text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-gray-400" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-gray-400" />
              <span>7 Days Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Scissors size={18} className="text-gray-400" />
              <span>Premium Stitching</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-gray-400" />
              <span>Custom Fit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <Image 
          src="/login_bg.jpg" 
          alt="Premium Unstitched Suit on Mannequin" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>
    </div>
  )
}
