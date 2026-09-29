'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  Star,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  X,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DragDropImageUploader } from '@/components/admin/DragDropImageUploader';

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
  createdAt: string;
}

const FABRIC_TYPES = [
  'lawn',
  'cotton',
  'chiffon',
  'silk',
  'linen',
  'khaddar',
  'karandi',
  'organza',
  'georgette',
  'other',
];

const GARMENT_OPTIONS = [
  { key: 'full_suit', label: 'Shalwar Kameez / Pajama (Full Suit)' },
  { key: 'kameez_only', label: 'Only Shirt / Kurti' },
  { key: 'frock_maxi', label: 'Frock / Maxi Cut' },
  { key: 'waistcoat', label: 'Sadri / Waistcoat' },
  { key: 'pant_coat', label: 'Pant Coat (2-Piece Suit)' },
  { key: 'trouser_only', label: 'Trouser / Bottom Only' },
];

export default function AdminStockPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    inStockCount: 0,
    lowStockCount: 0,
    totalValuation: 0,
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [fabricFilter, setFabricFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('TailorLink Studio');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formPrice, setFormPrice] = useState<number | ''>(4500);
  const [formGender, setFormGender] = useState<'female' | 'male' | 'unisex'>('female');
  const [formGarmentSubtype, setFormGarmentSubtype] = useState('full_suit');
  const [formFabricType, setFormFabricType] = useState('lawn');
  const [formPiecesCount, setFormPiecesCount] = useState('3 Piece');
  const [formStockQty, setFormStockQty] = useState<number>(10);
  const [formSku, setFormSku] = useState('');
  const [formColorTags, setFormColorTags] = useState<string[]>(['Maroon']);
  const [colorInput, setColorInput] = useState('');
  const [formShirtFabric, setFormShirtFabric] = useState('Embroidered Lawn 3.0 Meters');
  const [formDupattaFabric, setFormDupattaFabric] = useState('Printed Chiffon 2.5 Meters');
  const [formTrouserFabric, setFormTrouserFabric] = useState('Dyed Cambric Cotton 2.5 Meters');
  const [formInStock, setFormInStock] = useState(true);

  // Fetch articles from API
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (fabricFilter !== 'all') params.append('fabricType', fabricFilter);
      if (stockFilter !== 'all') params.append('inStock', stockFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data) {
        setProducts(json.data.products || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      toast({
        title: 'Error loading inventory',
        description: 'Could not fetch stock articles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter, fabricFilter, stockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  // Open Form for Adding New Product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('TailorLink Studio');
    setFormDescription('Pure unstitched boutique quality fabric. Ready for bespoke tailoring.');
    setFormImages([]);
    setFormPrice(4500);
    setFormGender('female');
    setFormGarmentSubtype('full_suit');
    setFormFabricType('lawn');
    setFormPiecesCount('3 Piece');
    setFormStockQty(10);
    setFormSku(`TLK-${Date.now().toString(36).toUpperCase()}`);
    setFormColorTags(['Maroon']);
    setFormShirtFabric('Embroidered Lawn 3.0 Meters');
    setFormDupattaFabric('Printed Chiffon 2.5 Meters');
    setFormTrouserFabric('Dyed Cambric Cotton 2.5 Meters');
    setFormInStock(true);
    setIsModalOpen(true);
  };

  // Open Form for Editing an Existing Product
  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormName(p.name || '');
    setFormBrand(p.brand || 'TailorLink Studio');
    setFormDescription(p.description || '');
    setFormImages(Array.isArray(p.images) ? (p.images as string[]) : []);
    setFormPrice(Number(p.priceOriginal || 0));
    setFormGender((p.parseMetadata?.gender as any) || 'female');
    setFormGarmentSubtype(p.parseMetadata?.garmentSubtype || p.garmentType || 'full_suit');
    setFormFabricType(p.fabricType || 'lawn');
    setFormPiecesCount(p.parseMetadata?.piecesCount || '3 Piece');
    setFormStockQty(p.parseMetadata?.stockQuantity ?? 10);
    setFormSku(p.parseMetadata?.sku || '');
    setFormColorTags(p.colorTags || []);
    setFormShirtFabric(p.parseMetadata?.specifications?.shirtFabric || '');
    setFormDupattaFabric(p.parseMetadata?.specifications?.dupattaFabric || '');
    setFormTrouserFabric(p.parseMetadata?.specifications?.trouserFabric || '');
    setFormInStock(p.isActive && (p.parseMetadata?.inStock !== false));
    setIsModalOpen(true);
  };

  // Add/Remove Color Tags
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    if (!formColorTags.includes(colorInput.trim())) {
      setFormColorTags([...formColorTags, colorInput.trim()]);
    }
    setColorInput('');
  };

  const handleRemoveColor = (tag: string) => {
    setFormColorTags(formColorTags.filter((t) => t !== tag));
  };

  // Submit Article (Create or Update)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast({ title: 'Validation Error', description: 'Article name is required.', variant: 'destructive' });
      return;
    }
    if (formImages.length === 0) {
      toast({ title: 'Validation Error', description: 'Please upload at least 1 photo for this article.', variant: 'destructive' });
      return;
    }
    if (typeof formPrice !== 'number' || formPrice <= 0) {
      toast({ title: 'Validation Error', description: 'Please provide a valid price in PKR.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Map garmentSubtype to Prisma enum
      const prismaGarmentType =
        formGarmentSubtype === 'waistcoat' ||
        formGarmentSubtype === 'pant_coat' ||
        formGarmentSubtype === 'frock_maxi'
          ? 'other'
          : formGarmentSubtype;

      const payload = {
        name: formName.trim(),
        brand: formBrand.trim(),
        description: formDescription.trim(),
        images: formImages, // Exact reordered sequence
        fabricType: formFabricType,
        garmentType: prismaGarmentType,
        colorTags: formColorTags,
        priceOriginal: formPrice,
        currencyOriginal: 'PKR',
        isActive: formInStock,
        gender: formGender,
        piecesCount: formPiecesCount,
        garmentSubtype: formGarmentSubtype,
        stockQuantity: Number(formStockQty),
        inStock: formInStock && Number(formStockQty) > 0,
        sku: formSku.trim() || undefined,
        specifications: {
          shirtFabric: formShirtFabric.trim() || undefined,
          dupattaFabric: formDupattaFabric.trim() || undefined,
          trouserFabric: formTrouserFabric.trim() || undefined,
        },
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to save article.');
      }

      toast({
        title: editingProduct ? 'Article Updated' : 'Article Added to Stock',
        description: `"${formName}" is now active in in-house stock.`,
      });

      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      toast({
        title: 'Error Saving Article',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from stock?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to delete article.');
      }

      toast({
        title: 'Article Removed',
        description: `"${name}" removed from stock.`,
      });
      fetchArticles();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not delete article.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-50 text-[#7E153A]">
              <Boxes size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              In-House Stock & Fabric Studio
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage your unstitched fabric articles, reorder gallery photos, and set PKR prices for direct tailoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/stock" target="_blank">
            <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-xs font-bold gap-1.5">
              <ExternalLink size={14} /> Preview Storefront
            </Button>
          </Link>
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs font-bold shadow-md shadow-[#7E153A]/20 gap-1.5 px-4 h-10 cursor-pointer"
          >
            <Plus size={16} /> Add Stock Article
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
            Total Articles
          </span>
          <p className="text-2xl font-black text-gray-900">{stats.totalArticles}</p>
          <span className="text-[11px] text-gray-500 font-medium">Curated unstitched suits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-emerald-600 tracking-wider">
            Active In Stock
          </span>
          <p className="text-2xl font-black text-emerald-700">{stats.inStockCount}</p>
          <span className="text-[11px] text-gray-500 font-medium">Ready for customer ordering</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-amber-600 tracking-wider">
            Low Stock Alert
          </span>
          <p className="text-2xl font-black text-amber-700">{stats.lowStockCount}</p>
          <span className="text-[11px] text-gray-500 font-medium">3 or fewer units remaining</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] uppercase font-bold text-[#7E153A] tracking-wider">
            Total Inventory Value
          </span>
          <p className="text-2xl font-black font-mono text-[#7E153A]">
            PKR {Math.round(stats.totalValuation).toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-500 font-medium">Retail stock valuation</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search article name, brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-gray-50/50 border-gray-200"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium"
          >
            <option value="all">All Genders</option>
            <option value="female">Women's Collection</option>
            <option value="male">Men's Collection</option>
          </select>

          {/* Fabric Filter */}
          <select
            value={fabricFilter}
            onChange={(e) => setFabricFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium capitalize"
          >
            <option value="all">All Fabrics</option>
            {FABRIC_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium"
          >
            <option value="all">All Status</option>
            <option value="true">In Stock Only</option>
            <option value="false">Out of Stock / Inactive</option>
          </select>

          <Button
            type="button"
            onClick={fetchArticles}
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Stock Articles Grid / Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7E153A] mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading In-House Inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto">
            <Package size={28} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">No Stock Articles Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Start building your in-house catalog by uploading your first article with photos and tailoring prices.
            </p>
          </div>
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs font-bold"
          >
            <Plus size={15} className="mr-1.5" /> Add First Article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((item) => {
            const images = Array.isArray(item.images) ? (item.images as string[]) : [];
            const coverImage = images[0] || '/placeholder.jpg';
            const price = Number(item.priceOriginal || 0);
            const meta = item.parseMetadata || {};
            const qty = meta.stockQuantity ?? 0;
            const isAvailable = item.isActive && (meta.inStock !== false) && qty > 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image Preview with Hover Shift */}
                <div className="relative aspect-3/4 bg-gray-100 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {meta.gender || 'Women'}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isAvailable
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {isAvailable ? `${qty} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Photos count */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Layers size={10} /> {images.length} Photos
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>{item.brand}</span>
                      <span className="text-[#7E153A] font-semibold capitalize">{item.fabricType}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-gray-900 line-clamp-2 mt-1 leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      {meta.piecesCount || '3-Piece'} · {meta.garmentSubtype?.replace('_', ' ') || item.garmentType}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Fabric Price
                      </span>
                      <span className="text-sm font-black font-mono text-[#7E153A]">
                        PKR {price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-gray-600 hover:text-gray-900 cursor-pointer"
                        title="Edit Article & Reorder Photos"
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDeleteArticle(item.id, item.name)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50 border-red-100 cursor-pointer"
                        title="Remove Article"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Article Slide-over Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-50 text-[#7E153A]">
                  <Boxes size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight">
                    {editingProduct ? 'Edit Stock Article & Photos' : 'Add New Article to In-House Stock'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload photos, arrange cover picture, and specify Pakistani tailoring details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitArticle} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Image Reordering Studio */}
              <div className="bg-stone-50/70 p-5 rounded-3xl border border-stone-200">
                <DragDropImageUploader
                  images={formImages}
                  onChange={setFormImages}
                  maxImages={10}
                />
              </div>

              {/* Basic Article Information */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">
                  1. Article Identification & Brand
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">
                      Article Name / Title <span className="text-[#7E153A]">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Khaadi Embroidered 3-Piece Lawn"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">
                      Brand / Studio Label <span className="text-[#7E153A]">*</span>
                    </label>
                    <Input
                      placeholder="e.g. TailorLink Studio, Sapphire, J."
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Target Gender</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as any)}
                      className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800"
                    >
                      <option value="female">Women's Collection</option>
                      <option value="male">Men's Collection</option>
                      <option value="unisex">Unisex Fabric</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Garment Style</label>
                    <select
                      value={formGarmentSubtype}
                      onChange={(e) => setFormGarmentSubtype(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800"
                    >
                      {GARMENT_OPTIONS.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Fabric Weave Type</label>
                    <select
                      value={formFabricType}
                      onChange={(e) => setFormFabricType(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 capitalize"
                    >
                      {FABRIC_TYPES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">
                  2. Pricing & Stock Units
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">
                      Fabric Retail Price (PKR) <span className="text-[#7E153A]">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 4500"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : '')}
                      className="h-10 text-xs rounded-xl font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Pieces Included</label>
                    <select
                      value={formPiecesCount}
                      onChange={(e) => setFormPiecesCount(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800"
                    >
                      <option value="3 Piece">3 Piece Suit</option>
                      <option value="2 Piece">2 Piece Suit</option>
                      <option value="1 Piece">1 Piece (Shirt Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Available Stock Quantity</label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={formStockQty}
                      onChange={(e) => setFormStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-10 text-xs rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">SKU / Article Code</label>
                    <Input
                      placeholder="e.g. TLK-L26-001"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="h-10 text-xs rounded-xl font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Color Tags */}
                <div className="space-y-2">
                  <label className="font-bold text-gray-700 block">Color Palette Tags</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {formColorTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-red-50 text-[#7E153A] border border-red-100 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(tag)}
                          className="hover:text-red-800 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <Input
                        placeholder="Add color (e.g. Pastel Green)"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddColor();
                          }
                        }}
                        className="h-8 w-44 text-xs rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={handleAddColor}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs rounded-xl border-gray-200"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fabric Specifications */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">
                  3. Fabric Cuts & Specification Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Shirt / Kameez Cut</label>
                    <Input
                      placeholder="e.g. Embroidered Lawn 3.0 Meters"
                      value={formShirtFabric}
                      onChange={(e) => setFormShirtFabric(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Dupatta / Sadri Cut</label>
                    <Input
                      placeholder="e.g. Printed Chiffon 2.5 Meters"
                      value={formDupattaFabric}
                      onChange={(e) => setFormDupattaFabric(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Trouser / Bottom Cut</label>
                    <Input
                      placeholder="e.g. Dyed Cambric Cotton 2.5 Meters"
                      value={formTrouserFabric}
                      onChange={(e) => setFormTrouserFabric(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Description & Care Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Article highlights, texture description, shrink before wash guidelines..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-xs">Visible on Customer Storefront</h4>
                  <p className="text-[11px] text-gray-500">
                    When active, customers can discover this article and order bespoke tailoring.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7E153A]"></div>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="rounded-xl border-gray-200 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl text-xs font-bold shadow-md shadow-[#7E153A]/20 px-6 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving to Database...
                    </>
                  ) : editingProduct ? (
                    'Update Article & Photos'
                  ) : (
                    'Upload & Publish to Stock'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
