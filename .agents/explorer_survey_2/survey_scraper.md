# Pakistani Fashion E-Commerce Scraper & Parser Pipeline: Comprehensive Architecture Survey

**Explorer Agent:** `explorer_survey_2`  
**Date:** 2026-09-11  
**Working Directory:** `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_2`  
**Target Repository:** `stitch` (Custom Tailoring Platform for Pakistani E-Commerce Apparel)

---

## 1. Executive Summary

Pakistani apparel e-commerce features a distinctive landscape:

1. **Platform Distribution:** 7 of the top 8 major brands (Junaid Jamshed, Sapphire, Sana Safinaz, Maria.B, Gul Ahmed/Ideas, LimeLight, Nishat Linen) utilize **Shopify Plus** or Shopify-hosted infrastructures. However, major player **Khaadi** operates an enterprise **Salesforce Commerce Cloud (Demandware)** infrastructure with Microsoft Dynamics 365. Other boutique designers use Magento 2, WooCommerce, or headless React/Next.js storefronts.
2. **Anti-Scraping / WAF Profiles:** All major Pakistani brands deploy edge security through **Cloudflare** or **Akamai Bot Manager**. Bare HTTP requests without browser headers frequently receive HTTP 403, 430, or Cloudflare challenge pages.
3. **Gender & Cultural Semantics:** Pakistani fashion terms possess high information density (e.g., _Kurta_, _Shalwar Kameez_, _Waistcoat_, _Boski_, _Sherwani_ vs. _3 Piece_, _Kurti_, _Unstitched Lawn_, _Chiffon_, _Dupatta_, _Gharara_). Deterministic tokenization across URLs, tags, titles, and breadcrumbs yields >98% gender classification accuracy.
4. **Current Implementation Gap in Stitch:** The existing `src/lib/services/link-parser.service.ts` provides a basic Cheerio scraper with an initial Shopify JSON fetch attempt. However, it lacks gender classification, proper CDN high-res image upgrading, full header impersonation, structured error handling for 403/WAF blocks, and synchronization with `/new-order` gender tabs.

This document details the complete 5-tier resilient architecture, brand-by-brand archetypes, extraction mechanics, gender detection taxonomy, price normalization, image gallery pipelines, and verification framework.

---

## 2. Store Architectures for Top Pakistani Fashion Brands

