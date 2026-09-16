# Dispatch: Milestone 1 — Scraper Engine & Extraction Pipeline

## 2026-09-11T11:45:34Z

## Identity

- Role: Scraper Engine Worker
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\worker_m1
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Integrity Warning

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_2\survey_scraper.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_2\handoff.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_1\survey_codebase.md`

## Write Ownership

You exclusively own:

- `src/lib/services/link-parser.service.ts`
- Any helper modules under `src/lib/services/scraper/` (e.g., `gender-detector.ts`, `price-normalizer.ts`, `image-sanitizer.ts`, `types.ts`, `user-agents.ts`)
  DO NOT edit `src/app/(customer)/new-order/page.tsx` or `src/app/api/products/parse/route.ts` (those belong to Milestone 2).
  DO NOT edit `tests/` or `scripts/` (those belong to E2E Testing Track).

## Scope & Implementation Requirements

1. **Decouple Pure Extractor from Prisma**:
   - Implement `export async function extractProductDetails(urlStr: string, options?: ExtractionOptions): Promise<ScrapedProduct>`
   - `parseProductLink(urlStr: string, userId?: string)` must call `extractProductDetails` and handle Prisma persistence.
2. **5-Tier Fallback Cascade**:
   - **Tier 1 (Native JSON)**: For Shopify URLs, extract product handle from URL and fetch `/products/<handle>.json` with fast timeout (e.g. 2s). Extract title, vendor, variants[0].price, images, description, tags.
   - **Tier 2 (Browser-Mimicking HTTP Fetch)**: Browser-realistic HTTP request with modern Chrome User-Agent, `sec-ch-ua`, `sec-fetch-dest`, `sec-fetch-mode`, Accept headers, and 4s timeout.
   - **Tier 3 (DOM Heuristics & Microdata)**: Cheerio engine extracting Schema.org JSON-LD `Product`, OpenGraph (`og:title`, `og:image`, `og:price:amount`), Twitter tags, and store-specific selectors (supporting SFCC Khaadi, etc.).
   - **Tier 4 (Pattern / Inline State / LLM Fallback)**: Extract from inline JS (`dataLayer`, `ShopifyAnalytics`, `__NEXT_DATA__`) and if necessary call Groq `AiClient` (`src/lib/services/ai/client.ts`) if available.
   - **Tier 5 (Clean Structured Slug Fallback)**: In case of 404, 403 WAF blocking, or network timeout, gracefully parse brand and title from domain and URL slug path, guess gender from slug keywords, return clean structured `ScrapedProduct` with `fallbackTier: 5`, confidenceScore: 0.4. NEVER throw unhandled 500 exceptions!
3. **Price Normalization**:
   - Normalize prices to numeric integer PKR value: strip `PKR`, `Rs.`, `₨`, commas, whitespace, decimals. E.g. `"Rs. 4,950.00"` -> `4950`.
4. **Image Gallery Sanitization & Upgrade**:
   - Deduplicate image URLs.
   - Ensure all image links are absolute HTTP/HTTPS addresses (resolve `//cdn...` -> `https://cdn...`).
   - Upgrade Shopify CDN images by stripping dimension patterns (`_compact`, `_medium`, `_100x100`, etc.) and query params. Upgrade SFCC Demandware images by stripping `?sw=...`.
   - Filter out payment badges, trust icons, tiny svgs, or placeholders.
5. **Pakistani Fashion Gender & Garment Classification**:
   - Word-boundary classification across category breadcrumbs, product tags, handle slugs, and titles.
   - Male: `kurta`, `shalwar kameez`, `shalwar suit`, `waistcoat`, `sadri`, `sherwani`, `boski`, `latha`, `men`, `mens`, `man`.
   - Female: `3 piece`, `3-pc`, `2 piece`, `2-pc`, `kurti`, `unstitched lawn`, `lawn`, `chiffon`, `dupatta`, `pret`, `women`, `womens`, `woman`, `ladies`, `frock`, `maxi`, `lehenga`, `gharara`.
   - Distinguish `men` from `women` without substring collisions.
   - Suggest `garmentType` (`full_suit`, `kurta`, `kameez_only`, `trouser_only`, `other`).
6. **Verification**:
   - Run type-check (`npx tsc --noEmit`) to verify zero compile errors.
   - Run existing tests (`npm test`) to ensure no regressions.
   - Document commands and results in `handoff.md`.
