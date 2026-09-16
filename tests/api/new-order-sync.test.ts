import {
  MEN_TROUSER_CODES,
  WOMEN_TROUSER_CODES,
  DEFAULT_MEN_MEASUREMENTS,
  DEFAULT_WOMEN_MEASUREMENTS,
} from '@/hooks/useMeasurementStudio';

// Stitching tier definitions mirror src/app/(customer)/new-order/page.tsx
const WOMEN_STITCHING_TIERS = [
  {
    key: 'standard',
    name: 'Standard Stitching',
    price: 2000,
    days: '5-7 Days',
  },
  {
    key: 'premium',
    name: 'Premium Boutique',
    price: 3000,
    days: '4-5 Days',
  },
  {
    key: 'luxury',
    name: 'Luxury Designer',
    price: 4000,
    days: '3-4 Days',
  },
];

const MEN_STITCHING_TIERS = [
  {
    key: 'standard',
    name: 'Standard Tailoring',
    price: 1800,
    days: '5-7 Days',
  },
  {
    key: 'premium',
    name: 'Executive Master Tailoring',
    price: 2500,
    days: '4-5 Days',
  },
  {
    key: 'luxury',
    name: 'Luxury Bespoke Crafted',
    price: 3500,
    days: '3-4 Days',
  },
];

/**
 * Pure state machine simulator simulating the state transitions in
 * src/app/(customer)/new-order/page.tsx for handleGenderChange & handleParseUrl.
 */
class NewOrderFlowSimulator {
  public gender: 'female' | 'male' = 'female';
  public selectedTrouserCode: string | null = 'T-30';
  public garmentType: string = 'full_suit';
  public stitchingTier: 'standard' | 'premium' | 'luxury' = 'standard';

  // Men's Styles
  public collarStyle: string = 'Sherwani Ban Collar (Hard)';
  public pocketStyle: string = '1 Chest Pocket + 2 Side Pockets';

  // Women's Styles
  public neckStyle: string = 'Round Neck with Slit';

  // Shared Styles
  public sleeveStyle: string = 'Full Sleeve with Lace Trim';
  public fitType: string = 'Regular Fit';
  public damanStyle: string = 'Straight Cut Daman';
  public trouserStyle: string = 'Straight Trouser / Cigarette Pants';

  // Manual & Parsed Fields
  public parsedProduct: any = null;
  public manualTitle: string = '';
  public manualBrand: string = '';
  public manualPrice: number | '' = '';
  public manualFabric: string = '';

  constructor() {
    this.handleGenderChange('female');
  }

  public handleGenderChange(newGender: 'female' | 'male') {
    this.gender = newGender;
    this.selectedTrouserCode = newGender === 'male' ? 'P-32' : 'T-30';
    if (newGender === 'male') {
      this.garmentType = 'full_suit';
      this.collarStyle = 'Sherwani Ban Collar (Hard)';
      this.sleeveStyle = 'Straight Open Sleeves';
      this.pocketStyle = '1 Chest Pocket + 2 Side Pockets';
      this.damanStyle = 'Round / Gol Daman';
      this.trouserStyle = 'Traditional Wide Shalwar';
      this.fitType = 'Regular Fit';
      if (!this.manualTitle || this.manualTitle === 'Mahay Lawn 3-Piece') {
        this.manualTitle = "Men's Traditional Shalwar Kameez";
      }
      if (!this.manualBrand || this.manualBrand === 'Sana Safinaz') {
        this.manualBrand = 'J. (Junaid Jamshed)';
      }
    } else {
      this.garmentType = 'full_suit';
      this.neckStyle = 'Round Neck with Slit';
      this.sleeveStyle = 'Full Sleeve with Lace Trim';
      this.damanStyle = 'Straight Cut Daman';
      this.trouserStyle = 'Straight Trouser / Cigarette Pants';
      this.fitType = 'Regular Fit';
      if (
        !this.manualTitle ||
        this.manualTitle === "Men's Traditional Shalwar Kameez"
      ) {
        this.manualTitle = 'Mahay Lawn 3-Piece';
      }
      if (!this.manualBrand || this.manualBrand === 'J. (Junaid Jamshed)') {
        this.manualBrand = 'Sana Safinaz';
      }
    }
  }

