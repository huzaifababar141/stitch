'use client';

import React, { useState } from 'react';
import { X, Check, Ruler, Sliders, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (measurements: Record<string, string>) => void;
  gender?: 'female' | 'male';
  initialUnit?: 'inches' | 'cm';
}

interface SizePreset {
  name: string;
  tag: string;
  measurements: Record<string, string>;
}

interface TrouserCodeItem {
  code: string;
  name: string;
  waist: string;
  length: string;
  inseam: string;
  bottom: string;
  seat: string;
  measurements: Record<string, string>;
}

const WOMEN_SIZE_PRESETS: SizePreset[] = [
  {
    name: 'Extra Small (XS)',
    tag: '34"',
    measurements: {
      shoulder: '13.5',
      bust: '34',
      waist: '28',
      hip: '36',
      sleeve_length: '20.5',
      shirt_length: '40',
      trouser_length: '37',
      waist_bottom: '26',
      bottom_opening: '12',
    },
  },
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
      armhole: '8.5',
      cuff: '9',
      hip_bottom: '22',
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
      armhole: '9',
      cuff: '9.5',
      hip_bottom: '24',
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
      armhole: '9.5',
      cuff: '10',
      hip_bottom: '25',
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
      armhole: '10',
      cuff: '10.5',
      hip_bottom: '26',
    },
  },
  {
    name: 'Double XL (XXL)',
    tag: '48" Chest / 17.5" Collar',
    measurements: {
      neck: '17.5',
      shoulder: '21',
      bust: '48',
      waist: '46',
      sleeve_length: '26',
      shirt_length: '46',
      trouser_length: '42.5',
      bottom_opening: '18.5',
      waist_bottom: '42',
      armhole: '10.5',
      cuff: '11',
      hip_bottom: '28',
    },
  },
];

// ─── Standard Pakistani Trouser & Pant Size Codes ───────────────────────────

const MEN_TROUSER_CODE_ITEMS: TrouserCodeItem[] = [
  {
    code: 'P-30',
    name: 'P-30 (30" Waist)',
    waist: '30',
    length: '38',
    inseam: '32',
    bottom: '15',
    seat: '22',
    measurements: {
      trouser_length: '38',
      waist_bottom: '32',
      bottom_opening: '15',
      hip_bottom: '22',
    },
  },
  {
    code: 'P-32',
    name: 'P-32 (32" Waist)',
    waist: '32',
    length: '39',
    inseam: '33',
    bottom: '15.5',
    seat: '23',
    measurements: {
      trouser_length: '39',
      waist_bottom: '33',
      bottom_opening: '15.5',
      hip_bottom: '23',
    },
  },
  {
    code: 'P-34',
    name: 'P-34 (34" Waist)',
    waist: '34',
    length: '40',
    inseam: '34',
    bottom: '16',
    seat: '24',
    measurements: {
      trouser_length: '40',
      waist_bottom: '34',
      bottom_opening: '16',
      hip_bottom: '24',
    },
  },
  {
    code: 'P-36',
    name: 'P-36 (36" Waist)',
    waist: '36',
    length: '41',
    inseam: '35',
    bottom: '16.5',
    seat: '25',
    measurements: {
      trouser_length: '41',
      waist_bottom: '35',
      bottom_opening: '16.5',
      hip_bottom: '25',
    },
  },
  {
    code: 'P-38',
    name: 'P-38 (38" Waist)',
    waist: '38',
    length: '42',
    inseam: '36',
    bottom: '17',
    seat: '26',
    measurements: {
      trouser_length: '42',
      waist_bottom: '36',
      bottom_opening: '17',
      hip_bottom: '26',
    },
  },
  {
    code: 'P-40',
    name: 'P-40 (40" Waist)',
    waist: '40',
    length: '42.5',
    inseam: '36.5',
    bottom: '17.5',
    seat: '27',
    measurements: {
      trouser_length: '42.5',
      waist_bottom: '36.5',
      bottom_opening: '17.5',
      hip_bottom: '27',
    },
  },
  {
    code: 'P-42',
    name: 'P-42 (42" Waist)',
    waist: '42',
    length: '43',
    inseam: '37',
    bottom: '18',
    seat: '28',
    measurements: {
      trouser_length: '43',
      waist_bottom: '37',
      bottom_opening: '18',
      hip_bottom: '28',
    },
  },
];

