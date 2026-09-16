# Stitch E-Commerce Product Scraper — Test Infrastructure & Methodology (TEST_INFRA.md)

**Project**: Stitch Pakistani Fashion E-Commerce Product Link Scraper & Parser  
**Document Version**: 1.0.0  
**Test Suite Owner**: `test_writer_e2e`  
**Target Environments**: Jest (Node.js/ts-jest), Standalone CLI (`npx tsx scripts/test-scraper.ts`), CI/CD Pipelines

---

## 1. Overview & Test Architecture

The Stitch Product Link Scraper extracts product metadata (Title, Brand, Price in PKR, High-Resolution Images, Gender Classification, and Garment Type) from diverse Pakistani apparel storefronts. To ensure high resilience, field completeness, and zero unhandled exceptions in production, the test infrastructure is built around a decoupled architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Dual-Runner Verification Layer                     │
├────────────────────────────────────┬────────────────────────────────────┤
│         Jest Test Suite            │     Standalone CLI Benchmark       │
│  (tests/scraper/link-parser.test)  │    (scripts/test-scraper.ts)       │
│   - Unit & integration testing     │   - Executive verification report  │
│   - Deterministic offline fixtures │   - Field completeness score       │
│   - BVA & adversarial edge cases   │   - Gender accuracy calculation    │
│   - Run via: npm run test:scraper  │   - Run via: npm run benchmark:scraper│
└──────────────────┬─────────────────┴───────────────────┬────────────────┘
                   │                                     │
                   ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Layer 1: Pure Extractor Engine                      │
│            extractProductDetails(urlStr, options?: ExtractionOptions)   │
│   - Zero database / Prisma dependencies (pure functional execution)     │
│   - Offline fixtures injection via htmlOverride / jsonOverride          │
│   - High-resolution latency & completeness calculation                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 4-Tier Test Design Methodology

The test suite applies formal test engineering methodologies across four distinct tiers:

```
┌──────────────────────────────────────────────────────────────────┐
│ Tier 4: Real-World Workloads (Sapphire, Khaadi, J., Maria.B, SS) │
├──────────────────────────────────────────────────────────────────┤
│ Tier 3: Pairwise Combinations (Brand × Gender × Garment × Tier)  │
├──────────────────────────────────────────────────────────────────┤
│ Tier 2: Boundary Value Analysis (BVA) (Price, Image, String, SLA)│
├──────────────────────────────────────────────────────────────────┤
│ Tier 1: Category-Partition (Domains, Protocols, Tiers, Formats)  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 Tier 1: Category-Partition Method

We decompose the scraper's input domain into independent functional categories and partitions:

| Category                            | Partitions                                                                                                                                                                                                                                   | Test Coverage & Strategy                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **URL Protocol & Format**           | `https://`, `http://`, protocol-relative `//`, malformed URLs (`htp://`, blank, random string)                                                                                                                                               | Validates strict URL syntax, enforces HTTP/HTTPS, rejects malformed strings with `AppError.badRequest`.               |
| **Storefront Architecture**         | 1. Shopify Storefronts (`sapphireonline.pk`, `junaidjamshed.com`, `mariab.pk`, `sanasafinaz.com`)<br>2. Headless / Salesforce Commerce Cloud (SFCC) (`khaadi.com`)<br>3. Custom / Magento / WooCommerce (`gulahmedshop.com`, `limelight.pk`) | Tests Tier 1 Shopify JSON fast-path vs. Tier 3 DOM heuristics & JSON-LD microdata fallback for SFCC.                  |
| **Price Formatting & Symbols**      | `PKR 4,990`, `Rs. 4990.00`, `₨ 5,250`, `4990`, comma-separated numbers, decimal numbers, ranges (`PKR 4,990 - 7,990`), compare-at discounted pricing                                                                                         | Verifies regex stripping of currency symbols, whitespace, and commas, returning clean numeric integers in PKR.        |
| **Image URLs & Gallery**            | Shopify CDN URLs (`cdn.shopify.com/s/files/...`), SFCC dynamic media (`dw/image/v2/...`), protocol-relative `//`, thumbnail-parameterized (`_compact`, `_medium`, `?v=...&sw=800`)                                                           | Sanitizes thumbnails to full-res originals, resolves `https://`, strips duplicate assets, filters logos/placeholders. |
| **Gender & Garment Classification** | Men's apparel (`Kurta`, `Kameez Shalwar`, `Waistcoat`, `Sherwani`), Women's apparel (`3-Piece`, `Kurti`, `Unstitched Lawn`, `Pret`, `Dupatta`), Unisex / Ambiguous items                                                                     | Validates token/keyword boundary matching across category paths, product tags, titles, and descriptions.              |
| **Network & Security State**        | Clean 200 OK responses, 404 Not Found, Cloudflare 403 / anti-bot challenges (`<title>Just a moment...</title>`), upstream network timeout                                                                                                    | Ensures graceful degradation to Tier 5 URL slug heuristics without unhandled exceptions or 500 errors.                |

