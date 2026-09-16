# Handoff Report: Codebase Survey & Order Flow Analysis

**Agent**: `explorer_survey_1`  
**Date**: 2026-09-11  
**Recipient**: `orchestrator_1` (Conversation ID: `8696404f-3a2a-4a1e-986b-b5b6e4ea11c5`)  
**Status**: Hard Handoff (Investigation Complete)

---

## 1. Observation

1. **Framework & Package Configuration**:
   - `package.json`: Next.js version `^16.2.12`, React `^19.2.8`, Prisma `@prisma/client: ^7.9.1`, Cheerio `cheerio: ^1.2.0`, Axios `axios: ^1.19.0`, Groq `groq-sdk: ^1.4.1`, Zod `zod: ^4.4.3`, Jest `jest: ^30.4.2`.
   - `next.config.mjs` lines 3-9:
     ```javascript
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: '**',
         },
       ],
     },
     ```
   - `tsconfig.json` lines 21-22: Path alias `"@/*": ["./src/*"]`.
   - Layout: App Router located at `src/app/`.

2. **Customer Order Page (`src/app/(customer)/new-order/page.tsx`)**:
   - Total lines: 2,842.
   - Gender state at line 105:
     ```typescript
     const [gender, setGender] = useState<'female' | 'male'>('female');
     ```
   - Gender switching function `handleGenderChange` at lines 136-168:
     - Sets `gender`, `setGenderDefaults(newGender)`, `setSelectedTrouserCode(newGender === 'male' ? 'P-32' : 'T-30')`.
     - Configures default styles for `male` (Sherwani Ban Collar, Straight Open Sleeves, 1 Chest + 2 Side Pockets, Round Gol Daman, Traditional Wide Shalwar).
     - Configures default styles for `female` (Round Neck with Slit, Full Sleeve with Lace Trim, Straight Cut Daman, Straight Trouser / Cigarette Pants).
   - Stitching Tiers defined at lines 45-91:
     - `WOMEN_STITCHING_TIERS`: Standard (PKR 2000), Premium Boutique (PKR 3000), Luxury Designer (PKR 4000).
     - `MEN_STITCHING_TIERS`: Standard Tailoring (PKR 1800), Executive Master Tailoring (PKR 2500), Luxury Bespoke Crafted (PKR 3500).
   - Garment pieces at lines 948-986:
     - Male: `full_suit` ("Shalwar Kameez (2-Pc)"), `kurta` ("Kurta Pajama"), `kameez_only` ("Kurta Only"), `other` ("Sadri / Waistcoat").
     - Female: `full_suit` ("3-Piece Full Suit"), `kameez_only` ("Kurti / Kameez Only"), `trouser_only` ("Trouser Only"), `other` ("Formal / Maxi / Frock").
   - Link parsing handler `handleParseUrl` at lines 549-595:
     ```typescript
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
       toast({ title: 'Product Parsed', ... });
     }
     ```
     _Direct observation: `handleParseUrl` never inspects or applies `prod.gender`, never calls `handleGenderChange`, and never updates `garmentType`._

3. **Current Link Parser Service (`src/lib/services/link-parser.service.ts`)**:
   - Has `ALLOWED_DOMAINS` (21 domains).
   - Tier 1: Shopify `.json` endpoint fetch.
   - Tier 2: Plain HTML `fetch(urlStr)` with a single desktop User-Agent.
   - Cheerio extraction for OpenGraph meta tags, ld+json (`@type: 'Product'`), price selectors, and regex body text.
   - Line 138 & Line 360: Hardcodes `garmentType: 'full_suit' as any`.
   - No gender classification logic exists anywhere in `link-parser.service.ts`.
   - No Cloudflare/anti-bot fallback headers or retry mechanism.
   - Groq AI is not called despite `groq-sdk` being installed and configured in `src/lib/services/ai/client.ts`.

4. **API Route & Auth**:
   - `src/app/api/products/parse/route.ts`:
     - POST endpoint validating `{ url: z.string().url() }` with Zod.
     - Calls `await requireAuth()`. Fails if unauthenticated.
     - Calls `parseProductLink(url, user.id)`.
     - Returns `apiSuccess(product, 200, { message: 'Product parsed successfully' })`.

5. **Prisma Database Schema (`prisma/schema.prisma`)**:
   - `Product` model has `id`, `sourceUrl`, `normalizedUrl`, `name`, `brand`, `description`, `images` (JsonB), `fabricType`, `garmentType`, `priceOriginal`, `currencyOriginal`, `parseMetadata` (JsonB).
   - Does not have a standalone `gender` column on `Product`, but `parseMetadata` JSONB can persist `{ gender: 'male' | 'female', ... }`, and the API response object can return `gender` directly.

