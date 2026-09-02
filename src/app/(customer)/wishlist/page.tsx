'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: '1',
      brand: 'Sana Safinaz',
      title: 'Mahay Lawn 3 Piece Unstitched',
      price: 'PKR 4,850',
      image: '/login_bg.jpg',
      url: 'https://www.sanasafinaz.com/pk/mahay-lawn-3-piece-unstitched',
      fabric: 'Premium Lawn',
    },
    {
      id: '2',
      brand: 'Maria.B',
      title: 'Mbroidered Chiffon Edition',
      price: 'PKR 14,500',
      image:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
      url: 'https://www.mariab.pk/unstitched',
      fabric: 'Pure Chiffon & Silk',
    },
  ]);

  const handleRemove = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
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

        <Link href="/new-order">
          <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer">
            <Plus size={16} className="mr-1.5" /> Link Another Suit
          </Button>
        </Link>
      </div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Browse any lawn or festive collection online and paste the link
              here to save it for custom stitching.
            </p>
          </div>
          <Link href="/new-order">
            <Button className="bg-[#7E153A] text-white text-xs font-bold px-6 rounded-xl">
              Paste Suit Link
            </Button>
          </Link>
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
                  src={item.image}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-500 hover:text-red-600 shadow-sm cursor-pointer transition-colors"
                >
                  <Trash2 size={16} />
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
                  <p className="text-xs text-gray-500 mt-1">
                    Fabric: {item.fabric}
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-2">
                    {item.price}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink size={13} /> View Brand
                  </a>

                  <Link href="/new-order">
                    <Button className="h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs">
                      <Scissors size={14} className="mr-1.5" /> Stitch This
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
