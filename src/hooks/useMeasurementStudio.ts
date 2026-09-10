'use client';

import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'tailorlink_draft_measurements';

export type MeasurementGarmentType =
  'men_suit' | 'women_suit' | 'pant_trouser' | 'coat' | 'shalwar' | 'other';

export interface GarmentCategoryConfig {
  id: MeasurementGarmentType;
  label: string;
  shortLabel: string;
  iconName: string;
  gender: 'male' | 'female' | 'unisex';
  desc: string;
  hasUpper: boolean;
  hasLower: boolean;
  upperTabLabel: string;
  lowerTabLabel: string;
  defaultPresetKey: string;
}

export const GARMENT_CATEGORIES: GarmentCategoryConfig[] = [
  {
    id: 'men_suit',
    label: "Men's Stitching (Kurta Shalwar / Kameez Shalwar)",
    shortLabel: "Men's Suit",
    iconName: 'User',
    gender: 'male',
    desc: "Dedicated men's cut with collar/ban, teera, chest, kurta length, and shalwar dimensions.",
    hasUpper: true,
    hasLower: true,
    upperTabLabel: 'Kurta / Kameez',
    lowerTabLabel: 'Shalwar / Trouser',
    defaultPresetKey: 'm',
  },
  {
    id: 'women_suit',
    label: "Women's Stitching (Kameez Shalwar / Kurti Trouser / Frock)",
    shortLabel: "Women's Suit",
    iconName: 'Scissors',
    gender: 'female',
    desc: "Dedicated women's cut with bust, waist, hips, neckline depth, and trouser fit.",
    hasUpper: true,
    hasLower: true,
    upperTabLabel: 'Kameez / Kurti',
    lowerTabLabel: 'Trouser / Shalwar',
    defaultPresetKey: 'm',
  },
  {
    id: 'pant_trouser',
    label: 'Pant / Trouser (Formal Pants / Cigarette Pants / Jeans / Trousers)',
    shortLabel: 'Pant / Trouser',
    iconName: 'Sliders',
    gender: 'unisex',
    desc: 'Lower body only: Waist, pant length, inseam/asan, thigh, knee, and bottom opening.',
    hasUpper: false,
    hasLower: true,
    upperTabLabel: '',
    lowerTabLabel: 'Pant & Trouser Dimensions',
    defaultPresetKey: 'P-34',
  },
  {
    id: 'coat',
    label: 'Coat / Prince Coat / Blazer / Waistcoat',
    shortLabel: 'Coat & Blazer',
    iconName: 'Briefcase',
    gender: 'unisex',
    desc: 'Upper body only: Chest over vest, waist, coat length, shoulder (teera), sleeve, and back length.',
    hasUpper: true,
    hasLower: false,
    upperTabLabel: 'Coat & Blazer Dimensions',
    lowerTabLabel: '',
    defaultPresetKey: '40',
  },
  {
    id: 'shalwar',
    label: 'Shalwar / Pajama Only',
    shortLabel: 'Shalwar Only',
    iconName: 'Tag',
    gender: 'unisex',
    desc: 'Lower body only: Shalwar length, ghera/flare, asan depth, paicha/bottom, and waist.',
    hasUpper: false,
    hasLower: true,
    upperTabLabel: '',
    lowerTabLabel: 'Shalwar Dimensions',
    defaultPresetKey: 'm',
  },
  {
    id: 'other',
    label: 'Other / Custom Garment',
    shortLabel: 'Custom Garment',
    iconName: 'Ruler',
    gender: 'unisex',
    desc: 'Full flexible upper and lower measurements for bespoke and specialized garments.',
    hasUpper: true,
    hasLower: true,
    upperTabLabel: 'Upper Body',
    lowerTabLabel: 'Lower Body',
    defaultPresetKey: 'm',
  },
];

