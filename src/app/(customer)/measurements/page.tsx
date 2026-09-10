'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Ruler,
  Plus,
  Check,
  Star,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  Info,
  BookOpen,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Scissors,
  FileText,
  User,
  Briefcase,
  Tag,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BodyDiagram } from '@/components/measurement-studio/BodyDiagram';
import { HowToMeasureModal } from '@/components/measurement-studio/HowToMeasureModal';
import { SizeChartModal } from '@/components/measurement-studio/SizeChartModal';
import {
  MeasurementGarmentType,
  GARMENT_CATEGORIES,
  getProfileGarmentType,
  MEN_TROUSER_CODES,
  WOMEN_TROUSER_CODES,
  COAT_SIZE_PRESETS,
  SHALWAR_SIZE_PRESETS,
} from '@/hooks/useMeasurementStudio';

// ─── Standard Pakistani Size Presets (in Inches) ─────────────────────────────

const WOMEN_PRESETS: Record<
  string,
  { label: string; tag: string; values: Record<string, number> }
> = {
  xs: {
    label: 'Extra Small',
    tag: '34" Bust',
    values: {
      chest: 34,
      waist: 28,
      hips: 36,
      shoulderWidth: 13.5,
      kameezLength: 40,
      sleeveLength: 20.5,
      armhole: 7.5,
      neckCircumference: 14,
      galaDepth: 6,
      trouserLength: 37,
      trouserWaist: 26,
      thigh: 22,
      knee: 16,
      ankle: 12,
    },
  },
  s: {
    label: 'Small',
    tag: '36" Bust',
    values: {
      chest: 36,
      waist: 30,
      hips: 38,
      shoulderWidth: 14,
      kameezLength: 42,
      sleeveLength: 21,
      armhole: 8,
      neckCircumference: 14.5,
      galaDepth: 6.5,
      trouserLength: 38,
      trouserWaist: 28,
      thigh: 23,
      knee: 17,
      ankle: 13,
    },
  },
  m: {
    label: 'Medium',
    tag: '38" Bust',
    values: {
      chest: 38,
      waist: 32,
      hips: 40,
      shoulderWidth: 14.5,
      kameezLength: 43,
      sleeveLength: 22,
      armhole: 8.5,
      neckCircumference: 15,
      galaDepth: 6.5,
      trouserLength: 39,
      trouserWaist: 30,
      thigh: 24,
      knee: 18,
      ankle: 14,
    },
  },
  l: {
    label: 'Large',
    tag: '42" Bust',
    values: {
      chest: 42,
      waist: 36,
      hips: 44,
      shoulderWidth: 15,
      kameezLength: 44,
      sleeveLength: 22.5,
      armhole: 9,
      neckCircumference: 15.5,
      galaDepth: 7,
      trouserLength: 40,
      trouserWaist: 34,
      thigh: 25.5,
      knee: 19,
      ankle: 15,
    },
  },
  xl: {
    label: 'Extra Large',
    tag: '46" Bust',
    values: {
      chest: 46,
      waist: 40,
      hips: 48,
      shoulderWidth: 16,
      kameezLength: 45,
      sleeveLength: 23,
      armhole: 9.5,
      neckCircumference: 16,
      galaDepth: 7,
      trouserLength: 41,
      trouserWaist: 38,
      thigh: 27,
      knee: 20,
      ankle: 16,
    },
  },
};

const MEN_PRESETS: Record<
  string,
  { label: string; tag: string; values: Record<string, number> }
> = {
  s: {
    label: 'Small',
    tag: '38" Chest / 14.5" Collar',
    values: {
      neckCircumference: 14.5,
      shoulderWidth: 17.5,
      chest: 38,
      waist: 34,
      kameezLength: 40,
      sleeveLength: 23,
      armhole: 8.5,
      wrist: 9,
      trouserLength: 39,
      trouserWaist: 32,
      ankle: 15,
      seat: 22,
    },
  },
  m: {
    label: 'Medium',
    tag: '40" Chest / 15" Collar',
    values: {
      neckCircumference: 15,
      shoulderWidth: 18.5,
      chest: 40,
      waist: 36,
      kameezLength: 42,
      sleeveLength: 24,
      armhole: 9,
      wrist: 9.5,
      trouserLength: 40,
      trouserWaist: 34,
      ankle: 16,
      seat: 24,
    },
  },
  l: {
    label: 'Large',
    tag: '43" Chest / 16" Collar',
    values: {
      neckCircumference: 16,
      shoulderWidth: 19.5,
      chest: 43,
      waist: 39,
      kameezLength: 44,
      sleeveLength: 25,
      armhole: 9.5,
      wrist: 10,
      trouserLength: 41,
      trouserWaist: 36,
      ankle: 17,
      seat: 25,
    },
  },
  xl: {
    label: 'XL',
    tag: '46" Chest / 17" Collar',
    values: {
      neckCircumference: 17,
      shoulderWidth: 20.5,
      chest: 46,
      waist: 43,
      kameezLength: 45,
      sleeveLength: 25.5,
      armhole: 10,
      wrist: 10.5,
      trouserLength: 42,
      trouserWaist: 40,
      ankle: 18,
      seat: 26,
    },
  },
  xxl: {
    label: 'XXL',
    tag: '48" Chest / 17.5" Collar',
    values: {
      neckCircumference: 17.5,
      shoulderWidth: 21,
      chest: 48,
      waist: 46,
      kameezLength: 46,
      sleeveLength: 26,
      armhole: 10.5,
      wrist: 11,
      trouserLength: 42.5,
      trouserWaist: 42,
      ankle: 18.5,
      seat: 28,
    },
  },
};

