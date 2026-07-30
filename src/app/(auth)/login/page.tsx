'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let formattedPhone = phone
    if (!formattedPhone.startsWith('+92')) {
      formattedPhone = '+92' + formattedPhone.replace(/^0/, '')
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone })
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
    
    let formattedPhone = phone
    if (!formattedPhone.startsWith('+92')) {
      formattedPhone = '+92' + formattedPhone.replace(/^0/, '')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, token: otp })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Login Successful', description: 'Redirecting...' })
        const role = data.data.user.role
        
        if (role === 'admin' || role === 'super_admin') router.push('/admin/dashboard')
        else if (role === 'tailor') router.push('/tailor/dashboard')
        else if (role === 'qc_inspector') router.push('/qc/dashboard')
        else if (role === 'delivery_agent') router.push('/delivery/dashboard')
        else router.push('/dashboard')
        
      } else {
        toast({ title: 'Error', description: data.error?.message || 'Invalid OTP', variant: 'destructive' })
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
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 border border-r-0 border-gray-300 bg-gray-100 rounded-l-md text-gray-500">
                    +92
                  </div>
                  <Input 
                    id="phone" 
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
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input 
                  id="otp" 
                  placeholder="123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
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
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/register')}>
              Register here
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