const WOMEN_TROUSER_CODE_ITEMS: TrouserCodeItem[] = [
  {
    code: 'T-28',
    name: 'T-28 (Small / 28" Waist)',
    waist: '28',
    length: '38',
    inseam: '28',
    bottom: '13',
    seat: '38',
    measurements: {
      trouser_length: '38',
      waist_bottom: '28',
      bottom_opening: '13',
      hip_bottom: '38',
    },
  },
  {
    code: 'T-30',
    name: 'T-30 (Medium / 30" Waist)',
    waist: '30',
    length: '39',
    inseam: '29',
    bottom: '14',
    seat: '40',
    measurements: {
      trouser_length: '39',
      waist_bottom: '30',
      bottom_opening: '14',
      hip_bottom: '40',
    },
  },
  {
    code: 'T-32',
    name: 'T-32 (Large / 32" Waist)',
    waist: '32',
    length: '40',
    inseam: '29.5',
    bottom: '14.5',
    seat: '43',
    measurements: {
      trouser_length: '40',
      waist_bottom: '32',
      bottom_opening: '14.5',
      hip_bottom: '43',
    },
  },
  {
    code: 'T-34',
    name: 'T-34 (XL / 34" Waist)',
    waist: '34',
    length: '40.5',
    inseam: '30',
    bottom: '15',
    seat: '46',
    measurements: {
      trouser_length: '40.5',
      waist_bottom: '34',
      bottom_opening: '15',
      hip_bottom: '46',
    },
  },
  {
    code: 'T-36',
    name: 'T-36 (XXL / 36" Waist)',
    waist: '36',
    length: '41',
    inseam: '30.5',
    bottom: '15.5',
    seat: '48',
    measurements: {
      trouser_length: '41',
      waist_bottom: '36',
      bottom_opening: '15.5',
      hip_bottom: '48',
    },
  },
];