---

## 2. Logic Chain

1. **Requirement R1 & R2** demand a multi-tier extraction pipeline extracting title, brand, price in PKR, images, and description with anti-bot/Cloudflare resilience and semantic LLM fallback.
   - Observation 3 shows `link-parser.service.ts` uses only a bare `fetch()` that gets blocked by Cloudflare (Khaadi, Sapphire, Sana Safinaz), lacks modern header impersonation, and fails to utilize the existing `AiClient` (`groq-sdk`).
   - Therefore, `link-parser.service.ts` must be upgraded to implement browser-mimicking headers, Pakistani store selector engines, image URL deduplication/un-cropping, and Groq LLM semantic fallback.

2. **Requirement R3** demands detecting whether the product is for Men or Women and automatically setting the gender tab, garment pieces, and styling options in `/new-order`.
   - Observation 3 shows that the backend currently never detects gender (`prod.gender` does not exist).
   - Observation 2 shows that `new-order/page.tsx` has complete gender infrastructure (`handleGenderChange`, Men vs Women garment types, collar/neck styles, stitching tiers), but `handleParseUrl` never connects the parsed response to `handleGenderChange(prod.gender)` or `setGarmentType()`.
   - Therefore, two coordinated changes are needed:
     a. Backend (`link-parser.service.ts` + `/api/products/parse`) must classify gender (`male` vs `female`) and suggest `garmentType`.
     b. Frontend (`new-order/page.tsx`) must invoke `handleGenderChange(prod.gender)` and `setGarmentType(...)` in `handleParseUrl`.

3. **Requirement R4 & Project Integration** demand an automated verification test suite and clean TypeScript compilation:
   - Observation 4 shows `/api/products/parse` requires authentication (`requireAuth()`). For automated testing and public preview, the route should support optional authentication (e.g. `getAuthUser()` with fallback to guest/anonymous user ID).
   - The test suite can be implemented as a standalone verification runner (e.g. in `tests/` or a standalone script) testing representative Pakistani brand URLs.

---

## 3. Caveats

1. **Live Network Constraints**: Pakistani fashion storefronts frequently update bot-protection mechanisms. Live HTTP fetches might occasionally encounter rate limits, requiring mock fixtures or cached DOM snapshots in the test suite to ensure deterministic offline CI execution.
2. **Groq API Key**: `AiClient` reads `process.env.GROQ_API_KEY`. If no key is set in local `.env`, the LLM tier must gracefully degrade to DOM/heuristic extraction without throwing unhandled exceptions.
3. **Database Constraints**: `prisma.product.create` enforces foreign key `createdById` if user is required. If parsing is allowed for unauthenticated visitors, `createdById` must either allow null in schema or use a system guest ID, or caching can be decoupled from strict user tenancy.

---

## 4. Conclusion

The Stitch codebase has strong, mature UI and database primitives already in place for both Men's and Women's tailoring. The primary engineering work required to fulfill `ORIGINAL_REQUEST.md` consists of:

1. **Upgrading `src/lib/services/link-parser.service.ts`**:
   - Implement Pakistani gender detection heuristics (`male` vs `female`) with confidence scoring.
   - Add anti-bot header emulation and robust multi-tier fallback (Shopify JSON -> Anti-bot DOM -> Selector Heuristics -> Groq LLM fallback -> Graceful Slug Fallback).
   - Normalize PKR pricing (stripping `Rs.`, `PKR`, `₨`, commas) and sanitize high-res image URLs.
2. **Updating `src/app/api/products/parse/route.ts`**:
   - Return normalized fields including `gender`, `garmentType`, `fabricMaterial`.
   - Allow optional authentication for testability and previewing.
3. **Connecting `/new-order/page.tsx`**:
   - In `handleParseUrl`, synchronize `gender` via `handleGenderChange(prod.gender)`, update `garmentType`, and show feedback toast.
4. **Delivering Automated Test Suite**:
   - Create verification suite testing sample URLs across Khaadi, Sapphire, Junaid Jamshed, and Sana Safinaz / Maria.B.

---

## 5. Verification Method

To independently verify these survey findings:

1. Inspect order form gender handling:
   - Open `src/app/(customer)/new-order/page.tsx` and search for `handleGenderChange` (line 136) and `handleParseUrl` (line 549).
2. Inspect current link parsing logic:
   - Open `src/lib/services/link-parser.service.ts` and verify that `gender` is absent in product construction.
3. Validate TypeScript compatibility:
   - Run `npx tsc --noEmit` from project root to ensure existing codebase compiles cleanly.
4. View comprehensive survey documentation:
   - Read `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_1\survey_codebase.md`.
