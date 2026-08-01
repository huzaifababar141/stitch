import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  initialSeconds: number
  onResend: () => void
  disabled?: boolean
}

export function CountdownTimer({ initialSeconds, onResend, disabled }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  const handleResend = () => {
    if (disabled) return
    setSeconds(initialSeconds)
    onResend()
  }

  if (seconds > 0) {
    return <span className="text-sm text-gray-500">Resend in {seconds}s</span>
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={disabled}
      className="text-sm text-[#7E153A] hover:underline disabled:opacity-50 disabled:no-underline font-medium"
    >
      Resend Code
    </button>
  )
}