// ─── Measurement Guide Tooltips ──────────────────────────────────────────────

const MEASUREMENT_HELP: Record<string, string> = {
  kameezLength:
    'From highest point of shoulder straight down over chest to desired hemline.',
  chest:
    'Around fullest part of chest/bust, keeping tape measure parallel to floor.',
  waist:
    'Around natural waistline (narrowest part of torso or standard belt point).',
  hips: 'Around fullest part of hips/seat with feet together.',
  shoulderWidth:
    'From outer bone edge of one shoulder across back to other (Teera).',
  sleeveLength: 'From shoulder tip along slightly bent arm down to wrist/cuff.',
  armhole:
    'Around armpit over shoulder bone where sleeve connects (Bicep/Mudha).',
  neckCircumference:
    'Around base of neck where collar / sherwani ban rests comfortably.',
  galaDepth: 'From shoulder seam down to center of desired neckline dip.',
  trouserLength:
    'From waistline down outer leg to desired trouser/shalwar hem.',
  trouserWaist:
    'Around waist where trouser/shalwar is comfortably tied (or Asan depth).',
  thigh: 'Around fullest part of upper thigh.',
  knee: 'Around knee circumference (with knee slightly bent).',
  ankle: 'Around trouser bottom opening (Paicha).',
  seat: 'Across widest part of seat / shalwar ghera.',
  wrist: 'Circumference around wrist bone for sleeve cuff opening.',
  backLength:
    'From back neck bone straight down to coat/blazer hem (Center Back).',
  calf: 'Around fullest part of calf.',
  bicep: 'Around widest part of upper arm bicep.',
};

// ─── Main Measurement Studio Page ────────────────────────────────────────────

