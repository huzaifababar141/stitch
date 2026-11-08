'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Boxes, Scissors, Search } from 'lucide-react';
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

const WOMEN_CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'full_suit', label: 'Shalwar Kameez' },
  { key: 'kameez_only', label: 'Kurti / Shirt' },
  { key: 'frock_maxi', label: 'Frock / Maxi' },
];

const MEN_CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'full_suit', label: 'Shalwar Kameez' },
  { key: 'waistcoat', label: 'Waistcoat' },
  { key: 'pant_coat', label: 'Pant Coat' },
];

const ALL_CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'full_suit', label: 'Shalwar Kameez' },
  { key: 'kameez_only', label: 'Kurti / Shirt' },
  { key: 'waistcoat', label: 'Waistcoat' },
  { key: 'frock_maxi', label: 'Frock / Maxi' },
  { key: 'pant_coat', label: 'Pant Coat' },
];

export default function CustomerStockCatalogPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [genderTab, setGenderTab] = useState<'all' | 'female' | 'male'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
  }, [genderTab, categoryFilter, sortBy]);

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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-r from-[#7E153A] via-[#8E1741] to-[#5a0f2a] text-white p-5 sm:p-7 lg:p-8 shadow-md border border-white/10">
        <div className="relative z-10 max-w-xl space-y-1.5">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Our Unstitched Stock
          </h1>
          <p className="text-xs sm:text-sm text-red-100/90 font-normal leading-relaxed">
            Premium unstitched fabrics handpicked for custom bespoke tailoring.
          </p>
        </div>

        {/* Decorative Calligraphy & Atelier Craft Art */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-64 sm:w-80 md:w-[420px] overflow-hidden flex items-center justify-end"
        >
          <svg
            viewBox="0 0 420 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full opacity-60 sm:opacity-85"
          >
            <defs>
              <linearGradient
                id="gold-foil"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#AA7A28" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="silk-swirl" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.45" />
                <stop offset="80%" stopColor="#F5E6CA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
              </linearGradient>
              <radialGradient id="gold-glow" cx="70%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7E153A" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Soft luminous ambient aura */}
            <circle cx="320" cy="80" r="100" fill="url(#gold-glow)" />

            {/* Calligraphic Flourish Swashes (Qalam ribbon curves) */}
            <path
              d="M30 120 C90 145 160 110 215 70 C250 45 295 35 380 55"
              stroke="url(#silk-swirl)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M70 135 C130 155 185 125 235 85 C275 52 320 45 395 68"
              stroke="url(#gold-foil)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Traditional Pakistani Paisley / Boteh Silhouette */}
            <g transform="translate(260, 15) scale(0.9)" opacity="0.8">
              {/* Outer paisley contour */}
              <path
                d="M75 135 C40 135 15 110 15 78 C15 42 48 22 68 8 C65 26 74 38 86 45 C102 54 110 72 106 96 C102 120 90 135 75 135 Z"
                stroke="url(#gold-foil)"
                strokeWidth="1.5"
                fill="rgba(255, 255, 255, 0.03)"
              />
              {/* Inner filigree dashed paisley */}
              <path
                d="M71 120 C46 120 28 102 28 78 C28 52 50 36 64 24 C63 36 70 45 79 50 C90 57 96 70 93 88 C90 105 82 120 71 120 Z"
                stroke="url(#gold-foil)"
                strokeWidth="1"
                strokeDasharray="2.5 3"
              />
              {/* Core floral rosette */}
              <circle
                cx="62"
                cy="82"
                r="9"
                stroke="url(#gold-foil)"
                strokeWidth="1"
              />
              <circle
                cx="62"
                cy="82"
                r="3.5"
                fill="url(#gold-foil)"
                opacity="0.7"
              />
              <path
                d="M62 69 V73 M62 91 V95 M49 82 H53 M71 82 H75"
                stroke="url(#gold-foil)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Crown tip flourish */}
              <path
                d="M68 8 C71 5 76 6 78 10 C80 15 76 19 72 19 C68 19 65 16 67 12"
                stroke="url(#gold-foil)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>

            {/* Slender golden tailoring needle */}
            <g transform="translate(160, 68) rotate(-32)">
              <path
                d="M0 0 L52 0"
                stroke="#FDE68A"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <ellipse
                cx="6"
                cy="0"
                rx="3.2"
                ry="0.9"
                fill="#7E153A"
                stroke="#FDE68A"
                strokeWidth="0.6"
              />
            </g>

            {/* Urdu Calligraphy / Artisan Seal "دستکاری" (Handcrafted / Bespoke Craft) */}
            <g transform="translate(180, 138)" opacity="0.45">
              <text
                x="0"
                y="0"
                fill="#FDE68A"
                fontSize="18"
                fontFamily="system-ui, -apple-system, serif"
                fontWeight="bold"
                className="select-none tracking-widest"
              >
                دستکاری
              </text>
              <text
                x="68"
                y="-2"
                fill="#F5E6CA"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                letterSpacing="2.5"
                className="select-none uppercase"
              >
                • ATELIER
              </text>
            </g>

            {/* Delicate gold craft sparkle stars */}
            <path
              d="M135 38 L137.5 44 L143.5 46.5 L137.5 49 L135 55 L132.5 49 L126.5 46.5 L132.5 44 Z"
              fill="#FDE68A"
              opacity="0.8"
            />
            <path
              d="M215 118 L216.8 122 L220.8 123.8 L216.8 125.6 L215 129.6 L213.2 125.6 L209.2 123.8 L213.2 122 Z"
              fill="#F5E6CA"
              opacity="0.65"
            />
            <path
              d="M380 98 L381.5 101.5 L385 103 L381.5 104.5 L380 108 L378.5 104.5 L375 103 L378.5 101.5 Z"
              fill="#D4AF37"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Subtle background ambient blur */}
        <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-amber-400/10 pointer-events-none blur-3xl"></div>
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

        {/* Category Chips & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Category:
            </span>
            {currentCategoryChips.map((cat) => {
              const isActive = categoryFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-72 shrink-0"
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
            Try switching collections or selecting &quot;All&quot; to view
            available unstitched suits.
          </p>
          <Button
            onClick={() => {
              setGenderTab('all');
              setCategoryFilter('all');
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