// Helper to infer garment category from profile
export function getProfileGarmentType(profile: any): MeasurementGarmentType {
  if (!profile) return 'women_suit';

  const notes = profile.notes || '';
  if (notes.includes('[Category:men_suit]') || notes.includes('[men_suit]'))
    return 'men_suit';
  if (notes.includes('[Category:women_suit]') || notes.includes('[women_suit]'))
    return 'women_suit';
  if (
    notes.includes('[Category:pant_trouser]') ||
    notes.includes('[pant_trouser]') ||
    notes.includes('[Pant]')
  )
    return 'pant_trouser';
  if (
    notes.includes('[Category:coat]') ||
    notes.includes('[coat]') ||
    notes.includes('[Coat]')
  )
    return 'coat';
  if (
    notes.includes('[Category:shalwar]') ||
    notes.includes('[shalwar]') ||
    notes.includes('[Shalwar]')
  )
    return 'shalwar';
  if (notes.includes('[Category:other]') || notes.includes('[other]'))
    return 'other';
  if (notes.includes('[Men]')) return 'men_suit';

  const label = (profile.label || '').toLowerCase();
  if (
    label.includes('coat') ||
    label.includes('blazer') ||
    label.includes('waistcoat') ||
    label.includes('prince')
  )
    return 'coat';
  if (
    label.includes('pant') ||
    label.includes('trouser') ||
    label.includes('jeans')
  )
    return 'pant_trouser';
  if (label.includes('shalwar only') || label.includes('pajama'))
    return 'shalwar';
  if (
    label.includes('men') ||
    label.includes('kurta') ||
    label.includes('gent')
  )
    return 'men_suit';

  // Heuristic from field presence
  const hasUpper = !!(
    profile.chest ||
    profile.kameezLength ||
    profile.shoulderWidth
  );
  const hasLower = !!(
    profile.trouserLength ||
    profile.ankle ||
    profile.trouserWaist
  );

  if (!hasUpper && hasLower) return 'pant_trouser';
  if (hasUpper && !hasLower) return 'coat';
  if (
    profile.galaDepth === null &&
    (Number(profile.neckCircumference) > 0 ||
      Number(profile.shoulderWidth) >= 17)
  )
    return 'men_suit';

  return 'women_suit';
}

export const DEFAULT_WOMEN_MEASUREMENTS: Record<string, string> = {
  shoulder: '14.5',
  bust: '38',
  waist: '32',
  hip: '40',
  sleeve_length: '22',
  shirt_length: '43',
  trouser_length: '39',
  waist_bottom: '30',
  bottom_opening: '14',
  armhole: '8.5',
  neck: '15',
};

export const DEFAULT_MEN_MEASUREMENTS: Record<string, string> = {
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
};

export const DEFAULT_PANT_MEASUREMENTS: Record<string, string> = {
  trouser_length: '40',
  waist_bottom: '34',
  bottom_opening: '16',
  hip_bottom: '24',
  thigh: '24',
  knee: '18',
};

export const DEFAULT_COAT_MEASUREMENTS: Record<string, string> = {
  shirt_length: '30',
  bust: '42',
  waist: '38',
  shoulder: '18.5',
  sleeve_length: '25',
  neck: '15.5',
  armhole: '10',
  cuff: '11.5',
  back_length: '18',
  hip_bottom: '42',
};

export const DEFAULT_SHALWAR_MEASUREMENTS: Record<string, string> = {
  trouser_length: '40',
  hip_bottom: '24',
  thigh: '34',
  bottom_opening: '16',
  waist_bottom: '34',
};

export interface TrouserCode {
  code: string;
  name: string;
  measurements: Record<string, string>;
}

export const MEN_TROUSER_CODES: TrouserCode[] = [
  {
    code: 'P-30',
    name: 'P-30 (30" Waist)',
    measurements: {
      trouser_length: '38',
      waist_bottom: '30',
      bottom_opening: '15',
      hip_bottom: '22',
      thigh: '23',
    },
  },
  {
    code: 'P-32',
    name: 'P-32 (32" Waist)',
    measurements: {
      trouser_length: '39',
      waist_bottom: '32',
      bottom_opening: '15.5',
      hip_bottom: '23',
      thigh: '24',
    },
  },
  {
    code: 'P-34',
    name: 'P-34 (34" Waist)',
    measurements: {
      trouser_length: '40',
      waist_bottom: '34',
      bottom_opening: '16',
      hip_bottom: '24',
      thigh: '25',
    },
  },
  {
    code: 'P-36',
    name: 'P-36 (36" Waist)',
    measurements: {
      trouser_length: '41',
      waist_bottom: '36',
      bottom_opening: '16.5',
      hip_bottom: '25',
      thigh: '26',
    },
  },
  {
    code: 'P-38',
    name: 'P-38 (38" Waist)',
    measurements: {
      trouser_length: '42',
      waist_bottom: '38',
      bottom_opening: '17',
      hip_bottom: '26',
      thigh: '27',
    },
  },
  {
    code: 'P-40',
    name: 'P-40 (40" Waist)',
    measurements: {
      trouser_length: '42.5',
      waist_bottom: '40',
      bottom_opening: '17.5',
      hip_bottom: '27',
      thigh: '28',
    },
  },
];