---

### 2.2 Tier 2: Boundary Value Analysis (BVA)

Boundary conditions focus on extremes where parsing or type coercion is prone to regression:

| Variable / Parameter  | Lower Boundary                                | Valid Nominal Range                                                 | Upper Boundary                                            | Extreme / Invalid Edge Cases                                                             |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Price (PKR)**       | `PKR 0` / `PKR 100` (free/accessory boundary) | `PKR 500` to `PKR 150,000` (standard Pakistani retail pret/couture) | `PKR 500,000` (luxury bridal ceiling)                     | Negative prices (`-100`), non-numeric strings (`"Call for Price"`, `"Sold Out"`), `NaN`. |
| **Image Count**       | 0 images (no assets found)                    | 1 to 5 images (curated gallery)                                     | 5 images (maximum gallery slice)                          | >20 images (must be capped and deduplicated), empty array fallback.                      |
| **Title Length**      | 5 characters (`"Kurta"`)                      | 15 to 80 characters                                                 | 255 characters                                            | Empty string `""`, strings >500 chars (truncated cleanly).                               |
| **Execution Latency** | 0ms                                           | 300ms - 1500ms (fast-path JSON)<br>1500ms - 4000ms (DOM/HTML)       | <5,000ms (fast-path SLA)<br><10,000ms (deep fallback SLA) | Network hang >8000ms (must trigger AbortController timeout and fallback).                |
| **HTTP Status Code**  | 200 OK                                        | 200, 301, 302 (redirects followed)                                  | 404 Not Found, 403 Forbidden                              | 500 Internal Error, 503 Service Unavailable, connection reset.                           |

---

### 2.3 Tier 3: Pairwise Combinations

Pairwise interaction matrices test interactions between brand architecture, gender, garment category, and fallback tiers:

| Pair ID   | Brand Platform           | Garment Type           | Target Gender                 | Expected Fallback Tier     | Test Objective                                                            |
| --------- | ------------------------ | ---------------------- | ----------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| **PW-01** | Shopify (Sapphire)       | Stitched Kurta         | `male`                        | Tier 1 (Shopify JSON)      | Verify fast-path extraction of price, variants, and male classification.  |
| **PW-02** | Shopify (Sapphire)       | 3-Piece Lawn           | `female`                      | Tier 1 (Shopify JSON)      | Verify multi-piece women's unstitched extraction and tags.                |
| **PW-03** | SFCC (Khaadi)            | 3-Piece Lawn           | `female`                      | Tier 3 (JSON-LD Microdata) | Verify SFCC schema.org `Product` parsing when `.json` is unavailable.     |
| **PW-04** | SFCC (Khaadi)            | Kameez Shalwar         | `male`                        | Tier 3 (DOM Heuristics)    | Verify breadcrumb `/men/` path classification with SFCC selector pricing. |
| **PW-05** | Shopify (Junaid Jamshed) | Kameez Shalwar         | `male`                        | Tier 1 (Shopify JSON)      | Verify brand vendor preservation and men's traditional attire tokens.     |
| **PW-06** | Shopify (Junaid Jamshed) | Kurti                  | `female`                      | Tier 1 (Shopify JSON)      | Disambiguate `"Kurti"` (female) vs `"Kurta"` (male).                      |
| **PW-07** | Shopify (Maria.B)        | Unstitched Luxury Lawn | `female`                      | Tier 1 / Tier 2            | High-price couture parsing with comma-formatted PKR (`14,500`).           |
| **PW-08** | Shopify (Sana Safinaz)   | Mahay Printed Suit     | `female`                      | Tier 1 (Shopify JSON)      | Multi-image gallery extraction and female tags.                           |
| **PW-09** | Cloudflare Challenge     | Any blocked item       | Fallback (`male` or `female`) | Tier 5 (URL Slug Fallback) | Verify anti-bot 403 page degradation to slug metadata without crashing.   |
| **PW-10** | 404 Page                 | Missing product        | Fallback                      | Tier 5 (URL Slug Fallback) | Verify out-of-stock / expired product fallback.                           |

---

### 2.4 Tier 4: Real-World Workloads

