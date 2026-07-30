'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const formatPhone = (p: string) => {
    let formattedPhone = p
    if (!formattedPhone.startsWith('+92')) {
      formattedPhone = '+92' + formattedPhone.replace(/^0/, '')
    }
    return formattedPhone
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhone(phone) })
      })
      const data = await res.json()
      
      if (data.success) {
        setStep('otp')
        setCountdown(60)
        toast({ title: 'OTP Sent', description: 'Please check your WhatsApp.' })
      } else {
        toast({ title: 'Error', description: data.error?.message || 'Failed to send OTP', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error occurred', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhone(phone), token: otp })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Verified', description: 'Please complete your profile.' })
        setStep('profile')
      } else {
        toast({ title: 'Error', description: data.error?.message || 'Invalid OTP', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error occurred', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // NOTE: We will build /api/users/profile in TASK-C08
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Registration Complete', description: 'Welcome to Stitch!' })
        router.push('/dashboard')
      } else {
        toast({ title: 'Error', description: data.error?.message || 'Failed to update profile', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error occurred', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Join Stitch today</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 border border-r-0 border-gray-300 bg-gray-100 rounded-l-md text-gray-500">
                    +92
                  </div>
                  <Input 
                    id="reg-phone" 
                    placeholder="3001234567" 
                    value={phone.replace('+92', '')}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-otp">Enter 6-digit OTP</Label>
                <Input 
                  id="reg-otp" 
                  placeholder="123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  onClick={handleSendOtp} 
                  disabled={countdown > 0 || loading}
                  type="button"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
              </div>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="Ali" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name (Optional)</Label>
                <Input 
                  id="lastName" 
                  placeholder="Khan" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>
              Login here
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
