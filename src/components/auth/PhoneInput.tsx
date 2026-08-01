import { Input } from '@/components/ui/input'
import { ChangeEvent } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) {
      onChange(val)
    }
  }

  return (
    <div className="flex">
      <div className="flex items-center justify-center px-4 border border-r-0 border-gray-200 bg-gray-50 rounded-l-md text-gray-500 font-medium">
        +92
      </div>
      <Input
        type="tel"
        placeholder="300 1234567"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="rounded-l-none border-gray-200 focus-visible:ring-[#7E153A] h-12 text-lg tracking-wider"
        required
      />
    </div>
  )
}
