# Original User Request

## 2026-09-11T10:53:09Z

Build a production-grade, highly resilient e-commerce product link scraper and parser for Pakistani fashion stores that extracts product details, high-resolution imagery, pricing, and gender classification, seamlessly populating the new order workflow with comprehensive fallbacks.

Working directory: d:/University/CS 2024-2028/SP/stitch
Integrity mode: development

## Requirements

### R1. Multi-Tier Product Extraction Pipeline

Extract product title, brand/vendor, original price in PKR, description, and high-resolution image gallery from Pakistani apparel e-commerce URLs (including Shopify, WooCommerce, and custom headless storefronts like Khaadi, Sapphire, Junaid Jamshed, Sana Safinaz, Gul Ahmed, Maria.B, LimeLight, Nishat Linen, etc.).

### R2. Anti-Bot and Cloudflare Resilience

Incorporate a multi-tier fallback architecture:

1. Native JSON endpoint inspection (`/products/<handle>.json` and Storefront/collection feeds).
2. Browser-mimicking HTTP requests with modern user-agent and TLS header impersonation.
3. DOM heuristics parsing Schema.org JSON-LD microdata, OpenGraph tags, and platform-specific selector engines.
4. Semantic LLM / pattern-based parser fallback for unstructured or dynamic markup.
5. Clean, structured fallback when external sites aggressively block network requests, ensuring no unhandled exceptions or 500 crashes occur.

### R3. Gender Detection and Order Workflow Synchronization

Detect whether the product is for **Men** or **Women** (from category breadcrumbs, product tags, titles, or descriptions) and automatically select the corresponding gender tab, garment pieces, and styling options in the customer `/new-order` flow.

### R4. Automated Verification Test Suite

Provide a standalone, executable verification test suite that evaluates the parser against representative live and mock product URLs across major Pakistani apparel domains, reporting extraction success rate, response time, and field completeness.

## Acceptance Criteria

### Extraction Precision & Coverage

- [ ] Test suite successfully parses sample product URLs across at least 4 major Pakistani brands (e.g., Junaid Jamshed, Sapphire, Khaadi, Sana Safinaz / Maria.B) with >90% field completeness (Title, Brand, Price in PKR, Images).
- [ ] Accurately determines Gender (`male` or `female`) for male garments (Kurta, Shalwar Kameez) and female garments (3-pc, Kurti, Unstitched Lawn).
- [ ] Normalizes prices accurately to Pakistani Rupees (PKR) as numeric values, stripping commas and currency symbols (`Rs.`, `PKR`, `₨`).
- [ ] Deduplicates image URLs and verifies that extracted image links are valid, absolute HTTP/HTTPS addresses.

### Robustness & Error Handling

- [ ] When presented with invalid, 404, or bot-blocked URLs, the parser returns a structured response with appropriate error status and actionable fallback data without crashing or returning unhandled 500 errors.
- [ ] Execution completes within acceptable web request limits (<5 seconds for fast-path, <10 seconds for deep fallback).

### Project Integration

- [ ] API endpoint (`/api/products/parse`) passes input validation with Zod and responds with consistent JSON format.
- [ ] The customer `/new-order` interface automatically populates the parsed product data (title, brand, price, images) and dynamically sets the order gender.
- [ ] Next.js type check (`npx tsc --noEmit`) and build (`npm run build`) pass cleanly with zero errors.
