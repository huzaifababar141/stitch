import { ChangeEvent } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  disabled,
  error,
}: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('0')) {
      val = val.substring(1);
    }
    if (val.length <= 10) {
      onChange(val);
    }
  };

  return (
    <div className="space-y-1">
      {/* Unified bordered container matching all other inputs */}
      <div
        className={`group flex items-stretch h-12 min-h-[48px] sm:h-[52px] w-full rounded-xl border bg-white transition-all duration-150 focus-within:ring-4 ${
          error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
            : 'border-gray-200 focus-within:border-[#7E153A] focus-within:ring-[#7E153A]/10'
        }`}
      >
        {/* Fixed Country Code for Pakistan — no dropdown */}
        <div className="flex items-center shrink-0 px-3.5 select-none text-gray-700 text-sm font-semibold tracking-wide bg-white rounded-l-xl">
          PK +92
        </div>

        {/* Thin 1px divider */}
        <div className="w-[1px] my-2 bg-gray-200 shrink-0" />

        {/* Input Field */}
        <input
          id="phone"
          type="tel"
          placeholder="300 1234567"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="h-full w-full rounded-r-xl bg-white px-3.5 text-sm sm:text-[16px] text-gray-900 placeholder:text-gray-400 tracking-wide transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          required
        />
      </div>

      {/* Inline Validation Error Message */}
      {error && (
        <p className="text-xs font-medium text-red-600 pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