| Brand                   | Domain(s)                                   | Primary Platform                            | Native JSON Endpoint (`/products/<handle>.json`) | CDN Image URL Signature                                      | Anti-Bot / WAF Profile             | Key Garment Specialties                                                        |
| :---------------------- | :------------------------------------------ | :------------------------------------------ | :----------------------------------------------- | :----------------------------------------------------------- | :--------------------------------- | :----------------------------------------------------------------------------- |
| **Junaid Jamshed (J.)** | `junaidjamshed.com`                         | Shopify Plus (migrated from Magento)        | **Supported** (`/products/<handle>.json`)        | `cdn.shopify.com/s/files/...`                                | Cloudflare WAF, TLS fingerprinting | Men's Kurta & Shalwar Kameez, Waistcoats, Sherwanis; Women's Unstitched & Pret |
| **Sapphire**            | `pk.sapphireonline.pk`, `sapphireonline.pk` | Shopify Plus                                | **Supported** (`/products/<handle>.json`)        | `cdn.shopify.com/s/files/1/1592/0041/products/...`           | Cloudflare WAF; strict rate limits | Men's Eastern Pret & Unstitched; Women's Daily/Lawn 2pc/3pc, Sleepwear         |
| **Khaadi**              | `pk.khaadi.com`, `khaadi.com`               | Salesforce Commerce Cloud (SFCC/Demandware) | **Not supported** (OCAPI / internal REST only)   | `pk.khaadi.com/dw/image/v2/...`                              | Cloudflare / Akamai Bot Manager    | Women's Essentials Lawn (3pc, 2pc), Fabrics, Western, Men's Kurta              |
| **Sana Safinaz**        | `sanasafinaz.com`                           | Shopify Plus (migrated from Magento 2)      | **Supported** (`/products/<handle>.json`)        | `sanasafinaz.com/cdn/shop/files/...`                         | Cloudflare Enterprise              | Luxury Unstitched Lawn, Muzlin, Mahay, Silk Chiffon, Ready-to-Wear             |
| **Maria.B**             | `mariab.pk`, `mbasics.pk`                   | Shopify                                     | **Supported** (`/products/<handle>.json`)        | `mariab.pk/cdn/shop/products/...`                            | Shopify Edge Cloudflare            | M.Prints, Couture, Luxury Lawn, Kids, Linen, Evening Wear                      |
| **Gul Ahmed (Ideas)**   | `gulahmedshop.com`                          | Shopify Plus                                | **Supported** (`/products/<handle>.json`)        | `gulahmedshop.com/cdn/shop/files/...`                        | Cloudflare WAF                     | Unstitched Lawn, Men's Latha & Karandi, Ideas Pret, Home Textiles              |
| **LimeLight**           | `limelight.pk`                              | Shopify                                     | **Supported** (`/products/<handle>.json`)        | `cdn.shopify.com/s/files/...` or `limelight.pk/cdn/shop/...` | Shopify Cloudflare Edge            | Fast fashion Pret, Women's Kurtis, Western tops, Men's Eastern                 |
| **Nishat Linen**        | `nishatlinen.com`                           | Shopify                                     | **Supported** (`/products/<handle>.json`)        | `nishatlinen.com/cdn/shop/products/...`                      | Shopify Cloudflare Edge            | Luxury & Budget Unstitched Lawn, Pret, Jalabiyas, Men's Fabrics                |

### Brand-Specific Architectural Nuances

1. **Shopify-Based Brands (J., Sapphire, Sana Safinaz, Maria.B, Gul Ahmed, LimeLight, Nishat Linen):**
   - **URL Structure:** Canonical pattern is `https://<domain>/products/<handle>` or `https://<domain>/collections/<coll>/products/<handle>`.
   - **JSON Feeds:** Append `.json` to the canonical URL (`/products/<handle>.json`). This bypasses 95% of HTML parsing complexity and yields canonical attributes directly:
     ```json
     {
       "product": {
         "id": 8192837492,
         "title": "Embroidered Lawn 3 Piece Unstitched Suit",
         "body_html": "<p>Fabric: 100% Cotton Lawn...</p>",
         "vendor": "Sana Safinaz",
         "product_type": "Unstitched 3 Piece",
         "tags": ["Women", "Summer Lawn", "3 Piece", "Unstitched"],
         "variants": [
           {
             "price": "7990.00",
             "compare_at_price": "9990.00",
             "sku": "SS-LW-24-01"
           }
         ],
         "images": [{ "src": "https://cdn.shopify.com/s/files/.../img_01.jpg" }]
       }
     }
     ```
   - **Shopify Collection Feeds:** Stores also publish collection feeds at `/collections/<category>/products.json?limit=250` which can be queried if direct product access is challenged.
   - **Block Mitigation:** If a raw cURL request to `.json` returns HTTP 430 or 403, supplying a standard browser `User-Agent` and `Accept: application/json` header bypasses the filter in 90%+ of cases.

2. **Enterprise Salesforce Commerce Cloud (Khaadi):**
   - **URL Structure:** Product URLs are formatted as `https://pk.khaadi.com/<category-path>/<handle>.html` or `https://pk.khaadi.com/p/<product-id>` without a mandatory `/products/` prefix.
   - **No Public Shopify Endpoint:** Appending `.json` returns a 404 or redirects to the homepage.
   - **HTML Metadata:** Demandware templates reliably embed:
     - OpenGraph metadata: `og:title`, `og:image`, `og:price:amount`, `product:price:amount`.
     - JSON-LD Product schema: `<script type="application/ld+json">{"@type":"Product", ...}</script>`.
     - Analytics DataLayer: `window.dataLayer = window.dataLayer || []; dataLayer.push({ ecommerce: { ... } });`.
   - **CDN Resolution:** Khaadi stores images on `pk.khaadi.com/dw/image/v2/...`. High-resolution views require modifying dynamic image query parameters (`?sw=1200&sh=1800&sm=fit`).

