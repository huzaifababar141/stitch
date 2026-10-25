'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Scissors,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  Check,
  Star,
  Loader2,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getStitchingTiers,
  formatPKR,
  type StitchingTierKey,
} from '@/lib/constants/pricing';

interface ProductDetail {
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

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const id = params?.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTier, setSelectedTier] =
    useState<StitchingTierKey>('standard');

  useEffect(() => {
    if (!id) return;
    async function loadArticle() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setProduct(json.data);
        } else {
          toast({
            title: 'Not Found',
            description: 'Could not find the requested fabric article.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load article details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#7E153A]" />
        <p className="text-sm font-bold text-gray-700">
          Loading Article Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center space-y-4">
        <Package className="w-12 h-12 mx-auto text-gray-400" />
        <h2 className="text-lg font-extrabold text-gray-900">
          Article Not Found
        </h2>
        <p className="text-xs text-gray-500">
          This article may have been unlisted or removed from in-house stock.
        </p>
        <Link href="/stock">
          <Button
            variant="outline"
            className="rounded-xl border-gray-200 text-xs font-bold"
          >
            <ArrowLeft size={14} className="mr-1.5" /> Back to Stock Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? (product.images as string[])
    : [];
  const activeImage =
    images[selectedImageIndex] || images[0] || '/placeholder.jpg';
  const price = Number(product.priceOriginal || 0);
  const meta = product.parseMetadata || {};
  const isFemale = meta.gender !== 'male';
  const qty = meta.stockQuantity ?? 0;
  const isAvailable = product.isActive && meta.inStock !== false && qty > 0;

  const genderKey = (meta.gender === 'male' ? 'male' : 'female') as
    'male' | 'female';
  const garmentKey = meta.garmentSubtype || product.garmentType || 'full_suit';
  const stitchingTiers = getStitchingTiers(genderKey, garmentKey);
  const activeTierInfo =
    stitchingTiers.find((t) => t.key === selectedTier) ||
    stitchingTiers[1] ||
    stitchingTiers[0];
  const stitchingFee = activeTierInfo?.price || 0;
  const totalPrice = price + stitchingFee;

  const categoryLabelMap: Record<string, string> = {
    full_suit:
      genderKey === 'male'
        ? "Men's Shalwar Kameez"
        : "Women's Shalwar Kameez / Pajama",
    kameez_only: 'Only Shirt / Kurti',
    frock_maxi: "Women's Frock / Maxi Cut",
    waistcoat: "Men's Waist Coat / Sadri",
    pant_coat: "Men's Pent Coat (2-Piece)",
    trouser_only:
      genderKey === 'male' ? "Men's Trouser" : "Women's Trouser & Bottom",
  };
  const categoryLabel =
    categoryLabelMap[garmentKey] || garmentKey.replace('_', ' ');

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/stock"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#7E153A] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Fabric Stock
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: 'Link Copied',
                  description: 'Article link copied to clipboard.',
                });
              }
            }}
            className="rounded-xl border-gray-200 text-xs font-bold gap-1.5 h-8"
          >
            <Share2 size={13} /> Share
          </Button>
        </div>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery Studio (Ordered as Admin Reordered) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Large Main Picture Display */}
          <div className="relative aspect-3/4 rounded-3xl bg-gray-100 overflow-hidden border border-gray-100 shadow-md">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* In-Stock / Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-[#7E153A] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {categoryLabel}
              </span>
              <span className="bg-white/90 backdrop-blur-xs text-gray-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm capitalize">
                {product.fabricType}
              </span>
            </div>

            {/* Total Photos Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
              Photo {selectedImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Clickable Image Thumbnails (In exact reordered sequence) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((imgUrl, idx) => {
                const isSelected = idx === selectedImageIndex;
                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-[#7E153A] ring-2 ring-[#7E153A]/20 scale-105 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 right-1 bg-amber-500 text-white text-[8px] font-black py-0.5 rounded text-center uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Article Details, Price, & Tailor CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-gray-100 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#7E153A] uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} />{' '}
                  {isAvailable ? `${qty} in stock` : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-extrabold bg-[#FAF0F2] text-[#7E153A] px-2.5 py-1 rounded-lg border border-[#7E153A]/20">
                  {categoryLabel}
                </span>
                {meta.sku && (
                  <p className="text-[11px] font-mono text-gray-400">
                    SKU:{' '}
                    <span className="font-bold text-gray-700">{meta.sku}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Real-Time Bespoke Stitching & Price Calculator */}
            <div className="bg-[#FAF0F2]/80 p-4 sm:p-5 rounded-3xl border border-[#7E153A]/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Unstitched Fabric Price
                  </span>
                  <span className="text-xl font-black font-mono text-[#7E153A]">
                    {formatPKR(price)}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                  {meta.piecesCount || '3-Piece Suit'}
                </span>
              </div>

              {/* Stitching Tiers Selector */}
              <div className="space-y-2 pt-2 border-t border-[#7E153A]/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Scissors size={14} className="text-[#7E153A]" /> Bespoke
                    Tailoring Add-On:
                  </span>
                  <span className="text-[11px] text-[#7E153A] font-bold">
                    {activeTierInfo.days} turnaround
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {stitchingTiers.map((tier) => {
                    const isTierSelected = tier.key === selectedTier;
                    return (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => setSelectedTier(tier.key)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isTierSelected
                            ? 'bg-[#7E153A] text-white border-[#7E153A] shadow-md shadow-[#7E153A]/20'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span
                            className={`text-[11px] font-extrabold block ${
                              isTierSelected ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {tier.name
                              .replace(' Stitching', '')
                              .replace(' Designer', '')}
                          </span>
                          <span
                            className={`text-[9px] block ${
                              isTierSelected ? 'text-red-200' : 'text-gray-400'
                            }`}
                          >
                            {tier.days}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-black font-mono mt-1 ${
                            isTierSelected ? 'text-amber-300' : 'text-[#7E153A]'
                          }`}
                        >
                          +{formatPKR(tier.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="pt-2 border-t border-[#7E153A]/15 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">
                    Total (Fabric + {activeTierInfo.name})
                  </span>
                  <span className="text-2xl font-black font-mono text-[#7E153A]">
                    {formatPKR(totalPrice)}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  {formatPKR(price)} + {formatPKR(stitchingFee)}
                </span>
              </div>
            </div>

            {/* Primary Order Action Button */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/new-order?productId=${product.id}&stitchingTier=${selectedTier}`}
                className="w-full block"
              >
                <Button className="w-full h-12 rounded-2xl bg-[#7E153A] hover:bg-[#630f2d] text-white font-extrabold text-sm shadow-lg shadow-[#7E153A]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]">
                  <Scissors size={18} />
                  Tailor This Garment ({formatPKR(totalPrice)})
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-6 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#7E153A]" /> 100% Fit
                  Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-[#7E153A]" /> Express
                  Delivery
                </span>
              </div>
            </div>

            {/* Available Customization Options Preview */}
            <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
              <span className="font-extrabold text-gray-900 block uppercase tracking-wider text-[10px]">
                Customization Options in Order Wizard:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-700">
                {garmentKey === 'frock_maxi' && (
                  <>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Styles: A-Line, Anarkali, Flared, Tiered
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Necklines: Round, V-Neck, Square, Boat
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Damans: Straight, Curved, Scalloped
                    </span>
                  </>
                )}
                {garmentKey === 'waistcoat' && (
                  <>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Collars: Classic V-Neck, Band Collar, Sherwani
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Sleeves: Sleeveless, Plain Straight, Button Cuff
                    </span>
                  </>
                )}
                {garmentKey === 'pant_coat' && (
                  <>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Styles: Single / Double Breasted
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Lapels: Notch, Peak, Shawl Lapel
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Vents: Center Vent, Double Vent, No Vent
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Trousers: Straight, Slim, Tapered, Pleated
                    </span>
                  </>
                )}
                {(garmentKey === 'full_suit' ||
                  garmentKey === 'kameez_only') && (
                  <>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Collars: Band Collar, Round Neck, V-Neck
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Cuffs: Straight Sleeve, Regular Cuff, Bell
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-semibold">
                      Trousers: Straight Trouser, Cigarette, Classic Shalwar
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Fabric Specifications Section */}
            <div className="space-y-3 border-t border-gray-100 pt-5 text-xs">
              <h3 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">
                Fabric Cut & Specifications
              </h3>

              <div className="space-y-2 divide-y divide-gray-100 text-gray-700">
                {meta.specifications?.shirtFabric && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-500">
                      {garmentKey === 'frock_maxi'
                        ? 'Frock / Flare Cut'
                        : garmentKey === 'waistcoat'
                          ? 'Outer Waistcoat Cut'
                          : garmentKey === 'pant_coat'
                            ? 'Coat & Suit Fabric Cut'
                            : garmentKey === 'kameez_only'
                              ? 'Shirt / Kurti Cut'
                              : 'Shirt / Kameez Cut'}
                    </span>
                    <span className="font-bold">
                      {meta.specifications.shirtFabric}
                    </span>
                  </div>
                )}
                {meta.specifications?.dupattaFabric && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-500">
                      {garmentKey === 'waistcoat' || garmentKey === 'pant_coat'
                        ? 'Inner Lining Fabric'
                        : 'Dupatta / Sadri Cut'}
                    </span>
                    <span className="font-bold">
                      {meta.specifications.dupattaFabric}
                    </span>
                  </div>
                )}
                {meta.specifications?.trouserFabric && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-500">
                      {garmentKey === 'pant_coat'
                        ? 'Trouser Details'
                        : 'Trouser / Bottom Cut'}
                    </span>
                    <span className="font-bold">
                      {meta.specifications.trouserFabric}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500">Weave Type</span>
                  <span className="font-bold capitalize">
                    {product.fabricType}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500">Garment Category</span>
                  <span className="font-bold text-[#7E153A]">
                    {categoryLabel}
                  </span>
                </div>
              </div>

              {/* Color Tags */}
              {product.colorTags && product.colorTags.length > 0 && (
                <div className="pt-2">
                  <span className="text-gray-500 text-[11px] block mb-1.5 font-semibold">
                    Color Palette:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {product.colorTags.map((color) => (
                      <span
                        key={color}
                        className="bg-red-50 text-[#7E153A] border border-red-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description Text */}
            {product.description && (
              <div className="border-t border-gray-100 pt-5 space-y-1.5 text-xs text-gray-600">
                <h4 className="font-extrabold text-gray-900 text-[11px] uppercase tracking-wider">
                  About this Article
                </h4>
                <p className="leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