export const WOMEN_TROUSER_CODES: TrouserCode[] = [
  {
    code: 'T-28',
    name: 'T-28 (Small / 28" Waist)',
    measurements: {
      trouser_length: '38',
      waist_bottom: '28',
      bottom_opening: '13',
      hip_bottom: '38',
      thigh: '22',
    },
  },
  {
    code: 'T-30',
    name: 'T-30 (Medium / 30" Waist)',
    measurements: {
      trouser_length: '39',
      waist_bottom: '30',
      bottom_opening: '14',
      hip_bottom: '40',
      thigh: '23',
    },
  },
  {
    code: 'T-32',
    name: 'T-32 (Large / 32" Waist)',
    measurements: {
      trouser_length: '40',
      waist_bottom: '32',
      bottom_opening: '14.5',
      hip_bottom: '43',
      thigh: '24',
    },
  },
  {
    code: 'T-34',
    name: 'T-34 (XL / 34" Waist)',
    measurements: {
      trouser_length: '40.5',
      waist_bottom: '34',
      bottom_opening: '15',
      hip_bottom: '46',
      thigh: '25.5',
    },
  },
  {
    code: 'T-36',
    name: 'T-36 (XXL / 36" Waist)',
    measurements: {
      trouser_length: '41',
      waist_bottom: '36',
      bottom_opening: '15.5',
      hip_bottom: '48',
      thigh: '27',
    },
  },
];

// Standard Coat Presets
export const COAT_SIZE_PRESETS: Record<
  string,
  { label: string; tag: string; values: Record<string, number> }
> = {
  '36': {
    label: '36 Slim',
    tag: '36" Chest / 17.5" Teera',
    values: {
      kameezLength: 28,
      chest: 38,
      waist: 34,
      seat: 38,
      shoulderWidth: 17.5,
      sleeveLength: 24,
      neckCircumference: 14.5,
      armhole: 9,
      wrist: 10.5,
      backLength: 17,
    },
  },
  '38': {
    label: '38 Regular',
    tag: '38" Chest / 18" Teera',
    values: {
      kameezLength: 29,
      chest: 40,
      waist: 36,
      seat: 40,
      shoulderWidth: 18,
      sleeveLength: 24.5,
      neckCircumference: 15,
      armhole: 9.5,
      wrist: 11,
      backLength: 17.5,
    },
  },
  '40': {
    label: '40 Standard',
    tag: '40" Chest / 18.5" Teera',
    values: {
      kameezLength: 30,
      chest: 42,
      waist: 38,
      seat: 42,
      shoulderWidth: 18.5,
      sleeveLength: 25,
      neckCircumference: 15.5,
      armhole: 10,
      wrist: 11.5,
      backLength: 18,
    },
  },
  '42': {
    label: '42 Broad',
    tag: '42" Chest / 19" Teera',
    values: {
      kameezLength: 30.5,
      chest: 44,
      waist: 40,
      seat: 44,
      shoulderWidth: 19,
      sleeveLength: 25.5,
      neckCircumference: 16,
      armhole: 10.5,
      wrist: 12,
      backLength: 18.5,
    },
  },
  '44': {
    label: '44 Large',
    tag: '44" Chest / 19.5" Teera',
    values: {
      kameezLength: 31,
      chest: 46,
      waist: 42,
      seat: 46,
      shoulderWidth: 19.5,
      sleeveLength: 26,
      neckCircumference: 16.5,
      armhole: 11,
      wrist: 12.5,
      backLength: 19,
    },
  },
  '46': {
    label: '46 Extra Large',
    tag: '46" Chest / 20" Teera',
    values: {
      kameezLength: 31.5,
      chest: 48,
      waist: 44,
      seat: 48,
      shoulderWidth: 20,
      sleeveLength: 26.5,
      neckCircumference: 17,
      armhole: 11.5,
      wrist: 13,
      backLength: 19.5,
    },
  },
};

// Standard Shalwar Presets
export const SHALWAR_SIZE_PRESETS: Record<
  string,
  { label: string; tag: string; values: Record<string, number> }