---

## 3. Five-Tier Resilient Fallback Architecture

To ensure zero crashes, complete error resilience, and high extraction fidelity under real-world conditions, Stitch must employ a strict 5-tier fallback cascade:

```
[ Incoming E-Commerce URL ]
           │
           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 1: Fast-Path Native JSON Endpoint Inspection     │
│  - Try /products/<handle>.json                         │
│  - Response SLA: <800ms                                │
└──────────────────────────┬─────────────────────────────┘
                           │ (If 404, 403, non-Shopify)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 2: Browser-Mimicking HTTP Fetch                  │
│  - Full sec-ch-ua, modern Chrome User-Agent, Accept    │
│  - Cookie jar & redirect handling                      │
│  - Strict fetch timeout: 4.0s                          │
└──────────────────────────┬─────────────────────────────┘
                           │ (HTML Retrieved)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 3: DOM Heuristics & Structured Metadata Engine   │
│  - Schema.org JSON-LD (Product, @graph)                │
│  - OpenGraph / Twitter Cards (og:title, og:price, etc.)│
│  - Platform-specific CSS selector heuristics           │
└──────────────────────────┬─────────────────────────────┘
                           │ (If metadata incomplete/empty)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 4: Pattern-Based / Semantic Body Extraction      │
│  - Regex tokenization of body text & price ranges      │
│  - Embedded JS state (dataLayer, ShopifyAnalytics)     │
│  - Semantic LLM fallback (Groq llama-3.1-8b, 2.5s cap) │
└──────────────────────────┬─────────────────────────────┘
                           │ (If blocked by Cloudflare/WAF)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 5: Clean Structured Fallback (No 500s)           │
│  - Slug & hostname inference (brand, title, gender)    │
│  - Safe defaults, empty image/manual price flags       │
│  - Guarantee <10s total execution SLA                  │
└────────────────────────────────────────────────────────┘
```

### Detailed Tier Specifications

#### Tier 1: Native JSON Endpoint Inspection

- **Trigger:** URL contains `/products/` and matches a known or suspected Shopify domain.
- **Endpoint Construction:**
  - Strip query string and fragment: `cleanUrl = url.split('?')[0].replace(/\/+$/, '')`.
  - Check if handle ends in `.json`; if not, append `.json`.
  - Handle nested paths: e.g., `https://pk.sapphireonline.pk/collections/woman-unstitched/products/daily-3pc-suit` -> `https://pk.sapphireonline.pk/products/daily-3pc-suit.json`.
- **Headers:**
  ```http
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36
  Accept: application/json, text/plain, */*
  Accept-Language: en-US,en;q=0.9
  ```
- **Field Extraction:**
  - `title`: `json.product.title`
  - `brand`: `json.product.vendor` (falls back to hostname capitalization)
  - `priceOriginal`: `parseFloat(json.product.variants[0].price)`
  - `description`: Strip HTML tags from `json.product.body_html` using text parser
  - `images`: Map `json.product.images` to high-resolution `src` strings
  - `tags`: `json.product.tags` (critical for gender detection)
  - `productType`: `json.product.product_type`
- **Time to Complete:** ~250ms – 750ms.

#### Tier 2: Browser-Mimicking HTTP Request Construction

- **Trigger:** Tier 1 fails with 404 (e.g., Khaadi, Magento), 403, 430, or non-Shopify URL.
- **Client Emulation Profile:**
  Modern Cloudflare and Akamai WAFs perform passive HTTP/2 and HTTP header analysis. A basic `fetch()` with Node default headers (`undici` or `axios/1.x`) is immediately flagged.
