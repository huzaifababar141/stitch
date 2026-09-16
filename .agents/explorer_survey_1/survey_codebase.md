# Codebase Survey Report: Product Link Parser & Customer Order Workflow

**Date**: 2026-09-11  
**Investigator**: `explorer_survey_1`  
**Parent**: `orchestrator_1` (Conversation ID: `8696404f-3a2a-4a1e-986b-b5b6e4ea11c5`)  
**Target Repository**: `d:\University\CS 2024-2028\SP\stitch`

---

## Executive Summary

The Stitch platform is a centralized custom tailoring application built on **Next.js 16.2.12** using the **App Router**, **React 19.2.8**, **Tailwind CSS v4**, **Prisma ORM 7.9.1** (PostgreSQL), and **Supabase SSR**.

A preliminary product link parsing route exists (`/api/products/parse` backed by `link-parser.service.ts`), and the customer order workflow is implemented in `/new-order` (`src/app/(customer)/new-order/page.tsx`). However, there are significant gaps:

1. **Gender detection is absent**: The current parser does not detect whether a product is for Men or Women, returning no gender classification.
2. **UI synchronization is incomplete**: When `/new-order` calls `/api/products/parse`, it populates title, brand, and price, but completely ignores gender, garment pieces, and styling options.
3. **Bot / Cloudflare vulnerability**: The scraper only uses basic Node `fetch()` with a generic User-Agent header, causing immediate failures or blocks on major Pakistani brands (Sapphire, Khaadi, Sana Safinaz).
4. **Unused LLM capabilities**: The project has `groq-sdk` and an `AiClient` wrapper, but the parser does not employ semantic LLM fallback for unstructured or dynamic markup.
5. **Auth bottleneck**: `/api/products/parse` strictly enforces `requireAuth()`, which impedes guest link previews and automated verification test suites unless authenticated or conditionally bypassed.

---

## 1. Project Architecture & Dependency Analysis

### 1.1 Core Stack (`package.json`)

- **Framework**: Next.js `16.2.12` with React `19.2.8` and App Router (`src/app`).
- **Path Aliases**: Defined in `tsconfig.json`: `@/*` maps to `./src/*`.
- **Image Optimization (`next.config.mjs`)**:
  ```javascript
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }];
  }
  ```
  _Note: Next.js is configured to permit any HTTPS domain for image rendering, which is ideal for external Pakistani e-commerce image CDNs._

### 1.2 Key Installed Dependencies for Scraping & AI

| Package            | Version                | Current Usage                                            | Potential for Enhancement                                               |
| ------------------ | ---------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `cheerio`          | `^1.2.0`               | Used in `link-parser.service.ts` for HTML DOM extraction | Primary DOM heuristics engine                                           |
| `axios`            | `^1.19.0`              | Installed, but unused in link parser                     | Can be used with custom TLS/headers, interceptors, and timeout handling |
| `groq-sdk`         | `^1.4.1`               | Used in `src/lib/services/ai/client.ts`                  | Can be leveraged for Semantic LLM fallback parser (R2.4)                |
| `zod`              | `^4.4.3`               | Used across API routes and validations                   | Input and output validation schema                                      |
| `zustand`          | `^5.0.14`              | Installed for state management                           | Global order / measurement states                                       |
| `framer-motion`    | `^12.43.0`             | UI animations                                            | Wizard step transitions                                                 |
| `lucide-react`     | `^1.27.0`              | Icons                                                    | UI indicator icons                                                      |
| `jest` / `ts-jest` | `^30.4.2` / `^29.4.12` | API integration test suite (`tests/api/`)                | Execution framework for automated test suite                            |

---

## 2. Customer Order Workflow (`/new-order`)

### 2.1 Component Structure & State Architecture

