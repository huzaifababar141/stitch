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

const WOMEN_CATEGORY_CHIPS = [
  { key: 'all', label: 'All Silhouettes' },
  { key: 'full_suit', label: 'Shalwar Kameez / Pajama' },
  { key: 'kameez_only', label: 'Only Shirt / Kurti' },
  { key: 'frock_maxi', label: 'Frock / Maxi Cut' },
  { key: 'trouser_only', label: 'Trousers & Bottoms' },
];

const MEN_CATEGORY_CHIPS = [
  { key: 'all', label: 'All Silhouettes' },
  { key: 'full_suit', label: 'Shalwar Kameez' },
  { key: 'waistcoat', label: 'Waist Coat / Sadri' },
  { key: 'pant_coat', label: 'Pent Coat (2-Piece)' },
  { key: 'trouser_only', label: "Men's Trousers" },
];

const ALL_CATEGORY_CHIPS = [
  { key: 'all', label: 'All Categories' },
  { key: 'full_suit', label: 'Shalwar Kameez' },
  { key: 'frock_maxi', label: 'Frock / Maxi' },
  { key: 'waistcoat', label: 'Waist Coat' },
  { key: 'pant_coat', label: 'Pent Coat' },
  { key: 'kameez_only', label: 'Shirt / Kurti' },
];

export default function CustomerStockCatalogPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [genderTab, setGenderTab] = useState<'all' | 'female' | 'male'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fabricFilter, setFabricFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const currentCategoryChips =
    genderTab === 'female'
      ? WOMEN_CATEGORY_CHIPS
      : genderTab === 'male'
        ? MEN_CATEGORY_CHIPS
        : ALL_CATEGORY_CHIPS;

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genderTab !== 'all') params.append('gender', genderTab);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
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
  }, [genderTab, categoryFilter, fabricFilter, sortBy]);

  const handleGenderTabChange = (newGender: 'all' | 'female' | 'male') => {
    setGenderTab(newGender);
    setCategoryFilter('all');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock();
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 min-w-0 w-full max-w-full overflow-hidden">
      {/* Hero / Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-r from-[#7E153A] via-[#921943] to-[#5a0f2a] text-white p-5 sm:p-8 lg:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-300" /> Curated In-House
            Collection
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Our Unstitched Fabric Stock
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-normal leading-relaxed">
            Handpicked pure fabrics from top Pakistani looms and designers.
            Order the unstitched fabric and have it tailored to your custom
            measurements in one single order.
          </p>

          <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-semibold text-red-200">
            <span className="flex items-center gap-1.5 bg-white/10 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />{' '}
              100% Pure Fabric
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />{' '}
              24-Point QC
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />{' '}
              Express Delivery
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
      </div>

      {/* Gender Switcher & Filter Controls */}
      <div className="space-y-3.5 sm:space-y-4">
        {/* Gender Tabs & Sorter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center bg-gray-100/90 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleGenderTabChange('all')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap text-center ${
                genderTab === 'all'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Articles {products.length > 0 ? `(${products.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleGenderTabChange('female')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap text-center ${
                genderTab === 'female'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Women&apos;s Fabrics
            </button>
            <button
              type="button"
              onClick={() => handleGenderTabChange('male')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap text-center ${
                genderTab === 'male'
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Men&apos;s Fabrics
            </button>
          </div>

          {/* Sorter */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider shrink-0">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold cursor-pointer w-full sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Garment Silhouette Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
            Silhouette:
          </span>
          {currentCategoryChips.map((cat) => {
            const isActive = categoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#7E153A] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Fabric Filter Chips & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Fabric:
            </span>
            {FABRIC_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFabricFilter(chip.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  fabricFilter === chip.key
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-72"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search fabric, brand, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-white border-gray-200 w-full"
            />
          </form>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 min-w-0 w-full animate-in fade-in duration-200">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between animate-pulse"
            >
              <div className="aspect-3/4 bg-gray-100" />
              <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="space-y-1">
                  <div className="h-3.5 w-full bg-gray-300 rounded" />
                  <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-3.5 w-12 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-200 p-8 sm:p-16 text-center space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Boxes size={24} />
          </div>
          <h3 className="text-base font-extrabold text-gray-900">
            No Fabrics Matching Your Filter
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try switching gender collections or selecting &quot;All
            Fabrics&quot; to view available unstitched suits.
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((item) => {
            const images = Array.isArray(item.images)
              ? (item.images as string[])
              : [];
            const coverImage = images[0] || '/placeholder.jpg';
            const price = Number(item.priceOriginal || 0);
            const meta = item.parseMetadata || {};
            const categoryLabel =
              ALL_CATEGORY_CHIPS.find(
                (c) => c.key === (meta.garmentSubtype || item.garmentType)
              )?.label ||
              meta.garmentSubtype?.replace('_', ' ') ||
              item.garmentType;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Image Section */}
                <Link
                  href={`/stock/${item.id}`}
                  className="relative aspect-3/4 bg-gray-100 overflow-hidden block"
                >
                  <img
                    src={coverImage}
                    alt={item.name}
                    className={`w-full h-full object-cover object-center transition-all duration-500 ${
                      images[1]
                        ? 'group-hover:opacity-0'
                        : 'group-hover:scale-105'
                    }`}
                  />
                  {images[1] && (
                    <img
                      src={images[1]}
                      alt={`${item.name} alternate view`}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#7E153A] text-white text-[8.5px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {meta.gender === 'male' ? "Men's" : "Women's"}
                    </span>
                    <span className="bg-white/95 backdrop-blur-xs text-gray-800 text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full capitalize">
                      {item.fabricType}
                    </span>
                  </div>

                  {/* Category & Pieces pills */}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none gap-1">
                    <span className="bg-black/65 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full truncate">
                      {meta.piecesCount || '3-Piece'}
                    </span>
                    <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs truncate max-w-[75px] sm:max-w-[130px]">
                      {categoryLabel}
                    </span>
                  </div>
                </Link>

                {/* Article Info */}
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block truncate">
                      {item.brand}
                    </span>
                    <Link href={`/stock/${item.id}`}>
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-[#7E153A] transition-colors line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1 leading-snug">
                        {item.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Price & Tailor Now CTA */}
                  <div className="pt-2 sm:pt-3 border-t border-gray-100 space-y-2 sm:space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 block">
                          Fabric Price
                        </span>
                        <span className="text-xs sm:text-base font-black font-mono text-gray-900">
                          PKR {price.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                      <Link href={`/stock/${item.id}`} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 sm:h-9 rounded-xl border-gray-200 text-[11px] sm:text-xs font-bold text-gray-700 hover:bg-gray-50 px-1"
                        >
                          Details
                        </Button>
                      </Link>

                      <Link
                        href={`/new-order?productId=${item.id}`}
                        className="w-full"
                      >
                        <Button
                          size="sm"
                          className="w-full h-8 sm:h-9 rounded-xl bg-[#7E153A] hover:bg-[#630f2d] text-white text-[11px] sm:text-xs font-bold shadow-xs shadow-[#7E153A]/20 flex items-center justify-center gap-1 cursor-pointer px-1"
                        >
                          <Scissors size={11} className="shrink-0" />
                          <span>Tailor</span>
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
