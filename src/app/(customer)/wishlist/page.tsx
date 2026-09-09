'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  Plus,
  Scissors,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Loader2,
  X,
  Tag,
  Store,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// ─── Popular Pakistani Designer Brands & Fabrics ─────────────────────────────

const POPULAR_BRANDS = [
  'Sana Safinaz',
  'Maria.B',
  'Sapphire',
  'Khaadi',
  'Baroque',
  'Asim Jofa',
  'Gul Ahmed',
  'Nishat Linen',
  'Cross Stitch',
  'Charizma',
];

const POPULAR_FABRICS = [
  'Premium Lawn',
  'Embroidered Chiffon',
  'Raw Silk & Organza',
  'Winter Khaddar',
  'Jacquard / Cotton Net',
  'Velvet & Silk',
];

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');

  // Form State
  const [brand, setBrand] = useState('Sana Safinaz');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('PKR 5,450');
  const [url, setUrl] = useState('');
  const [fabric, setFabric] = useState('Premium Lawn');
  const [image, setImage] = useState('');

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const json = await res.json();
        setWishlist(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleOpenCreateWithBrand = (brandName: string) => {
    resetForm();
    setBrand(brandName);
    setIsModalOpen(true);
  };

  const handleAddSuit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please specify the suit collection or title.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim() || 'Designer Brand',
          title: title.trim(),
          price: price.trim() || 'PKR 4,850',
          url: url.trim() || undefined,
          fabric: fabric.trim() || 'Premium Lawn',
          image: image.trim() || '/login_bg.jpg',
        }),
      });

      if (res.ok) {
        toast({
          title: 'Suit Saved to Wishlist ❤️',
          description: 'Ready to order custom stitching whenever you are!',
        });
        setIsModalOpen(false);
        resetForm();
        loadWishlist();
      } else {
        const json = await res.json();
        toast({
          title: 'Error Saving Suit',
          description: json.error?.message || 'Failed to add item.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error Saving Suit',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string, suitTitle: string) => {
    if (!confirm(`Remove "${suitTitle}" from your saved wishlist?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Item Removed',
          description: `"${suitTitle}" removed from wishlist.`,
        });
        setWishlist((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast({
          title: 'Error',
          description: 'Could not remove suit.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setBrand('Sana Safinaz');
    setTitle('');
    setPrice('PKR 5,450');
    setUrl('');
    setFabric('Premium Lawn');
    setImage('');
  };

  const filteredWishlist =
    selectedBrandFilter === 'All'
      ? wishlist
      : wishlist.filter(
          (item) =>
            item.brand?.toLowerCase() === selectedBrandFilter.toLowerCase()
        );

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <Heart size={20} className="fill-[#7E153A]" />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                My Suit Wishlist
              </h1>
              {wishlist.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {wishlist.length}{' '}
                  {wishlist.length === 1 ? 'saved suit' : 'saved suits'}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Save unstitched lawn, festive, and bridal suit links from your
            favorite Pakistani designer brands to request custom doorstep
            tailoring anytime.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 sm:px-6 rounded-xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer shrink-0 flex items-center justify-center"
        >
          <Plus size={16} className="mr-1.5 shrink-0" /> Save Suit Link
        </Button>
      </div>

      {/* ── Pakistani Designer Brand Quick Chips ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Store size={13} className="text-[#7E153A]" /> Popular Pakistani
            Brands
          </span>
          <span className="text-[11px] text-gray-400">
            1-Tap to add or filter
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedBrandFilter('All')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
              selectedBrandFilter === 'All'
                ? 'bg-[#7E153A] text-white border-[#7E153A]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            All Brands ({wishlist.length})
          </button>
          {POPULAR_BRANDS.map((b) => {
            const count = wishlist.filter(
              (w) => w.brand?.toLowerCase() === b.toLowerCase()
            ).length;
            const isSelected =
              selectedBrandFilter.toLowerCase() === b.toLowerCase();

            return (
              <button
                key={b}
                onClick={() => {
                  if (count > 0) {
                    setSelectedBrandFilter(isSelected ? 'All' : b);
                  } else {
                    handleOpenCreateWithBrand(b);
                  }
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#7E153A] text-white border-[#7E153A]'
                    : count > 0
                      ? 'bg-red-50 text-[#7E153A] border-red-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <span>{b}</span>
                {count > 0 ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-[#7E153A]'
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <Plus size={12} className="text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Wishlist Grid ── */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs font-semibold text-gray-600">
            Loading your saved wishlist...
          </p>
        </div>
      ) : filteredWishlist.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shadow-inner">
            <Heart size={32} className="fill-[#7E153A]/20" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-extrabold text-gray-900">
              {selectedBrandFilter === 'All'
                ? 'Your Wishlist is Empty'
                : `No saved suits found for ${selectedBrandFilter}`}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Browse any lawn, chiffon, or festive collection online (Sana
              Safinaz, Maria.B, Sapphire) and save it here to order doorstep
              bespoke tailoring anytime.
            </p>
          </div>
          <Button
            onClick={() => {
              if (selectedBrandFilter !== 'All') {
                handleOpenCreateWithBrand(selectedBrandFilter);
              } else {
                resetForm();
                setIsModalOpen(true);
              }
            }}
            className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
          >
            <Plus size={16} className="mr-1.5" /> Save A Suit Link Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden group">
                <img
                  src={item.image || '/login_bg.jpg'}
                  alt={item.title}
                  onError={(e: any) => {
                    e.currentTarget.src = '/login_bg.jpg';
                  }}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-[#7E153A] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {item.brand}
                  </span>
                  {item.fabric && (
                    <span className="text-[10px] font-bold text-gray-700 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs hidden sm:inline-block">
                      {item.fabric}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(item.id, item.title)}
                  disabled={deletingId === item.id}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full text-gray-500 hover:text-red-600 shadow-sm cursor-pointer transition-colors flex items-center justify-center"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={15} className="animate-spin text-red-600" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2 break-words">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-extrabold text-[#7E153A] text-sm">
                      {item.price}
                    </span>
                    {item.fabric && (
                      <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md font-medium">
                        {item.fabric}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2 flex-wrap">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-[#7E153A] flex items-center gap-1 font-semibold transition-colors"
                    >
                      <ExternalLink size={13} /> View Brand Store
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Ready to tailor
                    </span>
                  )}

                  <Link
                    href={
                      item.url
                        ? `/new-order?productUrl=${encodeURIComponent(item.url)}&brand=${encodeURIComponent(item.brand || '')}&suitTitle=${encodeURIComponent(item.title || '')}`
                        : `/new-order?brand=${encodeURIComponent(item.brand || '')}&suitTitle=${encodeURIComponent(item.title || '')}`
                    }
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5">
                      <Scissors size={13} /> Stitch This Suit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Suit Modal (Bottom Sheet on Mobile) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  Save Designer Suit Link
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Add to your tailoring wishlist for 1-click doorstep ordering
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
              id="wishlistForm"
              onSubmit={handleAddSuit}
              className="flex-1 overflow-y-auto px-1 py-1 pr-2 space-y-4"
            >
              {/* Brand Name Input + Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Designer Brand Name <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sana Safinaz, Maria.B, Sapphire"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(b)}
                      className="text-[10px] font-semibold bg-gray-100 hover:bg-red-50 hover:text-[#7E153A] text-gray-700 px-2 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suit Title / Collection Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Suit Name / Collection Title{' '}
                  <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mahay Festive Embroidered 3-Piece Lawn"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                />
              </div>

              {/* Price & Fabric Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Retail Price (PKR)
                  </label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. PKR 5,450"
                    className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Fabric Type
                  </label>
                  <Input
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Premium Lawn, Pure Chiffon"
                    className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl"
                  />
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                    {POPULAR_FABRICS.slice(0, 3).map((fab) => (
                      <button
                        key={fab}
                        type="button"
                        onClick={() => setFabric(fab)}
                        className="text-[9px] font-medium text-gray-500 hover:text-[#7E153A] bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0"
                      >
                        {fab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Store URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Store / Product Web Link (Optional)
                </label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.sanasafinaz.com/pk/..."
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Suit Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Image URL (Optional)
                </label>
                <Input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://.../product.jpg"
                  className="h-11 sm:h-10 bg-gray-50/80 border-gray-200 text-xs rounded-xl text-[11px]"
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
                form="wishlistForm"
                disabled={saving}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving Suit...
                  </>
                ) : (
                  'Save to Wishlist'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
