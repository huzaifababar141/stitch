# Handoff Report: E-Commerce Scraper & Storefront Archetypes

**Agent:** `explorer_survey_2`  
**Working Directory:** `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_2`  
**Date:** 2026-09-11  
**Recipient:** `orchestrator_1` (conversation ID: `8696404f-3a2a-4a1e-986b-b5b6e4ea11c5`)  
**Type:** Hard Handoff (Investigation Complete)

---

## 1. Observation

1. **Existing Link Parser Service:**
   - Location: `d:\University\CS 2024-2028\SP\stitch\src\lib\services\link-parser.service.ts`
   - Lines 7–29: `ALLOWED_DOMAINS` contains 21 Pakistani fashion domains (`khaadi.com`, `gulahmedshop.com`, `sapphireonline.pk`, `sanasafinaz.com`, `junaidjamshed.com`, `alkaramstudio.com`, `mariab.pk`, `limelight.pk`, `asimjofa.com`, `baroque.pk`, `nishatlinen.com`, etc.).
   - Lines 95–149: Implements a rudimentary Tier 1 check (`urlStr.includes('/products/')`) appending `.json`. If successful, it maps `title`, `vendor`, `variants[0].price`, and `images.slice(0, 5)`.
   - Lines 151–175: Tier 2 attempts a bare `fetch(urlStr)` with a generic Chrome User-Agent, but lacks modern `sec-ch-ua`, `sec-fetch-*`, and redirect handling.
   - Lines 215–326: Cheerio DOM price parsing attempts meta tags, JSON-LD, selector list, and raw body regex.
   - Lines 348–362: Saves to Prisma `Product`.
   - **Deficiencies directly observed:**
     - Zero gender detection logic is present (no `gender` field is populated or detected).
     - Images are not upgraded to high-resolution (thumbnails with `_compact` or query parameters are left unscaled).
     - Non-Shopify enterprise architectures (specifically Khaadi on Salesforce Commerce Cloud) are unhandled by Tier 1.
     - Bot mitigation / Cloudflare challenge handling (Tier 2/Tier 5) does not cleanly structure WAF blocks or fallback gracefully without throwing.

2. **Customer Order Wizard Integration:**
   - Location: `d:\University\CS 2024-2028\SP\stitch\src\app\(customer)\new-order\page.tsx`
   - Lines 105–106: Wizard maintains separate state `gender` (`'female' | 'male'`, default `'female'`).
   - Lines 136–168: Function `handleGenderChange(newGender)` resets gender defaults, trouser codes (`P-32` vs `T-30`), collar/neckline styles, and title/brand defaults.
   - Lines 549–595: `handleParseUrl` calls `/api/products/parse`. Upon receiving `prod`, lines 570–575 populate `setParsedProduct(prod)`, `setManualTitle(...)`, `setManualBrand(...)`, and `setManualPrice(...)`.
   - **Deficiency directly observed:** `handleGenderChange` is **never called** when a product is parsed. If a customer pastes a Men's Kurta link, the wizard remains stuck on the Women's customization tab unless the customer manually realizes and toggles the tab.

3. **Prisma Database Schema:**
   - Location: `d:\University\CS 2024-2028\SP\stitch\prisma\schema.prisma`
   - Lines 372–397: `model Product` has fields `id`, `sourceUrl`, `normalizedUrl`, `name`, `brand`, `description`, `images` (JsonB), `fabricType`, `garmentType` (`GarmentType` enum), `colorTags`, `priceOriginal` (Decimal), `currencyOriginal`, `isActive`, `parseSource`, `parsedAt`, and `parseMetadata` (JsonB).
   - `parseMetadata` is available for structured metadata including detected gender, matched terms, fallback tier, and confidence score.

4. **Target Storefront E-Commerce Platforms:**
   - External platform verification via web documentation and CDN asset structure:
     - **Shopify Plus / Shopify:** Junaid Jamshed (`junaidjamshed.com`), Sapphire (`sapphireonline.pk`), Sana Safinaz (`sanasafinaz.com`), Maria.B (`mariab.pk`), Gul Ahmed (`gulahmedshop.com`), LimeLight (`limelight.pk`), Nishat Linen (`nishatlinen.com`).
     - **Salesforce Commerce Cloud (Demandware) + MS Dynamics 365:** Khaadi (`pk.khaadi.com`).

---

## 2. Logic Chain

1. **Platform Dominance & Fast Path:**
   - _Observation 4_ shows 7 of 8 target brands operate on Shopify.
   - Shopify stores natively expose product data at `/products/<handle>.json`.
   - _Therefore_, Tier 1 native JSON extraction is the optimal fast-path (<800ms) for >85% of Pakistani store links, bypassing DOM parsing and CSS selector drift.

2. **Enterprise & Non-Shopify Exception (Khaadi):**
   - _Observation 4_ confirms Khaadi uses Salesforce Commerce Cloud (SFCC), which does not support `/products/<handle>.json`.
   - _Therefore_, the architecture requires Tier 2 (browser-mimicking fetch with full client hints) and Tier 3 (Cheerio parsing of Schema.org JSON-LD and OpenGraph tags) to handle Khaadi and custom stores seamlessly.