> = {
  s: {
    label: 'Small Shalwar',
    tag: '38" Length / 15" Paicha',
    values: {
      trouserLength: 38,
      seat: 22,
      thigh: 32,
      ankle: 15,
      trouserWaist: 32,
    },
  },
  m: {
    label: 'Medium Shalwar',
    tag: '40" Length / 16" Paicha',
    values: {
      trouserLength: 40,
      seat: 24,
      thigh: 34,
      ankle: 16,
      trouserWaist: 34,
    },
  },
  l: {
    label: 'Large Shalwar',
    tag: '42" Length / 17" Paicha',
    values: {
      trouserLength: 42,
      seat: 26,
      thigh: 36,
      ankle: 17,
      trouserWaist: 36,
    },
  },
  xl: {
    label: 'XL Shalwar',
    tag: '44" Length / 18" Paicha',
    values: {
      trouserLength: 44,
      seat: 28,
      thigh: 38,
      ankle: 18,
      trouserWaist: 38,
    },
  },
};

export function useMeasurementStudio(
  initialCategory: MeasurementGarmentType | 'female' | 'male' = 'female'
) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const normalizedCategory: MeasurementGarmentType =
    initialCategory === 'male'
      ? 'men_suit'
      : initialCategory === 'female'
        ? 'women_suit'
        : initialCategory;

  const [garmentCategory, setGarmentCategory] =
    useState<MeasurementGarmentType>(normalizedCategory);
  const [activeField, setActiveField] = useState<string>(
    normalizedCategory === 'men_suit' || normalizedCategory === 'coat'
      ? 'chest'
      : normalizedCategory === 'pant_trouser' ||
          normalizedCategory === 'shalwar'
        ? 'trouser_length'
        : 'bust'
  );

  const getDefaultValuesForCategory = (
    cat: MeasurementGarmentType
  ): Record<string, string> => {
    switch (cat) {
      case 'men_suit':
        return DEFAULT_MEN_MEASUREMENTS;
      case 'pant_trouser':
        return DEFAULT_PANT_MEASUREMENTS;
      case 'coat':
        return DEFAULT_COAT_MEASUREMENTS;
      case 'shalwar':
        return DEFAULT_SHALWAR_MEASUREMENTS;
      case 'women_suit':
      case 'other':
      default:
        return DEFAULT_WOMEN_MEASUREMENTS;
    }
  };

  const defaultValues = getDefaultValuesForCategory(garmentCategory);

  const [measurements, setMeasurements] = useState<Record<string, string>>(
    () => {
      if (typeof window === 'undefined') return defaultValues;
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...defaultValues, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Failed to load draft measurements from localStorage');
      }
      return defaultValues;
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(measurements));
    } catch (e) {
      console.warn('Failed to save draft measurements');
    }
  }, [measurements]);

  // Convert units dynamically
  const toggleUnit = (newUnit: 'inches' | 'cm') => {
    if (newUnit === unit) return;

    setMeasurements((prev) => {
      const updated: Record<string, string> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (newUnit === 'cm') {
            updated[key] = (num * 2.54).toFixed(1);
          } else {
            updated[key] = (num / 2.54).toFixed(1);
          }
        } else {
          updated[key] = val;
        }
      });
      return updated;
    });

    setUnit(newUnit);
  };

  const setCategoryDefaults = (category: MeasurementGarmentType) => {
    setGarmentCategory(category);
    const base = getDefaultValuesForCategory(category);
    setMeasurements(base);
    if (category === 'pant_trouser' || category === 'shalwar') {
      setActiveField('trouser_length');
    } else if (category === 'men_suit' || category === 'coat') {
      setActiveField('chest');
    } else {
      setActiveField('bust');
    }
  };

  const setGenderDefaults = (gender: 'female' | 'male') => {
    setCategoryDefaults(gender === 'male' ? 'men_suit' : 'women_suit');
  };

  const updateMeasurement = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
    setActiveField(field);
  };

  const applyPreset = (preset: Record<string, string>) => {
    setMeasurements((prev) => ({ ...prev, ...preset }));
  };

  const resetMeasurements = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setMeasurements(defaultValues);
  };

  return {
    unit,
    toggleUnit,
    garmentCategory,
    setGarmentCategory,
    setCategoryDefaults,
    activeField,
    setActiveField,
    measurements,
    updateMeasurement,
    applyPreset,
    resetMeasurements,
    setGenderDefaults,
  };
}