Offline mock fixtures accurately reproduce production HTML and JSON payloads captured from top Pakistani apparel storefronts:

```
tests/fixtures/scraper/
├── shopify/
│   ├── sapphire.json             # Sapphire Men Embroidered Cotton Kurta
│   ├── sapphire-women.json       # Sapphire Women 3-Piece Printed Lawn Suit
│   ├── junaid-jamshed.json       # J. Men Kameez Shalwar
│   ├── sana-safinaz.json         # Sana Safinaz Women Mahay 3-Piece
│   └── maria-b.json              # Maria.B Luxury Unstitched Lawn
├── html/
│   ├── khaadi-sfcc.html          # Khaadi SFCC Women 3-Piece Lawn (JSON-LD + OpenGraph)
│   └── khaadi-sfcc-men.html      # Khaadi SFCC Men Kurta (DOM heuristics + breadcrumbs)
└── edge-cases/
    ├── cloudflare-403.html       # Cloudflare "Just a moment..." anti-bot interstitial
    ├── 404-not-found.html        # HTTP 404 error page
    └── malformed-price.html      # Missing/hidden price with "Call for Price" text
```

---

## 3. Quality Metrics & Acceptance SLA Thresholds

Every test execution evaluates three mandatory quality gates:

### 3.1 Field Completeness Score (>90% Threshold)

$$ \text{Completeness}(P) = \frac{W_{\text{title}} + W_{\text{brand}} + W_{\text{price}} + W_{\text{images}} + W_{\text{gender}}}{5} \times 100\% $$

- **Title ($W_{\text{title}} = 1.0$)**: Non-empty, $\ge 5$ characters, not generic fallback.
- **Brand ($W_{\text{brand}} = 1.0$)**: Capitalized brand name matching domain or vendor.
- **Price in PKR ($W_{\text{price}} = 1.0$)**: Numeric integer $\in [500, 500000]$, stripped of all non-numeric tokens.
- **Images ($W_{\text{images}} = 1.0$)**: At least 1 absolute HTTPS URL, deduplicated, clean of thumbnail suffixes.
- **Gender ($W_{\text{gender}} = 1.0$)**: Valid string (`'male'` or `'female'`).

**SLA Requirement**: Average Field Completeness Score across all benchmark products must exceed **90.0%**.

### 3.2 Gender Detection Accuracy (100% SLA)

Classification accuracy across labeled benchmark URLs:

- **Men's Apparel**: Kurta, Shalwar Kameez, Waistcoat, Sherwani, Boski -> `male`.
- **Women's Apparel**: 3-Piece, Kurti, Unstitched Lawn, Chiffon, Dupatta, Pret -> `female`.

**SLA Requirement**: **100% accuracy** on all labeled ground-truth test cases.

### 3.3 Latency & Resilience SLA

- **Fast-Path (Tier 1 Shopify Native JSON)**: $< 5.0\text{ seconds}$ (target $< 1.2\text{s}$).
- **Deep Fallback (Tier 2/3 DOM Heuristics & Tier 4 Regex)**: $< 10.0\text{ seconds}$ (target $< 3.5\text{s}$).
- **Resilience**: Zero unhandled exceptions or 500 server crashes. 100% of 404/403/malformed URLs return structured data or controlled 400 Bad Request errors.

---

## 4. Test Suites & Execution Commands

### 4.1 Jest Automated Test Suite

- **Path**: `tests/scraper/link-parser.test.ts`
- **Runner**: Jest (`ts-jest`)
- **Command**:
  ```bash
  npm run test:scraper
  ```

### 4.2 Standalone CLI Verification Benchmark

- **Path**: `scripts/test-scraper.ts`
- **Runner**: `npx tsx`
- **Command**:
  ```bash
  npm run benchmark:scraper
  # or directly:
  npx tsx scripts/test-scraper.ts
  ```
- **Optional Live Flag** (evaluates against active live store URLs):
  ```bash
  npx tsx scripts/test-scraper.ts --live
  ```

---

## 5. Verification Checklist

- [x] 4-Tier Test Design Methodology documented (Category-Partition, BVA, Pairwise, Real-World Workloads).
- [x] Offline mock fixtures catalog covering Sapphire, Junaid Jamshed, Khaadi SFCC, Sana Safinaz, Maria.B, Cloudflare 403, and 404.
- [x] Jest test suite verifying completeness, gender accuracy, price normalization, image deduplication, and error resilience.
- [x] Standalone executable CLI benchmark generating an ASCII metrics dashboard with pass/fail exit codes.
- [x] Package scripts `"test:scraper"` and `"benchmark:scraper"` configured in `package.json`.
