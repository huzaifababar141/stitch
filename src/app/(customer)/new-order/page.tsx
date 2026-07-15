'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Link2,
  Scissors,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Ruler,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Briefcase,
  Home,
  Sliders,
  Check,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BodyDiagram } from '@/components/measurement-studio/BodyDiagram';
import { HowToMeasureModal } from '@/components/measurement-studio/HowToMeasureModal';
import { SizeChartModal } from '@/components/measurement-studio/SizeChartModal';
import { ValidationFeedback } from '@/components/measurement-studio/ValidationFeedback';
import { useMeasurementStudio } from '@/hooks/useMeasurementStudio';

// ─── Stitching Tiers ─────────────────────────────────────────────────────────

const STITCHING_TIERS = [
  {
    key: 'standard',
    name: 'Standard Stitching',
    price: 2000,
    days: '5-7 Days',
    desc: 'Perfect for everyday lawn & casual cotton wear with standard piping and interlock.',
  },
  {
    key: 'premium',
    name: 'Premium Boutique',
    price: 3000,
    days: '4-5 Days',
    desc: 'Boutique finishing, custom laces attachment, fused neckline, and reinforced seams.',
  },
  {
    key: 'luxury',
    name: 'Luxury Designer',
    price: 4000,
    days: '3-4 Days',
    desc: 'Master tailor hand-crafted finishing, double lining, organza trims & priority dispatch.',
  },
];

