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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [brand, setBrand] = useState('Sana Safinaz');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('PKR 4,850');
  const [url, setUrl] = useState('');
  const [fabric, setFabric] = useState('Premium Lawn');
  const [image, setImage] = useState('/login_bg.jpg');

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
          brand,
          title,
          price,
          url,
          fabric,
          image: image || '/login_bg.jpg',
        }),
      });

      if (res.ok) {
        toast({
          title: 'Suit Saved to Wishlist ❤️',
          description: 'Ready to order when you are!',
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
        description: 'Network error.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Item Removed',
          description: 'Suit removed from your saved wishlist.',
        });
        setWishlist((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not remove suit.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setBrand('Sana Safinaz');
    setTitle('');
    setPrice('PKR 4,850');
    setUrl('');
    setFabric('Premium Lawn');
    setImage('/login_bg.jpg');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <Heart size={14} className="fill-[#7E153A]" /> Saved Brand Suits
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Save unstitched suit links from your favorite Pakistani designer
            brands for future tailoring orders.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
        >
          <Plus size={16} className="mr-1.5" /> Save Another Suit Link
        </Button>
      </div>

      {/* Wishlist Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs">
          <Loader2
            size={36}
            className="animate-spin text-[#7E153A] mx-auto mb-3"
          />
          <p className="text-xs font-semibold text-gray-600">
            Loading your saved suits...
          </p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Browse any lawn or festive collection online (Sana Safinaz,
              Maria.B, Sapphire) and save it here to order custom tailoring
              anytime.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7E153A] text-white text-xs font-bold px-6 rounded-xl cursor-pointer"
          >
            <Plus size={14} className="mr-1.5" /> Save Your First Suit Link
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={item.image || '/login_bg.jpg'}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-500 hover:text-red-600 shadow-sm cursor-pointer transition-colors"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} className="animate-spin text-red-600" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <h3 className="font-extrabold text-base text-gray-900 leading-snug mt-0.5">
                    {item.title}
                  </h3>
                  {item.fabric && (
                    <p className="text-xs text-gray-500 mt-1">
                      Fabric: {item.fabric}
                    </p>
                  )}
                  <p className="text-sm font-black text-gray-900 mt-2">
                    {item.price}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={13} /> View Brand
                    </a>
                  ) : (
                    <div />
                  )}

                  <Link
                    href={
                      item.url
                        ? `/new-order?productUrl=${encodeURIComponent(item.url)}`
                        : `/new-order`
                    }
                  >
                    <Button className="h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs cursor-pointer">
                      <Scissors size={14} className="mr-1.5" /> Stitch This
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Suit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Save Designer Suit Link
                </h3>
                <p className="text-xs text-gray-500">
                  Add to your tailoring wishlist
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSuit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Brand Name *
                </label>
                <Input
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sana Safinaz, Maria.B, Sapphire"
                  className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Suit Name / Collection *
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mahay Lawn 3-Piece Festive"
                  className="h-11 bg-gray-50 border-gray-200 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Retail Price
                  </label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. PKR 5,200"
                    className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Fabric Type
                  </label>
                  <Input
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Pure Chiffon & Silk"
                    className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Store / Product URL
                </label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.sanasafinaz.com/pk/..."
                  className="h-10 bg-gray-50 border-gray-200 text-xs rounded-xl font-mono text-[11px]"
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
                  Save to Wishlist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