export function SizeChartModal({
  isOpen,
  onClose,
  onSelectSize,
  gender = 'female',
  initialUnit = 'inches',
}: SizeChartModalProps) {
  const [activeGender, setActiveGender] = useState<'female' | 'male'>(gender);
  const [activeUnit, setActiveUnit] = useState<'inches' | 'cm'>(initialUnit);
  const [viewTab, setViewTab] = useState<'full' | 'trouser'>('full');
  const [selectedTrouserCode, setSelectedTrouserCode] = useState<string | null>(
    gender === 'male' ? 'P-32' : 'T-30'
  );

  React.useEffect(() => {
    setActiveGender(gender);
    setSelectedTrouserCode(gender === 'male' ? 'P-32' : 'T-30');
  }, [gender]);

  React.useEffect(() => {
    setActiveUnit(initialUnit);
  }, [initialUnit]);

  if (!isOpen) return null;

  const presets =
    activeGender === 'male' ? MEN_SIZE_PRESETS : WOMEN_SIZE_PRESETS;
  const trouserCodes =
    activeGender === 'male' ? MEN_TROUSER_CODE_ITEMS : WOMEN_TROUSER_CODE_ITEMS;

  const activeTrouserItem =
    trouserCodes.find((c) => c.code === selectedTrouserCode) || trouserCodes[0];

  // Helper to format dimension according to active unit
  const formatVal = (valInInches?: string) => {
    if (!valInInches) return '—';
    const num = parseFloat(valInInches);
    if (isNaN(num)) return valInInches;
    if (activeUnit === 'cm') {
      return (num * 2.54).toFixed(1);
    }
    return valInInches;
  };

  const handleApplyPreset = (preset: SizePreset) => {
    const converted: Record<string, string> = {};
    Object.entries(preset.measurements).forEach(([k, v]) => {
      converted[k] = formatVal(v);
    });
    onSelectSize(converted);
    onClose();
  };

  const handleApplyTrouserCode = (item: TrouserCodeItem) => {
    const converted: Record<string, string> = {};
    Object.entries(item.measurements).forEach(([k, v]) => {
      converted[k] = formatVal(v);
    });
    onSelectSize(converted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              Standard Pakistani Tailoring Size Charts
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              Standard Pakistani suit & trouser codes in{' '}
              {activeUnit === 'inches' ? 'Inches (")' : 'Centimeters (cm)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Toggle Switch */}
            <div className="flex bg-gray-200/70 p-0.5 rounded-lg border border-gray-300/40">
              <button
                type="button"
                onClick={() => setActiveUnit('inches')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  activeUnit === 'inches'
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inches (&quot;)
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit('cm')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  activeUnit === 'cm'
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                cm
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Gender Toggle & View Type Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center px-4 sm:px-6 pt-3 sm:pt-4 gap-2.5 bg-gray-50/50 border-b border-gray-100 pb-3">
          {/* Gender Selector */}
          <div className="flex bg-gray-200/80 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveGender('female');
                setSelectedTrouserCode('T-30');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGender === 'female'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Women&apos;s Sizing
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveGender('male');
                setSelectedTrouserCode('P-32');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGender === 'male'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Men&apos;s Sizing
            </button>
          </div>

          {/* Sub-Tabs: Full Suit vs Pant Codes */}
          <div className="flex bg-gray-200/80 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewTab('full')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'full'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers size={13} /> Full Suit Sizes
            </button>
            <button
              type="button"
              onClick={() => setViewTab('trouser')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'trouser'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sliders size={13} /> Pant / Trouser Codes
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {/* ── 1. Full Suit Presets View ── */}
          {viewTab === 'full' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  {activeGender === 'male'
                    ? "Men's Complete Kameez Shalwar / Kurta Sizes:"
                    : "Women's Complete 3-Piece / 2-Piece Suit Sizes:"}
                </span>
                <span className="text-[11px] text-gray-400">
                  Tap &apos;Apply Size&apos; to load all fields
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 scrollbar-none">
                <table className="w-full text-left text-xs min-w-[540px]">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 sm:p-3">Size</th>
                      {activeGender === 'male' ? (
                        <>
                          <th className="p-2.5 sm:p-3">
                            Collar ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">
                            Shoulder ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">Chest ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">Waist ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">Kurta ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">
                            Sleeve ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">
                            Shalwar ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">
                            Paicha ({activeUnit})
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5 sm:p-3">
                            Shoulder ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">Bust ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">Waist ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">Hips ({activeUnit})</th>
                          <th className="p-2.5 sm:p-3">
                            Kameez ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">
                            Sleeve ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">
                            Trouser ({activeUnit})
                          </th>
                          <th className="p-2.5 sm:p-3">Ankle ({activeUnit})</th>
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
                              {formatVal(preset.measurements.neck)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.shoulder)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.bust)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.waist)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.shirt_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.sleeve_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.trouser_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.bottom_opening)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.shoulder)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.bust)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.waist)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.hip)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.shirt_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.sleeve_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.trouser_length)}
                            </td>
                            <td className="p-2.5 sm:p-3 font-mono">
                              {formatVal(preset.measurements.bottom_opening)}
                            </td>
                          </>
                        )}
                        <td className="p-2.5 sm:p-3 text-right">
                          <Button
                            onClick={() => handleApplyPreset(preset)}
                            size="sm"
                            className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-[11px] sm:text-xs h-8 px-2.5 sm:px-3 rounded-lg cursor-pointer shrink-0"
                          >
                            Apply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 2. Pant & Trouser Codes View (with Live Breakdown Card) ── */}
          {viewTab === 'trouser' && (
            <div className="space-y-4">
              {/* Quick Code Selection Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Select Standard{' '}
                    {activeGender === 'male'
                      ? "Men's Shalwar / Trouser Code:"
                      : "Women's Trouser Code:"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Tap a code to inspect measurements
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {trouserCodes.map((item) => {
                    const isSelected = selectedTrouserCode === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setSelectedTrouserCode(item.code)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#7E153A] bg-red-50/70 text-[#7E153A] ring-2 ring-[#7E153A]/20 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="font-extrabold text-xs font-mono">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5">
                          {item.waist}&quot; Waist
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Code Measurement Breakdown Card */}
              {activeTrouserItem && (
                <div className="bg-gradient-to-r from-red-50/70 via-pink-50/30 to-red-50/70 border-2 border-red-100 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#7E153A] text-white flex items-center justify-center font-mono font-bold text-xs">
                        {activeTrouserItem.code}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {activeTrouserItem.name} Measurements
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Corresponding size values mapped to code &apos;
                          {activeTrouserItem.code}&apos;
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApplyTrouserCode(activeTrouserItem)}
                      className="h-9 px-4 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                      <Check size={14} className="mr-1.5" /> Apply Code{' '}
                      {activeTrouserItem.code}
                    </Button>
                  </div>

                  {/* 4-5 Box Dimension Display Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-red-100/60 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {activeGender === 'male'
                          ? 'Shalwar Length'
                          : 'Trouser Length'}
                      </span>
                      <span className="font-extrabold text-gray-900 font-mono text-sm mt-0.5 block">
                        {formatVal(activeTrouserItem.length)}{' '}
                        <span className="text-[10px] text-gray-400 font-sans">
                          {activeUnit}
                        </span>
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100/60 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Waist Fitting
                      </span>
                      <span className="font-extrabold text-gray-900 font-mono text-sm mt-0.5 block">
                        {formatVal(activeTrouserItem.waist)}{' '}
                        <span className="text-[10px] text-gray-400 font-sans">
                          {activeUnit}
                        </span>
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100/60 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {activeGender === 'male'
                          ? 'Inseam / Asan Depth'
                          : 'Inseam Length'}
                      </span>
                      <span className="font-extrabold text-gray-900 font-mono text-sm mt-0.5 block">
                        {formatVal(activeTrouserItem.inseam)}{' '}
                        <span className="text-[10px] text-gray-400 font-sans">
                          {activeUnit}
                        </span>
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100/60 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {activeGender === 'male'
                          ? 'Paicha (Bottom Opening)'
                          : 'Ankle Opening (Paicha)'}
                      </span>
                      <span className="font-extrabold text-gray-900 font-mono text-sm mt-0.5 block">
                        {formatVal(activeTrouserItem.bottom)}{' '}
                        <span className="text-[10px] text-gray-400 font-sans">
                          {activeUnit}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comprehensive Pant Code Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 scrollbar-none">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 sm:p-3">Code</th>
                      <th className="p-2.5 sm:p-3">Waist ({activeUnit})</th>
                      <th className="p-2.5 sm:p-3">Length ({activeUnit})</th>
                      <th className="p-2.5 sm:p-3">
                        Inseam / Asan ({activeUnit})
                      </th>
                      <th className="p-2.5 sm:p-3">Paicha ({activeUnit})</th>
                      <th className="p-2.5 sm:p-3">
                        {activeGender === 'male'
                          ? 'Ghera / Seat'
                          : 'Hips / Seat'}{' '}
                        ({activeUnit})
                      </th>
                      <th className="p-2.5 sm:p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {trouserCodes.map((item) => (
                      <tr
                        key={item.code}
                        className={`hover:bg-red-50/30 transition-colors ${
                          selectedTrouserCode === item.code
                            ? 'bg-red-50/20'
                            : ''
                        }`}
                      >
                        <td className="p-2.5 sm:p-3 font-bold text-gray-900 font-mono">
                          {item.code}
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {formatVal(item.waist)}
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {formatVal(item.length)}
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {formatVal(item.inseam)}
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {formatVal(item.bottom)}
                        </td>
                        <td className="p-2.5 sm:p-3 font-mono">
                          {formatVal(item.seat)}
                        </td>
                        <td className="p-2.5 sm:p-3 text-right">
                          <Button
                            onClick={() => handleApplyTrouserCode(item)}
                            size="sm"
                            className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-[11px] sm:text-xs h-7 px-2.5 rounded-lg cursor-pointer shrink-0"
                          >
                            Apply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left">
            Showing measurements in{' '}
            {activeUnit === 'inches' ? 'Inches (")' : 'Centimeters (cm)'}. You
            can tweak any dimension in the form after applying.
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
