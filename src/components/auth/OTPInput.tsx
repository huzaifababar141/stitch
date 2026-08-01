import { useRef, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'

interface OTPInputProps {
  value: string
  onChange: (val: string) => void
  length?: number
  disabled?: boolean
}

export function OTPInput({ value, onChange, length = 6, disabled }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char && e.target.value !== '') return // Ignore non-digits unless it's a backspace clearing

    const newValue = value.split('')
    newValue[index] = char
    const newString = newValue.join('')
    onChange(newString.slice(0, length))

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold rounded-md border-gray-200 focus-visible:ring-[#7E153A]"
        />
      ))}
    </div>
  )
}
