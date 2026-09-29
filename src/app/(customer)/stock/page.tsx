'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Scissors,
  Search,
  Sparkles,
  Filter,
  ArrowRight,
  Eye,
  Loader2,
  CheckCircle2,
  Package,
  Layers,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  fabricType: string;
  garmentType: string;
  colorTags: string[];
  priceOriginal: number;
  currencyOriginal: string;
  isActive: boolean;
  parseMetadata: {
    gender?: string;
    piecesCount?: string;
    garmentSubtype?: string;
    stockQuantity?: number;
    inStock?: boolean;
    sku?: string;
    season?: string;
    specifications?: {
      shirtFabric?: string;
      dupattaFabric?: string;
      trouserFabric?: string;
      careInstructions?: string;
    };
  };
}

const FABRIC_CHIPS = [
  { key: 'all', label: 'All Fabrics' },
  { key: 'lawn', label: 'Lawn' },
  { key: 'cotton', label: 'Cotton' },
  { key: 'chiffon', label: 'Chiffon' },
  { key: 'silk', label: 'Silk' },
  { key: 'linen', label: 'Linen' },
  { key: 'khaddar', label: 'Khaddar' },
  { key: 'organza', label: 'Organza' },
];

export default function CustomerStockCatalogPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [genderTab, setGenderTab] = useState<'all' | 'female' | 'male'>('all');
  const [fabricFilter, setFabricFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genderTab !== 'all') params.append('gender', genderTab);
      if (fabricFilter !== 'all') params.append('fabricType', fabricFilter);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setProducts(json.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load stock articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderTab, fabricFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero / Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#7E153A] via-[#921943] to-[#5a0f2a] text-white p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-300" /> Curated In-House Collection
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Our Unstitched Fabric Stock
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-normal leading-relaxed">
            Handpicked pure fabrics from top Pakistani looms and designers. Order the unstitched fabric and have it tailored to your custom measurements in one single order.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-red-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-300" /> Guaranteed 100% Pure Fabric
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-300" /> Doorstep QC Inspection
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-300" /> TCS Express Delivery
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
      </div>

      {/* Gender Switcher & Filter Controls */}
      <div className="space-y-4">
        {/* Gender Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setGenderTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                genderTab === 'all'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Articles ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setGenderTab('female')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                genderTab === 'female'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Women's Fabrics
            </button>
            <button
              type="button"
              onClick={() => setGenderTab('male')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                genderTab === 'male'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Men's Fabrics
            </button>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Fabric Filter Chips & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {FABRIC_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFabricFilter(chip.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  fabricFilter === chip.key
                    ? 'bg-[#7E153A] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search fabric, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-white border-gray-200"
            />
          </form>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7E153A] mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading Fabric Catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Boxes size={26} />
          </div>
          <h3 className="text-base font-extrabold text-gray-900">No Fabrics Matching Your Filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try switching gender collections or selecting "All Fabrics" to view available unstitched suits.
          </p>
          <Button
            onClick={() => {
              setGenderTab('all');
              setFabricFilter('all');
              setSearch('');
            }}
            variant="outline"
            className="rounded-xl border-gray-200 text-xs font-bold"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => {
            const images = Array.isArray(item.images) ? (item.images as string[]) : [];
            const coverImage = images[0] || '/placeholder.jpg';
            const hoverImage = images[1] || coverImage;
            const price = Number(item.priceOriginal || 0);
            const meta = item.parseMetadata || {};

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Image Section */}
                <Link href={`/stock/${item.id}`} className="relative aspect-3/4 bg-gray-100 overflow-hidden block">
                  <img
                    src={coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-[#7E153A] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {meta.gender === 'male' ? "Men's" : "Women's"}
                    </span>
                    <span className="bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {item.fabricType}
                    </span>
                  </div>

                  {/* Pieces count pill */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {meta.piecesCount || '3-Piece Suit'}
                  </div>
                </Link>

                {/* Article Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      {item.brand}
                    </span>
                    <Link href={`/stock/${item.id}`}>
                      <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-[#7E153A] transition-colors line-clamp-2 mt-1 leading-snug">
                        {item.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Price & Tailor Now CTA */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Fabric Price
                        </span>
                        <span className="text-base font-black font-mono text-gray-900">
                          PKR {price.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link href={`/stock/${item.id}`} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-9 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Details
                        </Button>
                      </Link>

                      <Link href={`/new-order?productId=${item.id}`} className="w-full">
                        <Button
                          size="sm"
                          className="w-full h-9 rounded-xl bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold shadow-xs shadow-[#7E153A]/20 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Scissors size={12} /> Tailor Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