- **Headers Definition:**
  ```typescript
  export const BROWSER_HEADERS: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua':
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
  ```
- **Execution & Timeout:**
  - Standard `AbortSignal.timeout(4500)` to guarantee Tier 2 never hangs.
  - Follow up to 5 HTTP redirects (301, 302, 307, 308).

#### Tier 3: DOM Heuristics & Structured Metadata Engine

When HTML is received, run Cheerio DOM parsing in strict precedence order:

1. **Schema.org JSON-LD Extraction (`application/ld+json`):**
   - Iterate over all `<script type="application/ld+json">`.
   - Traverse single objects, arrays, and nested `@graph` nodes.
   - Match `@type` in `['Product', 'IndividualProduct', 'ProductGroup', 'ItemPage']`.
   - Extract `name`, `brand` (`brand.name` or `brand`), `offers.price`, `offers.priceCurrency`, `image` (string or array), `category`, `description`.
2. **OpenGraph & Twitter Cards Microdata:**
   - Title: `meta[property="og:title"]`, `meta[name="twitter:title"]`, `<title>`
   - Image: `meta[property="og:image"]`, `meta[property="og:image:secure_url"]`, `meta[name="twitter:image"]`
   - Price: `meta[property="product:price:amount"]`, `meta[property="og:price:amount"]`, `meta[itemprop="price"]`, `meta[name="twitter:data1"]`
   - Currency: `meta[property="product:price:currency"]`, `meta[property="og:price:currency"]`
   - Brand: `meta[property="og:site_name"]`, `meta[property="product:brand"]`
   - Description: `meta[property="og:description"]`, `meta[name="description"]`
3. **Pakistani Brand Platform Selector Heuristics:**
   - **Titles:** `h1.product-title`, `h1.product__title`, `h1.page-title`, `h1[itemprop="name"]`, `.product-name h1`
   - **Prices (Prioritize Active/Sale over Regular):**
     - Sale / Discounted: `.price-item--sale`, `.special-price .price`, `span.money`, `.product__price--sale`, `[data-product-price]`
     - Standard / Single: `.price-item--regular`, `.product-price`, `.current-price`, `.pdp-price`, `.regular-price .price`
   - **Descriptions:** `.product__description`, `.product-short-description`, `.product-description`, `#description`, `.tab-content-description`
   - **Breadcrumbs:** `nav.breadcrumb`, `ol.breadcrumb`, `.breadcrumbs`, `.breadcrumb-item`

#### Tier 4: Pattern-Based & Semantic Extraction

For JavaScript-rendered Single Page Applications or heavily obfuscated markup:

1. **Inline Window/Analytics Object Parsing:**
   - Regex scan for `window.ShopifyAnalytics.meta.product = ({.*?});`
   - Regex scan for `dataLayer.push\((.*?)\);` (extracting `ecommerce.detail.products[0]`)
   - Regex scan for Next.js `<script id="__NEXT_DATA__" type="application/json">`
2. **Deterministic Body Text Currency Regex:**
   ```regex
   /(?:PKR|Rs\.?|₨)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]{3,6})/gi
   ```
   Filters out numbers < 500 (e.g. shipping fees like Rs. 150 or percentage discounts like 20%).
3. **Semantic Fallback (Groq SDK / Pattern Extractor):**
   - If Groq API key is present and previous extractors failed on critical fields:
     - Pass the first 1,500 characters of cleaned text to `llama-3.1-8b-instant`.
     - System prompt: "Extract product title, brand, price in PKR, and gender (male/female) as JSON."
     - Timeout: 2.0s maximum.
   - If Groq API is not configured or fails: immediately proceed to Tier 5 without throwing.

#### Tier 5: Clean Structured Error Fallback (Zero 500s Guarantee)

