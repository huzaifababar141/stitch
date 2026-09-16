# Project: Stitch E-Commerce Product Link Scraper & Parser

## Architecture

- **Layer 1: Pure Extractor Engine (`src/lib/services/link-parser.service.ts` & `src/lib/services/scraper/`)**:
  - `extractProductDetails(urlStr: string, options?: ExtractionOptions): Promise<ScrapedProduct>`
  - Decoupled from Prisma database for instant, side-effect-free test execution.
  - 5-Tier Fallback Architecture:
    1. **Tier 1 (Native JSON)**: Fast-path `/products/<handle>.json` endpoint for Shopify stores (<800ms) with handle extraction from URL paths.
    2. **Tier 2 (Browser-Mimicking Fetch)**: Enhanced HTTP client with modern Chrome User-Agent, `sec-ch-ua`, client hints, Accept headers, and 4s timeout.
    3. **Tier 3 (DOM Heuristics)**: Cheerio engine extracting Schema.org JSON-LD `Product`, OpenGraph microdata, and store-specific selectors (supporting non-Shopify stores like Khaadi SFCC).
    4. **Tier 4 (Pattern / LLM Extraction)**: Regex/pattern extraction from inline JS state (`window.dataLayer`, `ShopifyAnalytics`, `__NEXT_DATA__`) and Groq AI fallback via `AiClient` (`groq-sdk`).
    5. **Tier 5 (Clean Structured Fallback)**: Resilient fallback deriving title, brand, and gender from URL slug if site blocks or 404s (<10s SLA). Zero unhandled 500 crashes.
  - **Normalization & Classification Modules**:
    - **Price Normalizer**: Regex stripping `PKR`, `Rs.`, `₨`, commas, whitespace, decimals -> numeric integer PKR.
    - **Image Gallery Sanitizer**: Normalizing protocol-relative URLs (`//` -> `https://`), stripping thumbnail sizes (`_compact`, `_medium`, `_100x100`, `?sw=...&sh=...`), deduplicating, and filtering logos/badges.
    - **Gender Classification Engine**: Word-boundary matching across category breadcrumbs, tags, titles, and slugs (`male` vs `female`, `full_suit`, `kurta`, `kameez_only`, etc.).
- **Layer 2: Persistence Wrapper & API Route**:
  - `parseProductLink(urlStr: string, userId?: string)` persists to `prisma.product`.
  - `/api/products/parse/route.ts`: Zod schema validation, optional auth (supporting guests and preview workflows), consistent JSON response with `gender` and `garmentType`.
- **Layer 3: Customer Order Workflow Synchronization (`src/app/(customer)/new-order/page.tsx`)**:
  - `handleParseUrl` invokes `handleGenderChange(prod.gender)`.
  - Automatically activates Men's vs Women's tailoring tabs, styles (neck/collar, sleeve, pockets, daman), trouser/shalwar codes (`P-32` vs `T-30`), and stitching tiers.
- **Layer 4: Automated Verification Test Suite**:
  - Jest test suite (`tests/scraper/link-parser.test.ts`) with offline mock fixtures (`tests/fixtures/`) for deterministic CI/CD execution (`npm run test:scraper`).
  - Standalone CLI verification benchmark (`scripts/test-scraper.ts`) evaluating field completeness (>90%), gender accuracy (100%), and latency (<5s/<10s) with formatted ASCII report.

## Feature Inventory

