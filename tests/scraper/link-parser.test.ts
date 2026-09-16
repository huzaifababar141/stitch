import fs from 'fs';
import path from 'path';
import {
  extractProductDetails,
  ScrapedProduct,
  ExtractionOptions,
} from '@/lib/services/link-parser.service';
import { normalizePkrPrice } from '@/lib/services/scraper/price-normalizer';
import {
  sanitizeAndUpgradeImages,
  upgradeShopifyImageUrl,
  upgradeDemandwareImageUrl,
  resolveAbsoluteImageUrl,
  isNonProductAsset,
} from '@/lib/services/scraper/image-sanitizer';
import {
  detectGenderAndGarment,
  detectFabricMaterial,
} from '@/lib/services/scraper/gender-detector';

// Helper to load offline JSON fixtures
function loadJsonFixture(relPath: string): any {
  let fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.resolve(__dirname, '../../', relPath);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

// Helper to load offline HTML fixtures
function loadHtmlFixture(relPath: string): string {
  let fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.resolve(__dirname, '../../', relPath);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Calculates field completeness score (0.0 to 1.0)
 * Evaluates Title (1.0), Brand (1.0), Price in PKR (1.0), Images (1.0), Gender (1.0).
 */
export function calculateCompleteness(
  product: Partial<ScrapedProduct>
): number {
  let score = 0;
  const title = product.title || (product as any)?.name;
  if (
    title &&
    typeof title === 'string' &&
    title.trim().length >= 5 &&
    !title.toLowerCase().includes('custom unstitched garment')
  ) {
    score += 1.0;
  }
  if (
    product.brand &&
    typeof product.brand === 'string' &&
    product.brand.trim().length > 0 &&
    product.brand !== 'Pakistani Brand'
  ) {
    score += 1.0;
  }
  if (
    typeof product.priceOriginal === 'number' &&
    !isNaN(product.priceOriginal) &&
    product.priceOriginal >= 500 &&
    product.priceOriginal <= 500000
  ) {
    score += 1.0;
  }
  if (
    Array.isArray(product.images) &&
    product.images.length >= 1 &&
    product.images.every(
      (url) =>
        typeof url === 'string' &&
        (url.startsWith('https://') || url.startsWith('http://'))
    )
  ) {
    score += 1.0;
  }
  if (product.gender === 'male' || product.gender === 'female') {
    score += 1.0;
  }
  return score / 5.0;
}

describe('Pakistani E-Commerce Product Scraper & Link Parser Suite', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: Category-Partition & Feature Coverage
  // ──────────────────────────────────────────────────────────────────────────
  describe('Tier 1: Category-Partition & Unit Feature Coverage', () => {
    describe('1.1 PKR Price Normalization', () => {
      it('strips "PKR" currency prefix and commas', () => {
        expect(normalizePkrPrice('PKR 4,990')).toBe(4990);
        expect(normalizePkrPrice('pkr 12,450.00')).toBe(12450);
      });

      it('strips "Rs." and "Rs" prefix with spacing variations', () => {
        expect(normalizePkrPrice('Rs. 6,850')).toBe(6850);
        expect(normalizePkrPrice('Rs 3,450')).toBe(3450);
        expect(normalizePkrPrice('rs.9,990')).toBe(9990);
      });

      it('handles Urdu/Arabic rupee symbol ₨', () => {
        expect(normalizePkrPrice('₨ 8,490')).toBe(8490);
        expect(normalizePkrPrice('₨14,500.00')).toBe(14500);
      });

      it('extracts discounted sale price from composite text', () => {
        const text = 'Sale price Rs. 3,500 Regular price Rs. 5,000';
        expect(normalizePkrPrice(text)).toBe(3500);
      });

      it('extracts lower bound from price range strings', () => {
        expect(normalizePkrPrice('PKR 4,500 - PKR 6,500')).toBe(4500);
        expect(normalizePkrPrice('Rs. 5,990 to Rs. 8,990')).toBe(5990);
      });

      it('returns null for unparseable or non-clothing prices', () => {
        expect(normalizePkrPrice(null)).toBeNull();
        expect(normalizePkrPrice(undefined)).toBeNull();
        expect(normalizePkrPrice('Call for Price')).toBeNull();
        expect(normalizePkrPrice('PKR 0')).toBeNull();
        expect(normalizePkrPrice(-500)).toBeNull();
      });
    });

    describe('1.2 High-Resolution Image Sanitization & Gallery Deduplication', () => {
      it('upgrades Shopify thumbnail URLs to original master resolution', () => {
        const thumb =
          'https://cdn.shopify.com/s/files/1/0550/kurta_medium.jpg?v=123';
        expect(upgradeShopifyImageUrl(thumb)).toBe(
          'https://cdn.shopify.com/s/files/1/0550/kurta.jpg?v=123'
        );
        const compact =
          'https://cdn.shopify.com/s/files/1/0550/kurta_compact.jpg';
        expect(upgradeShopifyImageUrl(compact)).toBe(
          'https://cdn.shopify.com/s/files/1/0550/kurta.jpg'
        );
      });

      it('upgrades SFCC Demandware dynamic image parameters', () => {
        const sfccUrl =
          'https://pk.khaadi.com/dw/image/v2/img.jpg?sw=400&sh=600&sm=fit';
        const upgraded = upgradeDemandwareImageUrl(sfccUrl);
        expect(upgraded).toContain('sw=1600');
        expect(upgraded).toContain('sh=2400');
      });

      it('resolves protocol-relative URLs into absolute HTTPS URLs', () => {
        const protoUrl = '//cdn.shopify.com/s/files/1/photo.jpg';
        expect(resolveAbsoluteImageUrl(protoUrl)).toBe(
          'https://cdn.shopify.com/s/files/1/photo.jpg'
        );
      });

      it('filters non-product assets like logos, banners, and payment badges', () => {
        expect(isNonProductAsset('https://store.pk/assets/logo.png')).toBe(
          true
        );
        expect(isNonProductAsset('https://store.pk/icons/cart-icon.svg')).toBe(
          true
        );
        expect(
          isNonProductAsset('https://store.pk/badges/visa_mastercard.png')
        ).toBe(true);
        expect(
          isNonProductAsset('https://store.pk/cdn/products/front-view.jpg')
        ).toBe(false);
      });

      it('deduplicates identical images and strips transient cache-buster query params', () => {
        const raw = [
          'https://cdn.shopify.com/s/files/1/kurta_medium.jpg?v=1',
          'https://cdn.shopify.com/s/files/1/kurta_large.jpg?v=2',
          'https://cdn.shopify.com/s/files/1/kurta.jpg',
          'https://cdn.shopify.com/s/files/1/kurta-back.jpg',
        ];
        const cleaned = sanitizeAndUpgradeImages(raw);
        expect(cleaned.length).toBe(2);
        expect(cleaned[0]).toContain('kurta.jpg');
        expect(cleaned[1]).toContain('kurta-back.jpg');
      });
    });

    describe('1.3 Gender & Garment Classification Engine', () => {
      it('classifies male apparel from traditional masculine garment tokens', () => {
        const r1 = detectGenderAndGarment({
          title: 'Men Embroidered Cotton Kurta',
        });
        expect(r1.gender).toBe('male');
        expect(r1.garmentType).toBe('kurta');

        const r2 = detectGenderAndGarment({
          title: 'Classic Kameez Shalwar Solid',
        });
        expect(r2.gender).toBe('male');
        expect(r2.garmentType).toBe('full_suit');

        const r3 = detectGenderAndGarment({
          title: 'Festive Raw Silk Waistcoat',
        });
        expect(r3.gender).toBe('male');
        expect(r3.garmentType).toBe('other');
      });

      it('classifies female apparel from feminine tokens and multi-piece ensembles', () => {
        const r1 = detectGenderAndGarment({
          title: '3 Piece Printed Lawn Suit With Voile Dupatta',
        });
        expect(r1.gender).toBe('female');
        expect(r1.garmentType).toBe('full_suit');

        const r2 = detectGenderAndGarment({
          title: 'Embroidered Cambric Kurti',
        });
        expect(r2.gender).toBe('female');
        expect(r2.garmentType).toBe('kameez_only');

        const r3 = detectGenderAndGarment({ title: 'Silk Dupatta 1 Piece' });
        expect(r3.gender).toBe('female');
      });

      it('disambiguates "Kurti" (female) from "Kurta" (male)', () => {
        const kurtiResult = detectGenderAndGarment({
          title: 'Printed Cotton Kurti',
        });
        expect(kurtiResult.gender).toBe('female');

        const kurtaResult = detectGenderAndGarment({
          title: 'Gents Plain Latha Kurta',
        });
        expect(kurtaResult.gender).toBe('male');
      });

      it('detects fabric material accurately from garment descriptions', () => {
        expect(detectFabricMaterial('Digital printed premium lawn shirt')).toBe(
          'lawn'
        );
        expect(
          detectFabricMaterial('Embroidered chiffon dupatta with zari work')
        ).toBe('chiffon');
        expect(detectFabricMaterial('100% fine Egyptian cotton fabric')).toBe(
          'cotton'
        );
        expect(detectFabricMaterial('Pure raw silk festive wear')).toBe('silk');
        expect(detectFabricMaterial('Traditional boski suit')).toBe('boski');
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: Boundary Value Analysis (BVA) & Corner Cases
  // ──────────────────────────────────────────────────────────────────────────
  describe('Tier 2: Boundary Value Analysis (BVA)', () => {
    it('accepts price at lowest valid boundary (PKR 100)', () => {
      expect(normalizePkrPrice(100)).toBe(100);
      expect(normalizePkrPrice('Rs. 100')).toBe(100);
    });

    it('rejects price below lowest boundary (< PKR 100)', () => {
      expect(normalizePkrPrice(99)).toBeNull();
      expect(normalizePkrPrice('Rs. 50')).toBeNull();
    });

    it('accepts price at upper Pakistani bridal/couture boundary (PKR 500,000)', () => {
      expect(normalizePkrPrice(500000)).toBe(500000);
      expect(normalizePkrPrice('PKR 500,000')).toBe(500000);
    });

    it('rejects price exceeding plausible upper boundary (> PKR 1,000,000)', () => {
      expect(normalizePkrPrice(1000001)).toBeNull();
      expect(normalizePkrPrice('Rs. 2,500,000')).toBeNull();
    });

    it('caps image gallery at specified max limit without array out-of-bounds', () => {
      const longList = Array.from(
        { length: 25 },
        (_, i) => `https://cdn.example.com/img-${i}.jpg`
      );
      const capped = sanitizeAndUpgradeImages(longList, undefined, 5);
      expect(capped.length).toBe(5);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: Pairwise Combinations & Platform Diversity
  // ──────────────────────────────────────────────────────────────────────────
  describe('Tier 3: Pairwise Combinations (Brand Platform × Gender × Garment)', () => {
    it('Pairwise 1: Shopify (Sapphire) × Male × Kurta', async () => {
      const fixture = loadJsonFixture(
        'tests/fixtures/scraper/shopify/sapphire.json'
      );
      const url =
        'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta-m-kt-24-01';
      const result = await extractProductDetails(url, {
        mockJson: fixture,
        forceTier: 1,
      });

      expect(result.brand).toBe('Sapphire');
      expect(result.gender).toBe('male');
      expect(result.garmentType).toBe('kurta');
      expect(result.priceOriginal).toBe(4990);
      expect(result.currencyOriginal).toBe('PKR');
    });

    it('Pairwise 2: Shopify (Sapphire) × Female × 3-Piece Lawn', async () => {
      const fixture = loadJsonFixture(
        'tests/fixtures/scraper/shopify/sapphire-women.json'
      );
      const url =
        'https://pk.sapphireonline.pk/products/3-piece-printed-lawn-suit-u3pest24v31-3pc';
      const result = await extractProductDetails(url, {
        mockJson: fixture,
        forceTier: 1,
      });

      expect(result.brand).toBe('Sapphire');
      expect(result.gender).toBe('female');
      expect(result.garmentType).toBe('full_suit');
      expect(result.priceOriginal).toBe(8490);
      expect(result.fabricMaterial).toBe('lawn');
    });

    it('Pairwise 3: SFCC (Khaadi) × Female × 3-Piece (Tier 3 DOM JSON-LD)', async () => {
      const fixture = loadHtmlFixture(
        'tests/fixtures/scraper/html/khaadi-sfcc.html'
      );
      const url =
        'https://pk.khaadi.com/fabrics/unstitched/3-piece-embroidered-lawn-suit-b25101.html';
      const result = await extractProductDetails(url, {
        html: fixture,
      });

      expect(result.brand).toBe('Khaadi');
      expect(result.gender).toBe('female');
      expect(result.priceOriginal).toBe(6990);
      expect(result.currencyOriginal).toBe('PKR');
      expect(result.images.length).toBeGreaterThanOrEqual(1);
    });

    it('Pairwise 4: SFCC (Khaadi) × Male × Kurta (Tier 3 DOM Heuristics)', async () => {
      const fixture = loadHtmlFixture(
        'tests/fixtures/scraper/html/khaadi-sfcc-men.html'
      );
      const url = 'https://pk.khaadi.com/men/kurta-shalwar/kurta-km24102.html';
      const result = await extractProductDetails(url, {
        html: fixture,
      });

      expect(result.brand).toBe('Khaadi');
      expect(result.gender).toBe('male');
      expect(result.priceOriginal).toBe(5490);
      expect(result.currencyOriginal).toBe('PKR');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 4: Real-World Workloads across Major Pakistani Brands
  // ──────────────────────────────────────────────────────────────────────────
  describe('Tier 4: Real-World Workload Benchmarks across >=4 Pakistani Brands', () => {
    const brandCases = [
      {
        brand: 'Sapphire',
        fixture: 'tests/fixtures/scraper/shopify/sapphire.json',
        url: 'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta-m-kt-24-01',
        type: 'shopify',
        expectedGender: 'male',
        expectedPrice: 4990,
      },
      {
        brand: 'Junaid Jamshed',
        fixture: 'tests/fixtures/scraper/shopify/junaid-jamshed.json',
        url: 'https://www.junaidjamshed.com/products/jjks-a-50012',
        type: 'shopify',
        expectedGender: 'male',
        expectedPrice: 6850,
      },
      {
        brand: 'Khaadi',
        fixture: 'tests/fixtures/scraper/html/khaadi-sfcc.html',
        url: 'https://pk.khaadi.com/fabrics/unstitched/3-piece-embroidered-lawn-suit-b25101.html',
        type: 'sfcc_html',
        expectedGender: 'female',
        expectedPrice: 6990,
      },
      {
        brand: 'Sana Safinaz',
        fixture: 'tests/fixtures/scraper/shopify/sana-safinaz.json',
        url: 'https://www.sanasafinaz.com/products/mahay-unstitched-3-piece-printed-lawn-suit-h241-001a',
        type: 'shopify',
        expectedGender: 'female',
        expectedPrice: 9990,
      },
      {
        brand: 'Maria.B',
        fixture: 'tests/fixtures/scraper/shopify/maria-b.json',
        url: 'https://mariab.pk/products/m-lawn-unstitched-3-piece-d-2401-a',
        type: 'shopify',
        expectedGender: 'female',
        expectedPrice: 14500,
      },
    ];

    it.each(brandCases)(
      'extracts $brand with >90% field completeness and 100% gender accuracy',
      async ({ brand, fixture, url, type, expectedGender, expectedPrice }) => {
        let options: ExtractionOptions = {};
        if (type === 'shopify') {
          options.mockJson = loadJsonFixture(fixture);
        } else {
          options.html = loadHtmlFixture(fixture);
        }

        const product = await extractProductDetails(url, options);

        // Assert core contract
        expect(product.brand.toLowerCase()).toContain(brand.toLowerCase());
        expect(product.gender).toBe(expectedGender);
        expect(product.priceOriginal).toBe(expectedPrice);
        expect(product.currencyOriginal).toBe('PKR');
        expect(product.images.length).toBeGreaterThanOrEqual(1);

        // Check each image is absolute HTTPS
        for (const img of product.images) {
          expect(img).toMatch(/^https?:\/\//);
        }

        // SLA: Field completeness score >= 90% (1.0 = 100%)
        const completeness = calculateCompleteness(product);
        expect(completeness).toBeGreaterThanOrEqual(0.9);
      }
    );

    it('maintains overall benchmark average completeness >90% across all brands', async () => {
      let totalScore = 0;
      for (const bc of brandCases) {
        let options: ExtractionOptions = {};
        if (bc.type === 'shopify') {
          options.mockJson = loadJsonFixture(bc.fixture);
        } else {
          options.html = loadHtmlFixture(bc.fixture);
        }
        const product = await extractProductDetails(bc.url, options);
        totalScore += calculateCompleteness(product);
      }
      const avg = totalScore / brandCases.length;
      expect(avg).toBeGreaterThanOrEqual(0.95);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Robustness, Anti-Bot & Error Resilience
  // ──────────────────────────────────────────────────────────────────────────
  describe('Robustness & Error Resilience (No 500 Crashes Guarantee)', () => {
    it('gracefully degrades to Tier 5 slug fallback on Cloudflare 403 challenge', async () => {
      const challengeHtml = loadHtmlFixture(
        'tests/fixtures/scraper/edge-cases/cloudflare-403.html'
      );
      const url =
        'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta';

      const product = await extractProductDetails(url, {
        html: challengeHtml,
      });

      expect(product).toBeDefined();
      expect(product.brand).toBe('Sapphire');
      expect(product.sourceUrl).toBe(url);
      expect(product.currencyOriginal).toBe('PKR');
      expect(product.gender).toBe('male');
      // No unhandled crash, graceful degraded metadata
      expect(product.confidenceScore).toBeLessThanOrEqual(0.85);
    });

    it('gracefully handles 404 Not Found without throwing unhandled exceptions', async () => {
      const notFoundHtml = loadHtmlFixture(
        'tests/fixtures/scraper/edge-cases/404-not-found.html'
      );
      const url =
        'https://pk.sapphireonline.pk/products/discontinued-summer-lawn-suit';

      const product = await extractProductDetails(url, {
        html: notFoundHtml,
      });

      expect(product).toBeDefined();
      expect(product.brand).toBe('Sapphire');
      expect(product.title).toBeDefined();
      expect(product.gender).toBe('female');
      expect(product.requiresManualPrice).toBe(true);
    });

    it('handles malformed / missing price markup cleanly without NaN propagation', async () => {
      const html = loadHtmlFixture(
        'tests/fixtures/scraper/edge-cases/malformed-price.html'
      );
      const url =
        'https://www.sanasafinaz.com/products/exclusive-couture-silk-suit';

      const product = await extractProductDetails(url, {
        html,
      });

      expect(product).toBeDefined();
      expect(product.priceOriginal).toBeNull();
      expect(product.requiresManualPrice).toBe(true);
      expect(product.brand).toBe('Sana Safinaz');
    });

    it('safely handles empty string and malformed URLs without server crash', async () => {
      const emptyResult = await extractProductDetails('');
      expect(emptyResult).toBeDefined();
      expect(emptyResult.fallbackTier).toBe(5);

      const invalidResult = await extractProductDetails(
        'not-a-valid-domain-url'
      );
      expect(invalidResult).toBeDefined();
      expect(invalidResult.fallbackTier).toBe(5);
    });
  });
});
