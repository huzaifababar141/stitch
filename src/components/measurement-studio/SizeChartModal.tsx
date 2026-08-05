'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (measurements: Record<string, string>) => void;
}

const SIZE_PRESETS = [
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
    },
  },
];

export function SizeChartModal({
  isOpen,
  onClose,
  onSelectSize,
}: SizeChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Standard Pakistani Size Chart
            </h3>
            <p className="text-xs text-gray-500">
              Select a preset size to auto-fill your measurements in inches
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Bust</th>
                  <th className="p-3">Waist</th>
                  <th className="p-3">Hip</th>
                  <th className="p-3">Sleeve</th>
                  <th className="p-3">Length</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {SIZE_PRESETS.map((preset) => (
                  <tr
                    key={preset.name}
                    className="hover:bg-red-50/30 transition-colors"
                  >
                    <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center text-[10px]">
                        {preset.tag}
                      </span>
                      {preset.name}
                    </td>
                    <td className="p-3">
                      {preset.measurements.shoulder}&quot;
                    </td>
                    <td className="p-3">{preset.measurements.bust}&quot;</td>
                    <td className="p-3">{preset.measurements.waist}&quot;</td>
                    <td className="p-3">{preset.measurements.hip}&quot;</td>
                    <td className="p-3">
                      {preset.measurements.sleeve_length}&quot;
                    </td>
                    <td className="p-3">
                      {preset.measurements.shirt_length}&quot;
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => {
                          onSelectSize(preset.measurements);
                          onClose();
                        }}
                        size="sm"
                        className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs h-8 px-3"
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
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            All measurements are in inches. You can tweak values after applying.
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