- **Location**: `src/app/(customer)/new-order/page.tsx` (2,842 lines)
- **Wizard Steps**:
  1. **Step 1: Suit Fabric & Tailoring Details** (Product URL scraper, manual title, brand, price in PKR, fabric material, gender selection).
  2. **Step 2: Style & Craftsmanship Tier** (Craftsmanship tier, gender-specific garment types and styling options).
  3. **Step 3: Fit & Sizing** (`useMeasurementStudio` hook, body diagram, size presets, standard trouser codes like `P-32`, or sample suit pickup).
  4. **Step 4: Delivery Address** (Saved addresses or custom Pakistani delivery address).
  5. **Step 5: Review & Place Order** (Calculation: `Fabric Price + Stitching Fee + Delivery Fee (150) - Discount`, coupon validation, submission to `/api/orders`).

### 2.2 Gender Selection & Switching Mechanics

In `src/app/(customer)/new-order/page.tsx`:

- **State**: `const [gender, setGender] = useState<'female' | 'male'>('female');`
- **Switching Handler (`handleGenderChange`)**:
  ```typescript
  const handleGenderChange = (newGender: 'female' | 'male') => {
    setGender(newGender);
    setGenderDefaults(newGender);
    setSelectedTrouserCode(newGender === 'male' ? 'P-32' : 'T-30');
    if (newGender === 'male') {
      setGarmentType('full_suit');
      setCollarStyle('Sherwani Ban Collar (Hard)');
      setSleeveStyle('Straight Open Sleeves');
      setPocketStyle('1 Chest Pocket + 2 Side Pockets');
      setDamanStyle('Round / Gol Daman');
      setTrouserStyle('Traditional Wide Shalwar');
      setFitType('Regular Fit');
      // Default placeholders
      if (!manualTitle || manualTitle === 'Mahay Lawn 3-Piece') {
        setManualTitle("Men's Traditional Shalwar Kameez");
      }
      if (!manualBrand || manualBrand === 'Sana Safinaz') {
        setManualBrand('J. (Junaid Jamshed)');
      }
    } else {
      setGarmentType('full_suit');
      setNeckStyle('Round Neck with Slit');
      setSleeveStyle('Full Sleeve with Lace Trim');
      setDamanStyle('Straight Cut Daman');
      setTrouserStyle('Straight Trouser / Cigarette Pants');
      setFitType('Regular Fit');
      if (!manualTitle || manualTitle === "Men's Traditional Shalwar Kameez") {
        setManualTitle('Mahay Lawn 3-Piece');
      }
      if (!manualBrand || manualBrand === 'J. (Junaid Jamshed)') {
        setManualBrand('Sana Safinaz');
      }
    }
  };
  ```

### 2.3 Garment Pieces & Styling Options Matrix

#### Garment Types:

| Gender    | Garment Type Key | Display Label         | Description / Intended Use                  |
| --------- | ---------------- | --------------------- | ------------------------------------------- |
| **Men**   | `full_suit`      | Shalwar Kameez (2-Pc) | Traditional Kameez Shalwar suit             |
| **Men**   | `kurta`          | Kurta Pajama          | Straight Kurta paired with pajama/trouser   |
| **Men**   | `kameez_only`    | Kurta Only            | Upper garment only                          |
| **Men**   | `other`          | Sadri / Waistcoat     | Traditional waistcoat overlay               |
| **Women** | `full_suit`      | 3-Piece Full Suit     | Kameez, Trouser/Shalwar & Dupatta           |
| **Women** | `kameez_only`    | Kurti / Kameez Only   | Single shirt/kurti                          |
| **Women** | `trouser_only`   | Trouser Only          | Cigarette pants, tulip shalwar, or culottes |
| **Women** | `other`          | Formal / Maxi / Frock | Heavy festive/bridal or flared maxi         |

#### Stitching Craftsmanship Tiers:

| Tier Key   | Women's Tier Name  | Women's Price | Men's Tier Name            | Men's Price | SLA      |
| ---------- | ------------------ | ------------- | -------------------------- | ----------- | -------- |
| `standard` | Standard Stitching | PKR 2,000     | Standard Tailoring         | PKR 1,800   | 5-7 Days |
| `premium`  | Premium Boutique   | PKR 3,000     | Executive Master Tailoring | PKR 2,500   | 4-5 Days |
| `luxury`   | Luxury Designer    | PKR 4,000     | Luxury Bespoke Crafted     | PKR 3,500   | 3-4 Days |

#### Styling Cuts & Configuration Options:

| Option Category          | Men's Options                                                                                                                                       | Women's Options                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neck / Collar Cut**    | • Sherwani Ban Collar (Hard)<br>• Sherwani Ban Collar (Soft)<br>• Shirt Collar (Semi-Stiff)<br>• Open Kurta Placket (Gol Gala)<br>• Mandarin Collar | • Round Neck with Slit<br>• V-Neck with Patti<br>• Ban Collar / Chinese Collar<br>• Boat Neck (Wide)<br>• Square Neckline<br>• Angrakha Style Overlap |
| **Sleeve Finish**        | • Straight Open Sleeves<br>• Cuffed Kurta Sleeves (Single Button)<br>• Double French Cuffs (for Cufflinks)<br>• Half Sleeves                        | • Full Sleeve with Lace Trim<br>• Straight 3/4 Sleeve<br>• Bell Sleeve (Flared)<br>• Cuff Sleeve with Buttons<br>• Sleeveless with Piping             |
| **Pockets / Fitting**    | • 1 Chest Pocket + 2 Side Pockets<br>• 2 Side Pockets Only<br>• 1 Chest Pocket Only<br>• Hidden Mobile Zipper Pocket<br>• No Pockets (Minimalist)   | • Regular Fit<br>• Relaxed / Loose Fit<br>• Smart Fitted<br>• A-Line Flare                                                                            |
| **Daman / Hem Cut**      | • Round / Gol Daman<br>• Straight Square Daman<br>• Short Kurta Daman                                                                               | • Straight Cut Daman<br>• Round / Curved Daman<br>• Chak Patti & Interlock<br>• Side Slits Closed                                                     |
| **Bottom / Trouser Cut** | • Traditional Wide Shalwar (Pakistani Ghera)<br>• Straight Trouser / Pajama<br>• Narrow Bottom Pajama<br>• Churidar Pajama                          | • Straight Trouser / Cigarette Pants<br>• Traditional Pleated Shalwar<br>• Culottes / Wide Bottom Pants<br>• Tulip Shalwar<br>• Capri with Slits      |
| **Fitting Silhouette**   | • Regular Fit<br>• Smart / Slim Fit<br>• Relaxed / Traditional Fit                                                                                  | _(Captured under Garment Fitting)_                                                                                                                    |

---

## 3. Existing Link Parser & API Route Survey

### 3.1 API Route: `/api/products/parse`

- **Location**: `src/app/api/products/parse/route.ts`
- **Method**: `POST`
- **Current Logic**:
  ```typescript
  import { NextRequest } from 'next/server';
  import { requireAuth } from '@/lib/utils/auth';
  import { apiSuccess } from '@/lib/utils/response';
  import { handleApiError } from '@/lib/utils/errors';
  import { validateBody } from '@/lib/utils/validation';
  import { z } from 'zod';
  import { parseProductLink } from '@/lib/services/link-parser.service';

  const parseProductSchema = z.object({
    url: z.string().url('Must be a valid URL'),
  });

  export async function POST(request: NextRequest) {
    try {
      const user = await requireAuth();
      const { url } = await validateBody(request, parseProductSchema);
      const product = await parseProductLink(url, user.id);
      return apiSuccess(product, 200, {
        message: 'Product parsed successfully',
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
  ```

### 3.2 Service: `src/lib/services/link-parser.service.ts`

