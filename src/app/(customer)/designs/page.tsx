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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Design Preset Removed',
          description: 'The style preset was deleted.',
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
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <Palette size={14} /> Saved Tailoring Styles
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Design Presets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Save your favorite necklines, sleeve cuts, and trouser silhouettes
            to apply to any new unstitched suit order.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
        >
          <Plus size={16} className="mr-1.5" /> Design New Style
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs">
          <Loader2
            size={36}
            className="animate-spin text-[#7E153A] mx-auto mb-3"
          />
          <p className="text-xs font-semibold text-gray-600">
            Loading your saved designs...
          </p>
        </div>
      ) : designs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Palette size={32} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              No Custom Styles Saved Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Create and save your go-to neck cuts, sleeve styles, and trouser
              measurements for 1-click order placement.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7E153A] text-white text-xs font-bold px-6 rounded-xl cursor-pointer"
          >
            <Plus size={14} className="mr-1.5" /> Create Your First Style Preset
          </Button>
        </div>
      ) : (
        /* Designs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designs.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {formatGarmentType(style.garmentType)}
                  </span>
                  <button
                    onClick={() => handleDelete(style.id)}
                    disabled={deletingId === style.id}
                    aria-label="Delete style preset"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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

                <h3 className="font-extrabold text-base text-gray-900">
                  {style.label}
                </h3>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  {style.galaStyle && (
                    <div className="flex justify-between text-gray-600">
                      <span>Neck Style:</span>
                      <span className="font-bold text-gray-900">
                        {style.galaStyle}
                      </span>
                    </div>
                  )}
                  {style.sleeveStyle && (
                    <div className="flex justify-between text-gray-600">
                      <span>Sleeve Style:</span>
                      <span className="font-bold text-gray-900">
                        {style.sleeveStyle}
                      </span>
                    </div>
                  )}
                  {style.trouserStyle && (
                    <div className="flex justify-between text-gray-600">
                      <span>Trouser Cut:</span>
                      <span className="font-bold text-gray-900">
                        {style.trouserStyle}
                      </span>
                    </div>
                  )}
                </div>

                {style.specialInstructions && (
                  <p className="text-xs text-gray-500 italic">
                    &quot;{style.specialInstructions}&quot;
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <Link href={`/new-order?styleConfigId=${style.id}`}>
                  <Button className="h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs cursor-pointer">
                    <Scissors size={14} className="mr-1.5" /> Apply to Order
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Style Preset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Design New Style Preset
                </h3>
                <p className="text-xs text-gray-500">
                  Save custom cutting details for future orders
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDesign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Preset Name *
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Formal Ban Gala with Cigarette Pant"
                  className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Garment Type
                </label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 font-semibold text-gray-800"
                >
                  <option value="full_suit">3-Piece Shalwar Kameez</option>
                  <option value="two_piece_shirt_trouser">
                    2-Piece Kurti & Trouser
                  </option>
                  <option value="shirt_only">1-Piece Kameez / Kurti</option>
                  <option value="kurta_shalwar">
                    Men&apos;s Kurta Shalwar
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Neckline Style
                  </label>
                  <Input
                    value={neckStyle}
                    onChange={(e) => setNeckStyle(e.target.value)}
                    placeholder="e.g. Ban Collar with Placket"
                    className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Sleeve Style
                  </label>
                  <Input
                    value={sleeveStyle}
                    onChange={(e) => setSleeveStyle(e.target.value)}
                    placeholder="e.g. Bell Sleeve with Lace"
                    className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Trouser Silhouette
                </label>
                <Input
                  value={trouserStyle}
                  onChange={(e) => setTrouserStyle(e.target.value)}
                  placeholder="e.g. Straight Cigarette Pants (Paicha 13 inches)"
                  className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Finishing / Lace Notes
                </label>
                <Input
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Add organza trims on daman and sleeves"
                  className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 text-xs font-bold text-gray-600 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 rounded-xl shadow-xs"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  ) : null}
                  Save Preset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
