'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (measurements: Record<string, string>) => void;
  gender?: 'female' | 'male';
}

interface SizePreset {
  name: string;
  tag: string;
  measurements: Record<string, string>;
}

const WOMEN_SIZE_PRESETS: SizePreset[] = [
  {
    name: 'Small (S)',
    tag: '36"',
    measurements: {
      shoulder: '14',
      bust: '36',
      waist: '30',
      hip: '38',
      sleeve_length: '21',
      shirt_length: '42',
      trouser_length: '38',
      waist_bottom: '28',
      bottom_opening: '13',
    },
  },
  {
    name: 'Medium (M)',
    tag: '38"',
    measurements: {
      shoulder: '14.5',
      bust: '38',
      waist: '32',
      hip: '40',
      sleeve_length: '22',
      shirt_length: '44',
      trouser_length: '39',
      waist_bottom: '30',
      bottom_opening: '14',
    },
  },
  {
    name: 'Large (L)',
    tag: '42"',
    measurements: {
      shoulder: '15',
      bust: '42',
      waist: '36',
      hip: '44',
      sleeve_length: '22.5',
      shirt_length: '45',
      trouser_length: '40',
      waist_bottom: '34',
      bottom_opening: '15',
    },
  },
  {
    name: 'Extra Large (XL)',
    tag: '46"',
    measurements: {
      shoulder: '16',
      bust: '46',
      waist: '40',
      hip: '48',
      sleeve_length: '23',
      shirt_length: '46',
      trouser_length: '41',
      waist_bottom: '38',
      bottom_opening: '16',
    },
  },
];

const MEN_SIZE_PRESETS: SizePreset[] = [
  {
    name: 'Small (S)',
    tag: '38" Chest / 14.5" Collar',
    measurements: {
      neck: '14.5',
      shoulder: '17.5',
      bust: '38',
      waist: '34',
      sleeve_length: '23',
      shirt_length: '40',
      trouser_length: '39',
      bottom_opening: '15',
      waist_bottom: '32',
    },
  },
  {
    name: 'Medium (M)',
    tag: '40" Chest / 15" Collar',
    measurements: {
      neck: '15',
      shoulder: '18.5',
      bust: '40',
      waist: '36',
      sleeve_length: '24',
      shirt_length: '42',
      trouser_length: '40',
      bottom_opening: '16',
      waist_bottom: '34',
    },
  },
  {
    name: 'Large (L)',
    tag: '43" Chest / 16" Collar',
    measurements: {
      neck: '16',
      shoulder: '19.5',
      bust: '43',
      waist: '39',
      sleeve_length: '25',
      shirt_length: '44',
      trouser_length: '41',
      bottom_opening: '17',
      waist_bottom: '36',
    },
  },
  {
    name: 'Extra Large (XL)',
    tag: '46" Chest / 17" Collar',
    measurements: {
      neck: '17',
      shoulder: '20.5',
      bust: '46',
      waist: '43',
      sleeve_length: '25.5',
      shirt_length: '45',
      trouser_length: '42',
      bottom_opening: '18',
      waist_bottom: '40',
    },
  },
];

export function SizeChartModal({
  isOpen,
  onClose,
  onSelectSize,
  gender = 'female',
}: SizeChartModalProps) {
  const [activeGender, setActiveGender] = React.useState<'female' | 'male'>(
    gender
  );

  React.useEffect(() => {
    setActiveGender(gender);
  }, [gender]);

  const presets =
    activeGender === 'male' ? MEN_SIZE_PRESETS : WOMEN_SIZE_PRESETS;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              Standard Pakistani Size Chart
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              Select a preset size to auto-fill your measurements in inches
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Gender Toggle */}
        <div className="flex flex-col sm:flex-row px-4 sm:px-6 pt-3 sm:pt-4 gap-2 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveGender('female')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeGender === 'female'
                ? 'bg-[#7E153A] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Women&apos;s Standard Sizes (3-Pc / Kurti)
          </button>
          <button
            type="button"
            onClick={() => setActiveGender('male')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeGender === 'male'
                ? 'bg-[#7E153A] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Men&apos;s Standard Sizes (Kameez Shalwar / Kurta)
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200 scrollbar-none">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5 sm:p-3">Size</th>
                  {activeGender === 'male' ? (
                    <>
                      <th className="p-2.5 sm:p-3">Collar</th>
                      <th className="p-2.5 sm:p-3">Shoulder</th>
                      <th className="p-2.5 sm:p-3">Chest</th>
                      <th className="p-2.5 sm:p-3">Length</th>
                      <th className="p-2.5 sm:p-3">Sleeve</th>
                      <th className="p-2.5 sm:p-3">Shalwar</th>
                      <th className="p-2.5 sm:p-3">Paicha</th>
                    </>
                  ) : (
                    <>
                      <th className="p-2.5 sm:p-3">Shoulder</th>
                      <th className="p-2.5 sm:p-3">Bust</th>
                      <th className="p-2.5 sm:p-3">Waist</th>
                      <th className="p-2.5 sm:p-3">Hip</th>
                      <th className="p-2.5 sm:p-3">Sleeve</th>
                      <th className="p-2.5 sm:p-3">Length</th>
                    </>
                  )}
                  <th className="p-2.5 sm:p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {presets.map((preset) => (
                  <tr
                    key={preset.name}
                    className="hover:bg-red-50/30 transition-colors"
                  >
                    <td className="p-2.5 sm:p-3 font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center text-[10px] font-mono shrink-0">
                        {preset.tag}
                      </span>
                      <span className="truncate">{preset.name}</span>
                    </td>
                    {activeGender === 'male' ? (
                      <>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.neck}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.shoulder}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.bust}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.shirt_length}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.sleeve_length}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.trouser_length}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.bottom_opening}&quot;
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.shoulder}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.bust}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.waist}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.hip}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.sleeve_length}&quot;
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {preset.measurements.shirt_length}&quot;
                        </td>
                      </>
                    )}
                    <td className="p-2.5 sm:p-3 text-right">
                      <Button
                        onClick={() => {
                          onSelectSize(preset.measurements);
                          onClose();
                        }}
                        size="sm"
                        className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-[11px] sm:text-xs h-8 px-2.5 sm:px-3 rounded-lg cursor-pointer"
                      >
                        Apply Size
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left">
            All measurements are in inches. You can tweak values after applying.
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto h-9 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
