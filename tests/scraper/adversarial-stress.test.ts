import {
  extractProductDetails,
  ScrapedProduct,
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
import {
  titleFromSlug,
  brandFromHostname,
} from '@/lib/services/scraper/user-agents';

describe('Adversarial Stress Test Suite: Scraper Engine', () => {
  // ==========================================================================
  // 1. Extreme and Varied Price Formats
  // ==========================================================================
  describe('1. Extreme & Varied Price Formats', () => {
    describe('1.1 Range representations & delimiters', () => {
      it('handles standard hyphen price range (extracts lower bound)', () => {
        expect(normalizePkrPrice('PKR 4,990 - 7,990')).toBe(4990);
        expect(normalizePkrPrice('Rs. 3,500 - Rs. 5,000')).toBe(3500);
        expect(normalizePkrPrice('12,000 - 15,000')).toBe(12000);
      });

      it('handles Unicode En-dash (–) price ranges', () => {
        expect(normalizePkrPrice('PKR 4,500 – PKR 6,500')).toBe(4500);
        expect(normalizePkrPrice('Rs. 8,990 – 11,990')).toBe(8990);
      });

      it('handles Unicode Em-dash (—) price ranges', () => {
        expect(normalizePkrPrice('PKR 2,990 — PKR 4,990')).toBe(2990);
        expect(normalizePkrPrice('Rs. 6,450 — 8,950')).toBe(6450);
      });

      it('handles textual "to" price ranges', () => {
        expect(normalizePkrPrice('PKR 5,500 to PKR 7,500')).toBe(5500);
        expect(normalizePkrPrice('Rs. 3,990 to Rs. 4,990')).toBe(3990);
      });
    });

    describe('1.2 European comma decimal & dot thousands notation', () => {
      it('correctly normalizes European format "3.490,00" to 3490', () => {
        expect(normalizePkrPrice('3.490,00')).toBe(3490);
        expect(normalizePkrPrice('Rs 3.490,00')).toBe(3490);
        expect(normalizePkrPrice('PKR 12.850,50')).toBe(12851);
      });

      it('handles European format without decimals "4.990"', () => {
        expect(normalizePkrPrice('PKR 4.990')).toBe(4990);
        expect(normalizePkrPrice('Rs. 15.000')).toBe(15000);
      });
    });

    describe('1.3 Standard Anglo-American commas and decimals', () => {
      it('handles decimal rounding', () => {
        expect(normalizePkrPrice('PKR 4,999.49')).toBe(4999);
        expect(normalizePkrPrice('PKR 4,999.50')).toBe(5000);
        expect(normalizePkrPrice('Rs. 12,450.99')).toBe(12451);
      });

      it('handles varied thousand commas', () => {
        expect(normalizePkrPrice('1,250')).toBe(1250);
        expect(normalizePkrPrice('12,500')).toBe(12500);
        expect(normalizePkrPrice('125,000')).toBe(125000);
        expect(normalizePkrPrice('PKR 1,000,000')).toBe(1000000);
      });
    });

    describe('1.4 Currency symbols and variants', () => {
      it('strips "Rs.", "Rs", "rs.", "RS "', () => {
        expect(normalizePkrPrice('Rs. 6,850')).toBe(6850);
        expect(normalizePkrPrice('Rs 3,450')).toBe(3450);
        expect(normalizePkrPrice('rs.9,990')).toBe(9990);
        expect(normalizePkrPrice('RS 15,000')).toBe(15000);
      });

      it('strips "PKR", "pkr", "PKR."', () => {
        expect(normalizePkrPrice('PKR 4,990')).toBe(4990);
        expect(normalizePkrPrice('pkr 12,450.00')).toBe(12450);
        expect(normalizePkrPrice('PKR. 8,500')).toBe(8500);
      });

      it('handles Urdu/Arabic rupee symbol ₨ and ₨.', () => {
        expect(normalizePkrPrice('₨ 7,990')).toBe(7990);
        expect(normalizePkrPrice('₨14,500.00')).toBe(14500);
        expect(normalizePkrPrice('₨. 5,490')).toBe(5490);
      });
    });

    describe('1.5 Composite sale & promotional strings', () => {
      it('extracts sale price over regular price in promotional markup', () => {
        expect(
          normalizePkrPrice('Sale price Rs. 3,500 Regular price Rs. 5,000')
        ).toBe(3500);
        expect(
          normalizePkrPrice('Special Price PKR 2,999 Regular Price PKR 4,500')
        ).toBe(2999);
        expect(normalizePkrPrice('Now Rs. 1,999 Was Rs. 2,999')).toBe(1999);
        expect(
          normalizePkrPrice('Discount price PKR 4,200 Original PKR 6,000')
        ).toBe(4200);
        expect(normalizePkrPrice('Current price Rs. 8,000')).toBe(8000);
      });
    });

    describe('1.6 Boundary limits & invalid prices', () => {
      it('enforces lower boundary (PKR 100)', () => {
        expect(normalizePkrPrice(100)).toBe(100);
        expect(normalizePkrPrice('100')).toBe(100);
        expect(normalizePkrPrice(99)).toBeNull();
        expect(normalizePkrPrice('99')).toBeNull();
      });

      it('enforces upper boundary (PKR 1,000,000)', () => {
        expect(normalizePkrPrice(1000000)).toBe(1000000);
        expect(normalizePkrPrice('1,000,000')).toBe(1000000);
        expect(normalizePkrPrice(1000001)).toBeNull();
        expect(normalizePkrPrice('1,000,001')).toBeNull();
      });

      it('safely rejects non-numeric or malformed strings', () => {
        expect(normalizePkrPrice('Call for Price')).toBeNull();
        expect(normalizePkrPrice('Sold Out')).toBeNull();
        expect(normalizePkrPrice('Free')).toBeNull();
        expect(normalizePkrPrice('')).toBeNull();
        expect(normalizePkrPrice('   ')).toBeNull();
        expect(normalizePkrPrice(null)).toBeNull();
        expect(normalizePkrPrice(undefined)).toBeNull();
        expect(normalizePkrPrice(NaN)).toBeNull();
        expect(normalizePkrPrice(-100)).toBeNull();
        expect(normalizePkrPrice(0)).toBeNull();
      });
    });
  });

  // ==========================================================================
  // 2. Gender Word-Boundary Attacks
  // ==========================================================================
  describe('2. Gender Word-Boundary Attacks', () => {
    describe('2.1 "women" vs "men" boundary isolation', () => {
      it('never classifies "women" as "men"', () => {
        const r1 = detectGenderAndGarment({
          title: 'Women Embroidered Lawn Suit',
        });
        expect(r1.gender).toBe('female');
        expect(r1.matchedTerms.some((t) => t.includes('title:\\bmen\\b'))).toBe(
          false
        );

        const r2 = detectGenderAndGarment({
          title: "Women's Stitched Cotton Shirt",
        });
        expect(r2.gender).toBe('female');

        const r3 = detectGenderAndGarment({
          title: 'Superfine Womens Pret 2-Piece',
        });
        expect(r3.gender).toBe('female');
      });

      it('never classifies "female" as "male"', () => {
        const r = detectGenderAndGarment({
          title: 'Female Luxury Unstitched Lawn',
        });
        expect(r.gender).toBe('female');
        expect(r.matchedTerms.some((t) => t.includes('title:\\bmale\\b'))).toBe(
          false
        );
      });
    });

    describe('2.2 Fabric & garment substring collisions', () => {
      it('does not classify "linen" as "men"', () => {
        const r = detectGenderAndGarment({ title: 'Solid Dyed Linen Shirt' });
        // "linen" contains "nen", should not match male direct tokens
        expect(r.gender).toBe('female'); // defaults to female in absence of male tokens
        expect(r.fabricMaterial).toBe('linen');
        expect(r.matchedTerms.some((t) => t.includes('\\bmen\\b'))).toBe(false);
      });

      it('does not classify "garment" as "men"', () => {
        const r = detectGenderAndGarment({
          title: 'Luxury Unstitched Garment',
        });
        // "garment" contains "ment", word-boundary \bmen\b must not trigger
        expect(r.matchedTerms.some((t) => t.includes('\\bmen\\b'))).toBe(false);
      });

      it('does not false-match "daman" as "man"', () => {
        const r = detectGenderAndGarment({
          title: 'Embroidered Daman Border Lawn',
        });
        // "daman" contains "man", word-boundary \bman\b must not trigger
        expect(r.gender).toBe('female');
        expect(r.matchedTerms.some((t) => t.includes('\\bman\\b'))).toBe(false);
      });

      it('does not false-match words with "men" or "man" inside', () => {
        const testWords = [
          'Recommendation For Summer Wear',
          'Fundamental Basics Collection',
          'Regimen Daily Wear',
          'Specimen Print Lawn',
          'Monumental Festive Series',
          'Ornamental Embroidery Kurti',
        ];

        for (const title of testWords) {
          const res = detectGenderAndGarment({ title });
          expect(res.matchedTerms.some((t) => t.includes('\\bmen\\b'))).toBe(
            false
          );
          expect(res.matchedTerms.some((t) => t.includes('\\bman\\b'))).toBe(
            false
          );
        }
      });
    });

    describe('2.3 Ambiguous & Unisex terminology', () => {
      it('resolves unisex Kurta with male context as male', () => {
        const r = detectGenderAndGarment({ title: 'Unisex Cotton Kurta' });
        expect(r.gender).toBe('male');
        expect(r.garmentType).toBe('kurta');
      });

      it('resolves unisex Kurta with female context as female', () => {
        const r = detectGenderAndGarment({
          title: 'Unisex Printed Lawn Kurta with Dupatta',
        });
        expect(r.gender).toBe('female');
      });

      it('safely handles ambiguous items without throwing', () => {
        const r = detectGenderAndGarment({ title: 'Unisex Winter Shawl' });
        expect(['male', 'female']).toContain(r.gender);
        expect(r.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    describe('2.4 Kurti vs Kurta disambiguation', () => {
      it('correctly differentiates Kurti (female) from Kurta (male)', () => {
        const kurti = detectGenderAndGarment({
          title: 'Embroidered Silk Kurti',
        });
        expect(kurti.gender).toBe('female');
        expect(kurti.garmentType).toBe('kameez_only');

        const kurta = detectGenderAndGarment({
          title: 'Men Classic Cotton Kurta',
        });
        expect(kurta.gender).toBe('male');
        expect(kurta.garmentType).toBe('kurta');
      });
    });
  });

  // ==========================================================================
  // 3. Image URL Sanitization & Upgrading
  // ==========================================================================
  describe('3. Image URL Sanitization & Upgrading', () => {
    describe('3.1 Shopify dimension upgrade & thumbnail stripping', () => {
      it('strips standard thumbnail suffixes (_compact, _medium, _100x100, etc.)', () => {
        const baseUrl = 'https://cdn.shopify.com/s/files/1/0550/products/suit';
        expect(upgradeShopifyImageUrl(`${baseUrl}_compact.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_medium.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_small.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_large.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_grande.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_100x100.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_1024x1024.png`)).toBe(
          `${baseUrl}.png`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_pico.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_icon.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_thumb.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
        expect(upgradeShopifyImageUrl(`${baseUrl}_master.jpg`)).toBe(
          `${baseUrl}.jpg`
        );
      });

      it('preserves query parameters when stripping thumbnail suffixes', () => {
        const urlWithQuery =
          'https://cdn.shopify.com/s/files/1/prod_compact.jpg?v=1708934';
        expect(upgradeShopifyImageUrl(urlWithQuery)).toBe(
          'https://cdn.shopify.com/s/files/1/prod.jpg?v=1708934'
        );
      });

      it('upgrades query parameter width/height restrictions to 2048px', () => {
        const queryResUrl =
          'https://cdn.shopify.com/s/files/1/prod.jpg?width=400&height=600';
        const upgraded = upgradeShopifyImageUrl(queryResUrl);
        expect(upgraded).toContain('width=2048');
        expect(upgraded).not.toContain('height=600');
      });
    });

    describe('3.2 SFCC Demandware dynamic image parameters', () => {
      it('upgrades Demandware sw and sh parameters to 1600x2400', () => {
        const sfccUrl =
          'https://pk.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/img.jpg?sw=400&sh=600&sm=fit';
        const upgraded = upgradeDemandwareImageUrl(sfccUrl);
        expect(upgraded).toContain('sw=1600');
        expect(upgraded).toContain('sh=2400');
        expect(upgraded).toContain('sm=fit');
      });
    });

    describe('3.3 Protocol-relative and relative URL resolution', () => {
      it('converts protocol-relative "//" URLs to absolute "https://"', () => {
        const protoUrl = '//cdn.shopify.com/s/files/1/photo.jpg';
        expect(resolveAbsoluteImageUrl(protoUrl)).toBe(
          'https://cdn.shopify.com/s/files/1/photo.jpg'
        );
      });

      it('resolves root-relative "/" paths against baseUrl', () => {
        const relUrl = '/dw/image/v2/test.jpg';
        const resolved = resolveAbsoluteImageUrl(
          relUrl,
          'https://pk.khaadi.com'
        );
        expect(resolved).toBe('https://pk.khaadi.com/dw/image/v2/test.jpg');
      });

      it('upgrades insecure "http://" apparel CDN links to "https://"', () => {
        const httpUrl = 'http://cdn.shopify.com/s/files/1/photo.jpg';
        expect(resolveAbsoluteImageUrl(httpUrl)).toBe(
          'https://cdn.shopify.com/s/files/1/photo.jpg'
        );
      });

      it('rejects data URIs and javascript: schemes', () => {
        expect(
          resolveAbsoluteImageUrl(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE='
          )
        ).toBeNull();
        expect(resolveAbsoluteImageUrl('javascript:alert(1)')).toBeNull();
        expect(resolveAbsoluteImageUrl('')).toBeNull();
      });
    });

    describe('3.4 Asset exclusion & gallery deduplication', () => {
      it('filters non-product UI icons, badges, and SVGs', () => {
        expect(
          isNonProductAsset('https://store.pk/static/icons/cart.svg')
        ).toBe(true);
        expect(
          isNonProductAsset('https://store.pk/images/payment-easypaisa.png')
        ).toBe(true);
        expect(
          isNonProductAsset('https://store.pk/badges/visa_mastercard.jpg')
        ).toBe(true);
        expect(
          isNonProductAsset('https://store.pk/assets/size_chart.jpg')
        ).toBe(true);
        expect(isNonProductAsset('https://store.pk/1x1.gif')).toBe(true);
        expect(
          isNonProductAsset('https://store.pk/cdn/products/front-shot.jpg')
        ).toBe(false);
      });

      it('deduplicates variant URLs pointing to the same master photo', () => {
        const images = [
          'https://cdn.shopify.com/s/files/1/kurta_compact.jpg?v=1',
          'https://cdn.shopify.com/s/files/1/kurta_large.jpg?v=2',
          'https://cdn.shopify.com/s/files/1/kurta_100x100.jpg',
          'https://cdn.shopify.com/s/files/1/kurta-back_medium.jpg',
        ];
        const sanitized = sanitizeAndUpgradeImages(images);
        expect(sanitized.length).toBe(2);
        expect(sanitized[0]).toContain('kurta.jpg');
        expect(sanitized[1]).toContain('kurta-back.jpg');
      });
    });
  });

  // ==========================================================================
  // 4. Tier 5 Slug Fallback under Network / 404 / 403 Errors
  // ==========================================================================
  describe('4. Tier 5 Slug Fallback Resilience (Zero 500 Crashes)', () => {
    describe('4.1 Slug title and brand inference', () => {
      it('derives human-readable title from kebab-case URL slug', () => {
        expect(titleFromSlug('/products/men-embroidered-cotton-kurta')).toBe(
          'Men Embroidered Cotton Kurta'
        );
        expect(
          titleFromSlug('/fabrics/unstitched/3-piece-printed-lawn-suit.html')
        ).toBe('3-Piece Printed Lawn Suit');
        expect(titleFromSlug('/women-pret-kurti-collection')).toBe(
          'Women Pret Kurti Collection'
        );
      });

      it('converts acronyms like 3pc, 2pc to readable format', () => {
        expect(titleFromSlug('/products/luxury-3pc-lawn-suit')).toBe(
          'Luxury 3-Piece Lawn Suit'
        );
        expect(titleFromSlug('/products/printed-2pc-cambric')).toBe(
          'Printed 2-Piece Cambric'
        );
      });

      it('derives Pakistani brand name from known hostnames', () => {
        expect(brandFromHostname('pk.sapphireonline.pk')).toBe('Sapphire');
        expect(brandFromHostname('www.junaidjamshed.com')).toBe(
          'J. (Junaid Jamshed)'
        );
        expect(brandFromHostname('pk.khaadi.com')).toBe('Khaadi');
        expect(brandFromHostname('sanasafinaz.com')).toBe('Sana Safinaz');
        expect(brandFromHostname('mariab.pk')).toBe('Maria.B');
        expect(brandFromHostname('limelight.pk')).toBe('LimeLight');
        expect(brandFromHostname('nishatlinen.com')).toBe('Nishat Linen');
        expect(brandFromHostname('gulahmedshop.com')).toBe('Gul Ahmed (Ideas)');
      });

      it('falls back gracefully to capitalized domain label for unmapped hostnames', () => {
        expect(brandFromHostname('customcouture.pk')).toBe('Customcouture');
        expect(brandFromHostname('designer-label.com')).toBe('Designer-label');
      });
    });

    describe('4.2 Simulated network failure & bot-blocked scenarios', () => {
      it('handles simulated Cloudflare 403 Bot Challenge with Tier 5 fallback', async () => {
        const cloudflareHtml = `
          <!DOCTYPE html>
          <html>
            <head><title>Just a moment...</title></head>
            <body><p>Enable JavaScript and cookies to continue</p></body>
          </html>
        `;
        const url =
          'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta';
        const product = await extractProductDetails(url, {
          html: cloudflareHtml,
        });

        expect(product).toBeDefined();
        expect(product.fallbackTier).toBe(5);
        expect(product.brand).toBe('Sapphire');
        expect(product.title).toBe('Men Embroidered Cotton Kurta');
        expect(product.gender).toBe('male');
        expect(product.garmentType).toBe('kurta');
        expect(product.requiresManualPrice).toBe(true);
        expect(product.priceOriginal).toBeNull();
      });

      it('handles simulated HTTP 404 Not Found without throwing', async () => {
        const notFoundHtml = `
          <!DOCTYPE html>
          <html>
            <head><title>404 Not Found - Sapphire Online</title></head>
            <body><h1>The page you requested does not exist</h1></body>
          </html>
        `;
        const url =
          'https://pk.sapphireonline.pk/products/women-3-piece-printed-lawn-suit';
        const product = await extractProductDetails(url, {
          html: notFoundHtml,
        });

        expect(product).toBeDefined();
        expect(product.fallbackTier).toBe(5);
        expect(product.brand).toBe('Sapphire');
        expect(product.title).toBe('Women 3-Piece Printed Lawn Suit');
        expect(product.gender).toBe('female');
        expect(product.garmentType).toBe('full_suit');
        expect(product.requiresManualPrice).toBe(true);
      });

      it('handles simulated 500 Internal Server Error page gracefully', async () => {
        const serverErrorHtml = `
          <!DOCTYPE html>
          <html>
            <head><title>500 Internal Server Error</title></head>
            <body><h1>Server Error</h1></body>
          </html>
        `;
        const url =
          'https://pk.khaadi.com/fabrics/unstitched/3-piece-embroidered-lawn-suit.html';
        const product = await extractProductDetails(url, {
          html: serverErrorHtml,
        });

        expect(product).toBeDefined();
        expect(product.fallbackTier).toBe(5);
        expect(product.brand).toBe('Khaadi');
        expect(product.gender).toBe('female');
        expect(product.requiresManualPrice).toBe(true);
      });

      it('handles empty string and completely malformed URLs without server crash', async () => {
        const emptyResult = await extractProductDetails('');
        expect(emptyResult).toBeDefined();
        expect(emptyResult.fallbackTier).toBe(5);

        const malformedResult = await extractProductDetails(
          'not-a-valid-url-at-all'
        );
        expect(malformedResult).toBeDefined();
        expect(malformedResult.fallbackTier).toBe(5);
        expect(malformedResult.requiresManualPrice).toBe(true);

        const nullishResult = await extractProductDetails(null as any);
        expect(nullishResult).toBeDefined();
        expect(nullishResult.fallbackTier).toBe(5);
      });
    });
  });
});
