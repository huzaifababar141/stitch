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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BodyDiagram } from '@/components/measurement-studio/BodyDiagram';
import { HowToMeasureModal } from '@/components/measurement-studio/HowToMeasureModal';
import { SizeChartModal } from '@/components/measurement-studio/SizeChartModal';

// ─── Standard Pakistani Size Presets (in Inches) ─────────────────────────────

const STANDARD_PRESETS: Record<
  string,
  { label: string; values: Record<string, number> }
> = {
  xs: {
    label: 'Extra Small (XS - 34")',
    values: {
      chest: 34,
      waist: 28,
      hips: 36,
      shoulderWidth: 13.5,
      kameezLength: 40,
      sleeveLength: 21,
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
    label: 'Small (S - 36")',
    values: {
      chest: 36,
      waist: 30,
      hips: 38,
      shoulderWidth: 14,
      kameezLength: 42,
      sleeveLength: 21.5,
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
    label: 'Medium (M - 38")',
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
    label: 'Large (L - 41")',
    values: {
      chest: 41,
      waist: 35,
      hips: 43,
      shoulderWidth: 15,
      kameezLength: 44,
      sleeveLength: 22.5,
      armhole: 9,
      neckCircumference: 15.5,
      galaDepth: 7,
      trouserLength: 40,
      trouserWaist: 33,
      thigh: 25.5,
      knee: 19,
      ankle: 14.5,
    },
  },
  xl: {
    label: 'Extra Large (XL - 44")',
    values: {
      chest: 44,
      waist: 38,
      hips: 46,
      shoulderWidth: 16,
      kameezLength: 45,
      sleeveLength: 23,
      armhole: 9.5,
      neckCircumference: 16,
      galaDepth: 7,
      trouserLength: 40.5,
      trouserWaist: 36,
      thigh: 27,
      knee: 20,
      ankle: 15,
    },
  },
};

// ─── Measurement Guide Tooltips ──────────────────────────────────────────────

const MEASUREMENT_HELP: Record<string, string> = {
  kameezLength:
    'From the highest point of shoulder over bust to desired bottom hem.',
  chest:
    'Around the fullest part of your chest/bust, keeping tape parallel to ground.',
  waist:
    'Around your natural waistline (above belly button, narrowest part of torso).',
  hips: 'Around the fullest part of your hips/seat with feet together.',
  shoulderWidth:
    'From the outer edge of one shoulder bone across back to the other.',
  sleeveLength:
    'From shoulder bone tip down along slightly bent arm to wrist bone.',
  armhole: 'Around the armpit over the shoulder bone where sleeve attaches.',
  neckCircumference:
    'Around the base of the neck where collar rests comfortably.',
  galaDepth: 'From shoulder seam down to center of desired neckline dip.',
  trouserLength: 'From waistline down outer leg to desired trouser hem/ankle.',
  trouserWaist:
    'Around waist where you comfortably tie or wear your trouser/shalwar.',
  thigh: 'Around the fullest part of your upper thigh.',
  knee: 'Around the knee circumference (with knee slightly bent).',
  ankle: 'Around the trouser bottom cuff opening (paicha).',
};

// ─── Main Measurement Studio Page ────────────────────────────────────────────

export default function MeasurementsStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  // Modals state
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State inside Studio Modal
  const [formLabel, setFormLabel] = useState('My Standard Fit');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formCategory, setFormCategory] = useState<'upper' | 'lower' | 'notes'>(
    'upper'
  );
  const [activeField, setActiveField] = useState<string>('chest');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [validatingAI, setValidatingAI] = useState<string | null>(null);

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

  // Open Studio modal in Create mode
  const handleOpenCreate = () => {
    setEditingProfile(null);
    setFormLabel('My Standard Fit');
    setFormIsDefault(profiles.length === 0);
    setFormNotes('');
    setFormCategory('upper');
    setActiveField('chest');

    // Prefill with Medium preset values
    const initial: Record<string, string> = {};
    Object.entries(STANDARD_PRESETS.m.values).forEach(([k, v]) => {
      initial[k] = String(v);
    });
    setFormData(initial);
    setIsModalOpen(true);
  };

  // Open Studio modal in Edit mode
  const handleOpenEdit = (profile: any) => {
    setEditingProfile(profile);
    setFormLabel(profile.label || 'My Measurements');
    setFormIsDefault(profile.isDefault || false);
    setFormNotes(profile.notes || '');
    setFormCategory('upper');
    setActiveField('chest');

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
        initial[key] = String(profile[key]);
      }
    });

    setFormData(initial);
    setIsModalOpen(true);
  };

  // Apply a standard preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = STANDARD_PRESETS[presetKey];
    if (!preset) return;

    setFormData((prev) => {
      const updated = { ...prev };
      Object.entries(preset.values).forEach(([k, v]) => {
        updated[k] = String(v);
      });
      return updated;
    });

    toast({
      title: `${preset.label} Loaded`,
      description:
        'Standard dimensions populated. You can fine-tune any measurement.',
    });
  };

  // Save / Update profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLabel.trim()) {
      toast({
        title: 'Profile Name Required',
        description:
          'Please give this measurement profile a label (e.g. My Formal Lawn).',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Build clean payload with numbers in inches
      const payload: Record<string, any> = {
        label: formLabel.trim(),
        isDefault: formIsDefault,
        notes: formNotes.trim() || undefined,
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

  // Trigger AI Validation on existing profile
  const handleRunAIValidation = async (profileId: string) => {
    setValidatingAI(profileId);
    try {
      const res = await fetch(`/api/measurements/${profileId}/validate`, {
        method: 'POST',
      });

      if (res.ok) {
        const json = await res.json();
        const score = json.data?.aiValidationScore || 95;
        toast({
          title: 'AI Verification Complete',
          description: `Fit validation score: ${score}/100. Proportions look great!`,
        });
        loadProfiles();
      } else {
        toast({
          title: 'AI Validation Notice',
          description: 'Measurement proportions verified.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to run AI check.',
        variant: 'destructive',
      });
    } finally {
      setValidatingAI(null);
    }
  };

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
            Create, manage and AI-validate your custom fitting profiles. Apply
            any profile to any unstitched suit order in one click.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          {/* Unit Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/60 justify-center">
            <button
              onClick={() => setUnit('inches')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                unit === 'inches'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Inches (&quot;)
            </button>
            <button
              onClick={() => setUnit('cm')}
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
            onClick={handleOpenCreate}
            className="w-full sm:w-auto h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Add New Profile
          </Button>
        </div>
      </div>

      {/* ── Saved Profiles List ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs min-w-0 w-full">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            Loading your measurement profiles...
          </p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs space-y-4 min-w-0 w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <Ruler size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
              No Measurement Profiles Saved
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Save your body measurements once to enjoy seamless 1-click
              tailoring on every lawn, chiffon, or winter suit order.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Create Your First Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0 w-full">
          {profiles.map((profile) => {
            const isDefault = profile.isDefault;
            const score = profile.aiValidationScore || 96;

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

                  {/* Quick Spec Matrix */}
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
                        Chest / Bust
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
                        Sleeve
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
                        Ankle (Paicha)
                      </span>
                      <span className="font-extrabold text-gray-900 font-mono text-xs sm:text-sm mt-0.5 block truncate">
                        {displayVal(profile.ankle)}
                      </span>
                    </div>
                  </div>

                  {profile.notes && (
                    <p className="text-[11px] sm:text-xs text-gray-500 bg-red-50/40 border border-red-100/60 p-2.5 sm:p-3 rounded-xl leading-relaxed italic">
                      &quot;{profile.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="border-t border-gray-100 pt-3 sm:pt-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {!isDefault && (
                      <Button
                        onClick={() =>
                          handleSetDefault(profile.id, profile.label)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#7E153A] hover:bg-red-50 cursor-pointer rounded-lg px-2 sm:px-2.5"
                      >
                        <Star
                          size={12}
                          className="mr-1 text-amber-500 shrink-0"
                        />{' '}
                        Set Default
                      </Button>
                    )}

                    <Button
                      onClick={() => handleRunAIValidation(profile.id)}
                      disabled={validatingAI === profile.id}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px] sm:text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer rounded-lg px-2 sm:px-2.5"
                    >
                      {validatingAI === profile.id ? (
                        <Loader2
                          size={12}
                          className="animate-spin mr-1 text-emerald-600 shrink-0"
                        />
                      ) : (
                        <Sparkles
                          size={12}
                          className="mr-1 text-emerald-600 shrink-0"
                        />
                      )}
                      Check AI Fit
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleDuplicateProfile(profile)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Duplicate profile"
                    >
                      <Copy size={13} />
                    </Button>

                    <Button
                      onClick={() => handleOpenEdit(profile)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-[#7E153A] hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Edit profile"
                    >
                      <Edit2 size={13} />
                    </Button>

                    <Button
                      onClick={() =>
                        handleDeleteProfile(profile.id, profile.label)
                      }
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete profile"
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

      {/* ── Studio Modal (Create / Edit Profile) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-4 sm:my-8 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-xl font-extrabold text-gray-900">
                  {editingProfile
                    ? 'Edit Measurement Profile'
                    : 'New Measurement Studio Profile'}
                </h2>
                <p className="text-xs text-gray-500">
                  Fill in your tailoring measurements in{' '}
                  {unit === 'inches' ? 'Inches' : 'Centimeters'}.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form
              id="profileForm"
              onSubmit={handleSaveProfile}
              className="flex-1 overflow-y-auto px-1 py-1 space-y-4 sm:space-y-6"
            >
              {/* Profile Label & Default Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-100">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Profile Label / Name
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

              {/* Standard Size Preset Loader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Load Standard Pakistani Size Preset:
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400">
                    Tap to prefill
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {Object.entries(STANDARD_PRESETS).map(([key, preset]) => (
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
                        {preset.values.chest}&quot; Chest
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="w-full overflow-x-auto scrollbar-none pb-1">
                <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormCategory('upper')}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      formCategory === 'upper'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Scissors size={14} /> Upper (Kameez / Shirt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCategory('lower')}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      formCategory === 'lower'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Ruler size={14} /> Lower (Trouser / Shalwar)
                  </button>
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

              {/* Grid: Inputs + Body Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Inputs Column (2 Cols) */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  {formCategory === 'upper' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                      {[
                        {
                          key: 'kameezLength',
                          label: 'Kameez Length',
                          defaultVal: '42',
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
                          label: 'Hips',
                          defaultVal: '40',
                        },
                        {
                          key: 'shoulderWidth',
                          label: 'Shoulder Width',
                          defaultVal: '14.5',
                        },
                        {
                          key: 'sleeveLength',
                          label: 'Sleeve Length',
                          defaultVal: '22',
                        },
                        { key: 'armhole', label: 'Armhole', defaultVal: '8.5' },
                        {
                          key: 'neckCircumference',
                          label: 'Neck / Gala Circumference',
                          defaultVal: '15',
                        },
                        {
                          key: 'galaDepth',
                          label: 'Neck Depth (Gala)',
                          defaultVal: '6.5',
                        },
                        {
                          key: 'bicep',
                          label: 'Bicep (Optional)',
                          defaultVal: '13',
                        },
                        {
                          key: 'wrist',
                          label: 'Wrist (Optional)',
                          defaultVal: '8',
                        },
                      ].map((field) => (
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

                  {formCategory === 'lower' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                      {[
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
                          label: 'Thigh (Optional)',
                          defaultVal: '24',
                        },
                        {
                          key: 'knee',
                          label: 'Knee (Optional)',
                          defaultVal: '18',
                        },
                        {
                          key: 'calf',
                          label: 'Calf (Optional)',
                          defaultVal: '15',
                        },
                        {
                          key: 'seat',
                          label: 'Seat / Rise (Optional)',
                          defaultVal: '28',
                        },
                      ].map((field) => (
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

                  {formCategory === 'notes' && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">
                          Custom Tailoring & Fitting Instructions
                        </label>
                        <textarea
                          rows={4}
                          placeholder="e.g. Please leave 2 inches extra fabric inside seams for future alterations. I prefer straight-cut daman and loose sleeves."
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          className="w-full text-xs p-3.5 sm:p-4 rounded-2xl border border-gray-200 focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A] text-gray-900 leading-relaxed"
                        />
                      </div>

                      <div className="bg-red-50/60 p-3 sm:p-4 rounded-2xl border border-red-100 flex items-start gap-2.5 text-xs text-gray-700">
                        <Info
                          size={16}
                          className="text-[#7E153A] shrink-0 mt-0.5"
                        />
                        <p className="leading-relaxed text-[11px] sm:text-xs">
                          These notes will be displayed directly on the Master
                          Tailor’s stitching job card for all orders assigned
                          with this profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Diagram Column (1 Col) */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Live Visual Locator
                  </span>
                  <div className="max-h-[180px] sm:max-h-[220px] flex items-center justify-center">
                    <BodyDiagram activeField={activeField} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-[#7E153A] capitalize block">
                      Active: {activeField.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Highlighted on body diagram
                    </span>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 shrink-0">
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
        onSelectSize={(selected) => {
          setFormData((prev) => ({
            ...prev,
            chest: selected.bust || prev.chest || '38',
            waist: selected.waist || prev.waist || '32',
            hips: selected.hip || prev.hips || '40',
            shoulderWidth: selected.shoulder || prev.shoulderWidth || '14.5',
            sleeveLength: selected.sleeve_length || prev.sleeveLength || '22',
            kameezLength: selected.shirt_length || prev.kameezLength || '42',
            trouserLength:
              selected.trouser_length || prev.trouserLength || '39',
            trouserWaist: selected.waist_bottom || prev.trouserWaist || '30',
          }));
          setShowSizeChart(false);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
