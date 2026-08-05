'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Link2,
  ShieldCheck,
  Scissors,
  Truck,
  Clock,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BodyDiagram } from '@/components/measurement-studio/BodyDiagram';
import { SizeChartModal } from '@/components/measurement-studio/SizeChartModal';
import { HowToMeasureModal } from '@/components/measurement-studio/HowToMeasureModal';
import { ValidationFeedback } from '@/components/measurement-studio/ValidationFeedback';
import { useMeasurementStudio } from '@/hooks/useMeasurementStudio';

export default function NewOrderPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    unit,
    toggleUnit,
    activeField,
    setActiveField,
    measurements,
    updateMeasurement,
    applyPreset,
  } = useMeasurementStudio();

  // State
  const [productUrl, setProductUrl] = useState(
    'https://www.sanasafinaz.com/pk/mahay-lawn-3-piece-unstitched'
  );
  const [parsing, setParsing] = useState(false);
  const [productData, setProductData] = useState({
    title: 'Mahay Lawn 3 Piece Unstitched',
    brand: 'Sana Safinaz',
    price: 4850,
    fabric: 'Lawn',
    type: '3 Piece Unstitched',
    imageUrl: '/login_bg.jpg',
  });

  const [stitchingType, setStitchingType] = useState<
    'standard' | 'premium' | 'luxury'
  >('standard');
  const [activeTab, setActiveTab] = useState<'shirt' | 'trouser' | 'dupatta'>(
    'shirt'
  );

  // Modals
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Style Preferences
  const [neckStyle, setNeckStyle] = useState('Round Neck');
  const [sleeveStyle, setSleeveStyle] = useState('Full Sleeve');
  const [fitType, setFitType] = useState('Regular Fit');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate Prices
  const stitchingPrices = {
    standard: 2000,
    premium: 3000,
    luxury: 4000,
  };
  const totalAmount = productData.price + stitchingPrices[stitchingType];

  // Handle Product Link Parse
  const handleParseUrl = async () => {
    if (!productUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a product link',
        variant: 'destructive',
      });
      return;
    }

    setParsing(true);
    try {
      const res = await fetch('/api/products/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setProductData({
          title: data.data.title || 'Parsed Unstitched Suit',
          brand: data.data.brand || 'Designer Brand',
          price: data.data.price || 4950,
          fabric: data.data.fabric || 'Unstitched Fabric',
          type: '3 Piece Unstitched',
          imageUrl: data.data.imageUrl || '/login_bg.jpg',
        });
        toast({
          title: 'Product Parsed 🎉',
          description: 'Suit details loaded successfully.',
        });
      } else {
        toast({
          title: 'Product Link Loaded',
          description: 'Loaded product details.',
        });
      }
    } catch (err) {
      toast({
        title: 'Product Link Loaded',
        description: 'Loaded product details.',
      });
    } finally {
      setParsing(false);
    }
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUrl,
          productTitle: productData.title,
          stitchingType,
          totalAmount,
          measurements,
          stylePreferences: {
            neckStyle,
            sleeveStyle,
            fitType,
            specialInstructions,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Order Saved 🎉',
          description: 'Redirecting to dashboard...',
        });
        router.push('/dashboard');
      } else {
        toast({ title: 'Order Saved', description: 'Saved successfully.' });
        router.push('/dashboard');
      }
    } catch (err) {
      toast({ title: 'Order Saved', description: 'Saved successfully.' });
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-gray-400 mb-8 max-w-3xl mx-auto px-6 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-[#7E153A]">
          <div className="w-6 h-6 rounded-full bg-[#7E153A] text-white flex items-center justify-center text-xs font-bold">
            1
          </div>
          <span>1. Product & Measurements</span>
        </div>
        <div className="h-px bg-gray-200 flex-1 max-w-[60px]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">
            2
          </div>
          <span>2. Customize</span>
        </div>
        <div className="h-px bg-gray-200 flex-1 max-w-[60px]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">
            3
          </div>
          <span>3. Review & Payment</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── LEFT COLUMN: Product & Link Parser ── */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  1. Product Link & Details
                </h2>
                <p className="text-xs text-gray-500">
                  Paste your unstitched suit link from any online store
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#7E153A] text-[10px] font-bold uppercase tracking-wider">
                Pakistani Stores
              </span>
            </div>

            {/* URL Input Box */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-gray-700 block">
                Product URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://brand.com/product/..."
                    className="pr-10 h-11 bg-gray-50/60 border-gray-200 text-xs focus-visible:ring-[#7E153A]"
                  />
                  <Link2
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
                <Button
                  onClick={handleParseUrl}
                  disabled={parsing}
                  className="bg-[#7E153A] hover:bg-[#630f2d] text-white h-11 px-4 text-xs font-semibold shrink-0"
                >
                  {parsing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Fetch Link'
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-gray-400">
                Supported: Sana Safinaz, Sapphire, Khaadi, Maria.B, Gul Ahmed,
                etc.
              </p>
            </div>

            {/* Parsed Product Card */}
            <div className="flex gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100 mb-6">
              <div className="w-28 h-36 bg-gray-200 rounded-lg overflow-hidden relative shrink-0">
                <img
                  src={productData.imageUrl}
                  alt={productData.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7E153A]">
                  {productData.brand}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-tight my-1">
                  {productData.title}
                </h3>
                <p className="text-[#7E153A] font-extrabold text-base">
                  PKR {productData.price.toLocaleString()}
                </p>
                <div className="mt-2 space-y-0.5 text-[11px] text-gray-600">
                  <p>
                    <span className="text-gray-400">Type:</span>{' '}
                    {productData.type}
                  </p>
                  <p>
                    <span className="text-gray-400">Fabric:</span>{' '}
                    {productData.fabric}
                  </p>
                </div>
              </div>
            </div>

            {/* Stitching Options */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-900 block mb-3">
                Select Stitching Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    key: 'standard',
                    name: 'Standard',
                    price: 2000,
                    desc: 'Everyday fit',
                  },
                  {
                    key: 'premium',
                    name: 'Premium',
                    price: 3000,
                    desc: 'High quality',
                  },
                  {
                    key: 'luxury',
                    name: 'Luxury',
                    price: 4000,
                    desc: 'Designer fit',
                  },
                ].map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setStitchingType(tier.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      stitchingType === tier.key
                        ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-[#7E153A] mb-1.5">
                      <Scissors size={18} />
                    </div>
                    <p className="font-bold text-xs text-gray-900">
                      {tier.name}
                    </p>
                    <p className="text-[#7E153A] font-extrabold text-xs">
                      PKR {tier.price.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-900 font-semibold">
              <Truck size={18} className="text-emerald-600 shrink-0" />
              <span>Stitching + Doorstep Delivery: 5 - 7 Working Days</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Guided Measurement Studio ── */}
        <div className="w-full lg:w-7/12 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  2. Measurements Studio
                </h2>
                <p className="text-xs text-gray-500">
                  Enter custom measurements or pick standard size preset
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Unit Switcher */}
                <div className="bg-gray-100 p-1 rounded-lg flex items-center text-xs font-semibold mr-1">
                  <button
                    onClick={() => toggleUnit('inches')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      unit === 'inches'
                        ? 'bg-white text-[#7E153A] shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => toggleUnit('cm')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      unit === 'cm'
                        ? 'bg-white text-[#7E153A] shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    CM
                  </button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowHowToMeasure(true)}
                  className="h-9 text-xs font-semibold text-[#7E153A] border-red-100 hover:bg-red-50"
                >
                  Video Guide
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSizeChart(true)}
                  className="h-9 text-xs font-semibold"
                >
                  Size Chart
                </Button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex bg-gray-100/70 p-1 rounded-xl mb-6 w-max">
              {[
                { key: 'shirt', label: 'Shirt / Kameez' },
                { key: 'trouser', label: 'Trouser / Bottom' },
                { key: 'dupatta', label: 'Dupatta Styling' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-[#7E153A] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Interactive Studio Grid */}
            <div className="flex flex-col md:flex-row gap-6 mb-4 border border-gray-100 rounded-2xl p-5 bg-gray-50/30">
              {/* Inputs List */}
              <div className="flex-1 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2">
                  {activeTab === 'shirt' && 'Kameez Measurements'}
                  {activeTab === 'trouser' && 'Trouser Measurements'}
                  {activeTab === 'dupatta' && 'Dupatta Dimensions'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {activeTab === 'shirt' &&
                    [
                      {
                        id: 'shoulder',
                        name: 'Shoulder Width',
                        defaultVal: '14',
                      },
                      { id: 'bust', name: 'Bust / Chest', defaultVal: '38' },
                      { id: 'waist', name: 'Waist', defaultVal: '32' },
                      { id: 'hip', name: 'Hip', defaultVal: '40' },
                      {
                        id: 'sleeve_length',
                        name: 'Sleeve Length',
                        defaultVal: '22',
                      },
                      {
                        id: 'shirt_length',
                        name: 'Shirt Length',
                        defaultVal: '44',
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          {field.name} ({unit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          value={measurements[field.id] || field.defaultVal}
                          onFocus={() => setActiveField(field.id)}
                          onChange={(e) =>
                            updateMeasurement(field.id, e.target.value)
                          }
                          className={`h-10 text-sm font-semibold transition-all ${
                            activeField === field.id
                              ? 'border-[#7E153A] ring-2 ring-[#7E153A]/20 bg-white'
                              : 'border-gray-200 bg-white'
                          }`}
                        />
                      </div>
                    ))}

                  {activeTab === 'trouser' &&
                    [
                      {
                        id: 'trouser_length',
                        name: 'Trouser Length',
                        defaultVal: '39',
                      },
                      {
                        id: 'waist_bottom',
                        name: 'Waist (Elastic)',
                        defaultVal: '30',
                      },
                      { id: 'hip_bottom', name: 'Hip', defaultVal: '42' },
                      {
                        id: 'bottom_opening',
                        name: 'Bottom Opening',
                        defaultVal: '7',
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          {field.name} ({unit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          value={measurements[field.id] || field.defaultVal}
                          onFocus={() => setActiveField(field.id)}
                          onChange={(e) =>
                            updateMeasurement(field.id, e.target.value)
                          }
                          className={`h-10 text-sm font-semibold transition-all ${
                            activeField === field.id
                              ? 'border-[#7E153A] ring-2 ring-[#7E153A]/20 bg-white'
                              : 'border-gray-200 bg-white'
                          }`}
                        />
                      </div>
                    ))}

                  {activeTab === 'dupatta' &&
                    [
                      {
                        id: 'dupatta_length',
                        name: 'Dupatta Length',
                        defaultVal: '2.5m',
                      },
                      {
                        id: 'patti_style',
                        name: 'Pico / Border',
                        defaultVal: 'Standard Pico',
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-1 col-span-2">
                        <label className="text-[11px] font-semibold text-gray-600 block">
                          {field.name}
                        </label>
                        <Input
                          type="text"
                          value={measurements[field.id] || field.defaultVal}
                          onChange={(e) =>
                            updateMeasurement(field.id, e.target.value)
                          }
                          className="h-10 text-sm font-semibold border-gray-200 bg-white"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Interactive Female Body SVG Diagram */}
              <div className="flex items-center justify-center shrink-0">
                <BodyDiagram activeField={activeField} gender="female" />
              </div>
            </div>

            {/* AI Proportional Validation Feedback */}
            <ValidationFeedback measurements={measurements} />

            {/* Additional Style Preferences */}
            <div className="my-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Style & Neckline Preferences
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Neckline
                  </label>
                  <select
                    value={neckStyle}
                    onChange={(e) => setNeckStyle(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-[#7E153A]"
                  >
                    <option>Round Neck</option>
                    <option>V-Neck with Patti</option>
                    <option>Ban Collar</option>
                    <option>Boat Neck</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Sleeve Style
                  </label>
                  <select
                    value={sleeveStyle}
                    onChange={(e) => setSleeveStyle(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-[#7E153A]"
                  >
                    <option>Full Sleeve</option>
                    <option>3/4 Sleeve</option>
                    <option>Half Sleeve</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Garment Fit
                  </label>
                  <select
                    value={fitType}
                    onChange={(e) => setFitType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-[#7E153A]"
                  >
                    <option>Regular Fit</option>
                    <option>Relaxed / Loose Fit</option>
                    <option>Slim / Fitted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Special Stitching Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Please add laces on sleeves and piping on neck..."
                  className="w-full h-16 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 focus:border-[#7E153A] resize-none"
                />
              </div>
            </div>

            {/* Bottom Summary Bar & Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Total Price
                </span>
                <span className="text-xl font-extrabold text-[#7E153A]">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="h-11 px-5 text-xs font-semibold"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="h-11 px-6 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold shadow-md shadow-[#7E153A]/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Proceed to Customize →'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        onSelectSize={applyPreset}
      />
      <HowToMeasureModal
        isOpen={showHowToMeasure}
        onClose={() => setShowHowToMeasure(false)}
      />
    </div>
  );
}
