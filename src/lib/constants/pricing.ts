/**
 * Canonical Pakistani Stitching Pricing Matrix
 * Defines official PKR pricing per gender, garment type, and craftsmanship tier.
 */

export type StitchingTierKey = 'basic' | 'standard' | 'luxury';

export interface StitchingTierInfo {
  key: StitchingTierKey;
  name: string;
  price: number;
  days: string;
  desc: string;
}

export interface GarmentPricingOption {
  key: string;
  label: string;
  sublabel?: string;
  image?: string; // path to illustration SVG in /public/images/garments/
  prismaGarmentType:
    | 'full_suit'
    | 'kameez_only'
    | 'trouser_only'
    | 'other'
    | 'kurta'
    | 'shalwar'
    | 'trouser';
  tiers: Record<StitchingTierKey, number>;
}

// ── Female Pricing Structure ────────────────────────────────────────────────
// Stitching Type            Basic        Standard     Luxury
// Shalwar Kameez / Pajama   Rs. 2,000    Rs. 3,000    Rs. 4,000
// Only Shirt                Rs. 1,000    Rs. 1,500    Rs. 2,000
// Frock / Maxi              Rs. 3,000    Rs. 3,500    Rs. 5,000
export const FEMALE_GARMENTS: GarmentPricingOption[] = [
  {
    key: 'full_suit',
    label: 'Shalwar Kameez / Pajama',
    sublabel: 'Complete 2-Pc / 3-Pc suit with matching bottoms & dupatta',
    image: '/images/tailor/garment_w_shalwarkameez.png',
    prismaGarmentType: 'full_suit',
    tiers: {
      basic: 2000,
      standard: 3000,
      luxury: 4000,
    },
  },
  {
    key: 'kameez_only',
    label: 'Only Shirt',
    sublabel: 'Single Kurti or Kameez with custom neckline & sleeves',
    image: '/images/tailor/garment_w_onlyshirt.png',
    prismaGarmentType: 'kameez_only',
    tiers: {
      basic: 1000,
      standard: 1500,
      luxury: 2000,
    },
  },
  {
    key: 'frock_maxi',
    label: 'Frock / Maxi',
    sublabel: 'Floor-length Maxi, Flared Frock, or Anarkali cut',
    image: '/images/tailor/garment_w_frockmaxi.png',
    prismaGarmentType: 'other',
    tiers: {
      basic: 3000,
      standard: 3500,
      luxury: 5000,
    },
  },
  {
    key: 'trouser_only',
    label: 'Trouser Only',
    sublabel: 'Straight pants, cigarette pants, or shalwar',
    image: '/images/tailor/garment_w_trouser.png',
    prismaGarmentType: 'trouser_only',
    tiers: {
      basic: 1000,
      standard: 1500,
      luxury: 2000,
    },
  },
];

// ── MENS Pricing Structure ──────────────────────────────────────────────────
// Stitching Type            Basic        Standard     Luxury
// Shalwar Kameez            Rs. 2,000    Rs. 3,000    Rs. 3,500
// Trouser                   Rs. 1,500    Rs. 2,000    Rs. 2,500
// Waist Coat                Rs. 3,000    Rs. 3,500    Rs. 4,000
// Pent Coat                 Rs. 10,000   Rs. 13,000   Rs. 15,000
export const MENS_GARMENTS: GarmentPricingOption[] = [
  {
    key: 'full_suit',
    label: 'Shalwar Kameez',
    sublabel: 'Traditional 2-Piece Kameez Shalwar or Kurta Pajama',
    image: '/images/tailor/garment_m_shalwarkameez.png',
    prismaGarmentType: 'full_suit',
    tiers: {
      basic: 2000,
      standard: 3000,
      luxury: 3500,
    },
  },
  {
    key: 'trouser_mens',
    label: 'Trouser',
    sublabel: 'Formal or casual trouser with custom fit and waistband',
    image: '/images/tailor/garment_m_trouser.png',
    prismaGarmentType: 'trouser',
    tiers: {
      basic: 1500,
      standard: 2000,
      luxury: 2500,
    },
  },
  {
    key: 'waistcoat',
    label: 'Waist Coat',
    sublabel:
      'Tailored Sadri / Waistcoat with premium inner lining & welt pockets',
    image: '/images/tailor/garment_m_waistcoat.png',
    prismaGarmentType: 'other',
    tiers: {
      basic: 3000,
      standard: 3500,
      luxury: 4000,
    },
  },
  {
    key: 'pant_coat',
    label: 'Pent Coat',
    sublabel:
      'Two-Piece Formal Suit with fused lapel jacket & matching trousers',
    image: '/images/tailor/garment_m_pentcoat.png',
    prismaGarmentType: 'other',
    tiers: {
      basic: 10000,
      standard: 13000,
      luxury: 15000,
    },
  },
];

export const TIER_METADATA: Record<
  StitchingTierKey,
  { name: string; days: string; desc: string }
> = {
  basic: {
    name: 'Basic Stitching',
    days: '5-7 Days',
    desc: 'Clean single-needle precision tailoring, standard interlock & durable seam finishing.',
  },
  standard: {
    name: 'Standard Stitching',
    days: '4-5 Days',
    desc: 'Fused collar/neckline, reinforced Kaj buttonholes, boutique overlock & custom piping.',
  },
  luxury: {
    name: 'Luxury Designer',
    days: '2-3 Days',
    desc: 'Master craftsman hand-finishing, imported German fusing, double press & priority dispatch.',
  },
};

/**
 * Returns dynamic stitching tiers with prices calculated for the selected gender & garment
 */
export function getStitchingTiers(
  gender: 'female' | 'male',
  garmentKey: string = 'full_suit'
): StitchingTierInfo[] {
  const garments = gender === 'male' ? MENS_GARMENTS : FEMALE_GARMENTS;
  const garment =
    garments.find((g) => g.key === garmentKey) ||
    garments.find((g) => g.prismaGarmentType === garmentKey) ||
    garments[0];

  const tierKeys: StitchingTierKey[] = ['basic', 'standard', 'luxury'];

  return tierKeys.map((key) => ({
    key,
    name: TIER_METADATA[key].name,
    days: TIER_METADATA[key].days,
    desc: TIER_METADATA[key].desc,
    price: garment.tiers[key],
  }));
}

/**
 * Returns exact PKR stitching fee for a given gender, garment, and tier
 */
export function calculateStitchingFee(
  gender: 'female' | 'male',
  garmentKey: string = 'full_suit',
  tier: string = 'standard'
): number {
  const normalizedTier: StitchingTierKey =
    tier === 'basic' ? 'basic' : tier === 'luxury' ? 'luxury' : 'standard';

  const garments = gender === 'male' ? MENS_GARMENTS : FEMALE_GARMENTS;
  const garment =
    garments.find((g) => g.key === garmentKey) ||
    garments.find((g) => g.prismaGarmentType === garmentKey) ||
    garments[0];

  return garment.tiers[normalizedTier];
}

/**
 * Formats a number cleanly into Pakistani Rupees notation (e.g. "Rs. 3,000" or "PKR 3,000")
 */
export function formatPKR(
  amount: number,
  prefix: 'Rs.' | 'PKR' = 'PKR'
): string {
  return `${prefix} ${Math.round(amount).toLocaleString('en-PK')}`;
}