| #   | Feature                           | Description                                                                           | Milestone | Source          |
| --- | --------------------------------- | ------------------------------------------------------------------------------------- | --------- | --------------- |
| 1   | Pure Extractor Decoupling         | Decouple scraping engine `extractProductDetails` from Prisma database persistence     | M1        | Survey          |
| 2   | Tier 1 Fast-Path Shopify JSON     | Inspect `/products/<handle>.json` for Shopify-based fashion brands (<800ms)           | M1        | R1, R2          |
| 3   | Tier 2 Browser-Mimicking HTTP     | HTTP fetch with modern Chrome UA, `sec-ch-ua`, client hints, Accept headers           | M1        | R2              |
| 4   | Tier 3 DOM Heuristics & Microdata | Cheerio parsing of Schema.org JSON-LD `Product`, OpenGraph, SFCC/Khaadi selectors     | M1        | R1, R2          |
| 5   | Tier 4 Pattern & LLM Fallback     | Inline JS state extraction (`dataLayer`, `ShopifyAnalytics`) and Groq AI fallback     | M1        | R2              |
| 6   | Tier 5 Structured Error Fallback  | Resilient slug-based fallback on 404/403/blocking with zero 500 crashes (<10s)        | M1        | R2              |
| 7   | PKR Price Normalization           | Strip commas, `Rs.`, `PKR`, `₨`, decimals and normalize to numeric integer PKR        | M1        | R1, Acceptance  |
| 8   | High-Res Image Sanitization       | Upgrade CDN URLs, strip thumbnail dimensions, resolve protocol URLs, deduplicate      | M1        | R1, Acceptance  |
| 9   | Gender Detection Lexicon          | Word-boundary token matcher for Men vs Women apparel across tags/titles/breadcrumbs   | M1        | R3, Acceptance  |
| 10  | Garment Type Mapping              | Map detected garment (Kurta, Shalwar Kameez, 3-Piece, Kurti) to `garmentType`         | M1        | R3              |
| 11  | API Route Enriched Output         | `/api/products/parse` Zod validation, guest/auth support, return `gender` & metadata  | M2        | R1, Acceptance  |
| 12  | `/new-order` Gender Sync          | In `handleParseUrl`, invoke `handleGenderChange(prod.gender)` and sync garment pieces | M2        | R3, Acceptance  |
| 13  | E2E Test Suite Infra & Fixtures   | Offline mock fixtures for >=4 Pakistani brands and Jest runner integration            | E2E       | R4, Acceptance  |
| 14  | Standalone CLI Benchmark Runner   | Executable script `scripts/test-scraper.ts` evaluating completeness, gender, latency  | E2E       | R4, Acceptance  |
| 15  | E2E Verification & Hardening      | 100% E2E test pass across Tiers 1-4 and Tier 5 adversarial hardening                  | M3        | Final Milestone |

## Milestones

| #   | Name                                   | Scope                                                                                                      | Dependencies | Status |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| E2E | E2E Testing Track                      | Test fixtures, Jest scraper runner, standalone CLI benchmark, `TEST_READY.md`                              | none         | DONE   |
| M1  | Scraper Engine & Extraction Pipeline   | Decoupled extractor, 5-tier fallback, price normalization, image sanitization, gender & garment classifier | none         | DONE   |
| M2  | API Route & `/new-order` Sync          | Update `/api/products/parse` and connect `handleGenderChange` in `/new-order/page.tsx`                     | M1           | DONE   |
| M3  | Final Milestone: Test Pass & Hardening | Pass 100% E2E tests (Tiers 1-4), adversarial hardening (Tier 5), type-check & build                        | E2E, M2      | DONE   |

## Interface Contracts

### `extractProductDetails(urlStr: string, options?: ExtractionOptions): Promise<ScrapedProduct>`

```typescript
export interface ScrapedProduct {
  title: string;
  brand: string;
  priceOriginal: number | null; // numeric PKR value
  currencyOriginal: 'PKR';
  description: string;
  images: string[]; // absolute high-res URLs, deduplicated
  gender: 'male' | 'female';
  garmentType?:
    'full_suit' | 'kurta' | 'kameez_only' | 'trouser_only' | 'other';
  confidenceScore: number; // 0.0 - 1.0
  fallbackTier: 1 | 2 | 3 | 4 | 5;
  sourceUrl: string;
  normalizedUrl: string;
}
```

### `/api/products/parse` Request / Response

```typescript
// Request
{ url: string }

// Response (Success: 200)
{
  success: true,
  data: {
    id?: string,
    name: string,
    title: string,
    brand: string,
    priceOriginal: number | null,
    currencyOriginal: 'PKR',
    description: string,
    images: string[],
    gender: 'male' | 'female',
    garmentType?: string,
    fabricMaterial?: string | null,
    fallbackTier: number,
    confidenceScore: number,
    requiresManualPrice: boolean
  },
  message: 'Product parsed successfully'
}
```

## Code Layout

- `src/lib/services/link-parser.service.ts`: Core link parsing & extraction service.
- `src/lib/services/scraper/`: Modular scraper modules (`types.ts`, `user-agents.ts`, `price-normalizer.ts`, `image-sanitizer.ts`, `gender-detector.ts`, `tiers/`, `extractor.ts`).
- `src/app/api/products/parse/route.ts`: API endpoint with Zod validation.
- `src/app/(customer)/new-order/page.tsx`: Order wizard UI integrating `handleGenderChange`.
- `tests/fixtures/scraper/`: Offline mock fixtures for Sapphire, Junaid Jamshed, Khaadi, Sana Safinaz, Maria.B, edge cases.
- `tests/scraper/link-parser.test.ts`: Jest verification test suite.
- `scripts/test-scraper.ts`: Standalone executable CLI benchmark runner.
