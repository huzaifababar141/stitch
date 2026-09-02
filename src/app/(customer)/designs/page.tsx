'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Sparkles,
  Scissors,
  Plus,
  ArrowRight,
  Sliders,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  BookOpen,
  Shirt,
  Layers,
  Wand2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// ─── Popular Pakistani Tailoring Starter Templates ────────────────────────────

const STYLE_TEMPLATES = [
  {
    name: 'Formal Ban Gala & Cigarette Pant',
    garmentType: 'full_suit',
    neckStyle: 'Chinese Ban Collar with Front Slit',
    sleeveStyle: 'Straight Sleeves with Organza Border',
    trouserStyle: 'Straight Cigarette Pants (Paicha 13")',
    specialInstructions: 'Add subtle gotta piping on neckline and daman.',
  },
  {
    name: 'Festive Angrakha & Churidar',
    garmentType: 'full_suit',
    neckStyle: 'Overlapping Angrakha with Dori Tassels',
    sleeveStyle: 'Fitted Churidar Sleeves',
    trouserStyle: 'Traditional Gathering Churidar Pajama',
    specialInstructions: 'Lining attached under translucent chiffon fabric.',
  },
  {
    name: 'Casual Lawn Kurti & Tulip Shalwar',
    garmentType: 'two_piece_shirt_trouser',
    neckStyle: 'Soft Boat Neck with V-Keyhole',
    sleeveStyle: 'Bell Sleeve (3/4th length with Lace)',
    trouserStyle: 'Pleated Tulip Shalwar',
    specialInstructions: 'Loose comfort fit with side slits.',
  },
  {
    name: "Men's Classic Kurta Shalwar",
    garmentType: 'kurta_shalwar',
    neckStyle: 'Sherwani Stand Collar with Hidden Placket',
    sleeveStyle: 'Traditional Open Cuff Kurta Sleeves',
    trouserStyle: 'Classic Pakistani Shalwar with 16" Paicha',
    specialInstructions: 'Single front pocket and side seam pocket.',
  },
];

const POPULAR_NECKLINES = [
  'Ban Collar with Slit',
  'Boat Neck (Kashti Gala)',
  'V-Neck with Lace Border',
  'Round Neck with Keyhole',
  'Angrakha Overlap',
  'Sweetheart Neckline',
];

const POPULAR_SLEEVES = [
  'Bell Sleeve (3/4th)',
  'Straight Fit with Organza',
  'Cuff Sleeve with Pearls',
  'Churidar Sleeves',
  'Cape / Kaftan Sleeves',
];

const POPULAR_TROUSERS = [
  'Straight Cigarette Pants',
  'Classic Pakistani Shalwar',
  'Tulip Shalwar',
  'Flared Bootcut Trouser',
  'Wide Leg Culottes / Palazzo',
  'Churidar Pajama',
];