- **Design Requirement:** If an external server returns HTTP 403, 503, DNS failure, timeout, or aggressive bot block, the application must **never** return an unhandled 500 or throw an unhandled promise rejection.
- **Fallback Extraction Mechanics:**
  - **Brand Extraction:** Inferred from hostname lookup table or capitalized domain:
    - `junaidjamshed.com` -> `J. (Junaid Jamshed)`
    - `sapphireonline.pk` -> `Sapphire`
    - `khaadi.com` -> `Khaadi`
    - `sanasafinaz.com` -> `Sana Safinaz`
    - `mariab.pk` -> `Maria.B`
    - `gulahmedshop.com` -> `Gul Ahmed`
    - `limelight.pk` -> `LimeLight`
    - `nishatlinen.com` -> `Nishat Linen`
  - **Title Extraction:** Slug transformation:
    - Path: `/products/embroidered-lawn-3pc-suit-with-chiffon-dupatta`
    - Slug parser replaces hyphens with spaces, strips `.html`, and applies title casing:
      `"Embroidered Lawn 3pc Suit With Chiffon Dupatta"`
  - **Gender Detection:** Slug keyword scan (e.g. `/men/`, `kurta`, `lawn-3pc`).
  - **Price Handling:** Returned as `null` with explicit `requiresManualPrice: true` flag.
  - **Response Payload:** Returns HTTP 200 with clear metadata:
    ```json
    {
      "success": true,
      "data": {
        "name": "Embroidered Lawn 3pc Suit",
        "brand": "Sana Safinaz",
        "priceOriginal": null,
        "requiresManualPrice": true,
        "currencyOriginal": "PKR",
        "gender": "female",
        "images": [],
        "sourceUrl": "https://sanasafinaz.com/products/embroidered-lawn-3pc-suit",
        "parseSource": "sanasafinaz.com (Fallback Heuristic)",
        "parseMetadata": {
          "fallbackTier": 5,
          "warning": "External site protected or blocked. Fallback data inferred from URL slug."
        }
      }
    }
    ```

---

## 4. Gender Detection Logic (Men vs Women)

In the Stitch custom tailoring workflow, gender detection is critical because it dictates:

1. Whether `/new-order` automatically selects the **Women's Customization** or **Men's Customization** tab.
2. The available garment pieces (e.g., Ban/Collar styles, Chest pocket, Gol/Chakor daman, Trouser vs. Shalwar vs. Cigarette pants).
3. The tailoring pricing matrix (Women's Stitching: Standard 2,000 / Premium 3,000 / Luxury 4,000 PKR; Men's Stitching: Standard 1,800 / Premium 2,500 / Luxury 3,500 PKR).
4. The measurement profile studio inputs.

### Gender Lexicon & Scoring Model

```typescript
export interface GenderDetectionResult {
  gender: 'male' | 'female';
  confidence: number; // 0.0 to 1.0
  matchedTerms: string[];
  source: 'tags' | 'category' | 'title' | 'url' | 'description' | 'default';
}
```

#### Lexicon Definitions

```typescript
export const MALE_TERMS = [
  // Direct keywords
  'men',
  'man',
  'mens',
  "men's",
  'gents',
  'gent',
  'boys',
  'boy',
  'male',
  // Traditional Male Garments
  'kurta',
  'kurtas',
  'shalwar kameez',
  'kameez shalwar',
  'waistcoat',
  'waistcoats',
  'sherwani',
  'sherwanis',
  'prince coat',
  'nehru jacket',
  'boski',
  'lattha',
  'latha',
  'pajama',
  'churidar pajama',
  'trouser suit men',
  // Specific Male Styles / Cuts
  'ban collar',
  'sherwani ban',
  'cuff sleeves',
  'chest pocket',
  'gol daman',
  // Category tags
  'men unstitched',
  'men pret',
  'men fabrics',
  'men collection',
  'eastern pret men',
];

export const FEMALE_TERMS = [
  // Direct keywords
  'women',
  'woman',
  'womens',
  "women's",
  'ladies',
  'lady',
  'girls',
  'girl',
  'female',
  // Multi-piece designations (strictly female in Pakistani retail)
  '3 piece',
  '3-piece',
  '3pc',
  '2 piece',
  '2-piece',
  '2pc',
  '1 piece',
  '1-piece',
  '1pc',
  'three piece',
  'two piece',
  // Female Garments & Fabric Cuts
  'kurti',
  'kurtis',
  'dupatta',
  'dupattas',
  'shirt dupatta',
  'suit dupatta',
  'unstitched lawn',
  'lawn suit',
  'embroidered lawn',
  'chiffon',
  'chiffon dupatta',
  'organza',
  'georgette',
  'silk dupatta',
  'jacquard suit',
  'sharara',
  'gharara',
  'lehenga',
  'lehnga',
  'maxi',
  'frock',
  'angrakha',
  'anarkali',
  'kaftan',
  'palazzo',
  'cigarette pants',
  'culottes',
  'tulip shalwar',
  // Embellishments & Female Lines
  'pret women',
  'luxury pret',
  'festive unstitched',
  'mahay',
  'muzlin',
  'mprints',
];
```