  public handleParseUrlResponse(prod: any) {
    if (prod.gender === 'male' || prod.gender === 'female') {
      this.handleGenderChange(prod.gender);
    }

    if (prod.garmentType) {
      const validMenGarmentTypes = [
        'full_suit',
        'kurta',
        'kameez_only',
        'other',
      ];
      const validWomenGarmentTypes = [
        'full_suit',
        'kameez_only',
        'trouser_only',
        'other',
      ];
      const allowedTypes =
        prod.gender === 'male' ? validMenGarmentTypes : validWomenGarmentTypes;
      if (allowedTypes.includes(prod.garmentType)) {
        this.garmentType = prod.garmentType;
      }
    }

    this.parsedProduct = prod;
    this.manualTitle = prod.name || prod.title || 'Unstitched Suit';
    this.manualBrand = prod.brand || 'Designer Brand';

    if (prod.priceOriginal !== null && prod.priceOriginal !== undefined) {
      this.manualPrice = Number(prod.priceOriginal) || 0;
    }

    if (prod.fabricMaterial) {
      this.manualFabric = prod.fabricMaterial;
    }
  }

  public get currentTiers() {
    return this.gender === 'male' ? MEN_STITCHING_TIERS : WOMEN_STITCHING_TIERS;
  }

  public get currentTierObj() {
    return (
      this.currentTiers.find((t) => t.key === this.stitchingTier) ||
      this.currentTiers[0]
    );
  }

  public calculateTotal(discountApplied = 0) {
    const fabricPrice = Number(
      this.parsedProduct?.priceOriginal || this.manualPrice || 0
    );
    const stitchingFee = this.currentTierObj.price;
    const deliveryFee = 150;
    return fabricPrice + stitchingFee + deliveryFee - discountApplied;
  }
}

