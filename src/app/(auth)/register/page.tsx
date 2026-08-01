'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // If user is not authenticated with phone yet, they shouldn't be here
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Create user profile in public.users table
      const { error } = await supabase.from('users').insert({
        id: user.id,
        phone_number: user.phone,
        email: email || null,
        role: 'customer'
      })

      if (error) throw error

      // Also create a customer profile
      await supabase.from('customer_profiles').insert({
        user_id: user.id,
        full_name: fullName
      })

      toast({ title: 'Profile Created', description: 'Welcome to TailorLink!' })
      router.push('/dashboard')
      
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to complete profile', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Profile</h2>
        <p className="text-gray-500 text-sm mb-6">You're almost there! Let us know what to call you.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <Input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Ali Ahmed"
              className="h-12 focus-visible:ring-[#7E153A]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address (Optional)</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ali@example.com"
              className="h-12 focus-visible:ring-[#7E153A]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white h-12 rounded-md mt-4"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}
