'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  User,
  Table2,
  ChevronDown,
  ChevronUp,
  Boxes,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BodyDiagram } from '@/components/measurement-studio/BodyDiagram';
import { HowToMeasureModal } from '@/components/measurement-studio/HowToMeasureModal';
import { SizeChartModal } from '@/components/measurement-studio/SizeChartModal';
import { ValidationFeedback } from '@/components/measurement-studio/ValidationFeedback';
import {
  useMeasurementStudio,
  getProfileGarmentType,
  MEN_TROUSER_CODES,
  WOMEN_TROUSER_CODES,
} from '@/hooks/useMeasurementStudio';
import {
  FEMALE_GARMENTS,
  MENS_GARMENTS,
  getStitchingTiers,
  calculateStitchingFee,
  formatPKR,
  type StitchingTierKey,
} from '@/lib/constants/pricing';
import {
  WOMEN_COLLARS,
  WOMEN_CUFFS,
  WOMEN_TROUSERS,
  MEN_COLLARS,
  MEN_CUFFS,
  MEN_TROUSERS,
  FROCK_NECKLINES,
  FROCK_SLEEVES,
  FROCK_STYLES,
  FROCK_DAMANS,
  FROCK_OPTIONS,
} from '@/lib/constants/customizations';

// ─── Main New Order Wizard Content ──────────────────────────────────────────

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Wizard Step Control (1: Product -> 2: Style -> 3: Measurements -> 4: Address -> 5: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1: Product / Fabric Link & Gender ──
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [productUrl, setProductUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedProduct, setParsedProduct] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [manualTitle, setManualTitle] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualPrice, setManualPrice] = useState<number | ''>('');
  const [manualFabric, setManualFabric] = useState('');

  // ── Step 2: Customization & Stitching Tier ──
  const [stitchingTier, setStitchingTier] =
    useState<StitchingTierKey>('standard');
  const [showRateCard, setShowRateCard] = useState(false);
  const [garmentType, setGarmentType] = useState('full_suit');
  // Women's Styles
  const [neckStyle, setNeckStyle] = useState('Round Neck');
  const [frockStyle, setFrockStyle] = useState('A-Line');
  const [selectedFrockOptions, setSelectedFrockOptions] = useState<string[]>([
    'Button Style',
  ]);
  // Men's Styles
  const [collarStyle, setCollarStyle] = useState('Classic Collar');
  const [cuffStyle, setCuffStyle] = useState('Regular Cuff');
  const [pocketStyle, setPocketStyle] = useState(
    '1 Chest Pocket + 2 Side Pockets'
  );
  // Shared / General Styles
  const [sleeveStyle, setSleeveStyle] = useState('Full Sleeve');
  const [fitType, setFitType] = useState('Regular Fit');
  const [damanStyle, setDamanStyle] = useState('Straight');
  const [trouserStyle, setTrouserStyle] = useState('Straight Fit');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Handler for Gender Switching
  const handleGenderChange = (newGender: 'female' | 'male') => {
    setGender(newGender);
    setGenderDefaults(newGender);
    setSelectedTrouserCode(newGender === 'male' ? 'P-32' : 'T-30');
    if (newGender === 'male') {
      setGarmentType('full_suit');
      setCollarStyle('Classic Collar');
      setCuffStyle('Regular Cuff');
      setSleeveStyle('Full Sleeve');
      setPocketStyle('1 Chest Pocket + 2 Side Pockets');
      setDamanStyle('Straight');
      setTrouserStyle('Straight Fit');
      setFitType('Regular Fit');
      if (!manualTitle || manualTitle === 'Mahay Lawn 3-Piece') {
        setManualTitle("Men's Traditional Shalwar Kameez");
      }
      if (!manualBrand || manualBrand === 'Sana Safinaz') {
        setManualBrand('J. (Junaid Jamshed)');
      }
    } else {
      setGarmentType('full_suit');
      setCollarStyle('Classic Collar');
      setCuffStyle('Regular Cuff');
      setNeckStyle('Round Neck');
      setSleeveStyle('Full Sleeve');
      setFrockStyle('A-Line');
      setDamanStyle('Straight');
      setTrouserStyle('Straight Fit');
      setFitType('Regular Fit');
      if (!manualTitle || manualTitle === "Men's Traditional Shalwar Kameez") {
        setManualTitle('Mahay Lawn 3-Piece');
      }
      if (!manualBrand || manualBrand === 'J. (Junaid Jamshed)') {
        setManualBrand('Sana Safinaz');
      }
    }
  };

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
    setGenderDefaults,
  } = useMeasurementStudio(gender);

  const [activeTab, setActiveTab] = useState<'shirt' | 'trouser'>('shirt');
  const [selectedTrouserCode, setSelectedTrouserCode] = useState<string | null>(
    'P-32'
  );
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);

  // Apply Trouser Code Handler
  const handleSelectTrouserCode = (item: any) => {
    setSelectedTrouserCode(item.code);
    Object.entries(item.measurements).forEach(([k, v]) => {
      updateMeasurement(
        k,
        unit === 'cm'
          ? (parseFloat(v as string) * 2.54).toFixed(1)
          : (v as string)
      );
    });
    toast({
      title: `Trouser Code ${item.code} Applied`,
      description: `Dimensions: Length ${item.measurements.trouser_length}" · Waist ${item.measurements.waist_bottom}" · Paicha ${item.measurements.bottom_opening}"`,
    });
  };

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
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadUserData = async () => {
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
          if (!isMounted) return;
          setSavedProfiles(items);
          const defaultProfile =
            items.find((p: any) => p.isDefault) || items[0];
          if (defaultProfile) {
            setSelectedProfileId(defaultProfile.id);
          } else {
            setSelectedProfileId('custom');
          }
        } else {
          if (!isMounted) return;
          setSelectedProfileId('custom');
        }

        if (addressesRes && addressesRes.ok) {
          const aJson = await addressesRes.json();
          const items = Array.isArray(aJson.data)
            ? aJson.data
            : Array.isArray(aJson)
              ? aJson
              : [];
          if (!isMounted) return;
          setSavedAddresses(items);
          const defaultAddress =
            items.find((a: any) => a.isDefault) || items[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else {
            setSelectedAddressId('custom');
          }
        } else {
          if (!isMounted) return;
          setSelectedAddressId('custom');
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        if (isMounted) {
          setSelectedProfileId('custom');
          setSelectedAddressId('custom');
        }
      } finally {
        if (isMounted) {
          setLoadingProfiles(false);
          setLoadingAddresses(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load URL query parameters (e.g. from Wishlist "Stitch This", Designs "Apply to Order", etc.)
  useEffect(() => {
    const urlParam = searchParams.get('productUrl');
    const styleConfigIdParam = searchParams.get('styleConfigId');
    const titleParam = searchParams.get('title');
    const brandParam = searchParams.get('brand');
    const priceParam = searchParams.get('price');
    const genderParam = searchParams.get('gender');

    const productIdParam = searchParams.get('productId');

    if (productIdParam) {
      fetch(`/api/products/${productIdParam}`)
        .then((res) => res.json())
        .then((json) => {
          const prod = json.data || json;
          if (prod && prod.id) {
            setParsedProduct(prod);
            setSelectedImageIndex(0);
            if (prod.name) setManualTitle(prod.name);
            if (prod.brand) setManualBrand(prod.brand);
            if (prod.priceOriginal) setManualPrice(Number(prod.priceOriginal));
            if (prod.fabricType) setManualFabric(prod.fabricType);

            const meta = prod.parseMetadata || {};
            if (meta.gender === 'male' || meta.gender === 'female') {
              handleGenderChange(meta.gender);
            }
            if (meta.garmentSubtype) {
              setGarmentType(meta.garmentSubtype);
            } else if (prod.garmentType) {
              setGarmentType(prod.garmentType);
            }

            toast({
              title: 'In-House Fabric Selected',
              description: `"${prod.name}" attached to your tailoring order.`,
            });
          }
        })
        .catch(() => {});
    }

    if (urlParam) {
      setProductUrl(urlParam);
    }
    if (titleParam) {
      setManualTitle(titleParam);
    }
    if (brandParam) {
      setManualBrand(brandParam);
    }
    if (priceParam && !isNaN(Number(priceParam))) {
      setManualPrice(Number(priceParam));
    }
    if (genderParam === 'male' || genderParam === 'female') {
      handleGenderChange(genderParam);
    }

    if (styleConfigIdParam) {
      fetch(`/api/designs/${styleConfigIdParam}`)
        .then((res) => res.json())
        .then((data) => {
          const style = data.data || data;
          if (style) {
            if (style.gender) handleGenderChange(style.gender);
            if (style.stitchingTier) {
              const t = String(style.stitchingTier).toLowerCase();
              if (t === 'basic' || t === 'luxury') {
                setStitchingTier(t as StitchingTierKey);
              } else {
                setStitchingTier('standard');
              }
            }
            if (style.neckStyle) setNeckStyle(style.neckStyle);
            if (style.collarStyle) setCollarStyle(style.collarStyle);
            if (style.sleeveStyle) setSleeveStyle(style.sleeveStyle);
            if (style.pocketStyle) setPocketStyle(style.pocketStyle);
            if (style.damanStyle) setDamanStyle(style.damanStyle);
            if (style.trouserStyle) setTrouserStyle(style.trouserStyle);
            if (style.fitType) setFitType(style.fitType);
            if (style.specialInstructions)
              setSpecialInstructions(style.specialInstructions);
            toast({
              title: 'Design Preset Loaded',
              description: `Applied styles from "${style.label || 'Saved Design'}"`,
            });
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Validation Guards for Each Step ──

  const validateStep1 = (): boolean => {
    if (!gender) {
      toast({
        title: 'Gender Required',
        description:
          'Please select whether this order is for Women or Men tailoring.',
        variant: 'destructive',
      });
      return false;
    }
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
    return true;
  };

  const validateStep3 = (): boolean => {
    if (selectedProfileId === 'sample_suit') {
      return true;
    }
    if (selectedProfileId && selectedProfileId !== 'custom') {
      const exists = savedProfiles.some((p) => p.id === selectedProfileId);
      if (exists) return true;
    }

    // If custom measurements, verify all key body measurements are filled
    const requiredDims =
      gender === 'male'
        ? [
            { key: 'bust', label: 'Chest' },
            { key: 'waist', label: 'Waist' },
            { key: 'shoulder', label: 'Shoulder (Teera)' },
            { key: 'sleeve_length', label: 'Sleeve Length' },
            { key: 'shirt_length', label: 'Kurta / Kameez Length' },
            { key: 'trouser_length', label: 'Shalwar Length' },
          ]
        : [
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

        // 1. Gender Synchronization:
        // When prod.gender ('male' | 'female') is present, immediately call handleGenderChange(prod.gender).
        // This switches active tab, sets Men's or Women's default styles (Ban collar vs neck slit,
        // sleeves, daman, P-32 vs T-30 trousers, and appropriate stitching tiers).
        if (prod.gender === 'male' || prod.gender === 'female') {
          handleGenderChange(prod.gender);
        }

        // 2. Garment Type Synchronization:
        // If prod.garmentType is provided and valid, call setGarmentType(prod.garmentType).
        if (prod.garmentType) {
          const validMenGarmentTypes = [
            'full_suit',
            'waistcoat',
            'pant_coat',
            'kurta_only',
            'kurta',
            'kameez_only',
            'other',
          ];
          const validWomenGarmentTypes = [
            'full_suit',
            'kameez_only',
            'frock_maxi',
            'trouser_only',
            'other',
          ];
          const allowedTypes =
            prod.gender === 'male'
              ? validMenGarmentTypes
              : validWomenGarmentTypes;
          if (allowedTypes.includes(prod.garmentType)) {
            const mappedType =
              prod.garmentType === 'kurta' ? 'kurta_only' : prod.garmentType;
            setGarmentType(mappedType);
          }
        }

        // 3. Set Manual Title, Brand, Price, Fabric, and Images
        setParsedProduct(prod);
        setSelectedImageIndex(0);
        setManualTitle(prod.name || prod.title || 'Unstitched Suit');
        setManualBrand(prod.brand || 'Designer Brand');

        if (prod.priceOriginal !== null && prod.priceOriginal !== undefined) {
          setManualPrice(Number(prod.priceOriginal) || 0);
        }

        if (prod.fabricMaterial) {
          setManualFabric(prod.fabricMaterial);
        }

        // 4. Toast Notification
        const genderUpper = prod.gender ? prod.gender.toUpperCase() : 'APPAREL';
        const brandName = prod.brand || 'Designer Brand';
        toast({
          title: `Product Parsed: Detected ${genderUpper} apparel (${brandName})`,
          description: `Loaded suit details, synchronized ${
            prod.gender === 'male' ? "Men's" : "Women's"
          } tailoring styles, and updated pricing.`,
        });
      } else {
        const errorJson = await res.json().catch(() => null);
        const errMsg =
          errorJson?.message ||
          errorJson?.error?.message ||
          'Link attached to order. You can fine-tune fabric details.';
        toast({
          title: 'Direct Link Saved',
          description: errMsg,
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
  const currentTiers = getStitchingTiers(gender, garmentType);
  const currentTierObj =
    currentTiers.find((t) => t.key === stitchingTier) || currentTiers[0];
  const suitFabricPrice = Number(
    parsedProduct?.priceOriginal || manualPrice || 0
  );
  const stitchingFee = currentTierObj
    ? currentTierObj.price
    : calculateStitchingFee(gender, garmentType, stitchingTier);
  const deliveryFee = 150;
  const grandTotal =
    suitFabricPrice + stitchingFee + deliveryFee - discountApplied;

  // Apply Promo / Referral Coupon via Backend API
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          stitchingFee,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.valid) {
        setDiscountApplied(json.data.discountAmount);
        toast({
          title: 'Discount Applied',
          description:
            json.data.message ||
            `PKR ${json.data.discountAmount} discount applied to your order.`,
        });
      } else {
        setDiscountApplied(0);
        toast({
          title: 'Invalid Code',
          description:
            json.error?.message ||
            'Could not validate this promo or referral code.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to validate coupon with server.',
        variant: 'destructive',
      });
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
      const garmentsList = gender === 'male' ? MENS_GARMENTS : FEMALE_GARMENTS;
      const matchedGarment = garmentsList.find((g) => g.key === garmentType);
      const prismaGarmentType =
        matchedGarment?.prismaGarmentType ||
        (garmentType === 'waistcoat' ||
        garmentType === 'pant_coat' ||
        garmentType === 'frock_maxi'
          ? 'other'
          : garmentType);

      const payload: Record<string, any> = {
        gender,
        garmentType: prismaGarmentType,
        garmentSubtype: garmentType,
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
        gender,
        garmentSubtype: garmentType,
        neckStyle,
        collarStyle,
        cuffStyle,
        pocketStyle: gender === 'male' ? pocketStyle : undefined,
        sleeveStyle,
        frockStyle: garmentType === 'frock_maxi' ? frockStyle : undefined,
        damanStyle,
        trouserStyle,
        frockOptions:
          garmentType === 'frock_maxi' ? selectedFrockOptions : undefined,
        fitType,
        specialInstructions,
      };

      // 3. Measurement Profile
      if (selectedProfileId === 'sample_suit') {
        payload.customMeasurements = {
          mode: 'sample_suit_pickup',
          instructions:
            'Rider will collect physical sample suit for measurement copying',
        };
      } else if (selectedProfileId && selectedProfileId !== 'custom') {
        payload.measurementProfileId = selectedProfileId;
      } else {
        payload.customMeasurements = {
          ...measurements,
          unit,
        };
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-gray-900">
                Select Your Garment
              </h2>
              <p className="text-xs text-gray-500">
                Choose who this order is for and select the garment type you
                want tailored.
              </p>
            </div>

            {/* Gender Selection Cards - Matching Reference Screenshot 1 */}
            <div className="space-y-3 pb-3 border-b border-gray-100">
              <label className="text-xs font-bold text-gray-900 block">
                Select Tailoring Category{' '}
                <span className="text-[#7E153A]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Women's Card */}
                <div
                  onClick={() => handleGenderChange('female')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    gender === 'female'
                      ? 'border-[#7E153A] bg-red-50/30 ring-2 ring-[#7E153A]/10 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-16 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        src="/images/tailor/gender_women.png"
                        alt="Women's Tailoring"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-gray-900 leading-tight">
                        Women's Tailoring
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                        Elegant styles for every occasion, crafted just for you.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                      gender === 'female'
                        ? 'border-[#7E153A] bg-[#7E153A] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {gender === 'female' && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                {/* Men's Card */}
                <div
                  onClick={() => handleGenderChange('male')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    gender === 'male'
                      ? 'border-[#7E153A] bg-red-50/30 ring-2 ring-[#7E153A]/10 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-16 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        src="/images/tailor/gender_men.png"
                        alt="Men's Tailoring"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-gray-900 leading-tight">
                        Men's Tailoring
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                        Classic fits, modern styles, made to measure.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                      gender === 'male'
                        ? 'border-[#7E153A] bg-[#7E153A] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {gender === 'male' && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Garment Type Selector - Matching Reference Screenshot 1 */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-700 block">
                Choose garment type ({gender === 'female' ? 'Women' : 'Men'}){' '}
                <span className="text-[#7E153A]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(gender === 'male' ? MENS_GARMENTS : FEMALE_GARMENTS).map(
                  (g) => {
                    const isSelected = garmentType === g.key;
                    return (
                      <div
                        key={g.key}
                        onClick={() => setGarmentType(g.key)}
                        className={`relative rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'border-[#7E153A] bg-red-50/20 ring-1 ring-[#7E153A]/20 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {/* Radio Checkmark on top-right */}
                        <div className="flex items-start justify-between w-full mb-2">
                          <div className="w-full h-28 flex items-center justify-center rounded-xl bg-gray-50/60 p-1 overflow-hidden">
                            {g.image ? (
                              <img
                                src={g.image}
                                alt={g.label}
                                className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Scissors
                                size={28}
                                className={
                                  isSelected
                                    ? 'text-[#7E153A]'
                                    : 'text-gray-400'
                                }
                              />
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ml-2 ${
                              isSelected
                                ? 'border-[#7E153A] bg-[#7E153A] text-white shadow-xs'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && (
                              <Check size={11} strokeWidth={3.5} />
                            )}
                          </div>
                        </div>

                        <div>
                          <p
                            className={`text-xs font-extrabold leading-tight ${
                              isSelected ? 'text-[#7E153A]' : 'text-gray-900'
                            }`}
                          >
                            {g.label}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                            {g.sublabel || 'Custom master tailoring'}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Choose From In-House Stock Banner */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0 shadow-xs">
                  <Boxes size={20} />
                </span>
                <div>
                  <p className="text-xs font-black text-gray-900 leading-tight">
                    Don't have an online store link?
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Browse our curated in-house fabric stock of pure lawn,
                    cotton, chiffon & formal suits.
                  </p>
                </div>
              </div>
              <Link href="/stock" className="shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-[#7E153A] text-[#7E153A] hover:bg-red-50 text-xs font-bold w-full sm:w-auto h-9 cursor-pointer"
                >
                  Browse Our Stock
                </Button>
              </Link>
            </div>

            {/* URL Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Or Paste Online Store Link (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="url"
                    placeholder={
                      gender === 'male'
                        ? 'https://www.junaidjamshed.com/products/jj-unstitched-latha...'
                        : 'https://www.sanasafinaz.com/pk/mahay-lawn-3-piece...'
                    }
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

            <div className="pt-4 flex justify-end mt-auto">
              <Button
                onClick={() => handleGoToStep(2)}
                className="h-11 px-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                Continue to Style & Tier{' '}
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Product Preview Card - Adjusted to match Continue Button alignment */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">
                  Selected Garment Preview
                </span>
                {parsedProduct ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#7E153A] border border-red-100">
                    {gender === 'female' ? "👗 Women's Suit" : "👔 Men's Suit"}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-gray-400">
                    Live Preview
                  </span>
                )}
              </div>

              {/* Garment Image Card - Balanced height matching left form fields */}
              <div className="w-full h-[230px] sm:h-[250px] lg:h-[265px] rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center group shadow-xs shrink-0">
                {parsedProduct?.images?.[selectedImageIndex] ||
                parsedProduct?.images?.[0] ? (
                  <>
                    <img
                      src={
                        parsedProduct?.images?.[selectedImageIndex] ||
                        parsedProduct.images[0]
                      }
                      alt={manualTitle || 'Product Preview'}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Photo Counter Badge */}
                    {Array.isArray(parsedProduct?.images) &&
                      parsedProduct.images.length > 1 && (
                        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                          {selectedImageIndex + 1} /{' '}
                          {parsedProduct.images.length}
                        </div>
                      )}
                    {/* Brand Pill */}
                    {manualBrand && (
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-md border border-white/60">
                        {manualBrand}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2 p-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center shadow-xs">
                      <Scissors size={22} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {manualTitle ? manualTitle : 'No Suit Linked Yet'}
                    </span>
                    <span className="text-[11px] text-gray-400 leading-relaxed max-w-[200px]">
                      Paste a store link or enter fabric details on the left to
                      see live preview.
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {Array.isArray(parsedProduct?.images) &&
                parsedProduct.images.length > 1 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 px-0.5">
                      <span>
                        Available Views ({parsedProduct.images.length})
                      </span>
                      <span>Click to switch photo</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-0.5 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {parsedProduct.images
                        .slice(0, 8)
                        .map((imgUrl: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-11 h-13 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative ${
                              selectedImageIndex === idx
                                ? 'border-[#7E153A] ring-2 ring-[#7E153A]/25 shadow-sm scale-105'
                                : 'border-gray-200 hover:border-gray-300 opacity-65 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover object-top"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

              {/* Product Specifications & Details */}
              <div className="pt-1.5 border-t border-gray-100 space-y-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                  Fabric Details
                </span>
                {manualTitle || manualBrand || parsedProduct ? (
                  <div className="space-y-1">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-[#7E153A] tracking-wider block truncate">
                        {manualBrand || 'Pakistani Brand'}
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-0.5 leading-snug line-clamp-2">
                        {manualTitle || 'Unstitched Suit'}
                      </h3>
                    </div>

                    {/* Dynamic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {parsedProduct?.parseSource === 'in_house' && (
                        <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ★ In-House Stock Fabric
                        </span>
                      )}
                      {manualFabric && (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {manualFabric}
                        </span>
                      )}
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#7E153A] border border-red-100">
                        {gender === 'female'
                          ? "Women's Collection"
                          : "Men's Collection"}
                      </span>
                      {parsedProduct?.garmentType && (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 capitalize">
                          {parsedProduct.garmentType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {[
                      { icon: '🏷️', label: 'Brand & Product Name' },
                      { icon: '🧵', label: 'Fabric Type' },
                      { icon: '🎨', label: 'Design / Pattern' },
                      { icon: '🎨', label: 'Color' },
                      { icon: '♻️', label: 'Material' },
                      { icon: 'ℹ️', label: 'Other Details' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-400"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="text-[10px] text-gray-400">
                          {item.label}
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 italic pt-0.5">
                      Will appear after fetching from brand link
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Notice - Stitching price goes to Step 2 */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 mt-auto space-y-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-blue-600 shrink-0" />
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                  Stitching Price in Step 2
                </span>
              </div>
              <p className="text-[10px] text-blue-600/80 leading-relaxed">
                In the next step, you'll choose your preferred stitching method
                (Basic, Standard or Luxury) and see the corresponding price.
              </p>
              <div className="flex gap-1.5 pt-0.5">
                {(['Basic', 'Standard', 'Luxury'] as const).map((tier) => (
                  <span
                    key={tier}
                    className="flex-1 text-center text-[9px] font-bold py-0.5 rounded-md bg-white border border-blue-100 text-blue-600"
                  >
                    {tier}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Style Customization & Stitching Tier ── */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
          {/* Main Customization Section (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-gray-900">
                  {garmentType === 'frock_maxi'
                    ? '3. Choose Your Frock Style'
                    : '2. Customize Your Garment'}
                </h2>
                <p className="text-xs text-gray-500">
                  {garmentType === 'frock_maxi'
                    ? 'Select the type of frock and customize its design according to your style.'
                    : 'Choose the design details for your outfit. You can select different styles for collar, cuff, trouser and more.'}
                </p>
              </div>

              {/* Gender Indicator / Switcher Pill */}
              <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#7E153A] bg-red-50 border border-red-100">
                <span>
                  {gender === 'female'
                    ? "👗 Women's Outfit"
                    : "👔 Men's Outfit"}
                </span>
              </div>
            </div>

            {/* Garment Type Row - Matching Reference Screenshot */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Scissors size={14} className="text-[#7E153A]" />
                <span>Garment Type</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Select the type of outfit you want to stitch.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {(gender === 'male' ? MENS_GARMENTS : FEMALE_GARMENTS).map(
                  (g) => {
                    const isSelected = garmentType === g.key;
                    return (
                      <div
                        key={g.key}
                        onClick={() => setGarmentType(g.key)}
                        className={`relative rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'border-[#7E153A] bg-red-50/20 ring-1 ring-[#7E153A]/20 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="w-full h-20 flex items-center justify-center rounded-lg bg-gray-50/60 p-1 mb-1.5 relative overflow-hidden">
                          {g.image ? (
                            <img
                              src={g.image}
                              alt={g.label}
                              className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <Scissors size={20} className="text-gray-400" />
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7E153A] flex items-center justify-center shadow-xs">
                              <Check
                                size={9}
                                className="text-white"
                                strokeWidth={3.5}
                              />
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-[11px] font-extrabold leading-tight truncate ${
                            isSelected ? 'text-[#7E153A]' : 'text-gray-800'
                          }`}
                        >
                          {g.label}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* ── FROCK CUSTOMIZATION STUDIO (Screenshot 4) ── */}
            {garmentType === 'frock_maxi' ? (
              <div className="space-y-6 pt-2">
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <span>👗 Frock Design</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Customize your frock from different styles, necklines,
                    sleeves and more.
                  </p>
                </div>

                {/* 1. Neckline Design & 2. Sleeve Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Neckline Design */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Neckline Design
                      </span>
                      <span className="text-[10px] text-[#7E153A] font-semibold">
                        {neckStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FROCK_NECKLINES.map((item) => {
                        const isSelected = neckStyle === item.name;
                        return (
                          <div
                            key={item.name}
                            onClick={() => setNeckStyle(item.name)}
                            className={`rounded-xl border p-1 text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#7E153A] bg-red-50/40 ring-1 ring-[#7E153A]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="h-14 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p
                              className={`text-[9px] font-bold mt-1 leading-tight line-clamp-1 ${
                                isSelected ? 'text-[#7E153A]' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sleeve Design */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Sleeve Design
                      </span>
                      <span className="text-[10px] text-[#7E153A] font-semibold">
                        {sleeveStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FROCK_SLEEVES.map((item) => {
                        const isSelected = sleeveStyle === item.name;
                        return (
                          <div
                            key={item.name}
                            onClick={() => setSleeveStyle(item.name)}
                            className={`rounded-xl border p-1 text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#7E153A] bg-red-50/40 ring-1 ring-[#7E153A]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="h-14 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p
                              className={`text-[9px] font-bold mt-1 leading-tight line-clamp-1 ${
                                isSelected ? 'text-[#7E153A]' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Frock Style & 4. Daman Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Frock Style */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Frock Style
                      </span>
                      <span className="text-[10px] text-[#7E153A] font-semibold">
                        {frockStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FROCK_STYLES.map((item) => {
                        const isSelected = frockStyle === item.name;
                        return (
                          <div
                            key={item.name}
                            onClick={() => setFrockStyle(item.name)}
                            className={`rounded-xl border p-1 text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#7E153A] bg-red-50/40 ring-1 ring-[#7E153A]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="h-14 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p
                              className={`text-[9px] font-bold mt-1 leading-tight line-clamp-1 ${
                                isSelected ? 'text-[#7E153A]' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daman Design */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Daman Design
                      </span>
                      <span className="text-[10px] text-[#7E153A] font-semibold">
                        {damanStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FROCK_DAMANS.map((item) => {
                        const isSelected = damanStyle === item.name;
                        return (
                          <div
                            key={item.name}
                            onClick={() => setDamanStyle(item.name)}
                            className={`rounded-xl border p-1 text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#7E153A] bg-red-50/40 ring-1 ring-[#7E153A]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="h-14 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p
                              className={`text-[9px] font-bold mt-1 leading-tight line-clamp-1 ${
                                isSelected ? 'text-[#7E153A]' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. Additional Options */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      Additional Options
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Click to toggle options
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {FROCK_OPTIONS.map((item) => {
                      const isSelected = selectedFrockOptions.includes(
                        item.name
                      );
                      return (
                        <div
                          key={item.name}
                          onClick={() => {
                            setSelectedFrockOptions((prev) =>
                              prev.includes(item.name)
                                ? prev.filter((o) => o !== item.name)
                                : [...prev, item.name]
                            );
                          }}
                          className={`rounded-xl border p-1.5 text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#7E153A] bg-red-50/40 ring-1 ring-[#7E153A]/20 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="h-12 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                            {isSelected && (
                              <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#7E153A] flex items-center justify-center">
                                <Check
                                  size={8}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              </div>
                            )}
                          </div>
                          <p
                            className={`text-[9px] font-bold mt-1 leading-tight line-clamp-1 ${
                              isSelected ? 'text-[#7E153A]' : 'text-gray-700'
                            }`}
                          >
                            {item.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ── STANDARD CUSTOMIZATION STUDIO (Collar, Cuff, Trouser) (Screenshot 2 & 3) ── */
              <div className="space-y-6 pt-2">
                {/* 1. Collar Design Row */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>Collar Design</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Choose your preferred collar style.
                  </p>

                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    {/* Cards Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {(gender === 'female' ? WOMEN_COLLARS : MEN_COLLARS).map(
                        (item) => {
                          const isSelected = collarStyle === item.name;
                          return (
                            <div
                              key={item.name}
                              onClick={() => setCollarStyle(item.name)}
                              className={`rounded-2xl border-2 p-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#7E153A] bg-red-50/20 ring-1 ring-[#7E153A]/20 shadow-xs'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="w-full h-16 flex items-center justify-center rounded-xl bg-gray-50/60 p-1 overflow-hidden relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-auto object-contain"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7E153A] flex items-center justify-center shadow-xs">
                                    <Check
                                      size={9}
                                      className="text-white"
                                      strokeWidth={3.5}
                                    />
                                  </div>
                                )}
                              </div>
                              <p
                                className={`text-[10px] font-extrabold mt-1.5 leading-tight ${
                                  isSelected
                                    ? 'text-[#7E153A]'
                                    : 'text-gray-800'
                                }`}
                              >
                                {item.name}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* "Your Selection" Preview Card */}
                    <div className="w-full md:w-28 rounded-2xl border border-red-100 bg-red-50/40 p-2.5 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] uppercase font-extrabold text-[#7E153A] tracking-wider mb-1">
                        Your Selection
                      </span>
                      <div className="w-14 h-14 rounded-xl bg-white border border-red-100 flex items-center justify-center p-1 overflow-hidden shadow-2xs">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_COLLARS
                              : MEN_COLLARS
                            ).find((c) => c.name === collarStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_COLLARS[0].image
                              : MEN_COLLARS[0].image)
                          }
                          alt={collarStyle}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-800 mt-1.5 line-clamp-1">
                        {collarStyle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Cuff Design Row */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>Cuff Design</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Choose the cuff style for your sleeves.
                  </p>

                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    {/* Cards Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {(gender === 'female' ? WOMEN_CUFFS : MEN_CUFFS).map(
                        (item) => {
                          const isSelected = cuffStyle === item.name;
                          return (
                            <div
                              key={item.name}
                              onClick={() => setCuffStyle(item.name)}
                              className={`rounded-2xl border-2 p-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#7E153A] bg-red-50/20 ring-1 ring-[#7E153A]/20 shadow-xs'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="w-full h-16 flex items-center justify-center rounded-xl bg-gray-50/60 p-1 overflow-hidden relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-auto object-contain"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7E153A] flex items-center justify-center shadow-xs">
                                    <Check
                                      size={9}
                                      className="text-white"
                                      strokeWidth={3.5}
                                    />
                                  </div>
                                )}
                              </div>
                              <p
                                className={`text-[10px] font-extrabold mt-1.5 leading-tight ${
                                  isSelected
                                    ? 'text-[#7E153A]'
                                    : 'text-gray-800'
                                }`}
                              >
                                {item.name}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* "Your Selection" Preview Card */}
                    <div className="w-full md:w-28 rounded-2xl border border-red-100 bg-red-50/40 p-2.5 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] uppercase font-extrabold text-[#7E153A] tracking-wider mb-1">
                        Your Selection
                      </span>
                      <div className="w-14 h-14 rounded-xl bg-white border border-red-100 flex items-center justify-center p-1 overflow-hidden shadow-2xs">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_CUFFS
                              : MEN_CUFFS
                            ).find((c) => c.name === cuffStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_CUFFS[0].image
                              : MEN_CUFFS[0].image)
                          }
                          alt={cuffStyle}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-800 mt-1.5 line-clamp-1">
                        {cuffStyle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Trouser / Shalwar Design Row */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>Trouser / Shalwar Design</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Select the trouser or shalwar style you prefer.
                  </p>

                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    {/* Cards Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {(gender === 'female'
                        ? WOMEN_TROUSERS
                        : MEN_TROUSERS
                      ).map((item) => {
                        const isSelected = trouserStyle === item.name;
                        return (
                          <div
                            key={item.name}
                            onClick={() => setTrouserStyle(item.name)}
                            className={`rounded-2xl border-2 p-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#7E153A] bg-red-50/20 ring-1 ring-[#7E153A]/20 shadow-xs'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="w-full h-16 flex items-center justify-center rounded-xl bg-gray-50/60 p-1 overflow-hidden relative">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-auto object-contain"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7E153A] flex items-center justify-center shadow-xs">
                                  <Check
                                    size={9}
                                    className="text-white"
                                    strokeWidth={3.5}
                                  />
                                </div>
                              )}
                            </div>
                            <p
                              className={`text-[10px] font-extrabold mt-1.5 leading-tight ${
                                isSelected ? 'text-[#7E153A]' : 'text-gray-800'
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* "Your Selection" Preview Card */}
                    <div className="w-full md:w-28 rounded-2xl border border-red-100 bg-red-50/40 p-2.5 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] uppercase font-extrabold text-[#7E153A] tracking-wider mb-1">
                        Your Selection
                      </span>
                      <div className="w-14 h-14 rounded-xl bg-white border border-red-100 flex items-center justify-center p-1 overflow-hidden shadow-2xs">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_TROUSERS
                              : MEN_TROUSERS
                            ).find((t) => t.name === trouserStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_TROUSERS[0].image
                              : MEN_TROUSERS[0].image)
                          }
                          alt={trouserStyle}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-800 mt-1.5 line-clamp-1">
                        {trouserStyle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stitching Craftsmanship Tier Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-800 block">
                    Stitching Craftsmanship Tier
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Official rates for{' '}
                    <span className="font-semibold text-gray-900">
                      {(gender === 'male'
                        ? MENS_GARMENTS
                        : FEMALE_GARMENTS
                      ).find((g) => g.key === garmentType)?.label ||
                        'Selected Garment'}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRateCard((prev) => !prev)}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#7E153A] bg-red-50 hover:bg-red-100/70 border border-red-200 transition-colors cursor-pointer"
                >
                  <Table2 size={13} />
                  <span>
                    {showRateCard
                      ? 'Hide Rate Card'
                      : 'View Official Rate Card (PKR)'}
                  </span>
                  {showRateCard ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </button>
              </div>

              {/* Official Stitching Rate Card Accordion */}
              {showRateCard && (
                <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7E153A]"></span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-800">
                        Official Tailoring Rate Card (Pakistani Rupees)
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      As per verified pricing policy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Female Rate Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-pink-50/70 px-3.5 py-2 border-b border-pink-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-pink-950 uppercase tracking-wider">
                          Female Tailoring
                        </span>
                        {gender === 'female' && (
                          <span className="text-[9px] font-extrabold bg-[#7E153A] text-white px-2 py-0.5 rounded-full uppercase">
                            Active Selection
                          </span>
                        )}
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500">
                            <th className="py-2 px-3 font-bold">
                              Stitching Type
                            </th>
                            <th className="py-2 px-2.5 text-right">Basic</th>
                            <th className="py-2 px-2.5 text-right">Standard</th>
                            <th className="py-2 px-2.5 text-right">Luxury</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {FEMALE_GARMENTS.map((item) => {
                            const isCurrentGarment =
                              gender === 'female' && garmentType === item.key;
                            return (
                              <tr
                                key={item.key}
                                className={
                                  isCurrentGarment
                                    ? 'bg-red-50/40 font-semibold text-gray-900'
                                    : 'hover:bg-gray-50/60'
                                }
                              >
                                <td className="py-2 px-3 flex items-center gap-1.5">
                                  {isCurrentGarment && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7E153A]"></span>
                                  )}
                                  <span>{item.label}</span>
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'basic'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.basic.toLocaleString()}
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'standard'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.standard.toLocaleString()}
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'luxury'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.luxury.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mens Rate Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-blue-50/70 px-3.5 py-2 border-b border-blue-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                          MENS Tailoring
                        </span>
                        {gender === 'male' && (
                          <span className="text-[9px] font-extrabold bg-[#7E153A] text-white px-2 py-0.5 rounded-full uppercase">
                            Active Selection
                          </span>
                        )}
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500">
                            <th className="py-2 px-3 font-bold">
                              Stitching Type
                            </th>
                            <th className="py-2 px-2.5 text-right">Basic</th>
                            <th className="py-2 px-2.5 text-right">Standard</th>
                            <th className="py-2 px-2.5 text-right">Luxury</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {MENS_GARMENTS.map((item) => {
                            const isCurrentGarment =
                              gender === 'male' && garmentType === item.key;
                            return (
                              <tr
                                key={item.key}
                                className={
                                  isCurrentGarment
                                    ? 'bg-red-50/40 font-semibold text-gray-900'
                                    : 'hover:bg-gray-50/60'
                                }
                              >
                                <td className="py-2 px-3 flex items-center gap-1.5">
                                  {isCurrentGarment && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7E153A]"></span>
                                  )}
                                  <span>{item.label}</span>
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'basic'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.basic.toLocaleString()}
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'standard'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.standard.toLocaleString()}
                                </td>
                                <td
                                  className={`py-2 px-2.5 text-right font-mono ${
                                    isCurrentGarment &&
                                    stitchingTier === 'luxury'
                                      ? 'font-extrabold text-[#7E153A] bg-red-100/50 rounded'
                                      : ''
                                  }`}
                                >
                                  Rs. {item.tiers.luxury.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Tier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentTiers.map((tier) => {
                  const isSelected = stitchingTier === tier.key;
                  return (
                    <div
                      key={tier.key}
                      onClick={() => setStitchingTier(tier.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-gray-900">
                            {tier.name}
                          </h4>
                          <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {tier.days}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                          {tier.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">
                            Stitching Fee
                          </span>
                          <span className="text-xs font-extrabold text-[#7E153A] font-mono">
                            PKR {tier.price.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? 'border-[#7E153A] bg-[#7E153A] text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master Tailor Notes */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700">
                Special Stitching Instructions for Master Tailor (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please keep 2 inches extra fabric inside side seams. Attach lace on sleeve borders."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:border-[#7E153A] text-gray-900"
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
                Save & Continue <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Order Summary & Your Selections (Matching Reference Screenshot 2, 3, 4) */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
            {/* 1. Order Summary Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider">
                  Order Summary
                </span>
              </div>

              {/* Main Garment Image & Meta */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="w-16 h-20 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={
                      parsedProduct?.images?.[selectedImageIndex] ||
                      parsedProduct?.images?.[0] ||
                      (garmentType === 'frock_maxi'
                        ? '/images/tailor/preview_w_frock.png'
                        : gender === 'female'
                          ? '/images/tailor/preview_w_shalwarkameez.png'
                          : '/images/tailor/preview_m_shalwarkameez.png')
                    }
                    alt="Garment Preview"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">
                    {manualTitle ||
                      (gender === 'male'
                        ? MENS_GARMENTS
                        : FEMALE_GARMENTS
                      ).find((g) => g.key === garmentType)?.label ||
                      'Custom Tailoring'}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {manualBrand || 'Unstitched Fabric'}
                  </p>
                  <div className="pt-1 space-y-0.5 text-[10px] text-gray-500">
                    <p>
                      <span className="text-gray-400">Fabric: </span>
                      <span className="font-semibold text-gray-700">
                        {manualFabric ||
                          (gender === 'female' ? 'Lawn Cotton' : 'Cotton Mix')}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Color: </span>
                      <span className="font-semibold text-gray-700">
                        {gender === 'female' ? 'Dusty Pink' : 'Light Blue'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Designs: </span>
                      <span className="font-semibold text-gray-700">
                        Custom
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Your Selections */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider block">
                Your Selections
              </span>

              <div className="space-y-2.5">
                {/* Garment Type */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img
                      src={
                        (gender === 'male'
                          ? MENS_GARMENTS
                          : FEMALE_GARMENTS
                        ).find((g) => g.key === garmentType)?.image ||
                        '/images/tailor/garment_w_shalwarkameez.png'
                      }
                      alt="Garment Type"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block leading-tight">
                      Garment Type
                    </span>
                    <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                      {(gender === 'male'
                        ? MENS_GARMENTS
                        : FEMALE_GARMENTS
                      ).find((g) => g.key === garmentType)?.label ||
                        'Custom Suit'}
                    </span>
                  </div>
                </div>

                {garmentType === 'frock_maxi' ? (
                  <>
                    {/* Neckline */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            FROCK_NECKLINES.find((n) => n.name === neckStyle)
                              ?.image || FROCK_NECKLINES[0].image
                          }
                          alt="Neckline"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Neckline Design
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {neckStyle}
                        </span>
                      </div>
                    </div>

                    {/* Sleeve */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            FROCK_SLEEVES.find((s) => s.name === sleeveStyle)
                              ?.image || FROCK_SLEEVES[0].image
                          }
                          alt="Sleeve"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Sleeve Design
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {sleeveStyle}
                        </span>
                      </div>
                    </div>

                    {/* Frock Style */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            FROCK_STYLES.find((f) => f.name === frockStyle)
                              ?.image || FROCK_STYLES[0].image
                          }
                          alt="Frock Style"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Frock Style
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {frockStyle}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Collar Design */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_COLLARS
                              : MEN_COLLARS
                            ).find((c) => c.name === collarStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_COLLARS[0].image
                              : MEN_COLLARS[0].image)
                          }
                          alt="Collar"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Collar Design
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {collarStyle}
                        </span>
                      </div>
                    </div>

                    {/* Cuff Design */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_CUFFS
                              : MEN_CUFFS
                            ).find((c) => c.name === cuffStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_CUFFS[0].image
                              : MEN_CUFFS[0].image)
                          }
                          alt="Cuff"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Cuff Design
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {cuffStyle}
                        </span>
                      </div>
                    </div>

                    {/* Trouser Design */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={
                            (gender === 'female'
                              ? WOMEN_TROUSERS
                              : MEN_TROUSERS
                            ).find((t) => t.name === trouserStyle)?.image ||
                            (gender === 'female'
                              ? WOMEN_TROUSERS[0].image
                              : MEN_TROUSERS[0].image)
                          }
                          alt="Trouser"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          Trouser Design
                        </span>
                        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
                          {trouserStyle}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. Delivery Badge & Stitching Price */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <Truck size={14} className="text-[#7E153A] shrink-0" />
                <span className="text-[11px] font-semibold text-gray-700">
                  Estimated Delivery:{' '}
                  <span className="font-extrabold text-gray-900">
                    7 - 10 Days
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                <span className="text-xs font-bold text-gray-700">
                  Stitching Fee ({currentTierObj.name})
                </span>
                <span className="text-sm font-extrabold text-[#7E153A] font-mono">
                  PKR {stitchingFee.toLocaleString()}
                </span>
              </div>
            </div>
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

          {/* 3 Measurement Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                const def =
                  savedProfiles.find((p) => p.isDefault) || savedProfiles[0];
                if (def) setSelectedProfileId(def.id);
                else setSelectedProfileId('custom');
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedProfileId &&
                selectedProfileId !== 'custom' &&
                selectedProfileId !== 'sample_suit'
                  ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Ruler size={20} className="text-[#7E153A]" />
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Saved Size
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-gray-900">
                  Saved Fit Profile
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Use your pre-saved digital measurements.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProfileId('sample_suit')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedProfileId === 'sample_suit'
                  ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Truck size={20} className="text-[#7E153A]" />
                  <span className="text-[10px] uppercase font-extrabold text-[#7E153A] bg-red-100 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-gray-900">
                  Send Sample Suit
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Rider collects your fitted sample suit for copy.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProfileId('custom')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedProfileId === 'custom'
                  ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Sliders size={20} className="text-[#7E153A]" />
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Studio
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-gray-900">
                  Custom Studio
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Enter manual dimensions in cm or inches.
                </p>
              </div>
            </button>
          </div>

          {/* Sample Suit Reassurance Banner */}
          {selectedProfileId === 'sample_suit' && (
            <div className="bg-gradient-to-r from-red-50 via-pink-50/40 to-red-50 border border-red-100 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#7E153A] text-white flex items-center justify-center shadow-md shadow-[#7E153A]/20 shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Doorstep Sample Suit Pickup Selected
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    No measuring tape required! Our master tailor will copy the
                    exact fit of your favorite suit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-red-100/70 space-y-1">
                  <span className="font-bold text-[#7E153A] block">
                    1. Pack Suit & Fabric
                  </span>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Place your fitted sample suit along with your unstitched
                    fabric into one bag.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-red-100/70 space-y-1">
                  <span className="font-bold text-[#7E153A] block">
                    2. Courier Rider Pickup
                  </span>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Our courier rider will collect the package from your
                    doorstep.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-red-100/70 space-y-1">
                  <span className="font-bold text-[#7E153A] block">
                    3. Exact Copy Tailored
                  </span>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Tailor precisely matches all dimensions and returns both
                    suits safely back to you.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Saved Profiles Selector */}
          {selectedProfileId !== 'sample_suit' &&
            selectedProfileId !== 'custom' &&
            savedProfiles.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">
                  Choose Saved Measurement Profile{' '}
                  <span className="text-[#7E153A]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedProfiles.map((p) => {
                    const isSelected = selectedProfileId === p.id;
                    const cat = getProfileGarmentType(p);

                    const getCatBadge = () => {
                      switch (cat) {
                        case 'men_suit':
                          return {
                            text: "Men's Fit",
                            cls: 'bg-slate-50 text-slate-700 border-slate-200',
                          };
                        case 'women_suit':
                          return {
                            text: "Women's Fit",
                            cls: 'bg-pink-50 text-pink-800 border-pink-100',
                          };
                        case 'pant_trouser':
                          return {
                            text: 'Pant / Trouser',
                            cls: 'bg-blue-50 text-blue-800 border-blue-100',
                          };
                        case 'coat':
                          return {
                            text: 'Coat / Blazer',
                            cls: 'bg-amber-50 text-amber-800 border-amber-100',
                          };
                        case 'shalwar':
                          return {
                            text: 'Shalwar Only',
                            cls: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                          };
                        default:
                          return {
                            text: 'Custom Fit',
                            cls: 'bg-purple-50 text-purple-800 border-purple-100',
                          };
                      }
                    };

                    const badge = getCatBadge();

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'border-[#7E153A] bg-red-50/40 ring-2 ring-[#7E153A]/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">
                            {p.label}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.cls}`}
                            >
                              {badge.text}
                            </span>
                            {p.isDefault && (
                              <span className="bg-red-50 text-[#7E153A] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-red-100 uppercase">
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        {cat === 'pant_trouser' ? (
                          <p className="text-[11px] text-gray-500 truncate">
                            Length: {p.trouserLength}&quot; · Waist:{' '}
                            {p.trouserWaist}&quot; · Paicha: {p.ankle}&quot;
                          </p>
                        ) : cat === 'coat' ? (
                          <p className="text-[11px] text-gray-500 truncate">
                            Coat: {p.kameezLength}&quot; · Chest: {p.chest}
                            &quot; · Teera: {p.shoulderWidth}&quot;
                          </p>
                        ) : cat === 'shalwar' ? (
                          <p className="text-[11px] text-gray-500 truncate">
                            Shalwar: {p.trouserLength}&quot; · Ghera: {p.seat}
                            &quot; · Paicha: {p.ankle}&quot;
                          </p>
                        ) : cat === 'men_suit' ? (
                          <p className="text-[11px] text-gray-500 truncate">
                            Kurta: {p.kameezLength || '42'}&quot; · Chest:{' '}
                            {p.chest || '40'}&quot; · Shalwar:{' '}
                            {p.trouserLength || '40'}&quot;
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-500 truncate">
                            Kameez: {p.kameezLength || '42'}&quot; · Bust:{' '}
                            {p.chest || '38'}&quot; · Trouser:{' '}
                            {p.trouserLength || '39'}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                            {savedProfiles.find(
                              (p) => p.id === selectedProfileId
                            )?.label || 'Selected Profile'}
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
                      const cat = getProfileGarmentType(prof);

                      if (cat === 'pant_trouser') {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Pant Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.trouserLength}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Waistband
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.trouserWaist}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Inseam / Asan
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.thigh || prof.seat || '34'}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Paicha Opening
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.ankle}&quot;
                              </span>
                            </div>
                          </div>
                        );
                      }

                      if (cat === 'coat') {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Coat Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.kameezLength}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Chest Width
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.chest}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Shoulder (Teera)
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
                          </div>
                        );
                      }

                      if (cat === 'shalwar') {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Shalwar Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.trouserLength}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Shalwar Ghera
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.seat}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Inseam / Asan
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.thigh || prof.trouserWaist}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Paicha Opening
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.ankle}&quot;
                              </span>
                            </div>
                          </div>
                        );
                      }

                      if (cat === 'men_suit' || gender === 'male') {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Kurta Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.kameezLength || prof.shirt_length || '42'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Chest Width
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.chest || prof.bust || '40'}&quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Shoulder (Teera)
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.shoulderWidth || prof.shoulder || '18.5'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Collar / Ban
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.neckCircumference || prof.neck || '15'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Sleeve Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.sleeveLength ||
                                  prof.sleeve_length ||
                                  '24'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Shalwar Length
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.trouserLength ||
                                  prof.trouser_length ||
                                  '40'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Inseam / Asan
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.trouserWaist || prof.waist_bottom || '34'}
                                &quot;
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-red-100/60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Paicha (Opening)
                              </span>
                              <span className="font-extrabold text-gray-900 font-mono">
                                {prof.ankle || prof.bottom_opening || '16'}
                                &quot;
                              </span>
                            </div>
                          </div>
                        );
                      }

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

          {/* Custom Studio Inputs Grid (when custom selected) */}
          {selectedProfileId === 'custom' && (
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('shirt')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      activeTab === 'shirt'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    {gender === 'male'
                      ? 'Kurta / Kameez Dimensions'
                      : 'Kameez Dimensions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('trouser')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      activeTab === 'trouser'
                        ? 'bg-white text-[#7E153A] shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    {gender === 'male'
                      ? 'Shalwar / Trouser Dimensions'
                      : 'Trouser Dimensions'}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Unit Selector (Inches vs Centimeters) */}
                  <div className="flex bg-gray-200/80 p-0.5 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => toggleUnit('inches')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        unit === 'inches'
                          ? 'bg-white text-[#7E153A] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Inches (&quot;)
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUnit('cm')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        unit === 'cm'
                          ? 'bg-white text-[#7E153A] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSizeChart(true)}
                    className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <Sliders size={13} className="mr-1" /> Standard Sizes
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  {activeTab === 'shirt' && (
                    <>
                      {(gender === 'male'
                        ? [
                            {
                              id: 'shirt_length',
                              name: 'Kurta / Kameez Length',
                              defaultVal: '42',
                            },
                            {
                              id: 'bust',
                              name: 'Chest Width',
                              defaultVal: '40',
                            },
                            { id: 'waist', name: 'Waist', defaultVal: '36' },
                            {
                              id: 'neck',
                              name: 'Collar / Neck Size',
                              defaultVal: '15',
                            },
                            {
                              id: 'shoulder',
                              name: 'Shoulder (Teera)',
                              defaultVal: '18',
                            },
                            {
                              id: 'sleeve_length',
                              name: 'Sleeve Length',
                              defaultVal: '24',
                            },
                            {
                              id: 'armhole',
                              name: 'Bicep / Armhole',
                              defaultVal: '9',
                            },
                            {
                              id: 'cuff',
                              name: 'Wrist / Cuff Opening',
                              defaultVal: '9.5',
                            },
                          ]
                        : [
                            {
                              id: 'shirt_length',
                              name: 'Kameez Length',
                              defaultVal: '42',
                            },
                            {
                              id: 'bust',
                              name: 'Chest / Bust',
                              defaultVal: '38',
                            },
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
                          ]
                      ).map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">
                            {field.name} ({unit === 'inches' ? 'in' : 'cm'}){' '}
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
                    <div className="col-span-2 space-y-3 mb-2">
                      {/* Quick Trouser Code Selector Bar */}
                      <div className="bg-white p-3 rounded-2xl border border-gray-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700 flex items-center gap-1.5">
                            <Sliders size={13} className="text-[#7E153A]" />
                            {gender === 'male'
                              ? "Standard Men's Shalwar / Trouser Size Codes:"
                              : "Standard Women's Trouser Size Codes:"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Tap to load & inspect dimensions
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {(gender === 'male'
                            ? MEN_TROUSER_CODES
                            : WOMEN_TROUSER_CODES
                          ).map((item) => {
                            const isSelected =
                              selectedTrouserCode === item.code;
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => handleSelectTrouserCode(item)}
                                className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#7E153A] bg-red-50 text-[#7E153A] ring-2 ring-[#7E153A]/20 font-extrabold shadow-xs'
                                    : 'border-gray-200 bg-gray-50/60 hover:bg-white text-gray-700 font-bold'
                                }`}
                              >
                                <span className="text-xs font-mono block">
                                  {item.code}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Live Trouser Code Breakdown Card */}
                        {selectedTrouserCode && (
                          <div className="mt-2 p-2.5 bg-red-50/60 border border-red-100 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#7E153A] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                                Code: {selectedTrouserCode}
                              </span>
                              <span className="text-[11px] text-gray-600 font-medium">
                                {gender === 'male'
                                  ? `Length: ${measurements.trouser_length || '40'}${unit === 'inches' ? '"' : 'cm'} · Waist: ${measurements.waist_bottom || '34'}${unit === 'inches' ? '"' : 'cm'} · Paicha: ${measurements.bottom_opening || '16'}${unit === 'inches' ? '"' : 'cm'}`
                                  : `Length: ${measurements.trouser_length || '39'}${unit === 'inches' ? '"' : 'cm'} · Waist: ${measurements.waist_bottom || '30'}${unit === 'inches' ? '"' : 'cm'} · Paicha: ${measurements.bottom_opening || '14'}${unit === 'inches' ? '"' : 'cm'}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              Dimensions Applied
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'trouser' && (
                    <>
                      {(gender === 'male'
                        ? [
                            {
                              id: 'trouser_length',
                              name: 'Shalwar Length',
                              defaultVal: '40',
                            },
                            {
                              id: 'waist_bottom',
                              name: 'Inseam / Asan Depth',
                              defaultVal: '34',
                            },
                            {
                              id: 'bottom_opening',
                              name: 'Paicha (Bottom Opening)',
                              defaultVal: '16',
                            },
                            {
                              id: 'hip_bottom',
                              name: 'Ghera / Seat Width',
                              defaultVal: '24',
                            },
                          ]
                        : [
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
                          ]
                      ).map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">
                            {field.name} ({unit === 'inches' ? 'in' : 'cm'}){' '}
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
                  <BodyDiagram
                    activeField={activeField}
                    gender={gender}
                    onSelectField={(f) => setActiveField(f)}
                    onOpenGuideModal={() => setShowHowToMeasure(true)}
                  />
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Category & Brand
                  </span>
                  <span className="text-[10px] font-bold text-[#7E153A] bg-red-50 px-2 py-0.5 rounded-full">
                    {gender === 'male'
                      ? "Men's Tailoring"
                      : "Women's Tailoring"}
                  </span>
                </div>
                <p className="font-extrabold text-gray-900">{manualTitle}</p>
                <p className="text-gray-500">
                  {manualBrand} · {manualFabric || 'Unstitched Fabric'}
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
                <p className="font-semibold text-gray-900">
                  {gender === 'male' ? collarStyle : neckStyle}
                </p>
                <p className="text-gray-500">
                  {gender === 'male'
                    ? `${sleeveStyle} · ${pocketStyle} · ${trouserStyle}`
                    : `${sleeveStyle} · ${trouserStyle} · ${fitType}`}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Fitting & Measurements
                </span>
                <p className="font-semibold text-gray-900">
                  {selectedProfileId === 'sample_suit'
                    ? 'Sample Suit Pickup'
                    : selectedProfileId && selectedProfileId !== 'custom'
                      ? savedProfiles.find((p) => p.id === selectedProfileId)
                          ?.label || 'Saved Profile'
                      : `Custom Studio (${unit === 'inches' ? 'Inches' : 'Centimeters'})`}
                </p>
                <p className="text-gray-500">
                  {selectedProfileId === 'sample_suit'
                    ? 'Rider will collect fitted suit from doorstep'
                    : selectedProfileId && selectedProfileId !== 'custom'
                      ? 'Pre-saved tailoring dimensions'
                      : `Custom entered dimensions in ${unit === 'inches' ? 'Inches (in)' : 'Centimeters (cm)'}`}
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
        gender={gender}
        initialUnit={unit}
      />
      <HowToMeasureModal
        isOpen={showHowToMeasure}
        onClose={() => setShowHowToMeasure(false)}
      />
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-sm font-medium">Loading tailoring wizard...</p>
        </div>
      }
    >
      <NewOrderContent />
    </Suspense>
  );
}