- **Domains Listed**: 21 domains (`khaadi.com`, `gulahmedshop.com`, `sapphireonline.pk`, `sanasafinaz.com`, `junaidjamshed.com`, `mariab.pk`, `limelight.pk`, `nishatlinen.com`, etc.).
- **Tiers Currently Implemented**:
  1. **Database Cache**: Looks up `prisma.product.findFirst({ where: { normalizedUrl } })`.
  2. **Tier 1 (Shopify Native API)**: Appends `.json` to `/products/<handle>` URLs and parses variants, body_html, and images.
  3. **Tier 2 (HTML DOM & Cheerio)**: Fetches HTML using basic `fetch()` with hardcoded Chrome User-Agent. Extracts OpenGraph tags, JSON-LD (`@type: "Product"`), price selectors (`.price`, `.current-price`, etc.), and regex patterns.
- **Critical Flaws Identified**:
  - **No Gender Extraction**: Completely ignores gender classification. Always defaults `garmentType` to `full_suit` without determining whether it is Men's or Women's wear.
  - **No Cloudflare / Bot Evasion**: Cloudflare, Imperva, or Akamai challenge pages return status 403 or HTML containing captcha challenges, which causes the service to fall back to an empty URL-slug name without retrying using realistic headers, mobile user-agents, or headless fallbacks.
  - **No Semantic LLM Fallback**: If HTML is dynamic (React/Next.js/Shopify Hydro hydration), the raw HTML contains empty containers. No Groq LLM fallback is attempted despite the SDK being present.
  - **Images**: Only extracts the first 5 images; does not resolve protocol-relative links (e.g., `//cdn.shopify.com/...` -> `https://cdn.shopify.com/...`), does not replace image dimensions to get uncropped high-resolution assets (`_100x100` -> `_master`), and does not deduplicate across responsive srcset attributes.

---

## 4. UI Synchronization Deficiencies in `/new-order`

In `src/app/(customer)/new-order/page.tsx`, lines 549-595:

```typescript
const handleParseUrl = async () => {
  // ...
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
    toast({ ... });
  }
}
```

### Missing Sync Hooks:

