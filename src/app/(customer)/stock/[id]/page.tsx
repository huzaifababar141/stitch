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
                {meta.gender === 'male' ? "Men's Fabric" : "Women's Fabric"}
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
                      <span className="absolute bottom-1 left-1 right-1 bg-[#7E153A] text-white text-[8px] font-extrabold py-0.5 rounded text-center">
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

              {meta.sku && (
                <p className="text-[11px] font-mono text-gray-400">
                  Article Code:{' '}
                  <span className="font-bold text-gray-700">{meta.sku}</span>
                </p>
              )}
            </div>

            {/* Price Breakdown in PKR */}
            <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Unstitched Fabric Price
                  </span>
                  <span className="text-2xl font-black font-mono text-[#7E153A]">
                    PKR {price.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {meta.piecesCount || '3-Piece Suit'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Stitching service can be seamlessly added in the next step. Our
                master craftsmen will stitch this fabric according to your exact
                measurements.
              </p>
            </div>

            {/* Primary Order Action Button */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/new-order?productId=${product.id}`}
                className="w-full block"
              >
                <Button className="w-full h-12 rounded-2xl bg-[#7E153A] hover:bg-[#630f2d] text-white font-extrabold text-sm shadow-lg shadow-[#7E153A]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]">
                  <Scissors size={18} />
                  Tailor This Suit Now
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-6 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#7E153A]" /> 100% Fit
                  Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-[#7E153A]" /> TCS Express
                  Delivery
                </span>
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
                    <span className="text-gray-500">Shirt / Kameez Cut</span>
                    <span className="font-bold">
                      {meta.specifications.shirtFabric}
                    </span>
                  </div>
                )}
                {meta.specifications?.dupattaFabric && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-500">Dupatta / Sadri Cut</span>
                    <span className="font-bold">
                      {meta.specifications.dupattaFabric}
                    </span>
                  </div>
                )}
                {meta.specifications?.trouserFabric && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-500">Trouser / Bottom Cut</span>
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
                  <span className="text-gray-500">Target Category</span>
                  <span className="font-bold">
                    {isFemale ? "Women's Wear" : "Men's Wear"}
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