// ─── Main New Order Page Component ──────────────────────────────────────────

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Wizard Step Control (1: Product -> 2: Style -> 3: Measurements -> 4: Address -> 5: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1: Product / Fabric Link ──
  const [productUrl, setProductUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedProduct, setParsedProduct] = useState<any | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualPrice, setManualPrice] = useState<number | ''>('');
  const [manualFabric, setManualFabric] = useState('');

  // ── Step 2: Customization & Stitching Tier ──
  const [stitchingTier, setStitchingTier] = useState<
    'standard' | 'premium' | 'luxury'
  >('standard');
  const [garmentType, setGarmentType] = useState('full_suit');
  const [neckStyle, setNeckStyle] = useState('Round Neck with Slit');
  const [sleeveStyle, setSleeveStyle] = useState('Full Sleeve with Lace Trim');
  const [fitType, setFitType] = useState('Regular Fit');
  const [damanStyle, setDamanStyle] = useState('Straight Cut Daman');
  const [trouserStyle, setTrouserStyle] = useState(
    'Straight Trouser / Cigarette Pants'
  );
  const [specialInstructions, setSpecialInstructions] = useState('');

  // ── Step 3: Measurement Profile ──
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Fallback / Custom Measurements
  const {
    unit,
    toggleUnit,
    activeField,
    setActiveField,
    measurements,
    updateMeasurement,
    applyPreset,
  } = useMeasurementStudio();

  const [activeTab, setActiveTab] = useState<'shirt' | 'trouser'>('shirt');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);

  // ── Step 4: Delivery Address ──
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [customFullName, setCustomFullName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customAddressLine1, setCustomAddressLine1] = useState('');
  const [customCity, setCustomCity] = useState('Lahore');
  const [customProvince, setCustomProvince] = useState('Punjab');
  const [customLandmark, setCustomLandmark] = useState('');

  // ── Step 5: Pricing & Submission ──
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Fetch saved profiles and addresses
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      const [profilesRes, addressesRes] = await Promise.all([
        fetch('/api/measurements').catch(() => null),
        fetch('/api/users/addresses').catch(() => null),
      ]);

      if (profilesRes && profilesRes.ok) {
        const pJson = await profilesRes.json();
        const items = Array.isArray(pJson.data)
          ? pJson.data
          : Array.isArray(pJson)
            ? pJson
            : [];
        setSavedProfiles(items);
        const defaultProfile = items.find((p: any) => p.isDefault) || items[0];
        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.id);
        } else {
          setSelectedProfileId('custom');
        }
      } else {
        setSelectedProfileId('custom');
      }

      if (addressesRes && addressesRes.ok) {
        const aJson = await addressesRes.json();
        const items = Array.isArray(aJson.data)
          ? aJson.data
          : Array.isArray(aJson)
            ? aJson
            : [];
        setSavedAddresses(items);
        const defaultAddress = items.find((a: any) => a.isDefault) || items[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setSelectedAddressId('custom');
        }
      } else {
        setSelectedAddressId('custom');
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setSelectedProfileId('custom');
      setSelectedAddressId('custom');
    } finally {
      setLoadingProfiles(false);
      setLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ── Validation Guards for Each Step ──

  const validateStep1 = (): boolean => {
    if (!manualTitle || manualTitle.trim().length < 2) {
      toast({
        title: 'Suit Title Required',
        description: 'Please specify the name or title of the suit/dress.',
        variant: 'destructive',
      });
      return false;
    }
    if (!manualBrand || manualBrand.trim().length < 2) {
      toast({
        title: 'Brand Required',
        description:
          'Please specify the brand or store of the unstitched fabric.',
        variant: 'destructive',
      });
      return false;
    }
    if (!manualPrice || manualPrice <= 0 || isNaN(manualPrice)) {
      toast({
        title: 'Valid Retail Price Required',
        description: 'Please provide a valid numeric fabric retail price.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!stitchingTier) {
      toast({
        title: 'Craftsmanship Tier Required',
        description: 'Please select a stitching craftsmanship tier.',
        variant: 'destructive',
      });
      return false;
    }
    if (!neckStyle || !sleeveStyle || !fitType) {
      toast({
        title: 'Style Options Required',
        description:
          'Please select your desired neckline cut, sleeve design, and fitting.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (selectedProfileId && selectedProfileId !== 'custom') {
      const exists = savedProfiles.some((p) => p.id === selectedProfileId);
      if (exists) return true;
    }

    // If custom measurements, verify all key body measurements are filled
    const requiredDims: { key: string; label: string }[] = [
      { key: 'bust', label: 'Bust / Chest' },
      { key: 'waist', label: 'Waist' },
      { key: 'hip', label: 'Hips' },
      { key: 'shoulder', label: 'Shoulder Width' },
      { key: 'sleeve_length', label: 'Sleeve Length' },
      { key: 'shirt_length', label: 'Kameez Length' },
      { key: 'trouser_length', label: 'Trouser Length' },
      { key: 'waist_bottom', label: 'Trouser Waist' },
    ];

    for (const item of requiredDims) {
      const val = parseFloat(measurements[item.key] || '');
      if (isNaN(val) || val <= 0) {
        toast({
          title: 'Measurement Required',
          description: `Please enter a valid numeric measurement for "${item.label}".`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (selectedAddressId && selectedAddressId !== 'custom') {
      const exists = savedAddresses.some((a) => a.id === selectedAddressId);
      if (exists) return true;
    }

    // Custom address validation
    if (!customFullName || customFullName.trim().length < 2) {
      toast({
        title: 'Recipient Name Required',
        description:
          'Please enter the recipient full name for doorstep delivery.',
        variant: 'destructive',
      });
      return false;
    }

    if (!customPhone || customPhone.trim().length < 10) {
      toast({
        title: 'Valid Phone Number Required',
        description:
          'Please provide a valid Pakistani contact number (e.g. 03001234567).',
        variant: 'destructive',
      });
      return false;
    }

    if (!customAddressLine1 || customAddressLine1.trim().length < 5) {
      toast({
        title: 'Delivery Address Required',
        description:
          'Please enter your street address and house/apartment number.',
        variant: 'destructive',
      });
      return false;
    }

    if (!customCity || customCity.trim().length < 2) {
      toast({
        title: 'City Required',
        description: 'Please select or enter your delivery city.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  // Safe Step Navigator
  const handleGoToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    if (currentStep === 1 && !validateStep1()) return;
    if (targetStep >= 3 && !validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (targetStep >= 4 && !validateStep3()) {
      setCurrentStep(3);
      return;
    }
    if (targetStep >= 5 && !validateStep4()) {
      setCurrentStep(4);
      return;
    }

    setCurrentStep(targetStep);
  };

  // Handle URL Link Parsing
  const handleParseUrl = async () => {
    if (!productUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please paste a link to an unstitched Pakistani suit.',
        variant: 'destructive',
      });
      return;
    }

    setParsing(true);
    try {
      const res = await fetch('/api/products/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim() }),
      });

      if (res.ok) {
        const json = await res.json();
        const prod = json.data || json;
        setParsedProduct(prod);
        setManualTitle(prod.name || prod.title || 'Unstitched Suit');
        setManualBrand(prod.brand || 'Designer Brand');
        if (prod.priceOriginal) {
          setManualPrice(Number(prod.priceOriginal));
        }
        toast({
          title: 'Product Parsed',
          description: `Loaded suit details from ${prod.brand || 'store'}.`,
        });
      } else {
        toast({
          title: 'Direct Link Saved',
          description:
            'Link attached to order. You can fine-tune fabric details.',
        });
      }
    } catch (err) {
      toast({
        title: 'Direct Link Saved',
        description: 'Link attached to order.',
      });
    } finally {
      setParsing(false);
    }
  };

  // Pricing Calculation
  const currentTierObj =
    STITCHING_TIERS.find((t) => t.key === stitchingTier) || STITCHING_TIERS[0];
  const suitFabricPrice = Number(
    parsedProduct?.priceOriginal || manualPrice || 0
  );
  const stitchingFee = currentTierObj.price;
  const deliveryFee = 150;
  const grandTotal =
    suitFabricPrice + stitchingFee + deliveryFee - discountApplied;

  // Apply Promo Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      if (couponCode.toUpperCase() === 'FIRST500') {
        setDiscountApplied(500);
        toast({
          title: 'Coupon Applied',
          description: 'PKR 500 discount added to your order.',
        });
      } else if (couponCode.toUpperCase() === 'STITCH10') {
        const disc = Math.round(stitchingFee * 0.1);
        setDiscountApplied(disc);
        toast({
          title: 'Coupon Applied',
          description: `10% stitching discount (-PKR ${disc}) applied.`,
        });
      } else {
        toast({
          title: 'Invalid Coupon Code',
          description: 'Please check your promo code and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Place Order Handler with full validation
  const handlePlaceOrder = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep3()) {
      setCurrentStep(3);
      return;
    }
    if (!validateStep4()) {
      setCurrentStep(4);
      return;
    }

    setSubmittingOrder(true);

    try {
      const payload: Record<string, any> = {
        garmentType,
        stitchingTier,
        couponCode: couponCode.trim() || undefined,
        internalNotes: specialInstructions.trim() || undefined,
      };

      // 1. Product Link / ID
      if (parsedProduct?.id) {
        payload.productId = parsedProduct.id;
      }

      // 2. Style Preferences
      payload.stylePreferences = {
        neckStyle,
        sleeveStyle,
        fitType,
        damanStyle,
        trouserStyle,
        specialInstructions,
      };

      // 3. Measurement Profile
      if (selectedProfileId && selectedProfileId !== 'custom') {
        payload.measurementProfileId = selectedProfileId;
      } else {
        payload.customMeasurements = measurements;
      }

      // 4. Delivery Address
      if (selectedAddressId && selectedAddressId !== 'custom') {
        payload.deliveryAddressId = selectedAddressId;
      } else {
        payload.customAddress = {
          fullName: customFullName.trim(),
          phone: customPhone.trim(),
          addressLine1: customAddressLine1.trim(),
          city: customCity.trim(),
          province: customProvince.trim(),
          landmark: customLandmark.trim() || undefined,
        };
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const newOrder = json.data || json;
        toast({
          title: 'Order Placed Successfully',
          description: `Order #${newOrder.orderNumber || ''} allocated to production.`,
        });

        // Redirect to live order tracking
        if (newOrder.id) {
          router.push(`/orders/${newOrder.id}`);
        } else {
          router.push('/orders');
        }
      } else {
        const json = await res.json();
        toast({
          title: 'Order Placement Failed',
          description:
            json.error?.message ||
            'Could not place order. Please review your details.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to place tailoring order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2 font-sans">
      {/* ── Top Header & Wizard Stepper ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Create Tailoring Order
            </h1>
            <p className="text-xs text-gray-500">
              Link your unstitched suit fabric, pick your master tailoring
              styles, and schedule doorstep delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-red-50 text-[#7E153A] px-3.5 py-1.5 rounded-xl text-xs font-bold border border-red-100">
            <ShieldCheck size={16} />
            <span>Guaranteed Perfect Fit Guarantee</span>
          </div>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {[
            { step: 1, label: '1. Suit Fabric' },
            { step: 2, label: '2. Style & Tier' },
            { step: 3, label: '3. Fit & Sizing' },
            { step: 4, label: '4. Delivery Address' },
            { step: 5, label: '5. Review & Place' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => handleGoToStep(s.step)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isActive
                    ? 'border-[#7E153A] bg-red-50/50 text-[#7E153A] ring-2 ring-[#7E153A]/10 font-bold'
                    : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800 font-semibold'
                      : 'border-gray-200 bg-white text-gray-400 font-medium hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#7E153A] text-white'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : s.step}
                </div>
                <span className="text-xs truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: Fabric & Product Link ── */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-gray-900">
                1. Unstitched Fabric & Store Link
              </h2>
              <p className="text-xs text-gray-500">
                Paste any product URL from Sana Safinaz, Khaadi, Sapphire, Gul
                Ahmed, or Maria.B to fetch details automatically.
              </p>
            </div>

            {/* URL Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Brand Online Store Link (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="url"
                    placeholder="https://www.sanasafinaz.com/pk/mahay-lawn-3-piece..."
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="h-11 text-xs bg-gray-50/60 rounded-xl pr-10 border-gray-200"
                  />
                  <Link2
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <Button
                  onClick={handleParseUrl}
                  disabled={parsing}
                  className="h-11 px-5 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer shrink-0"
                >
                  {parsing ? (
                    <Loader2 size={16} className="animate-spin mr-1.5" />
                  ) : (
                    'Fetch Details'
                  )}
                </Button>
              </div>
            </div>

            {/* Manual / Overwrite Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Suit / Dress Title <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Mahay Lawn 3-Piece"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="h-10 text-xs rounded-xl border-gray-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Brand Name <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sana Safinaz"
                  value={manualBrand}
                  onChange={(e) => setManualBrand(e.target.value)}
                  className="h-10 text-xs rounded-xl border-gray-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Fabric Retail Price (PKR){' '}
                  <span className="text-[#7E153A]">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="4850"
                  value={manualPrice === '' ? '' : manualPrice}
                  onChange={(e) =>
                    setManualPrice(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="h-10 text-xs rounded-xl border-gray-200 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Fabric Material
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Lawn / Cotton / Chiffon"
                  value={manualFabric}
                  onChange={(e) => setManualFabric(e.target.value)}
                  className="h-10 text-xs rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => handleGoToStep(2)}
                className="h-11 px-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                Continue to Style & Tier{' '}
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Product Preview Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                Selected Garment Preview
              </span>
              <div className="w-full aspect-[4/3] rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                {parsedProduct?.images?.[0] ? (
                  <img
                    src={parsedProduct.images[0]}
                    alt={manualTitle || 'Product Preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center">
                      <Scissors size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {manualTitle ? manualTitle : 'No Suit Linked Yet'}
                    </span>
                    <span className="text-[11px] text-gray-400 leading-tight">
                      Paste a brand URL above or enter fabric details to see
                      live preview
                    </span>
                  </div>
                )}
              </div>

              {manualTitle || manualBrand || parsedProduct ? (
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#7E153A] tracking-wider">
                    {manualBrand || 'Pakistani Brand'}
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-0.5">
                    {manualTitle || 'Unstitched Suit'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {manualFabric || 'Unstitched Fabric'}
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Suit Details
                  </span>
                  <p className="text-xs text-gray-400 italic mt-0.5">
                    Awaiting fabric link or manual input...
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">
                Fabric Value:
              </span>
              <span className="text-sm font-extrabold text-gray-900 font-mono">
                {suitFabricPrice > 0
                  ? `PKR ${suitFabricPrice.toLocaleString()}`
                  : 'PKR 0'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Style & Stitching Tier ── */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-gray-900">
              2. Select Stitching Tier & Custom Cuts
            </h2>
            <p className="text-xs text-gray-500">
              Choose your master craftsman finishing level and neckline style
              configuration.
            </p>
          </div>

          {/* Stitching Tiers Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              Stitching Craftsmanship Tier
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STITCHING_TIERS.map((tier) => {
                const isSelected = stitchingTier === tier.key;
                return (
                  <div
                    key={tier.key}
                    onClick={() => setStitchingTier(tier.key as any)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {tier.name}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">
                          {tier.days}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {tier.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-sm font-extrabold text-[#7E153A] font-mono">
                        PKR {tier.price.toLocaleString()}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'border-[#7E153A] bg-[#7E153A] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Style Configuration Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Neckline Cut
              </label>
              <select
                value={neckStyle}
                onChange={(e) => setNeckStyle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
              >
                <option>Round Neck with Slit</option>
                <option>V-Neck with Patti</option>
                <option>Ban Collar / Chinese Collar</option>
                <option>Boat Neck (Wide)</option>
                <option>Square Neckline</option>
                <option>Angrakha Style Overlap</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Sleeve Design
              </label>
              <select
                value={sleeveStyle}
                onChange={(e) => setSleeveStyle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
              >
                <option>Full Sleeve with Lace Trim</option>
                <option>Straight 3/4 Sleeve</option>
                <option>Bell Sleeve (Flared)</option>
                <option>Cuff Sleeve with Buttons</option>
                <option>Sleeveless with Piping</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Garment Fitting
              </label>
              <select
                value={fitType}
                onChange={(e) => setFitType(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
              >
                <option>Regular Fit</option>
                <option>Relaxed / Loose Fit</option>
                <option>Smart Fitted</option>
                <option>A-Line Flare</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Kameez Daman Style
              </label>
              <select
                value={damanStyle}
                onChange={(e) => setDamanStyle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
              >
                <option>Straight Cut Daman</option>
                <option>Round / Curved Daman</option>
                <option>Chak Patti & Interlock</option>
                <option>Side Slits Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Trouser / Shalwar Cut
              </label>
              <select
                value={trouserStyle}
                onChange={(e) => setTrouserStyle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
              >
                <option>Straight Trouser / Cigarette Pants</option>
                <option>Traditional Pleated Shalwar</option>
                <option>Culottes / Wide Bottom Pants</option>
                <option>Tulip Shalwar</option>
                <option>Capri with Slits</option>
              </select>
            </div>
          </div>

          {/* Master Tailor Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Special Stitching Instructions for Master Tailor (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please keep 2 inches extra fabric inside side seams. Attach lace on sleeve borders."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:border-[#7E153A] text-gray-900"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 px-6 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <ArrowLeft size={14} className="mr-1.5" /> Back
            </Button>

            <Button
              onClick={() => handleGoToStep(3)}
              className="h-11 px-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
            >
              Continue to Measurements{' '}
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Measurements Profile ── */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-gray-900">
              3. Measurement Profile & Fit Dimensions
            </h2>
            <p className="text-xs text-gray-500">
              Pick a saved fitting profile from your Measurement Studio or
              adjust dimensions manually.
            </p>
          </div>

          {/* Saved Profiles Selector */}
          {savedProfiles.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                Select Measurement Profile{' '}
                <span className="text-[#7E153A]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedProfiles.map((p) => {
                  const isSelected = selectedProfileId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {p.label}
                        </h4>
                        {p.isDefault && (
                          <span className="bg-red-50 text-[#7E153A] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-100 uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Kameez: {p.kameezLength}&quot; · Chest: {p.chest}&quot;
                        · Waist: {p.waist}&quot; · Trouser: {p.trouserLength}
                        &quot;
                      </p>
                    </div>
                  );
                })}

                <div
                  onClick={() => setSelectedProfileId('custom')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedProfileId === 'custom'
                      ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                      : 'border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50'
                  }`}
                >
                  <Plus size={16} className="text-[#7E153A]" />
                  <span className="text-xs font-bold text-gray-700">
                    Enter Custom Measurements
                  </span>
                </div>
              </div>

              {/* Selected Profile Detailed Specs Banner */}
              {selectedProfileId && selectedProfileId !== 'custom' && (
                <div className="bg-red-50/40 border border-red-100 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#7E153A]">
                      <Ruler size={16} />
                      <span>
                        Attached Fit Profile:{' '}
                        <span className="underline font-extrabold">
                          {savedProfiles.find((p) => p.id === selectedProfileId)
                            ?.label || 'Selected Profile'}
                        </span>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-full text-[#7E153A] border border-red-100">
                      Auto-Attached to Order
                    </span>
                  </div>

                  {(() => {
                    const prof = savedProfiles.find(
                      (p) => p.id === selectedProfileId
                    );
                    if (!prof) return null;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Kameez Length
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.kameezLength}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Chest / Bust
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.chest}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Waist
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.waist}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Hips / Seat
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.hips}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Shoulder Width
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.shoulderWidth}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Sleeve Length
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.sleeveLength}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Trouser Length
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.trouserLength}&quot;
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Ankle Opening
                          </span>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {prof.ankle}&quot;
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Custom Studio Inputs Grid (when custom selected or no profile) */}
          {(selectedProfileId === 'custom' || savedProfiles.length === 0) && (
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('shirt')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      activeTab === 'shirt'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    Kameez Dimensions
                  </button>
                  <button
                    onClick={() => setActiveTab('trouser')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      activeTab === 'trouser'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    Trouser Dimensions
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSizeChart(true)}
                    className="h-8 text-xs font-semibold rounded-lg"
                  >
                    <Sliders size={13} className="mr-1" /> Standard Sizes
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  {activeTab === 'shirt' && (
                    <>
                      {[
                        {
                          id: 'shirt_length',
                          name: 'Kameez Length',
                          defaultVal: '42',
                        },
                        { id: 'bust', name: 'Chest / Bust', defaultVal: '38' },
                        { id: 'waist', name: 'Waist', defaultVal: '32' },
                        { id: 'hip', name: 'Hips', defaultVal: '40' },
                        {
                          id: 'shoulder',
                          name: 'Shoulder Width',
                          defaultVal: '14.5',
                        },
                        {
                          id: 'sleeve_length',
                          name: 'Sleeve Length',
                          defaultVal: '22',
                        },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">
                            {field.name} (in){' '}
                            <span className="text-[#7E153A]">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.5"
                            value={measurements[field.id] || field.defaultVal}
                            onFocus={() => setActiveField(field.id)}
                            onChange={(e) =>
                              updateMeasurement(field.id, e.target.value)
                            }
                            className="h-9 text-xs bg-white font-mono font-bold"
                            required
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'trouser' && (
                    <>
                      {[
                        {
                          id: 'trouser_length',
                          name: 'Trouser Length',
                          defaultVal: '39',
                        },
                        {
                          id: 'waist_bottom',
                          name: 'Trouser Waist',
                          defaultVal: '30',
                        },
                        {
                          id: 'bottom_opening',
                          name: 'Ankle Opening (Paicha)',
                          defaultVal: '14',
                        },
                        {
                          id: 'hip_bottom',
                          name: 'Hips / Seat',
                          defaultVal: '42',
                        },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">
                            {field.name} (in){' '}
                            <span className="text-[#7E153A]">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.5"
                            value={measurements[field.id] || field.defaultVal}
                            onFocus={() => setActiveField(field.id)}
                            onChange={(e) =>
                              updateMeasurement(field.id, e.target.value)
                            }
                            className="h-9 text-xs bg-white font-mono font-bold"
                            required
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-100">
                  <BodyDiagram activeField={activeField} gender="female" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="h-11 px-6 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <ArrowLeft size={14} className="mr-1.5" /> Back
            </Button>

            <Button
              onClick={() => handleGoToStep(4)}
              className="h-11 px-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
            >
              Continue to Delivery Address{' '}
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Delivery Address ── */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-gray-900">
              4. Doorstep Pickup & Delivery Destination
            </h2>
            <p className="text-xs text-gray-500">
              Select where TCS courier should deliver your tailored garments
              upon quality inspection.
            </p>
          </div>

          {/* Saved Addresses List */}
          {savedAddresses.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                Select Delivery Address{' '}
                <span className="text-[#7E153A]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  const TypeIcon =
                    addr.label?.toLowerCase() === 'office' ? Briefcase : Home;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon size={16} className="text-[#7E153A]" />
                            <h4 className="font-extrabold text-sm text-gray-900">
                              {addr.label || 'Home'}
                            </h4>
                          </div>
                          {addr.isDefault && (
                            <span className="bg-red-50 text-[#7E153A] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-100 uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-800">
                          {addr.fullName} ({addr.phone})
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {addr.addressLine1}, {addr.city}, {addr.province}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] font-bold text-emerald-700">
                        <span>TCS Doorstep Eligible</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? 'border-[#7E153A] bg-[#7E153A] text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div
                  onClick={() => setSelectedAddressId('custom')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    selectedAddressId === 'custom'
                      ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                      : 'border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50'
                  }`}
                >
                  <Plus size={18} className="text-[#7E153A]" />
                  <span className="text-xs font-bold text-gray-700">
                    Enter New Delivery Address
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Fill address details for this order
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Inline Address Entry Form (when custom selected or no saved addresses) */}
          {(selectedAddressId === 'custom' || savedAddresses.length === 0) && (
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <MapPin size={16} className="text-[#7E153A]" />
                  <span>Enter Delivery Address Details</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Doorstep Courier
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Recipient Full Name{' '}
                    <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Fatima Ali"
                    value={customFullName}
                    onChange={(e) => setCustomFullName(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Phone Number <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="03001234567"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-gray-200 font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Street Address & House / Flat #{' '}
                    <span className="text-[#7E153A]">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. House 42, Street 8, Phase 5 DHA"
                    value={customAddressLine1}
                    onChange={(e) => setCustomAddressLine1(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    City <span className="text-[#7E153A]">*</span>
                  </label>
                  <select
                    value={customCity}
                    onChange={(e) => {
                      const city = e.target.value;
                      setCustomCity(city);
                      if (['Karachi', 'Hyderabad', 'Sukkur'].includes(city))
                        setCustomProvince('Sindh');
                      else if (
                        ['Peshawar', 'Mardan', 'Abbottabad'].includes(city)
                      )
                        setCustomProvince('Khyber Pakhtunkhwa');
                      else if (['Quetta', 'Gwadar'].includes(city))
                        setCustomProvince('Balochistan');
                      else if (city === 'Islamabad')
                        setCustomProvince('Islamabad');
                      else setCustomProvince('Punjab');
                    }}
                    className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-[#7E153A]"
                  >
                    <option>Lahore</option>
                    <option>Karachi</option>
                    <option>Islamabad</option>
                    <option>Rawalpindi</option>
                    <option>Faisalabad</option>
                    <option>Multan</option>
                    <option>Peshawar</option>
                    <option>Quetta</option>
                    <option>Gujranwala</option>
                    <option>Sialkot</option>
                    <option>Hyderabad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Province
                  </label>
                  <Input
                    type="text"
                    value={customProvince}
                    onChange={(e) => setCustomProvince(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Nearest Landmark (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Near Jalal Sons or Commercial Market"
                    value={customLandmark}
                    onChange={(e) => setCustomLandmark(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              className="h-11 px-6 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <ArrowLeft size={14} className="mr-1.5" /> Back
            </Button>

            <Button
              onClick={() => handleGoToStep(5)}
              className="h-11 px-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
            >
              Review & Price Breakdown{' '}
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Review & Place Order ── */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Order Summary Specification */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-gray-900">
                5. Review Order Specifications
              </h2>
              <p className="text-xs text-gray-500">
                Verify your custom styling and dimensions before sending to
                master tailor queue.
              </p>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Garment & Brand
                </span>
                <p className="font-extrabold text-gray-900">{manualTitle}</p>
                <p className="text-gray-500">
                  {manualBrand} · {manualFabric}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Craftsmanship Tier
                </span>
                <p className="font-extrabold text-[#7E153A]">
                  {currentTierObj.name}
                </p>
                <p className="text-gray-500">
                  {currentTierObj.days} Turnaround
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Style Configurations
                </span>
                <p className="font-semibold text-gray-900">{neckStyle}</p>
                <p className="text-gray-500">
                  {sleeveStyle} · {fitType}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Delivery Destination
                </span>
                <p className="font-semibold text-gray-900">
                  {selectedAddressId && selectedAddressId !== 'custom'
                    ? savedAddresses.find((a) => a.id === selectedAddressId)
                        ?.fullName || 'Doorstep Delivery'
                    : customFullName || 'Doorstep Delivery'}
                </p>
                <p className="text-gray-500">
                  {selectedAddressId && selectedAddressId !== 'custom'
                    ? `${savedAddresses.find((a) => a.id === selectedAddressId)?.city || 'Pakistan'}`
                    : `${customCity}, ${customProvince}`}
                </p>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 block">
                Promo or Referral Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Enter FIRST500 or STITCH10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-11 text-xs bg-gray-50/60 rounded-xl pr-10 uppercase font-mono font-bold"
                  />
                  <Tag
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <Button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  variant="outline"
                  className="h-11 px-5 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer shrink-0"
                >
                  {applyingCoupon ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(4)}
                className="h-11 px-6 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <ArrowLeft size={14} className="mr-1.5" /> Back to Address
              </Button>
            </div>
          </div>

          {/* Right Invoice & Confirmation Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">
                Order Total Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Fabric / Suit Retail</span>
                  <span className="font-mono font-semibold text-gray-900">
                    PKR {suitFabricPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>{currentTierObj.name}</span>
                  <span className="font-mono font-semibold text-gray-900">
                    PKR {stitchingFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>TCS Doorstep Courier</span>
                  <span className="font-mono font-semibold text-gray-900">
                    PKR {deliveryFee.toLocaleString()}
                  </span>
                </div>

                {discountApplied > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl">
                    <span>Discount Applied</span>
                    <span className="font-mono">
                      -PKR {discountApplied.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-gray-900">
                    Grand Total
                  </span>
                  <span className="text-xl font-extrabold text-[#7E153A] font-mono">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-[#7E153A]">
                  Doorstep Quality Inspection Included
                </p>
                <p>
                  Each stitch is verified by our QC inspector before TCS courier
                  dispatch.
                </p>
              </div>
            </div>

            {/* Place Order Primary Action */}
            <Button
              onClick={handlePlaceOrder}
              disabled={submittingOrder}
              className="w-full h-12 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-lg shadow-[#7E153A]/25 cursor-pointer transition-all"
            >
              {submittingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Allocating Master Tailor...
                </>
              ) : (
                'Place Custom Tailoring Order'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Reference Modals */}
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
