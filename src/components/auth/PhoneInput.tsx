import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

const COUNTRY_CODES = [
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
];

export function PhoneInput({
  value,
  onChange,
  disabled,
  error,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+92');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      onChange(val);
    }
  };

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div className="space-y-1.5">
      <div className="flex rounded-lg shadow-sm">
        {/* Interactive Country Code Selector */}
        <div className="relative flex items-center shrink-0">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={disabled}
            aria-label="Select Country Code"
            className="appearance-none h-12 pl-3 pr-8 bg-gray-50 hover:bg-gray-100/80 text-gray-800 text-sm font-semibold border border-r-0 border-gray-300 rounded-l-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7E153A]/20 focus:border-[#7E153A] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Input Field */}
        <Input
          type="tel"
          placeholder="300 1234567"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`h-12 rounded-l-none rounded-r-lg border-gray-300 text-gray-900 placeholder:text-gray-400 text-base tracking-wider transition-all duration-150 ${
            error
              ? 'border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500'
              : 'focus-visible:border-[#7E153A] focus-visible:ring-2 focus-visible:ring-[#7E153A]/20'
          }`}
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