describe('Customer /new-order Flow Synchronization & Tailoring Logic', () => {
  // ==========================================================================
  // 1. Male Apparel Flow Synchronization
  // ==========================================================================
  describe("1. Male Apparel Flow (handleGenderChange('male'))", () => {
    let sim: NewOrderFlowSimulator;

    beforeEach(() => {
      sim = new NewOrderFlowSimulator();
    });

    it('sets correct Men tailoring styles when switched to male', () => {
      sim.handleGenderChange('male');

      expect(sim.gender).toBe('male');
      expect(sim.selectedTrouserCode).toBe('P-32');
      expect(sim.collarStyle).toBe('Sherwani Ban Collar (Hard)');
      expect(sim.sleeveStyle).toBe('Straight Open Sleeves');
      expect(sim.pocketStyle).toBe('1 Chest Pocket + 2 Side Pockets');
      expect(sim.damanStyle).toBe('Round / Gol Daman');
      expect(sim.trouserStyle).toBe('Traditional Wide Shalwar');
      expect(sim.fitType).toBe('Regular Fit');
      expect(sim.garmentType).toBe('full_suit');
    });

    it("activates Men's stitching tiers (1800 / 2500 / 3500)", () => {
      sim.handleGenderChange('male');

      const tiers = sim.currentTiers;
      expect(tiers).toHaveLength(3);
      expect(tiers[0].name).toBe('Standard Tailoring');
      expect(tiers[0].price).toBe(1800);
      expect(tiers[1].name).toBe('Executive Master Tailoring');
      expect(tiers[1].price).toBe(2500);
      expect(tiers[2].name).toBe('Luxury Bespoke Crafted');
      expect(tiers[2].price).toBe(3500);
    });

    it('verifies P-32 trouser code exists in MEN_TROUSER_CODES with accurate dimensions', () => {
      const p32 = MEN_TROUSER_CODES.find((t) => t.code === 'P-32');
      expect(p32).toBeDefined();
      expect(p32?.measurements.waist_bottom).toBe('32');
      expect(p32?.measurements.trouser_length).toBe('39');
      expect(p32?.measurements.bottom_opening).toBe('15.5');
    });

    it('synchronizes parsed male product from scraper into order state', () => {
      const parsedMale = {
        title: "Men's Solid Kurta",
        name: "Men's Solid Kurta",
        brand: 'J. (Junaid Jamshed)',
        priceOriginal: 5490,
        currencyOriginal: 'PKR',
        gender: 'male',
        garmentType: 'kurta',
        fabricMaterial: 'Cotton',
      };

      sim.handleParseUrlResponse(parsedMale);

      expect(sim.gender).toBe('male');
      expect(sim.selectedTrouserCode).toBe('P-32');
      expect(sim.garmentType).toBe('kurta');
      expect(sim.manualTitle).toBe("Men's Solid Kurta");
      expect(sim.manualBrand).toBe('J. (Junaid Jamshed)');
      expect(sim.manualPrice).toBe(5490);
      expect(sim.manualFabric).toBe('Cotton');

      // Check total calculation with Men standard tailoring tier: 5490 + 1800 + 150 = 7440
      expect(sim.calculateTotal()).toBe(5490 + 1800 + 150);
    });
  });

  // ==========================================================================
  // 2. Female Apparel Flow Synchronization
  // ==========================================================================
  describe("2. Female Apparel Flow (handleGenderChange('female'))", () => {
    let sim: NewOrderFlowSimulator;

    beforeEach(() => {
      sim = new NewOrderFlowSimulator();
    });

    it('sets correct Women tailoring styles when switched to female', () => {
      sim.handleGenderChange('male'); // switch to male first
      sim.handleGenderChange('female'); // switch back to female

      expect(sim.gender).toBe('female');
      expect(sim.selectedTrouserCode).toBe('T-30');
      expect(sim.neckStyle).toBe('Round Neck with Slit');
      expect(sim.sleeveStyle).toBe('Full Sleeve with Lace Trim');
      expect(sim.damanStyle).toBe('Straight Cut Daman');
      expect(sim.trouserStyle).toBe('Straight Trouser / Cigarette Pants');
      expect(sim.fitType).toBe('Regular Fit');
      expect(sim.garmentType).toBe('full_suit');
    });

    it("activates Women's stitching tiers (2000 / 3000 / 4000)", () => {
      sim.handleGenderChange('female');

      const tiers = sim.currentTiers;
      expect(tiers).toHaveLength(3);
      expect(tiers[0].name).toBe('Standard Stitching');
      expect(tiers[0].price).toBe(2000);
      expect(tiers[1].name).toBe('Premium Boutique');
      expect(tiers[1].price).toBe(3000);
      expect(tiers[2].name).toBe('Luxury Designer');
      expect(tiers[2].price).toBe(4000);
    });

    it('verifies T-30 trouser code exists in WOMEN_TROUSER_CODES with accurate dimensions', () => {
      const t30 = WOMEN_TROUSER_CODES.find((t) => t.code === 'T-30');
      expect(t30).toBeDefined();
      expect(t30?.measurements.waist_bottom).toBe('30');
      expect(t30?.measurements.trouser_length).toBe('39');
      expect(t30?.measurements.bottom_opening).toBe('14');
      expect(t30?.measurements.hip_bottom).toBe('40');
    });

    it('synchronizes parsed female product from scraper into order state', () => {
      const parsedFemale = {
        title: '3-Piece Printed Lawn Suit',
        name: '3-Piece Printed Lawn Suit',
        brand: 'Sapphire',
        priceOriginal: 4990,
        currencyOriginal: 'PKR',
        gender: 'female',
        garmentType: 'full_suit',
        fabricMaterial: 'Lawn',
      };

      sim.handleParseUrlResponse(parsedFemale);

      expect(sim.gender).toBe('female');
      expect(sim.selectedTrouserCode).toBe('T-30');
      expect(sim.garmentType).toBe('full_suit');
      expect(sim.manualTitle).toBe('3-Piece Printed Lawn Suit');
      expect(sim.manualBrand).toBe('Sapphire');
      expect(sim.manualPrice).toBe(4990);
      expect(sim.manualFabric).toBe('Lawn');

      // Check total calculation with Women standard tier: 4990 + 2000 + 150 = 7140
      expect(sim.calculateTotal()).toBe(4990 + 2000 + 150);

      // Check with luxury tier: 4990 + 4000 + 150 = 9140
      sim.stitchingTier = 'luxury';
      expect(sim.calculateTotal()).toBe(4990 + 4000 + 150);
    });
  });

  // ==========================================================================
  // 3. Garment Type Whitelist & Validation Cross-Checks
  // ==========================================================================
  describe('3. Garment Type Cross-Gender Guarding', () => {
    let sim: NewOrderFlowSimulator;

    beforeEach(() => {
      sim = new NewOrderFlowSimulator();
    });

    it('rejects invalid female garment type for male order', () => {
      sim.handleGenderChange('male');
      sim.handleParseUrlResponse({
        gender: 'male',
        garmentType: 'trouser_only', // Not in validMenGarmentTypes ['full_suit', 'kurta', 'kameez_only', 'other']
      });
      // Should remain full_suit default because trouser_only is female/pant only
      expect(sim.garmentType).toBe('full_suit');
    });

    it('rejects male kurta garment type for female order if not in validWomenGarmentTypes', () => {
      sim.handleGenderChange('female');
      sim.handleParseUrlResponse({
        gender: 'female',
        garmentType: 'kurta', // Women use 'kameez_only' or 'full_suit'
      });
      // Should remain full_suit default
      expect(sim.garmentType).toBe('full_suit');
    });

    it('accepts valid female garment types: full_suit, kameez_only, trouser_only, other', () => {
      sim.handleGenderChange('female');
      sim.handleParseUrlResponse({
        gender: 'female',
        garmentType: 'kameez_only',
      });
      expect(sim.garmentType).toBe('kameez_only');
    });
  });
});