export default function MyDesignsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [garmentType, setGarmentType] = useState('full_suit');
  const [neckStyle, setNeckStyle] = useState('Round Neck with Slit');
  const [sleeveStyle, setSleeveStyle] = useState('Bell Sleeve (3/4th)');
  const [trouserStyle, setTrouserStyle] = useState(
    'Straight Cigarette Pants (Paicha 13")'
  );
  const [specialInstructions, setSpecialInstructions] = useState('');

  const loadDesigns = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/designs');
      if (res.ok) {
        const json = await res.json();
        setDesigns(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to load saved designs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const handleApplyTemplate = (template: (typeof STYLE_TEMPLATES)[0]) => {
    setName(template.name);
    setGarmentType(template.garmentType);
    setNeckStyle(template.neckStyle);
    setSleeveStyle(template.sleeveStyle);
    setTrouserStyle(template.trouserStyle);
    setSpecialInstructions(template.specialInstructions);
    setIsModalOpen(true);
    toast({
      title: 'Template Loaded',
      description: `"${template.name}" specifications loaded into designer.`,
    });
  };

  const handleCreateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Design Name Required',
        description: 'Please give your style preset a recognizable name.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: name.trim(),
          garmentType,
          galaStyle: neckStyle,
          sleeveStyle,
          trouserStyle,
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Style Preset Saved 🎉',
          description:
            'Your design configuration is ready to apply on any order.',
        });
        setIsModalOpen(false);
        resetForm();
        loadDesigns();
      } else {
        const json = await res.json();
        toast({
          title: 'Error Saving Design',
          description: json.error?.message || 'Failed to create style preset.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error Saving Design',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete preset "${label}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Design Preset Removed',
          description: `"${label}" was deleted.`,
        });
        setDesigns((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast({
          title: 'Error Deleting Design',
          description: 'Could not delete preset. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error Deleting Design',
        description: 'Network error.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setGarmentType('full_suit');
    setNeckStyle('Round Neck with Slit');
    setSleeveStyle('Bell Sleeve (3/4th)');
    setTrouserStyle('Straight Cigarette Pants (Paicha 13")');
    setSpecialInstructions('');
  };

  const formatGarmentType = (type: string) => {
    switch (type) {
      case 'full_suit':
        return '3-Piece Shalwar Kameez';
      case 'two_piece_shirt_trouser':
        return '2-Piece Kurti & Trouser';
      case 'shirt_only':
        return '1-Piece Kameez / Kurti';
      case 'kurta_shalwar':
        return "Men's Kurta Shalwar";
      case 'sherwani':
        return 'Designer Sherwani';
      default:
        return 'Custom Suit Cut';
    }
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <Palette size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                My Design Presets
              </h1>
              {designs.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {designs.length} {designs.length === 1 ? 'preset' : 'presets'}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Save your favorite necklines, sleeve cuts, and trouser silhouettes
            to apply instantly to any new tailoring order.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 sm:px-6 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer shrink-0 flex items-center justify-center"
        >
          <Plus size={16} className="mr-1.5 shrink-0" /> Design New Style
        </Button>
      </div>

      {/* ── Quick Starter Inspiration Micro-Strip ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#7E153A]" /> Popular Pakistani
            Cut Templates
          </h3>
          <span className="text-[11px] text-gray-400">1-Tap to customize</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STYLE_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyTemplate(tmpl)}
              className="bg-white rounded-2xl border border-gray-100 p-3.5 hover:border-[#7E153A]/30 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {tmpl.garmentType === 'full_suit'
                      ? '3-Piece'
                      : tmpl.garmentType === 'two_piece_shirt_trouser'
                        ? '2-Piece'
                        : tmpl.garmentType === 'kurta_shalwar'
                          ? "Men's Kurta"
                          : '1-Piece'}
                  </span>
                  <Wand2
                    size={12}
                    className="text-gray-400 group-hover:text-[#7E153A] transition-colors"
                  />
                </div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#7E153A] transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {tmpl.neckStyle} · {tmpl.trouserStyle}
                </p>
              </div>

              <span className="text-[10px] font-bold text-[#7E153A] flex items-center gap-1 pt-1">
                Load Template <ArrowRight size={10} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Saved Designs Grid ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs font-semibold text-gray-600">
            Loading your saved designs...
          </p>
        </div>
      ) : designs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <Palette size={32} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-extrabold text-gray-900">
              No Custom Styles Saved Yet
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Create and save your go-to neck cuts, sleeve cuts, and trouser
              measurements for 1-click tailored order placement.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Create Your First Style Preset
          </Button>
        </div>
      ) : (
        /* Designs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {designs.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border border-red-100/60">
                    {formatGarmentType(style.garmentType)}
                  </span>
                  <button
                    onClick={() => handleDelete(style.id, style.label)}
                    disabled={deletingId === style.id}
                    aria-label="Delete style preset"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  >
                    {deletingId === style.id ? (
                      <Loader2
                        size={15}
                        className="animate-spin text-red-600"
                      />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 break-words">
                  {style.label}
                </h3>

                <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 space-y-2 text-xs">
                  {style.galaStyle && (
                    <div className="flex items-start justify-between gap-2 text-gray-600">
                      <span className="text-gray-400 font-medium shrink-0">
                        Neck Style:
                      </span>
                      <span className="font-bold text-gray-900 text-right break-words">
                        {style.galaStyle}
                      </span>
                    </div>
                  )}
                  {style.sleeveStyle && (
                    <div className="flex items-start justify-between gap-2 text-gray-600">
                      <span className="text-gray-400 font-medium shrink-0">
                        Sleeves:
                      </span>
                      <span className="font-bold text-gray-900 text-right break-words">
                        {style.sleeveStyle}
                      </span>
                    </div>
                  )}
                  {style.trouserStyle && (
                    <div className="flex items-start justify-between gap-2 text-gray-600">
                      <span className="text-gray-400 font-medium shrink-0">
                        Trouser Cut:
                      </span>
                      <span className="font-bold text-gray-900 text-right break-words">
                        {style.trouserStyle}
                      </span>
                    </div>
                  )}
                </div>

                {style.specialInstructions && (
                  <p className="text-xs text-gray-500 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 break-words">
                    &quot;{style.specialInstructions}&quot;
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check size={11} /> Ready to stitch
                </span>

                <Link
                  href={`/new-order?styleConfigId=${style.id}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5">
                    <Scissors size={13} /> Apply to Order
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Style Preset Modal (Bottom Sheet on Mobile) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  Design New Style Preset
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Save custom cutting details for 1-click tailored suit orders
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form
              id="stylePresetForm"
              onSubmit={handleCreateDesign}
              className="flex-1 overflow-y-auto px-1 py-1 pr-2 space-y-4"
            >
              {/* Preset Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Preset Name <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Formal Ban Gala with Cigarette Pant"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
              </div>

              {/* Garment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Garment Type <span className="text-[#7E153A]">*</span>
                </label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className="w-full h-11 sm:h-10 bg-gray-50/80 border border-gray-200 text-xs rounded-xl px-3 font-semibold text-gray-800 focus:outline-hidden focus:border-[#7E153A]"
                >
                  <option value="full_suit">3-Piece Shalwar Kameez</option>
                  <option value="two_piece_shirt_trouser">
                    2-Piece Kurti & Trouser
                  </option>
                  <option value="shirt_only">1-Piece Kameez / Kurti</option>
                  <option value="kurta_shalwar">
                    Men&apos;s Kurta Shalwar
                  </option>
                  <option value="sherwani">Designer Sherwani</option>
                </select>
              </div>

              {/* Neckline / Gala Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Neckline Style (Gala)
                </label>
                <Input
                  value={neckStyle}
                  onChange={(e) => setNeckStyle(e.target.value)}
                  placeholder="e.g. Ban Collar with Placket"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {POPULAR_NECKLINES.map((neck) => (
                    <button
                      key={neck}
                      type="button"
                      onClick={() => setNeckStyle(neck)}
                      className="text-[10px] font-semibold bg-gray-100 hover:bg-red-50 hover:text-[#7E153A] text-gray-700 px-2 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      {neck}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleeve Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Sleeve Style (Asteen)
                </label>
                <Input
                  value={sleeveStyle}
                  onChange={(e) => setSleeveStyle(e.target.value)}
                  placeholder="e.g. Bell Sleeve with Lace"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {POPULAR_SLEEVES.map((slv) => (
                    <button
                      key={slv}
                      type="button"
                      onClick={() => setSleeveStyle(slv)}
                      className="text-[10px] font-semibold bg-gray-100 hover:bg-red-50 hover:text-[#7E153A] text-gray-700 px-2 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      {slv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trouser Silhouette */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Trouser Silhouette (Shalwar / Pajama)
                </label>
                <Input
                  value={trouserStyle}
                  onChange={(e) => setTrouserStyle(e.target.value)}
                  placeholder="e.g. Straight Cigarette Pants (Paicha 13 inches)"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {POPULAR_TROUSERS.map((tr) => (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => setTrouserStyle(tr)}
                      className="text-[10px] font-semibold bg-gray-100 hover:bg-red-50 hover:text-[#7E153A] text-gray-700 px-2 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finishing Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Finishing / Lace / Piping Notes (Optional)
                </label>
                <Input
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Add organza trims on daman, gotta patti on neckline"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="stylePresetForm"
                disabled={saving}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving Preset...
                  </>
                ) : (
                  'Save Style Preset'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
