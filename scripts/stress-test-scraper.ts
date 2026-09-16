#!/usr/bin/env tsx
import { normalizePkrPrice } from '../src/lib/services/scraper/price-normalizer';
import {
  sanitizeAndUpgradeImages,
  upgradeShopifyImageUrl,
  upgradeDemandwareImageUrl,
  resolveAbsoluteImageUrl,
  isNonProductAsset,
} from '../src/lib/services/scraper/image-sanitizer';
import {
  detectGenderAndGarment,
  detectFabricMaterial,
} from '../src/lib/services/scraper/gender-detector';
import {
  titleFromSlug,
  brandFromHostname,
} from '../src/lib/services/scraper/user-agents';
import { extractProductDetails } from '../src/lib/services/link-parser.service';

interface StressResult {
  category: string;
  name: string;
  expected: any;
  actual: any;
  passed: boolean;
  notes?: string;
}

const results: StressResult[] = [];

function assertTest(
  category: string,
  name: string,
  actual: any,
  expected: any,
  notes?: string
) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ category, name, expected, actual, passed, notes });
}

async function runEmpiricalStressSuite() {
  console.log(
    '\n================================================================================'
  );
  console.log(
    '       STITCH SCRAPER ENGINE EMPIRICAL STRESS VERIFICATION SUITE'
  );
  console.log(
    '================================================================================\n'
  );

  // ============================================================================
  // Area 1: Price Formats Stress Testing
  // ============================================================================
  console.log('>>> [1/4] Stress Testing Price Normalization Formats...');

  // Ranges
  assertTest(
    'Price',
    'Hyphen range "PKR 4,990 - 7,990"',
    normalizePkrPrice('PKR 4,990 - 7,990'),
    4990
  );
  assertTest(
    'Price',
    'En-dash range "PKR 4,500 – PKR 6,500"',
    normalizePkrPrice('PKR 4,500 – PKR 6,500'),
    4500
  );
  assertTest(
    'Price',
    'Em-dash range "PKR 2,990 — PKR 4,990"',
    normalizePkrPrice('PKR 2,990 — PKR 4,990'),
    2990
  );
  assertTest(
    'Price',
    'Textual "to" range "Rs. 3,990 to Rs. 4,990"',
    normalizePkrPrice('Rs. 3,990 to Rs. 4,990'),
    3990
  );

  // European formatting
  assertTest(
    'Price',
    'European comma decimal "3.490,00"',
    normalizePkrPrice('3.490,00'),
    3490
  );
  assertTest(
    'Price',
    'European with Rs "Rs 3.490,00"',
    normalizePkrPrice('Rs 3.490,00'),
    3490
  );
  assertTest(
    'Price',
    'European dot thousands "PKR 4.990"',
    normalizePkrPrice('PKR 4.990'),
    4990
  );

  // Currencies & Symbols
  assertTest(
    'Price',
    'Urdu symbol "₨ 7,990"',
    normalizePkrPrice('₨ 7,990'),
    7990
  );
  assertTest(
    'Price',
    'Urdu symbol dot "₨. 14,500"',
    normalizePkrPrice('₨. 14,500'),
    14500
  );
  assertTest(
    'Price',
    'Prefix "RS 15,000"',
    normalizePkrPrice('RS 15,000'),
    15000
  );
  assertTest(
    'Price',
    'Prefix dot "PKR. 8,500"',
    normalizePkrPrice('PKR. 8,500'),
    8500
  );

  // Composite sale
  assertTest(
    'Price',
    'Sale vs regular "Sale price Rs. 3,500 Regular price Rs. 5,000"',
    normalizePkrPrice('Sale price Rs. 3,500 Regular price Rs. 5,000'),
    3500
  );
  assertTest(
    'Price',
    'Special price "Special Price PKR 2,999 Regular Price PKR 4,500"',
    normalizePkrPrice('Special Price PKR 2,999 Regular Price PKR 4,500'),
    2999
  );
  assertTest(
    'Price',
    'Now vs Was "Now Rs. 1,999 Was Rs. 2,999"',
    normalizePkrPrice('Now Rs. 1,999 Was Rs. 2,999'),
    1999
  );

  // Boundaries & Anomalies
  assertTest('Price', 'Min bound valid (100)', normalizePkrPrice(100), 100);
  assertTest(
    'Price',
    'Min bound string "Rs. 100"',
    normalizePkrPrice('Rs. 100'),
    100
  );
  assertTest(
    'Price',
    'Below min bound rejected (99)',
    normalizePkrPrice(99),
    null
  );
  assertTest(
    'Price',
    'Max bound valid (1,000,000)',
    normalizePkrPrice(1000000),
    1000000
  );
  assertTest(
    'Price',
    'Above max bound rejected (1,000,001)',
    normalizePkrPrice(1000001),
    null
  );
  assertTest(
    'Price',
    'Invalid string "Call for Price"',
    normalizePkrPrice('Call for Price'),
    null
  );
  assertTest(
    'Price',
    'Invalid string "Sold Out"',
    normalizePkrPrice('Sold Out'),
    null
  );
  assertTest('Price', 'Empty string ""', normalizePkrPrice(''), null);
  assertTest('Price', 'Null value', normalizePkrPrice(null), null);
  assertTest('Price', 'Negative value (-500)', normalizePkrPrice(-500), null);

  // ============================================================================
  // Area 2: Gender Word-Boundary Attacks
  // ============================================================================
  console.log('>>> [2/4] Stress Testing Gender Word-Boundary Attacks...');

  // "women" isolation
  const w1 = detectGenderAndGarment({ title: 'Women Embroidered Lawn Suit' });
  assertTest(
    'Gender',
    '"women" does not trigger male tokens',
    w1.gender,
    'female'
  );
  assertTest(
    'Gender',
    '"women" matchedTerms isolation',
    w1.matchedTerms.some((t) => t.includes('\\bmen\\b')),
    false
  );

  const w2 = detectGenderAndGarment({ title: "Women's Stitched Cotton Shirt" });
  assertTest('Gender', '"women\'s" parsed as female', w2.gender, 'female');

  // "female" isolation
  const fem1 = detectGenderAndGarment({
    title: 'Female Luxury Unstitched Lawn',
  });
  assertTest(
    'Gender',
    '"female" does not trigger male tokens',
    fem1.gender,
    'female'
  );
  assertTest(
    'Gender',
    '"female" matchedTerms isolation',
    fem1.matchedTerms.some((t) => t.includes('\\bmale\\b')),
    false
  );

  // Substring collision defenses: "linen", "garment", "daman", "specimen", "recommendation"
  const linenRes = detectGenderAndGarment({ title: 'Solid Dyed Linen Shirt' });
  assertTest(
    'Gender',
    '"linen" does not false-match male',
    linenRes.matchedTerms.some((t) => t.includes('\\bmen\\b')),
    false
  );
  assertTest(
    'Gender',
    '"linen" fabric detected',
    linenRes.fabricMaterial,
    'linen'
  );

  const garmentRes = detectGenderAndGarment({
    title: 'Luxury Unstitched Garment',
  });
  assertTest(
    'Gender',
    '"garment" does not false-match male',
    garmentRes.matchedTerms.some((t) => t.includes('\\bmen\\b')),
    false
  );

  const damanRes = detectGenderAndGarment({
    title: 'Embroidered Daman Border Lawn',
  });
  assertTest(
    'Gender',
    '"daman" does not false-match "man"',
    damanRes.matchedTerms.some((t) => t.includes('\\bman\\b')),
    false
  );

  const words = [
    'Recommendation',
    'Fundamental',
    'Regimen',
    'Specimen',
    'Ornamental',
  ];
  for (const w of words) {
    const r = detectGenderAndGarment({ title: `${w} Collection` });
    assertTest(
      'Gender',
      `Word "${w}" does not false-match male`,
      r.matchedTerms.some(
        (t) => t.includes('\\bmen\\b') || t.includes('\\bman\\b')
      ),
      false
    );
  }

  // Ambiguous & Unisex
  const unisexKurtaMale = detectGenderAndGarment({
    title: 'Unisex Cotton Kurta',
  });
  assertTest(
    'Gender',
    'Unisex Kurta with cotton -> male',
    unisexKurtaMale.gender,
    'male'
  );
  assertTest(
    'Gender',
    'Unisex Kurta garmentType',
    unisexKurtaMale.garmentType,
    'kurta'
  );

  const unisexKurtaFemale = detectGenderAndGarment({
    title: 'Unisex Lawn Kurta with Dupatta',
  });
  assertTest(
    'Gender',
    'Unisex Kurta with dupatta -> female',
    unisexKurtaFemale.gender,
    'female'
  );

  // Kurti vs Kurta disambiguation
  const kurtiRes = detectGenderAndGarment({ title: 'Embroidered Silk Kurti' });
  assertTest('Gender', '"Kurti" -> female', kurtiRes.gender, 'female');
  assertTest(
    'Gender',
    '"Kurti" -> kameez_only',
    kurtiRes.garmentType,
    'kameez_only'
  );

  const kurtaRes = detectGenderAndGarment({
    title: 'Men Classic Cotton Kurta',
  });
  assertTest('Gender', '"Kurta" -> male', kurtaRes.gender, 'male');
  assertTest('Gender', '"Kurta" -> kurta', kurtaRes.garmentType, 'kurta');

  // ============================================================================
  // Area 3: Image URL Sanitization & Upgrading
  // ============================================================================
  console.log('>>> [3/4] Stress Testing Image URL Sanitization & Upgrading...');

  // Shopify stripping
  const shopifyBase = 'https://cdn.shopify.com/s/files/1/0550/products/suit';
  const suffixes = [
    'compact',
    'medium',
    'small',
    'large',
    'grande',
    '100x100',
    '1024x1024',
    'pico',
    'icon',
    'thumb',
    'master',
  ];
  for (const s of suffixes) {
    assertTest(
      'Image',
      `Shopify strip _${s}`,
      upgradeShopifyImageUrl(`${shopifyBase}_${s}.jpg`),
      `${shopifyBase}.jpg`
    );
  }

  // Shopify query param upscaling
  const queryImg = upgradeShopifyImageUrl(
    'https://cdn.shopify.com/s/files/1/prod.jpg?width=400&height=600'
  );
  assertTest(
    'Image',
    'Shopify width upscaled to 2048',
    queryImg.includes('width=2048'),
    true
  );
  assertTest(
    'Image',
    'Shopify height removed',
    queryImg.includes('height=600'),
    false
  );

  // SFCC Demandware
  const sfccUpgraded = upgradeDemandwareImageUrl(
    'https://pk.khaadi.com/dw/image/v2/img.jpg?sw=400&sh=600&sm=fit'
  );
  assertTest(
    'Image',
    'SFCC sw=1600 upgrade',
    sfccUpgraded.includes('sw=1600'),
    true
  );
  assertTest(
    'Image',
    'SFCC sh=2400 upgrade',
    sfccUpgraded.includes('sh=2400'),
    true
  );

  // Protocol-relative & relative
  assertTest(
    'Image',
    'Protocol relative "//" to "https://"',
    resolveAbsoluteImageUrl('//cdn.shopify.com/photo.jpg'),
    'https://cdn.shopify.com/photo.jpg'
  );
  assertTest(
    'Image',
    'Relative path with baseUrl',
    resolveAbsoluteImageUrl('/dw/image/v2/test.jpg', 'https://pk.khaadi.com'),
    'https://pk.khaadi.com/dw/image/v2/test.jpg'
  );
  assertTest(
    'Image',
    'Insecure http upgraded to https',
    resolveAbsoluteImageUrl('http://cdn.shopify.com/photo.jpg'),
    'https://cdn.shopify.com/photo.jpg'
  );
  assertTest(
    'Image',
    'data URI rejected',
    resolveAbsoluteImageUrl('data:image/png;base64,abc'),
    null
  );
  assertTest(
    'Image',
    'javascript: rejected',
    resolveAbsoluteImageUrl('javascript:alert(1)'),
    null
  );

  // UI asset filtering
  assertTest(
    'Image',
    'Filter cart.svg icon',
    isNonProductAsset('https://store.pk/icons/cart.svg'),
    true
  );
  assertTest(
    'Image',
    'Filter easypaisa badge',
    isNonProductAsset('https://store.pk/badges/easypaisa.png'),
    true
  );
  assertTest(
    'Image',
    'Filter visa card',
    isNonProductAsset('https://store.pk/badges/visa_mastercard.jpg'),
    true
  );
  assertTest(
    'Image',
    'Filter size chart',
    isNonProductAsset('https://store.pk/size_chart.png'),
    true
  );
  assertTest(
    'Image',
    'Product photo NOT filtered',
    isNonProductAsset('https://store.pk/cdn/products/front.jpg'),
    false
  );

  // Deduplication
  const rawList = [
    'https://cdn.shopify.com/s/files/1/kurta_compact.jpg?v=1',
    'https://cdn.shopify.com/s/files/1/kurta_large.jpg?v=2',
    'https://cdn.shopify.com/s/files/1/kurta_100x100.jpg',
    'https://cdn.shopify.com/s/files/1/kurta-back_medium.jpg',
  ];
  const deduped = sanitizeAndUpgradeImages(rawList);
  assertTest(
    'Image',
    'Deduplication collapses duplicates (4 -> 2)',
    deduped.length,
    2
  );

  // ============================================================================
  // Area 4: Tier 5 Slug Fallback under Network/404/403 Errors (Zero 500 Guarantee)
  // ============================================================================
  console.log('>>> [4/4] Stress Testing Tier 5 Fallback & Zero 500 Crashes...');

  // Title and Brand inference from slug
  assertTest(
    'Fallback',
    'Slug title "men-embroidered-cotton-kurta"',
    titleFromSlug('/products/men-embroidered-cotton-kurta'),
    'Men Embroidered Cotton Kurta'
  );
  assertTest(
    'Fallback',
    'Slug title with 3pc acronym',
    titleFromSlug('/products/luxury-3pc-lawn-suit'),
    'Luxury 3-Piece Lawn Suit'
  );
  assertTest(
    'Fallback',
    'Brand from sapphire hostname',
    brandFromHostname('pk.sapphireonline.pk'),
    'Sapphire'
  );
  assertTest(
    'Fallback',
    'Brand from jj hostname',
    brandFromHostname('www.junaidjamshed.com'),
    'J. (Junaid Jamshed)'
  );
  assertTest(
    'Fallback',
    'Brand from khaadi hostname',
    brandFromHostname('pk.khaadi.com'),
    'Khaadi'
  );
  assertTest(
    'Fallback',
    'Brand from unmapped hostname',
    brandFromHostname('customcouture.pk'),
    'Customcouture'
  );

  // Simulated Cloudflare 403
  const cfHtml =
    '<html><head><title>Just a moment...</title></head><body>Enable JS</body></html>';
  const cfProd = await extractProductDetails(
    'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta',
    { html: cfHtml }
  );
  assertTest(
    'Fallback',
    'Cloudflare 403 returns defined product',
    typeof cfProd,
    'object'
  );
  assertTest('Fallback', 'Cloudflare 403 Tier is 5', cfProd.fallbackTier, 5);
  assertTest(
    'Fallback',
    'Cloudflare 403 brand preserved',
    cfProd.brand,
    'Sapphire'
  );
  assertTest(
    'Fallback',
    'Cloudflare 403 title inferred',
    cfProd.title,
    'Men Embroidered Cotton Kurta'
  );
  assertTest(
    'Fallback',
    'Cloudflare 403 gender is male',
    cfProd.gender,
    'male'
  );
  assertTest(
    'Fallback',
    'Cloudflare 403 price requires manual entry',
    cfProd.requiresManualPrice,
    true
  );

  // Simulated 404 Not Found
  const nfHtml =
    '<html><head><title>404 Not Found</title></head><body>Page missing</body></html>';
  const nfProd = await extractProductDetails(
    'https://pk.sapphireonline.pk/products/women-3-piece-printed-lawn-suit',
    { html: nfHtml }
  );
  assertTest(
    'Fallback',
    '404 returns defined product',
    typeof nfProd,
    'object'
  );
  assertTest('Fallback', '404 Tier is 5', nfProd.fallbackTier, 5);
  assertTest('Fallback', '404 gender is female', nfProd.gender, 'female');

  // Empty string and malformed inputs
  const emptyProd = await extractProductDetails('');
  assertTest(
    'Fallback',
    'Empty string gracefully handled',
    emptyProd.fallbackTier,
    5
  );

  const malformedProd = await extractProductDetails('invalid-domain/test-slug');
  assertTest(
    'Fallback',
    'Malformed URL gracefully handled',
    malformedProd.fallbackTier,
    5
  );

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(
    '\n================================================================================'
  );
  console.log('                          STRESS SUITE RESULTS SUMMARY');
  console.log(
    '================================================================================'
  );
  console.log(` Total Assertions Tested: ${total}`);
  console.log(` Passed:                 ${passed} (${passRate}%)`);
  console.log(` Failed:                 ${failed}`);
  console.log(
    '================================================================================\n'
  );

  if (failed > 0) {
    console.error('FAILED TESTS:');
    for (const r of results.filter((r) => !r.passed)) {
      console.error(` [FAIL] [${r.category}] ${r.name}`);
      console.error(`        Expected: ${JSON.stringify(r.expected)}`);
      console.error(`        Actual:   ${JSON.stringify(r.actual)}`);
    }
    process.exit(1);
  } else {
    console.log(
      '>> [SUCCESS] 100% of adversarial stress assertions PASSED cleanly.'
    );
    console.log('>> VERDICT: APPROVE');
    process.exit(0);
  }
}

runEmpiricalStressSuite();