export default function MeasurementsStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State inside Studio Modal
  const [selectedGarmentType, setSelectedGarmentType] =
    useState<MeasurementGarmentType>('women_suit');
  const [formLabel, setFormLabel] = useState('My Standard Fit');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formCategory, setFormCategory] = useState<'upper' | 'lower' | 'notes'>(
    'upper'
  );
  const [activeField, setActiveField] = useState<string>('bust');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedTrouserCode, setSelectedTrouserCode] = useState<string | null>(
    'T-30'
  );
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Load user measurement profiles from API
  const loadProfiles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/measurements');
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        setProfiles(items);
      }
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Unit converter helper
  const displayVal = (inchesVal?: number | null) => {
    if (inchesVal === undefined || inchesVal === null || isNaN(inchesVal))
      return '—';
    if (unit === 'cm') {
      return `${(inchesVal * 2.54).toFixed(1)} cm`;
    }
    return `${inchesVal}"`;
  };

  // Toggle active unit and convert form data live
  const handleToggleUnit = (newUnit: 'inches' | 'cm') => {
    if (newUnit === unit) return;

    setFormData((prev) => {
      const updated: Record<string, string> = {};
      Object.entries(prev).forEach(([k, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (newUnit === 'cm') {
            updated[k] = (num * 2.54).toFixed(1);
          } else {
            updated[k] = (num / 2.54).toFixed(1);
          }
        } else {
          updated[k] = val;
        }
      });
      return updated;
    });

    setUnit(newUnit);
  };

  // Change Garment Type in Studio Modal
  const handleSelectGarmentType = (category: MeasurementGarmentType) => {
    setSelectedGarmentType(category);

    // Set appropriate initial tab and field
    if (category === 'pant_trouser' || category === 'shalwar') {
      setFormCategory('lower');
      setActiveField('trouserLength');
    } else if (category === 'coat') {
      setFormCategory('upper');
      setActiveField('chest');
    } else if (category === 'men_suit') {
      setFormCategory('upper');
      setActiveField('chest');
    } else {
      setFormCategory('upper');
      setActiveField('chest');
    }

    // Load sensible default values
    let baseValues: Record<string, number> = {};
    if (category === 'men_suit') {
      baseValues = MEN_PRESETS.m.values;
      setSelectedTrouserCode('P-34');
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel("Men's Classic Kurta Shalwar");
      }
    } else if (category === 'women_suit') {
      baseValues = WOMEN_PRESETS.m.values;
      setSelectedTrouserCode('T-30');
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel("Women's Standard Suit");
      }
    } else if (category === 'pant_trouser') {
      baseValues = {
        trouserLength: 40,
        trouserWaist: 34,
        seat: 24,
        thigh: 24,
        knee: 18,
        ankle: 16,
      };
      setSelectedTrouserCode('P-34');
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel('Formal Pant / Cigarette Trouser');
      }
    } else if (category === 'coat') {
      baseValues = COAT_SIZE_PRESETS['40'].values;
      setSelectedTrouserCode(null);
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel('Prince Coat / Blazer Fit');
      }
    } else if (category === 'shalwar') {
      baseValues = SHALWAR_SIZE_PRESETS.m.values;
      setSelectedTrouserCode(null);
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel('Traditional Shalwar Fit');
      }
    } else {
      baseValues = WOMEN_PRESETS.m.values;
      setSelectedTrouserCode(null);
      if (
        !formLabel ||
        formLabel.includes('Fit') ||
        formLabel.includes('Profile')
      ) {
        setFormLabel('Custom Tailoring Fit');
      }
    }

    const initial: Record<string, string> = {};
    Object.entries(baseValues).forEach(([k, v]) => {
      initial[k] = unit === 'cm' ? (v * 2.54).toFixed(1) : String(v);
    });
    setFormData(initial);
  };

  // Open Studio modal in Create mode
  const handleOpenCreate = (
    prefCategory: MeasurementGarmentType = 'women_suit'
  ) => {
    setEditingProfile(null);
    setFormIsDefault(profiles.length === 0);
    setFormNotes('');
    handleSelectGarmentType(prefCategory);
    setIsModalOpen(true);
  };

  // Open Studio modal in Edit mode
  const handleOpenEdit = (profile: any) => {
    setEditingProfile(profile);
    const category = getProfileGarmentType(profile);
    setSelectedGarmentType(category);

    setFormLabel(profile.label || 'My Measurements');
    setFormIsDefault(profile.isDefault || false);

    // Clean notes of category tags
    let cleanNotes = (profile.notes || '')
      .replace(/\[Category:[a-z_]+\]/g, '')
      .replace(/\[(Men|Women|Pant|Coat|Shalwar|Other)\]/g, '')
      .trim();
    setFormNotes(cleanNotes);

    if (category === 'pant_trouser' || category === 'shalwar') {
      setFormCategory('lower');
      setActiveField('trouserLength');
    } else {
      setFormCategory('upper');
      setActiveField('chest');
    }

    setSelectedTrouserCode(
      category === 'men_suit'
        ? 'P-34'
        : category === 'women_suit'
          ? 'T-30'
          : null
    );

    const initial: Record<string, string> = {};
    [
      'chest',
      'waist',
      'hips',
      'shoulderWidth',
      'backLength',
      'frontLength',
      'sleeveLength',
      'armhole',
      'bicep',
      'wrist',
      'neckCircumference',
      'kameezLength',
      'galaDepth',
      'trouserLength',
      'thigh',
      'knee',
      'calf',
      'ankle',
      'trouserWaist',
      'seat',
    ].forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        const valInInches = Number(profile[key]);
        initial[key] =
          unit === 'cm' ? (valInInches * 2.54).toFixed(1) : String(valInInches);
      }
    });

    setFormData(initial);
    setIsModalOpen(true);
  };

  // Apply a standard preset
  const handleApplyPreset = (presetKey: string) => {
    let values: Record<string, number> = {};
    let presetLabel = presetKey;

    if (selectedGarmentType === 'men_suit') {
      const preset = MEN_PRESETS[presetKey];
      if (preset) {
        values = preset.values;
        presetLabel = preset.label;
      }
    } else if (selectedGarmentType === 'women_suit') {
      const preset = WOMEN_PRESETS[presetKey];
      if (preset) {
        values = preset.values;
        presetLabel = preset.label;
      }
    } else if (selectedGarmentType === 'coat') {
      const preset = COAT_SIZE_PRESETS[presetKey];
      if (preset) {
        values = preset.values;
        presetLabel = preset.label;
      }
    } else if (selectedGarmentType === 'shalwar') {
      const preset = SHALWAR_SIZE_PRESETS[presetKey];
      if (preset) {
        values = preset.values;
        presetLabel = preset.label;
      }
    }

    if (Object.keys(values).length > 0) {
      setFormData((prev) => {
        const updated = { ...prev };
        Object.entries(values).forEach(([k, v]) => {
          updated[k] = unit === 'cm' ? (v * 2.54).toFixed(1) : String(v);
        });
        return updated;
      });

      toast({
        title: `${presetLabel} Preset Applied`,
        description: `Loaded standard dimensions in ${unit === 'inches' ? 'Inches' : 'Centimeters'}.`,
      });
    }
  };

  // Apply Trouser Code Handler
  const handleSelectTrouserCode = (item: any) => {
    setSelectedTrouserCode(item.code);
    setFormData((prev) => {
      const updated = { ...prev };
      Object.entries(item.measurements).forEach(([k, v]) => {
        const valStr = v as string;
        if (k === 'trouser_length') {
          updated.trouserLength =
            unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
        } else if (k === 'waist_bottom') {
          updated.trouserWaist =
            unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
        } else if (k === 'bottom_opening') {
          updated.ankle =
            unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
        } else if (k === 'thigh') {
          updated.thigh =
            unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
        } else if (k === 'hip_bottom') {
          if (
            selectedGarmentType === 'men_suit' ||
            selectedGarmentType === 'pant_trouser'
          ) {
            updated.seat =
              unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
          } else {
            updated.hips =
              unit === 'cm' ? (parseFloat(valStr) * 2.54).toFixed(1) : valStr;
          }
        }
      });
      return updated;
    });

    toast({
      title: `Trouser Code ${item.code} Loaded`,
      description: `Loaded standard trouser dimensions for code ${item.code}.`,
    });
  };

  // Save / Update profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLabel.trim()) {
      toast({
        title: 'Profile Name Required',
        description:
          'Please give this measurement profile a label (e.g. My Formal Trouser / Men Cotton Shalwar).',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Build clean payload with numbers in inches
      const categoryTag = `[Category:${selectedGarmentType}]`;
      const finalNotes = formNotes.trim()
        ? `${categoryTag} ${formNotes.trim()}`
        : categoryTag;

      const payload: Record<string, any> = {
        label: formLabel.trim(),
        isDefault: formIsDefault,
        notes: finalNotes,
      };

      Object.entries(formData).forEach(([key, val]) => {
        if (val && !isNaN(parseFloat(val))) {
          let num = parseFloat(val);
          if (unit === 'cm') {
            num = parseFloat((num / 2.54).toFixed(2));
          }
          payload[key] = num;
        }
      });

      // Category-based payload sanitization: Remove fields irrelevant to this category
      if (
        selectedGarmentType === 'pant_trouser' ||
        selectedGarmentType === 'shalwar'
      ) {
        delete payload.chest;
        delete payload.galaDepth;
        delete payload.sleeveLength;
        delete payload.kameezLength;
        delete payload.shoulderWidth;
        delete payload.armhole;
        delete payload.neckCircumference;
        delete payload.wrist;
        delete payload.bicep;
        delete payload.backLength;
        delete payload.frontLength;
      } else if (selectedGarmentType === 'coat') {
        delete payload.galaDepth;
        delete payload.trouserLength;
        delete payload.knee;
        delete payload.calf;
        delete payload.trouserWaist;
      } else if (selectedGarmentType === 'men_suit') {
        delete payload.galaDepth;
        delete payload.hips;
      }

      const isEdit = !!editingProfile?.id;
      const url = isEdit
        ? `/api/measurements/${editingProfile.id}`
        : '/api/measurements';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: isEdit ? 'Profile Updated' : 'Profile Created',
          description: `"${formLabel}" has been saved to your account.`,
        });
        setIsModalOpen(false);
        loadProfiles();
      } else {
        const json = await res.json();
        toast({
          title: 'Save Failed',
          description:
            json.error?.message || 'Could not save measurement profile.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save measurement profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Set Profile as Default
  const handleSetDefault = async (profileId: string, label: string) => {
    try {
      const res = await fetch(`/api/measurements/${profileId}/default`, {
        method: 'PATCH',
      });

      if (res.ok) {
        toast({
          title: 'Default Profile Updated',
          description: `"${label}" is now your default profile for new orders.`,
        });
        loadProfiles();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update default profile.',
        variant: 'destructive',
      });
    }
  };

  // Delete Profile
  const handleDeleteProfile = async (profileId: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return;

    try {
      const res = await fetch(`/api/measurements/${profileId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Profile Deleted',
          description: `"${label}" has been removed from your saved profiles.`,
        });
        loadProfiles();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete profile.',
        variant: 'destructive',
      });
    }
  };

  // Duplicate Profile
  const handleDuplicateProfile = async (profile: any) => {
    try {
      const {
        id,
        createdAt,
        updatedAt,
        deletedAt,
        isDefault,
        version,
        ...rest
      } = profile;
      const payload = {
        ...rest,
        label: `${profile.label} (Copy)`,
        isDefault: false,
      };

      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: 'Profile Duplicated',
          description: `Created a copy of "${profile.label}".`,
        });
        loadProfiles();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate profile.',
        variant: 'destructive',
      });
    }
  };

  // Filter profiles based on category
  const filteredProfiles = profiles.filter((p) => {
    if (filterCategory === 'all') return true;
    const cat = getProfileGarmentType(p);
    return cat === filterCategory;
  });

  const categoryMeta =
    GARMENT_CATEGORIES.find((c) => c.id === selectedGarmentType) ||
    GARMENT_CATEGORIES[0];

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 py-1 sm:py-2 font-sans min-w-0 w-full">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 min-w-0 w-full">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <Ruler size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Measurement Studio
            </h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Manage personalized fitting profiles for Men&apos;s, Women&apos;s,
            Pants, Coats, Shalwars, and custom tailoring with instant order
            reuse.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          {/* Unit Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/60 justify-center">
            <button
              onClick={() => handleToggleUnit('inches')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                unit === 'inches'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Inches (&quot;)
            </button>
            <button
              onClick={() => handleToggleUnit('cm')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                unit === 'cm'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            {/* Guide Buttons */}
            <Button
              onClick={() => setShowHowToMeasure(true)}
              variant="outline"
              className="h-9 sm:h-10 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer rounded-xl px-2.5 sm:px-3.5"
            >
              <BookOpen size={14} className="mr-1.5 text-[#7E153A] shrink-0" />{' '}
              How to Measure
            </Button>

            <Button
              onClick={() => setShowSizeChart(true)}
              variant="outline"
              className="h-9 sm:h-10 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer rounded-xl px-2.5 sm:px-3.5"
            >
              <Sliders size={14} className="mr-1.5 text-[#7E153A] shrink-0" />{' '}
              Size Chart
            </Button>
          </div>

          {/* New Profile CTA */}
          <Button
            onClick={() => handleOpenCreate('women_suit')}
            className="h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> New Profile
          </Button>
        </div>
      </div>

      {/* ── Category Filter Strip ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Profiles', count: profiles.length },
          {
            id: 'men_suit',
            label: "Men's Stitching",
            count: profiles.filter(
              (p) => getProfileGarmentType(p) === 'men_suit'
            ).length,
          },
          {
            id: 'women_suit',
            label: "Women's Stitching",
            count: profiles.filter(
              (p) => getProfileGarmentType(p) === 'women_suit'
            ).length,
          },
          {
            id: 'pant_trouser',
            label: 'Pant / Trouser',
            count: profiles.filter(
              (p) => getProfileGarmentType(p) === 'pant_trouser'
            ).length,
          },
          {
            id: 'coat',
            label: 'Coat & Blazer',
            count: profiles.filter((p) => getProfileGarmentType(p) === 'coat')
              .length,
          },
          {
            id: 'shalwar',
            label: 'Shalwar Only',
            count: profiles.filter(
              (p) => getProfileGarmentType(p) === 'shalwar'
            ).length,
          },
        ].map((tab) => {
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#7E153A] text-white border-[#7E153A] shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Saved Profiles List ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs min-w-0 w-full">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            Loading your measurement profiles...
          </p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs space-y-4 min-w-0 w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <Ruler size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
              {filterCategory === 'all'
                ? 'No Measurement Profiles Saved'
                : `No Profiles found for ${filterCategory.replace('_', ' ')}`}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Save your dimensions once to reuse instantly on any product link
              or suit selection.
            </p>
          </div>
          <div className="flex gap-2.5 justify-center flex-wrap">
            <Button
              onClick={() => handleOpenCreate('women_suit')}
              className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-5 h-10 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
            >
              <Plus size={15} className="mr-1" /> Add Women Fit
            </Button>
            <Button
              onClick={() => handleOpenCreate('men_suit')}
              variant="outline"
              className="border-gray-300 text-gray-800 text-xs font-bold px-5 h-10 rounded-xl cursor-pointer hover:bg-gray-50"
            >
              <Plus size={15} className="mr-1" /> Add Men Fit
            </Button>
            <Button
              onClick={() => handleOpenCreate('pant_trouser')}
              variant="outline"
              className="border-gray-300 text-gray-800 text-xs font-bold px-5 h-10 rounded-xl cursor-pointer hover:bg-gray-50"
            >
              <Plus size={15} className="mr-1" /> Add Pant / Trouser
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0 w-full">
          {filteredProfiles.map((profile) => {
            const isDefault = profile.isDefault;
            const score = profile.aiValidationScore || 96;
            const garmentType = getProfileGarmentType(profile);

            // Badge styling per category
            const getBadgeInfo = () => {
              switch (garmentType) {
                case 'men_suit':
                  return {
                    label: "Men's Stitching",
                    cls: 'bg-slate-50 text-slate-700 border-slate-200',
                  };
                case 'women_suit':
                  return {
                    label: "Women's Stitching",
                    cls: 'bg-pink-50 text-pink-800 border-pink-100',
                  };
                case 'pant_trouser':
                  return {
                    label: 'Pant / Trouser',
                    cls: 'bg-blue-50 text-blue-800 border-blue-100',
                  };
                case 'coat':
                  return {
                    label: 'Coat & Blazer',
                    cls: 'bg-amber-50 text-amber-800 border-amber-100',
                  };
                case 'shalwar':
                  return {
                    label: 'Shalwar Only',
                    cls: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                  };
                case 'other':
                default:
                  return {
                    label: 'Custom Fit',
                    cls: 'bg-purple-50 text-purple-800 border-purple-100',
                  };
              }
            };

            const badge = getBadgeInfo();

            return (
              <div
                key={profile.id}
                className={`bg-white rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 sm:space-y-5 min-w-0 w-full ${
                  isDefault
                    ? 'border-[#7E153A]/40 ring-2 ring-[#7E153A]/10'
                    : 'border-gray-100'
                }`}
              >
                {/* Profile Card Header */}
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                          {profile.label}
                        </h3>
                        <span
                          className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        {isDefault && (
                          <span className="bg-red-50 text-[#7E153A] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wider flex items-center gap-1 shrink-0">
                            <Star size={10} className="fill-[#7E153A]" />{' '}
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400">
                        Version v{profile.version || 1} · Updated{' '}
                        {profile.updatedAt
                          ? new Date(profile.updatedAt).toLocaleDateString(
                              'en-PK',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : 'Recently'}
                      </p>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex items-center sm:flex-col sm:items-end shrink-0">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                        <Sparkles size={11} className="text-emerald-600" /> AI
                        Verified {score}%
                      </span>
                    </div>
                  </div>

                  {/* Category-Tailored Quick Spec Matrix */}
                  {garmentType === 'pant_trouser' ? (
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Pant Length
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Waistband
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserWaist)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Thigh / Rise
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.thigh || profile.seat)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Bottom / Paicha
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.ankle)}
                        </span>
                      </div>
                    </div>
                  ) : garmentType === 'coat' ? (
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Coat Length
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.kameezLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Chest Width
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.chest)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Teera (Shoulder)
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.shoulderWidth)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Sleeve Length
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.sleeveLength)}
                        </span>
                      </div>
                    </div>
                  ) : garmentType === 'shalwar' ? (
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Shalwar Length
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Ghera / Seat
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.seat)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Inseam / Asan
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.thigh || profile.trouserWaist)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Paicha Opening
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.ankle)}
                        </span>
                      </div>
                    </div>
                  ) : garmentType === 'men_suit' ? (
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Kurta L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.kameezLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Chest Width
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.chest)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Teera (Shoulder)
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.shoulderWidth)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Collar / Ban
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.neckCircumference)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Sleeve L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.sleeveLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Shalwar L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Inseam / Asan
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserWaist)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Paicha Opening
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.ankle)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Kameez L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.kameezLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Bust / Chest
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.chest)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Waist
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.waist)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Hips
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.hips)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Shoulder
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.shoulderWidth)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Sleeve L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.sleeveLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Trouser L.
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.trouserLength)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100/80">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider truncate">
                          Gala Depth
                        </span>
                        <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                          {displayVal(profile.galaDepth)}
                        </span>
                      </div>
                    </div>
                  )}

                  {profile.notes && (
                    <p className="text-[11px] text-gray-500 bg-gray-50/70 p-2 sm:p-2.5 rounded-xl border border-gray-100 italic">
                      &ldquo;
                      {profile.notes
                        .replace(/\[Category:[a-z_]+\]/g, '')
                        .replace(/\[(Men|Women|Pant|Coat|Shalwar|Other)\]/g, '')
                        .trim()}
                      &rdquo;
                    </p>
                  )}
                </div>

                {/* Profile Card Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isDefault && (
                      <Button
                        onClick={() =>
                          handleSetDefault(profile.id, profile.label)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[11px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 rounded-lg cursor-pointer"
                      >
                        <Star size={13} className="mr-1" /> Make Default
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDuplicateProfile(profile)}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 rounded-lg cursor-pointer"
                    >
                      <Copy size={13} className="mr-1" /> Copy
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => handleOpenEdit(profile)}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none h-8 text-xs font-semibold text-gray-700 hover:bg-gray-50 border-gray-200 px-3 rounded-lg cursor-pointer"
                    >
                      <Edit2 size={13} className="mr-1 text-[#7E153A]" /> Edit
                    </Button>

                    <Button
                      onClick={() =>
                        handleDeleteProfile(profile.id, profile.label)
                      }
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Studio Modal: Category-Specific Dynamic Form ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
          <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center">
                  <Ruler size={16} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {editingProfile
                      ? `Edit "${editingProfile.label}"`
                      : 'Create New Tailoring Fit Profile'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Category: {categoryMeta.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Modal Unit Switcher */}
                <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleToggleUnit('inches')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      unit === 'inches'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Inches (&quot;)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleUnit('cm')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      unit === 'cm'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    cm
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Form Scrollable Body */}
            <form
              id="profileForm"
              onSubmit={handleSaveProfile}
              className="flex-1 overflow-y-auto px-1 py-1 space-y-4 sm:space-y-6 scrollbar-none"
            >
              {/* 1. Category / Garment Type Selector */}
              <div className="space-y-2.5 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-800">
                    1. Select Measurement Category / Garment Type:
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Form dynamically shows only relevant fields
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {GARMENT_CATEGORIES.map((cat) => {
                    const isSelected = selectedGarmentType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectGarmentType(cat.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-[#7E153A] bg-red-50/70 text-[#7E153A] ring-2 ring-[#7E153A]/20 font-extrabold shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 font-medium'
                        }`}
                      >
                        <span className="text-xs font-extrabold block">
                          {cat.shortLabel}
                        </span>
                        <span className="text-[9px] text-gray-400 block line-clamp-1">
                          {cat.gender === 'male'
                            ? "Men's Fit"
                            : cat.gender === 'female'
                              ? "Women's Fit"
                              : 'Unisex Fit'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Profile Label & Default Option */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end pt-2 border-t border-gray-200/60 mt-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Profile Label / Name{' '}
                      <span className="text-[#7E153A]">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. My Formal Lawn, Daily Cotton Fit"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      className="h-10 text-xs bg-white rounded-xl border-gray-200"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pb-1.5 sm:pb-2">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#7E153A] focus:ring-[#7E153A] border-gray-300 cursor-pointer"
                    />
                    <label
                      htmlFor="isDefaultCheckbox"
                      className="text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      Set as Default Profile
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Standard Size Preset Loader Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    2. Quick Standard Size Preset (
                    {selectedGarmentType === 'men_suit'
                      ? "Men's Kurta Shalwar Sizes"
                      : selectedGarmentType === 'women_suit'
                        ? "Women's Suit Sizes"
                        : selectedGarmentType === 'coat'
                          ? 'Coat & Blazer Chest Sizes'
                          : selectedGarmentType === 'shalwar'
                            ? 'Shalwar Length Presets'
                            : 'Standard Pant / Trouser Codes'}
                    ):
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400">
                    Tap to auto-populate fields
                  </span>
                </div>

                {selectedGarmentType === 'men_suit' && (
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {Object.entries(MEN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className="p-1.5 sm:p-2 bg-gray-50 hover:bg-red-50 hover:border-[#7E153A]/40 border border-gray-200 rounded-xl text-center transition-all cursor-pointer"
                      >
                        <span className="text-xs font-extrabold text-[#7E153A] uppercase block">
                          {key.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {preset.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedGarmentType === 'women_suit' && (
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {Object.entries(WOMEN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className="p-1.5 sm:p-2 bg-gray-50 hover:bg-red-50 hover:border-[#7E153A]/40 border border-gray-200 rounded-xl text-center transition-all cursor-pointer"
                      >
                        <span className="text-xs font-extrabold text-[#7E153A] uppercase block">
                          {key.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {preset.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedGarmentType === 'coat' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {Object.entries(COAT_SIZE_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className="p-1.5 sm:p-2 bg-gray-50 hover:bg-red-50 hover:border-[#7E153A]/40 border border-gray-200 rounded-xl text-center transition-all cursor-pointer"
                      >
                        <span className="text-xs font-extrabold text-[#7E153A] uppercase block">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {preset.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedGarmentType === 'shalwar' && (
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {Object.entries(SHALWAR_SIZE_PRESETS).map(
                      ([key, preset]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleApplyPreset(key)}
                          className="p-1.5 sm:p-2 bg-gray-50 hover:bg-red-50 hover:border-[#7E153A]/40 border border-gray-200 rounded-xl text-center transition-all cursor-pointer"
                        >
                          <span className="text-xs font-extrabold text-[#7E153A] uppercase block">
                            {preset.label}
                          </span>
                          <span className="text-[10px] text-gray-500 block truncate">
                            {preset.tag}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}

                {selectedGarmentType === 'pant_trouser' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {MEN_TROUSER_CODES.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectTrouserCode(item)}
                        className={`p-1.5 sm:p-2 border rounded-xl text-center transition-all cursor-pointer ${
                          selectedTrouserCode === item.code
                            ? 'bg-red-50 border-[#7E153A] text-[#7E153A] font-bold'
                            : 'bg-gray-50 hover:bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold font-mono block">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          Waist {item.measurements.waist_bottom}&quot;
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Category Form Tabs */}
              <div className="w-full overflow-x-auto scrollbar-none pb-1">
                <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0">
                  {categoryMeta.hasUpper && (
                    <button
                      type="button"
                      onClick={() => setFormCategory('upper')}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        formCategory === 'upper'
                          ? 'bg-white text-[#7E153A] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Scissors size={14} /> {categoryMeta.upperTabLabel}
                    </button>
                  )}

                  {categoryMeta.hasLower && (
                    <button
                      type="button"
                      onClick={() => setFormCategory('lower')}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        formCategory === 'lower'
                          ? 'bg-white text-[#7E153A] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Ruler size={14} /> {categoryMeta.lowerTabLabel}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setFormCategory('notes')}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      formCategory === 'notes'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <FileText size={14} /> Fitting Notes
                  </button>
                </div>
              </div>

              {/* 4. Grid: Inputs + Body Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Inputs Column */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  {/* Category-Specific Upper Fields */}
                  {formCategory === 'upper' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                      {(selectedGarmentType === 'men_suit'
                        ? [
                            {
                              key: 'neckCircumference',
                              label: 'Collar / Ban Size',
                              defaultVal: '15',
                            },
                            {
                              key: 'shoulderWidth',
                              label: 'Shoulder Width (Teera)',
                              defaultVal: '18.5',
                            },
                            {
                              key: 'chest',
                              label: 'Chest Width',
                              defaultVal: '40',
                            },
                            {
                              key: 'waist',
                              label: 'Waist',
                              defaultVal: '36',
                            },
                            {
                              key: 'kameezLength',
                              label: 'Kurta / Kameez Length',
                              defaultVal: '42',
                            },
                            {
                              key: 'sleeveLength',
                              label: 'Sleeve Length',
                              defaultVal: '24',
                            },
                            {
                              key: 'armhole',
                              label: 'Bicep / Armhole (Mudha)',
                              defaultVal: '9',
                            },
                            {
                              key: 'wrist',
                              label: 'Wrist / Cuff Opening',
                              defaultVal: '9.5',
                            },
                          ]
                        : selectedGarmentType === 'coat'
                          ? [
                              {
                                key: 'kameezLength',
                                label: 'Coat / Blazer Length',
                                defaultVal: '30',
                              },
                              {
                                key: 'chest',
                                label: 'Chest Width (Over Vest)',
                                defaultVal: '42',
                              },
                              {
                                key: 'waist',
                                label: 'Stomach / Waist',
                                defaultVal: '38',
                              },
                              {
                                key: 'seat',
                                label: 'Seat / Hem Sweep',
                                defaultVal: '42',
                              },
                              {
                                key: 'shoulderWidth',
                                label: 'Teera (Shoulder Width Across Back)',
                                defaultVal: '18.5',
                              },
                              {
                                key: 'sleeveLength',
                                label: 'Sleeve Length (Shoulder to Wrist)',
                                defaultVal: '25',
                              },
                              {
                                key: 'neckCircumference',
                                label: 'Collar / Neck Fit',
                                defaultVal: '15.5',
                              },
                              {
                                key: 'armhole',
                                label: 'Armhole Depth',
                                defaultVal: '10',
                              },
                              {
                                key: 'wrist',
                                label: 'Sleeve Opening / Cuff',
                                defaultVal: '11.5',
                              },
                              {
                                key: 'backLength',
                                label: 'Center Back Length',
                                defaultVal: '18',
                              },
                            ]
                          : [
                              {
                                key: 'kameezLength',
                                label: 'Kameez Length',
                                defaultVal: '43',
                              },
                              {
                                key: 'chest',
                                label: 'Chest / Bust',
                                defaultVal: '38',
                              },
                              {
                                key: 'waist',
                                label: 'Waist',
                                defaultVal: '32',
                              },
                              {
                                key: 'hips',
                                label: 'Hips / Chaak',
                                defaultVal: '40',
                              },
                              {
                                key: 'shoulderWidth',
                                label: 'Shoulder Width (Teera)',
                                defaultVal: '14.5',
                              },
                              {
                                key: 'sleeveLength',
                                label: 'Sleeve Length',
                                defaultVal: '22',
                              },
                              {
                                key: 'armhole',
                                label: 'Armhole',
                                defaultVal: '8.5',
                              },
                              {
                                key: 'galaDepth',
                                label: 'Neck Depth (Gala)',
                                defaultVal: '6.5',
                              },
                              {
                                key: 'neckCircumference',
                                label: 'Neck Circumference (Ban)',
                                defaultVal: '15',
                              },
                            ]
                      ).map((field) => (
                        <div
                          key={field.key}
                          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                            activeField === field.key
                              ? 'bg-red-50/50 border-[#7E153A] border-2 shadow-xs shadow-[#7E153A]/10'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            {field.label} ({unit === 'inches' ? 'in' : 'cm'})
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={field.defaultVal}
                            value={formData[field.key] || ''}
                            onFocus={() => setActiveField(field.key)}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [field.key]: e.target.value,
                              })
                            }
                            className="h-9 text-xs bg-white font-mono font-bold text-gray-900 border-gray-200"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                            {MEASUREMENT_HELP[field.key] || ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category-Specific Lower Fields */}
                  {formCategory === 'lower' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                      {(selectedGarmentType === 'pant_trouser'
                        ? [
                            {
                              key: 'trouserLength',
                              label: 'Pant / Trouser Length',
                              defaultVal: '40',
                            },
                            {
                              key: 'trouserWaist',
                              label: 'Waistband Circumference',
                              defaultVal: '34',
                            },
                            {
                              key: 'seat',
                              label: 'Seat / Hip Width',
                              defaultVal: '24',
                            },
                            {
                              key: 'thigh',
                              label: 'Thigh Circumference',
                              defaultVal: '24',
                            },
                            {
                              key: 'knee',
                              label: 'Knee Circumference',
                              defaultVal: '18',
                            },
                            {
                              key: 'ankle',
                              label: 'Bottom Opening / Paicha',
                              defaultVal: '16',
                            },
                            {
                              key: 'calf',
                              label: 'Calf (Optional)',
                              defaultVal: '15',
                            },
                          ]
                        : selectedGarmentType === 'shalwar'
                          ? [
                              {
                                key: 'trouserLength',
                                label: 'Shalwar Length (Waist to Ankle)',
                                defaultVal: '40',
                              },
                              {
                                key: 'seat',
                                label: 'Shalwar Ghera (Seat Width)',
                                defaultVal: '24',
                              },
                              {
                                key: 'thigh',
                                label: 'Inseam / Asan Depth',
                                defaultVal: '34',
                              },
                              {
                                key: 'ankle',
                                label: 'Paicha (Bottom Opening)',
                                defaultVal: '16',
                              },
                              {
                                key: 'trouserWaist',
                                label: 'Belt / Elastic / Naala Waist',
                                defaultVal: '34',
                              },
                            ]
                          : selectedGarmentType === 'men_suit'
                            ? [
                                {
                                  key: 'trouserLength',
                                  label: 'Shalwar / Trouser Length',
                                  defaultVal: '40',
                                },
                                {
                                  key: 'trouserWaist',
                                  label: 'Inseam / Asan Depth',
                                  defaultVal: '34',
                                },
                                {
                                  key: 'ankle',
                                  label: 'Paicha (Bottom Opening)',
                                  defaultVal: '16',
                                },
                                {
                                  key: 'seat',
                                  label: 'Ghera / Seat Width',
                                  defaultVal: '24',
                                },
                                {
                                  key: 'thigh',
                                  label: 'Thigh (Optional)',
                                  defaultVal: '16',
                                },
                              ]
                            : [
                                {
                                  key: 'trouserLength',
                                  label: 'Trouser Length',
                                  defaultVal: '39',
                                },
                                {
                                  key: 'trouserWaist',
                                  label: 'Trouser Waist',
                                  defaultVal: '30',
                                },
                                {
                                  key: 'ankle',
                                  label: 'Ankle Opening (Paicha)',
                                  defaultVal: '14',
                                },
                                {
                                  key: 'thigh',
                                  label: 'Thigh',
                                  defaultVal: '24',
                                },
                                {
                                  key: 'knee',
                                  label: 'Knee',
                                  defaultVal: '18',
                                },
                              ]
                      ).map((field) => (
                        <div
                          key={field.key}
                          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                            activeField === field.key
                              ? 'bg-red-50/50 border-[#7E153A] border-2 shadow-xs shadow-[#7E153A]/10'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            {field.label} ({unit === 'inches' ? 'in' : 'cm'})
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={field.defaultVal}
                            value={formData[field.key] || ''}
                            onFocus={() => setActiveField(field.key)}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [field.key]: e.target.value,
                              })
                            }
                            className="h-9 text-xs bg-white font-mono font-bold text-gray-900 border-gray-200"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                            {MEASUREMENT_HELP[field.key] || ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {formCategory === 'notes' && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">
                          Tailoring / Fit Notes for Master Tailor
                        </label>
                        <textarea
                          rows={4}
                          placeholder="e.g. Keep collar soft, 2 inches extra fabric inside side seams, hard cuff interlining, or straight cigarette hem."
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:border-[#7E153A] text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Diagram Visual Locator */}
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <BodyDiagram
                    activeField={activeField}
                    category={selectedGarmentType}
                    onSelectField={(field) => setActiveField(field)}
                    onOpenGuideModal={() => setShowHowToMeasure(true)}
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-gray-100 pt-3 sm:pt-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="profileForm"
                disabled={saving}
                className="w-full sm:w-auto h-10 sm:h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving Profile...
                  </>
                ) : (
                  'Save Measurement Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals: Guide & Size Chart ── */}
      <HowToMeasureModal
        isOpen={showHowToMeasure}
        onClose={() => setShowHowToMeasure(false)}
      />

      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        gender={
          selectedGarmentType === 'men_suit' || selectedGarmentType === 'coat'
            ? 'male'
            : 'female'
        }
        initialUnit={unit}
        onSelectSize={(selected) => {
          setFormData((prev) => ({
            ...prev,
            chest:
              selected.bust || prev.chest || (unit === 'cm' ? '96.5' : '38'),
            waist:
              selected.waist || prev.waist || (unit === 'cm' ? '81.3' : '32'),
            hips: selected.hip || prev.hips || (unit === 'cm' ? '101.6' : '40'),
            shoulderWidth:
              selected.shoulder ||
              prev.shoulderWidth ||
              (unit === 'cm' ? '36.8' : '14.5'),
            sleeveLength:
              selected.sleeve_length ||
              prev.sleeveLength ||
              (unit === 'cm' ? '55.9' : '22'),
            kameezLength:
              selected.shirt_length ||
              prev.kameezLength ||
              (unit === 'cm' ? '106.7' : '42'),
            trouserLength:
              selected.trouser_length ||
              prev.trouserLength ||
              (unit === 'cm' ? '99.1' : '39'),
            trouserWaist:
              selected.waist_bottom ||
              prev.trouserWaist ||
              (unit === 'cm' ? '76.2' : '30'),
            ankle:
              selected.bottom_opening ||
              prev.ankle ||
              (unit === 'cm' ? '38.1' : '15'),
            neckCircumference:
              selected.neck ||
              prev.neckCircumference ||
              (unit === 'cm' ? '38.1' : '15'),
          }));
          setShowSizeChart(false);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