3. **WAF & Anti-Bot Resilience:**
   - Both Cloudflare and Akamai monitor TLS fingerprints and passive headers.
   - _Observation 1_ shows the current fetch uses minimal headers without `sec-ch-ua` or client hints.
   - _Therefore_, Tier 2 must include full browser header mimicry (`sec-ch-ua`, `sec-fetch-dest`, `sec-fetch-mode`, modern Chrome UA) and Tier 5 must provide slug/hostname inference with clean structured responses if an external server returns HTTP 403/WAF challenges, guaranteeing zero 500 crashes.

4. **Gender Synchronization Defect:**
   - _Observation 2_ shows `/new-order/page.tsx` supports gender switching via `handleGenderChange`, but `handleParseUrl` never calls it because the existing parser does not return a `gender` attribute.
   - _Therefore_, the link parser must extract gender (`male` | `female`) from URL slugs, tags, breadcrumbs, and title keywords, and `/new-order/page.tsx` must trigger `handleGenderChange(product.gender)`.

5. **Image Quality for Custom Tailoring:**
   - Customers need high-resolution images to view fabric weave, lace details, and print borders.
   - _Observation 1_ shows images are currently stored as raw URLs without CDN scaling.
   - _Therefore_, the image pipeline must transform Shopify CDN URLs (removing `_compact`, `_medium`, `width=...`) and Demandware URLs (`?sw=...&sh=...`) to high-resolution assets (>= 1200px) while filtering out logos, payment badges, and icons.

---

## 3. Caveats

1. **Dynamic Client-Side Renders:** Certain headless or heavily JavaScript-rendered storefronts require inline state extraction (e.g. `window.dataLayer` or Next.js `__NEXT_DATA__`) rather than standard DOM selectors. Tier 4 pattern matching handles this without requiring a heavy Puppeteer/Playwright headless browser.
2. **Network Mode Restrictions:** In restricted or firewalled environments, external HTTP requests to live domains may be blocked or rate-limited. The implementation must include comprehensive mock fixtures in `tests/fixtures/scraper/` so the verification test suite executes cleanly offline in CI.
3. **International Currency Switching:** If accessed from overseas IP addresses, some stores (e.g., Sana Safinaz or Sapphire) may display prices in USD or AED. The parser should detect `offers.priceCurrency` or meta tags, prioritize PKR, or mark foreign currency appropriately.

---

## 4. Conclusion

A robust, production-ready link scraping pipeline for Pakistani apparel e-commerce requires:

1. **A 5-Tier Fallback Pipeline:**
   - Tier 1: Native `/products/<handle>.json` inspection for Shopify-based brands (J., Sapphire, Sana Safinaz, Maria.B, Gul Ahmed, LimeLight, Nishat Linen).
   - Tier 2: Browser-mimicking HTTP fetch with full `sec-ch-ua` and Chrome headers.
   - Tier 3: DOM parser prioritizing Schema.org JSON-LD `Product` and OpenGraph microdata (vital for SFCC/Khaadi).
   - Tier 4: Pattern-based extraction for inline JS (`dataLayer`, `ShopifyAnalytics`) and body text regex.
   - Tier 5: Clean structured fallback deriving brand, title, and gender from the URL slug, returning valid JSON without crashes.
2. **Deterministic Gender Detection:** Word-boundary token matching across categories, breadcrumbs, tags, and garment terms (`kurta`, `shalwar kameez`, `waistcoat` -> `male`; `3 piece`, `2 piece`, `kurti`, `unstitched lawn`, `chiffon`, `dupatta` -> `female`).
3. **Price Normalization:** Multi-format regex stripping `PKR`, `Rs.`, `₨`, commas, and whitespace, rounding to integer PKR.
4. **High-Res CDN Image Gallery:** Removing thumbnail dimensions from Shopify and SFCC URLs, filtering extraneous badges/logos, deduplicating, and capping at 5–8 images.
5. **Workflow Synchronization:** Connecting `product.gender` to `/new-order/page.tsx`'s `handleGenderChange`.

---

## 5. Verification Method

To verify these findings and the subsequent implementation:

1. **Architectural Specification Verification:**
   - Inspect `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_2\survey_scraper.md` for complete technical schemas and brand breakdowns.

2. **Automated Unit & Integration Test Verification:**
   - Check existing tests run cleanly:
     ```powershell
     npm run test
     ```
   - Build a standalone verification suite in `tests/api/link-parser.test.ts` verifying:
     - Extraction from mock fixtures for Junaid Jamshed, Sapphire, Khaadi, Sana Safinaz, and Maria.B (>90% field completeness).
     - Gender detection across 20+ male and 20+ female product handles/titles.
     - Price normalization across 10+ PKR currency string variants.
     - Zero unhandled 500 errors on 404, 403, and invalid URLs.

3. **TypeScript Compilation & Build Verification:**
   ```powershell
   npm run type-check
   npm run build
   ```