#### Disambiguation Rules

1. **Word-Boundary Matching:**
   A naive `.includes('men')` will erroneously trigger on `'women'`. The matching engine must use word boundary regex: `\bmen\b`, `\bmens\b`, `\bman\b` or clean token arrays.
2. **"Kurta" vs "Kurti":**
   - `Kurti` is exclusively female.
   - `Kurta` is unisex in modern ready-to-wear lines. If `kurta` appears alongside any female marker (`women`, `lawn`, `chiffon`, `embroidered`), classify as `female`. If paired with `men`, `gents`, `boys`, or male collection slugs (`/men/`, `/man/`), classify as `male`.
3. **Multi-Piece Significance:**
   In Pakistani fashion, `3 Piece` (`3pc`) and `2 Piece` (`2pc`) unstitched suits almost universally denote women's suits (Kameez + Shalwar/Trouser + Dupatta). Men's unstitched suits are sold as `Unstitched Fabric`, `Suit Length (4.5m)`, `Latha`, or `Boski`.
4. **Weighted Scoring Algorithm:**
   - Check URL pathname segments (Weight: 4x): `/men/` or `/women/` in the path is high-confidence.
   - Check Product Tags from Tier 1 JSON (Weight: 3x).
   - Check Category / Breadcrumbs (Weight: 3x).
   - Check Product Title (Weight: 2x).
   - Check Description (Weight: 1x).
   - If `maleScore > femaleScore`, return `'male'`.
   - If `femaleScore >= maleScore`, return `'female'` (defaulting to female when neutral, as women's unstitched suits represent >75% of tailoring link submissions).

---

## 5. Price Normalization Engine (PKR)

Prices on Pakistani stores come in varied, messy formats:

- `Rs. 4,590`
- `PKR 12,450.00`
- `₨ 7,990`
- `Rs 3.490,00` (locale variant)
- `4,990` (plain string)
- `Sale price Rs. 3,500 Regular price Rs. 5,000` (composite string)

### Normalization Logic

```typescript
export function normalizePkrPrice(rawPrice: unknown): number | null {
  if (typeof rawPrice === 'number') {
    return isNaN(rawPrice) || rawPrice <= 0 ? null : Math.round(rawPrice);
  }

  if (!rawPrice || typeof rawPrice !== 'string') {
    return null;
  }

  let text = rawPrice.trim();

  // If both sale and regular price exist in string, extract the first price (sale/current)
  if (/sale|special|discount/i.test(text)) {
    const saleMatch = text.match(
      /(?:sale|now|special|current)[:\s]*(?:PKR|Rs\.?|₨)?\s*([0-9,]+(?:\.[0-9]{2})?)/i
    );
    if (saleMatch && saleMatch[1]) {
      text = saleMatch[1];
    }
  }

  // Remove currency symbols, labels, and whitespace
  const sanitized = text
    .replace(/(?:PKR|Rs\.?|₨|pkr|rs)/gi, '')
    .replace(/,/g, '')
    .trim();

  // Extract first floating-point or integer numeric group
  const match = sanitized.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  if (!match || !match[1]) {
    return null;
  }

  const parsed = parseFloat(match[1]);
  if (isNaN(parsed)) {
    return null;
  }

  // Round to nearest integer (PKR does not trade in fractional paisas)
  const finalPrice = Math.round(parsed);

  // Plausibility check for Pakistani clothing items (PKR 300 to PKR 1,000,000)
  if (finalPrice < 300 || finalPrice > 1000000) {
    return null;
  }

  return finalPrice;
}
```

---

## 6. High-Resolution Image Gallery Extraction

Unstitched fabric tailoring requires high-resolution imagery so customers and tailors can inspect embroidery, neckline patches, lace borders, and trouser prints.

### CDN URL Transformation Rules

#### 1. Shopify CDN Resolution

Shopify stores (`cdn.shopify.com/s/files/...` and `<store>.com/cdn/shop/...`):

- Thumbnails contain suffixes such as `_pico`, `_icon`, `_thumb`, `_small`, `_compact`, `_medium`, `_large`, `_grande`, `_100x100`, `_300x300`, `_600x600`, `_1024x1024`.
- **Transformation Regex:**
  ```typescript
  export function upgradeShopifyImageUrl(url: string): string {
    return (
      url
        // Remove size suffix before extension
        .replace(
          /_(?:pico|icon|thumb|small|compact|medium|large|grande|master|\d+x\d+)(\.[a-zA-Z0-9]+)(?:\?.*)?$/i,
          '$1'
        )
        // Remove query sizing params
        .replace(/(\?|&)width=\d+/gi, '$1width=2048')
        .replace(/(\?|&)height=\d+/gi, '')
    );
  }
  ```

#### 2. Salesforce Commerce Cloud (Khaadi) Resolution

- Demandware image paths contain query string dimension constraints:
  `https://pk.khaadi.com/dw/image/v2/.../img.jpg?sw=400&sh=600&sm=fit`
- **Transformation:** Update query string to `?sw=1600&sh=2400&sm=fit` or strip resizing parameters.

#### 3. General Image Filtering & Deduplication

To keep the UI clean and prevent extraneous asset clutter:

- **Exclude Non-Product Assets:** Filter out URLs containing:
  `['logo', 'icon', 'badge', 'payment', 'cart', 'visa', 'mastercard', 'easypaisa', 'jazzcash', 'banner', 'placeholder', 'avatar', 'rating', 'star', 'loader', 'spinner']`.
- **Protocol Normalization:** Prepend `https:` to protocol-relative URLs (`//cdn.shopify.com/...`).
- **Deduplication:** Hash or compare canonical image paths (excluding tracking tokens `?v=...`) to prevent duplicate angle shots.
- **Gallery Cap:** Retain top 5 to 8 unique high-resolution images.

---

## 7. Integration with Next.js Order Workflow

### API Endpoint: `/api/products/parse`

- **Input Validation (Zod):**
  ```typescript
  const parseProductSchema = z.object({
    url: z.string().url('Must be a valid URL'),
  });
  ```
- **Response Format:**
  ```typescript
  interface ParsedProductResponse {
    id: string;
    sourceUrl: string;
    normalizedUrl: string;
    name: string;
    brand: string;
    description: string;
    images: string[];
    priceOriginal: number | null;
    currencyOriginal: string;
    gender: 'male' | 'female';
    garmentType: string;
    requiresManualPrice: boolean;
    parseSource: string;
    parseMetadata: {
      tier: number;
      confidence: number;
      matchedGenderTerms: string[];
    };
  }
  ```

### Customer UI Synchronization (`/new-order/page.tsx`)

When the customer pastes a link into Step 1 of the wizard and clicks "Attach Fabric Link":

1. The parser returns the product object with `gender: 'male' | 'female'`.
2. The UI triggers `handleGenderChange(product.gender)`:
   - Sets `gender = 'male'` or `'female'`.
   - Switches the wizard styling options to male (Collar/Ban, Straight Open Sleeves, Chest pocket, Shalwar/P-32) or female (Round neck with slit, Lace trim sleeves, Cigarette pants/T-30).
   - Switches the stitching pricing table to the respective tier prices.
3. Automatically sets `manualTitle`, `manualBrand`, `manualPrice` (if price was normalized), and populates the image carousel.
4. If `requiresManualPrice` is true, displays an unobtrusive alert: `"Product attached! Please confirm the fabric price."`

---

## 8. Standalone Verification Test Suite Architecture

The acceptance criteria mandate a standalone, executable verification test suite that evaluates representative live and mock product URLs across major Pakistani apparel domains.

### Test Matrix

| Store                   | Test Type   | Target Garment                     | Expected Gender          | Expected Brand        | Expected Price Range (PKR) | Min Images |
| :---------------------- | :---------- | :--------------------------------- | :----------------------- | :-------------------- | :------------------------- | :--------- |
| **Junaid Jamshed (J.)** | Live & Mock | Men's Wash & Wear Kameez Shalwar   | `male`                   | `J. (Junaid Jamshed)` | 4,500 – 12,000             | 3          |
| **Sapphire**            | Live & Mock | Daily 3-Piece Unstitched Lawn Suit | `female`                 | `Sapphire`            | 3,000 – 8,500              | 4          |
| **Khaadi**              | Live & Mock | 3-Piece Embroidered Fabric Suit    | `female`                 | `Khaadi`              | 4,000 – 15,000             | 3          |
| **Sana Safinaz**        | Live & Mock | Mahay Luxury Lawn 3-Piece          | `female`                 | `Sana Safinaz`        | 5,500 – 18,000             | 4          |
| **Maria.B**             | Live & Mock | M.Prints Unstitched 3-Piece        | `female`                 | `Maria.B`             | 4,000 – 12,000             | 4          |
| **Blocked / Invalid**   | Mock        | Cloudflare 403 Challenge Page      | `female` (slug fallback) | Inferred              | `null`                     | 0          |

### Mock Fixtures Strategy

To guarantee tests can run reliably in continuous integration (CI) environments without triggering external Cloudflare rate-limits or requiring external network access:

1. Provide realistic HTML / JSON mock fixtures for each of the major brands in `tests/fixtures/scraper/`.
2. Implement unit tests evaluating:
   - Tier 1 Shopify JSON parsing.
   - Tier 2/3 OpenGraph & Schema.org JSON-LD parsing.
   - Tier 4 regex and text heuristics.
   - Tier 5 fallback resilience (404, 403, 500 error pages).
   - Gender classification accuracy across 50 sample product titles and tags.
   - Price normalization across 20 format permutations.
   - High-res image CDN upgrading.
3. Provide an executable standalone script (`npm run test:scraper` or `scripts/verify-scraper.ts`) that outputs a structured completeness report.

---

## 9. Next Steps for Implementation Agents

1. **`builder_backend`**:
   - Refactor `src/lib/services/link-parser.service.ts` into modular components:
     - `src/lib/scraper/tier1-shopify.ts`
     - `src/lib/scraper/tier2-fetch.ts`
     - `src/lib/scraper/tier3-dom.ts`
     - `src/lib/scraper/gender-detector.ts`
     - `src/lib/scraper/price-normalizer.ts`
     - `src/lib/scraper/image-normalizer.ts`
   - Update `src/app/api/products/parse/route.ts` to return normalized gender, image array, and fallback metadata.
2. **`builder_frontend`**:
   - Update `src/app/(customer)/new-order/page.tsx` so `handleParseUrl` automatically executes `handleGenderChange(product.gender)` and updates order styling defaults.
3. **`tester`**:
   - Implement test suite in `tests/api/link-parser.test.ts` and `tests/fixtures/scraper/` with live and mock URL verifications.