1. **Gender Sync**: Does NOT check `prod.gender` or `prod.parseMetadata?.gender`. It leaves the order on whatever gender was previously selected (defaults to `female`). If a customer pastes a Junaid Jamshed Men's Kurta URL, the wizard remains in Women's collection!
2. **Garment Type Sync**: Does NOT set `garmentType` from detected categories (e.g., `kurta`, `full_suit`, `kameez_only`).
3. **Styling Options Sync**: Does NOT pre-fill recommended neck/collar styles or daman styles based on product metadata (e.g. Ban collar for Men's Kurta).
4. **Fabric Material**: `manualFabric` is not populated even if the description or title contains keywords like "Lawn", "Cotton", "Silk", "Khaddar", or "Chiffon".

---

## 5. Database Schema & Models (`prisma/schema.prisma`)

### 5.1 `Product` Model

```prisma
model Product {
  id              String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  sourceUrl       String?      @map("source_url")
  normalizedUrl   String?      @map("normalized_url")
  name            String?      @db.VarChar(500)
  brand           String?      @db.VarChar(200)
  description     String?
  images          Json         @default("[]") @db.JsonB
  fabricType      FabricType?  @map("fabric_type")
  garmentType     GarmentType  @default(full_suit) @map("garment_type")
  colorTags       String[]     @map("color_tags") @db.VarChar(50)
  priceOriginal   Decimal?     @map("price_original") @db.Decimal(10, 2)
  currencyOriginal String?     @map("currency_original") @db.VarChar(10)
  isActive        Boolean      @default(true) @map("is_active")
  parseSource     String?      @map("parse_source") @db.VarChar(100)
  parsedAt        DateTime?    @map("parsed_at") @db.Timestamptz
  parseMetadata   Json         @default("{}") @map("parse_metadata") @db.JsonB
  createdById     String?      @map("created_by") @db.Uuid
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  orders          Order[]
  @@map("products")
  @@index([normalizedUrl])
}
```

_Key Insight_: While `Product` does not have a top-level `gender` column in Prisma, `parseMetadata` is a JSONB column (`@map("parse_metadata") @db.JsonB`). We can store `{ gender: 'male' | 'female', fabricMaterial: string, suggestedGarmentType: string, confidence: number }` in `parseMetadata`. Furthermore, the API response object returned to the frontend can directly include `gender: 'male' | 'female'` at the root level!

---

## 6. Integration Architecture Plan

### 6.1 Desired Parser Contract (`/api/products/parse`)

The response contract should provide:

```typescript
export interface ParsedProductResponse {
  id?: string;
  sourceUrl: string;
  normalizedUrl: string;
  name: string;
  brand: string;
  priceOriginal: number | null;
  currencyOriginal: string;
  description: string;
  images: string[];
  gender: 'male' | 'female';
  confidence: number;
  garmentType?:
    'full_suit' | 'kurta' | 'kameez_only' | 'trouser_only' | 'other';
  fabricMaterial?: string;
  colorTags?: string[];
  parseSource: string;
  parseMetadata?: Record<string, any>;
}
```

### 6.2 Gender Detection Taxonomy for Pakistani Stores

- **Male Keywords (Tokens)**:
  `men`, `man`, `gents`, `male`, `kurta`, `kameez shalwar`, `shalwar kameez`, `waistcoat`, `sherwani`, `latha`, `boski`, `karandi gents`, `men's unstitched`, `men collection`.
- **Female Keywords (Tokens)**:
  `women`, `woman`, `ladies`, `female`, `lawn`, `3-piece`, `3 piece`, `2-piece`, `kurti`, `chiffon`, `dupatta`, `embroidery`, `unstitched lawn`, `pret`, `silk unstitched`, `women collection`.
- **Domain/Path Clues**:
  - URLs with `/men/`, `/gents/`, `/man/` -> `male`
  - URLs with `/women/`, `/unstitched/`, `/ladies/` -> usually `female` (unless men's subcollection)
  - Breadcrumb tags: `Home > Men > Unstitched` vs `Home > Women > Unstitched > 3 Piece`

### 6.3 Modernized Multi-Tier Fallback Pipeline

1. **Tier 1**: Fast-Path Shopify JSON (`/products/<handle>.json`) + Collection JSON lookup.
2. **Tier 2**: Anti-Bot HTTP request with modern Chrome/Firefox desktop and mobile TLS header impersonation, `Accept`, `Sec-Ch-Ua`, `Sec-Fetch-*` headers.
3. **Tier 3**: Comprehensive DOM Heuristics via Cheerio:
   - Schema.org JSON-LD microdata (`Product`, `IndividualProduct`, `ProductGroup`).
   - OpenGraph + Twitter cards (`og:price:amount`, `og:image`, `product:brand`).
   - Store-specific selector database (Khaadi, Sapphire, Junaid Jamshed, Sana Safinaz, Maria.B, Limelight, Gul Ahmed, Nishat Linen, Alkaram).
4. **Tier 4**: Semantic LLM Fallback:
   - When HTML markup is dynamic, bot-obscured, or missing key fields, pass sanitized page text/meta snippet to Groq (`llama-3.3-70b-versatile` or `mixtral-8x7b-32768`) via existing `AiClient`.
5. **Tier 5**: Resilient Degraded Fallback:
   - Derive clean brand and product title from URL slug, normalize domain, return structured object with `gender` heuristics without throwing unhandled exceptions.

### 6.4 Client UI Synchronization in `/new-order/page.tsx`

When `handleParseUrl` receives the parsed product:

1. Call `handleGenderChange(prod.gender)` to switch tabs, set default options, and trouser codes.
2. If `prod.garmentType` is returned, call `setGarmentType(prod.garmentType)`.
3. Set `manualTitle`, `manualBrand`, `manualPrice`.
4. If `prod.fabricMaterial`, set `manualFabric(prod.fabricMaterial)`.
5. Display gallery / high-res preview image.
6. Provide toast notification informing the user that the category was automatically switched to Men's or Women's collection.
